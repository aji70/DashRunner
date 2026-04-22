// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { DashRunnerStorage } from "./DashRunnerStorage.sol";
import { IDashRunnerScoreNFT } from "./interfaces/IDashRunnerScoreNFT.sol";

/**
 * @title DashRunner
 * @notice UUPS upgradeable registry for Dash endless-runner session results.
 * @dev Deploy behind an {ERC1967Proxy}. Call `initialize` once on the proxy, then `setUsdc` with canonical USDC.
 * Character purchases use USDC via `approve` + `buyCharacter`. On-chain data is best-effort integrity; pair with
 * signatures or a prover later.
 */
contract DashRunner is Initializable, OwnableUpgradeable, PausableUpgradeable, UUPSUpgradeable, DashRunnerStorage {
    using SafeERC20 for IERC20;
    event RunSubmitted(
        address indexed player,
        uint256 score,
        uint256 coinsCollected,
        uint256 distance,
        uint256 jumps,
        uint256 leftActions,
        uint256 rightActions,
        uint256 boostCollected,
        uint256 newBestScore,
        bool isNewGlobalBest
    );

    event PersonalBestNftMinted(address indexed player, uint256 indexed tokenId, uint256 score);
    event PersonalBestNftMintSkipped(address indexed player, uint256 score);

    event DailyRewardClaimed(address indexed player, uint32 dayIndex, uint16 streak);
    event CharacterPurchased(address indexed player, uint8 characterId, uint256 priceUsdc);
    event LoadoutUpdated(address indexed player, uint8 characterId, uint8 cityId);
    event CharacterPriceSet(uint8 indexed characterId, uint256 priceUsdc);
    event Withdrawal(address indexed to, uint256 amount);
    event WithdrawalUsdc(address indexed to, uint256 amount);

    /// @notice Wallet / campaign signal: no storage, one log — intended for lightweight on-chain activity.
    event LightSignal(address indexed player, uint40 timestamp);

    /// @notice Same as {LightSignal} plus an indexed tag (nonce, round id, etc.) to vary calldata for indexers.
    event LightSignalTagged(address indexed player, uint256 indexed tag, uint40 timestamp);

    error DashRunner__ZeroPlayer();
    error DashRunner__Uint64Overflow();
    error DashRunner__InvalidCharacter();
    error DashRunner__InvalidCity();
    error DashRunner__NotOwnerOfCharacter();
    error DashRunner__CharacterNotForSale();
    error DashRunner__AlreadyOwned();
    error DashRunner__UsdcNotConfigured();
    error DashRunner__AlreadyClaimedToday();
    error DashRunner__WithdrawFailed();

    uint8 public constant MAX_CITY_ID = 31;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) external initializer {
        if (initialOwner == address(0)) revert DashRunner__ZeroPlayer();
        __Ownable_init(initialOwner);
        __Pausable_init();
        __UUPSUpgradeable_init();
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Wire the achievement collection (only minter is this game contract). Pass `address(0)` to disable mints.
    function setScoreNft(address scoreNft_) external onlyOwner {
        scoreNft = scoreNft_;
    }

    receive() external payable { }

    function withdraw(address payable to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert DashRunner__ZeroPlayer();
        (bool ok,) = to.call{ value: amount }("");
        if (!ok) revert DashRunner__WithdrawFailed();
        emit Withdrawal(to, amount);
    }

    /// @notice ERC-20 USDC recovered from character sales (owner only).
    function withdrawUsdc(address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert DashRunner__ZeroPlayer();
        if (usdc == address(0)) revert DashRunner__UsdcNotConfigured();
        IERC20(usdc).safeTransfer(to, amount);
        emit WithdrawalUsdc(to, amount);
    }

    /// @notice Configure the USDC token used for `buyCharacter` (e.g. Celo mainnet USDC).
    function setUsdc(address usdc_) external onlyOwner {
        if (usdc_ == address(0)) revert DashRunner__ZeroPlayer();
        usdc = usdc_;
    }

    /// @notice Price in USDC smallest units for `buyCharacter(characterId)`. On Celo USDC uses 6 decimals.
    function setCharacterPriceUsdc(uint8 characterId, uint256 amountUsdc) external onlyOwner {
        if (characterId == 0) revert DashRunner__InvalidCharacter();
        characterPriceUsdc[characterId] = amountUsdc;
        emit CharacterPriceSet(characterId, amountUsdc);
    }

    /**
     * @notice Buy a character slot with USDC (requires prior `approve` on the USDC token). Character `0` is free.
     */
    function buyCharacter(uint8 characterId) external whenNotPaused {
        if (characterId == 0) revert DashRunner__InvalidCharacter();
        if (usdc == address(0)) revert DashRunner__UsdcNotConfigured();

        uint256 price = characterPriceUsdc[characterId];
        if (price == 0) revert DashRunner__CharacterNotForSale();
        if (_ownsCharacter(msg.sender, characterId)) revert DashRunner__AlreadyOwned();

        IERC20(usdc).safeTransferFrom(msg.sender, address(this), price);

        characterOwnershipMask[msg.sender] |= (uint256(1) << characterId);
        emit CharacterPurchased(msg.sender, characterId, price);
    }

    /**
     * @notice Persist the cosmetic loadout clients should use before starting a run.
     */
    function setLoadout(uint8 characterId, uint8 cityId) external whenNotPaused {
        address player = _msgSender();
        if (player == address(0)) revert DashRunner__ZeroPlayer();
        if (cityId > MAX_CITY_ID) revert DashRunner__InvalidCity();
        if (!_ownsCharacter(player, characterId)) revert DashRunner__NotOwnerOfCharacter();

        selectedCharacterId[player] = characterId;
        selectedCityId[player] = cityId;
        emit LoadoutUpdated(player, characterId, cityId);
    }

    /**
     * @notice On-chain daily check-in marker (UTC day boundary). Does not transfer tokens; pairs with off-chain rewards.
     */
    function claimDailyReward() external whenNotPaused {
        address player = _msgSender();
        if (player == address(0)) revert DashRunner__ZeroPlayer();

        uint32 today = uint32(block.timestamp / 1 days);
        uint32 last = lastDailyClaimDayIndex[player];
        if (last == today) revert DashRunner__AlreadyClaimedToday();

        uint16 streak = 1;
        if (last != 0 && today == last + 1) {
            streak = dailyClaimStreak[player] + 1;
        }

        lastDailyClaimDayIndex[player] = today;
        dailyClaimStreak[player] = streak;

        emit DailyRewardClaimed(player, today, streak);
    }

    function ownsCharacter(address player, uint8 characterId) external view returns (bool) {
        return _ownsCharacter(player, characterId);
    }

    /**
     * @notice Cheapest signal: single log, no contract state. Does not respect pause so activity still lands on-chain.
     */
    function signal() external {
        emit LightSignal(msg.sender, uint40(block.timestamp));
    }

    /**
     * @notice Signal with optional `tag` (e.g. incrementing nonce) — slightly more calldata, indexed tag for filters.
     */
    function signal(uint256 tag) external {
        emit LightSignalTagged(msg.sender, tag, uint40(block.timestamp));
    }

    /**
     * @notice Record a lightweight on-chain step (runner-themed counter per wallet). Ignores pause.
     */
    function dashStep() external {
        unchecked {
            dashSteps[msg.sender]++;
        }
    }

    /**
     * @notice Record a finished run for `msg.sender`. Updates per-player bests and optional global best.
     * @param jumps Lane jumps (or jump actions) in this run.
     * @param leftActions Strafe / lane moves left.
     * @param rightActions Strafe / lane moves right.
     * @param boostCollected Boost pickups collected in this run.
     * @dev If {scoreNft} is set and this run strictly beats the player's previous best score, the NFT is minted
     * via try/catch so a failed safe-mint (e.g. non-receiver contract) does not revert the run submission.
     */
    function submitRun(
        uint256 score,
        uint256 coinsCollected,
        uint256 distanceTraveled,
        uint256 jumps,
        uint256 leftActions,
        uint256 rightActions,
        uint256 boostCollected
    ) external whenNotPaused {
        address player = _msgSender();
        if (player == address(0)) revert DashRunner__ZeroPlayer();

        BestRun storage br = bestRun[player];
        uint256 priorBestScore = br.bestScore;
        bool newPersonalHighScore = score > priorBestScore;

        if (score > br.bestScore) {
            br.bestScore = _toUint64(score);
        }
        if (coinsCollected > br.bestCoins) {
            br.bestCoins = _toUint64(coinsCollected);
        }
        if (distanceTraveled > br.bestDistance) {
            br.bestDistance = _toUint64(distanceTraveled);
        }
        if (jumps > br.bestJumps) {
            br.bestJumps = _toUint64(jumps);
        }
        if (leftActions > br.bestLeft) {
            br.bestLeft = _toUint64(leftActions);
        }
        if (rightActions > br.bestRight) {
            br.bestRight = _toUint64(rightActions);
        }
        if (boostCollected > br.bestBoostCollected) {
            br.bestBoostCollected = _toUint64(boostCollected);
        }
        br.lastSubmittedAt = _toUint64(block.timestamp);

        bool isNewGlobalBest;
        if (score > globalBestScore) {
            globalBestScore = score;
            globalBestHolder = player;
            isNewGlobalBest = true;
        }

        emit RunSubmitted(
            player,
            score,
            coinsCollected,
            distanceTraveled,
            jumps,
            leftActions,
            rightActions,
            boostCollected,
            br.bestScore,
            isNewGlobalBest
        );

        if (newPersonalHighScore && scoreNft != address(0)) {
            try IDashRunnerScoreNFT(scoreNft).mintPersonalBest(player, score) returns (uint256 tokenId) {
                emit PersonalBestNftMinted(player, tokenId, score);
            } catch {
                emit PersonalBestNftMintSkipped(player, score);
            }
        }
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner { }

    function _ownsCharacter(address player, uint8 characterId) private view returns (bool) {
        if (characterId == 0) return true;
        if (characterId >= 256) return false;
        uint256 mask = characterOwnershipMask[player];
        return (mask & (uint256(1) << characterId)) != 0;
    }

    function _toUint64(uint256 value) private pure returns (uint64) {
        if (value > type(uint64).max) revert DashRunner__Uint64Overflow();
        unchecked {
            return uint64(value);
        }
    }
}
