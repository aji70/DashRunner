// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import { DashRunnerStorage } from "./DashRunnerStorage.sol";

/**
 * @title DashRunner
 * @notice UUPS upgradeable registry for Dash endless-runner session results.
 * @dev Deploy behind an {ERC1967Proxy}. Call `initialize` once on the proxy. On-chain
 * data is best-effort integrity (clients can lie); pair with signatures or a prover later.
 */
contract DashRunner is Initializable, OwnableUpgradeable, PausableUpgradeable, UUPSUpgradeable, DashRunnerStorage {
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

    error DashRunner__ZeroPlayer();
    error DashRunner__Uint64Overflow();

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

    /**
     * @notice Record a finished run for `msg.sender`. Updates per-player bests and optional global best.
     * @param jumps Lane jumps (or jump actions) in this run.
     * @param leftActions Strafe / lane moves left.
     * @param rightActions Strafe / lane moves right.
     * @param boostCollected Boost pickups collected in this run.
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
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner { }

    function _toUint64(uint256 value) private pure returns (uint64) {
        if (value > type(uint64).max) revert DashRunner__Uint64Overflow();
        unchecked {
            return uint64(value);
        }
    }
}
