// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title RewardVault
 * @author TurboChain
 * @notice Holds ERC-20 TURBO-style rewards and releases them to players when race milestones are attested on-chain.
 * @dev Uses {AccessControl} so a hot-wallet `DISBURSER_ROLE` can push payouts while administration stays with `DEFAULT_ADMIN_ROLE`.
 *      Each unique tuple `(player, milestoneId, raceId, amount)` may only be paid once to prevent double-spend of the same attestation.
 */
contract RewardVault is AccessControl {
    using SafeERC20 for IERC20;

    /**
     * @notice Role allowed to call {disburse} after off-chain validation of milestone completion (e.g. sub-target lap time).
     * @dev Hash of the literal string `"DISBURSER_ROLE"` for stable identifier across deployments.
     */
    bytes32 public constant DISBURSER_ROLE = keccak256("DISBURSER_ROLE");

    /// @notice ERC-20 token held in this vault and transferred to players on disbursement.
    IERC20 public immutable rewardToken;

    /**
     * @notice Tracks claim digests that already received a transfer so relayers cannot replay the same milestone payout.
     * @dev Key is `keccak256(abi.encode(player, milestoneId, raceId, amount))`.
     */
    mapping(bytes32 claimDigest => bool) private _claimed;

    /// @notice Running sum of all successfully transferred reward amounts (for analytics dashboards).
    uint256 public totalDisbursed;

    /**
     * @notice Emitted for every successful token transfer out of the vault to a player.
     * @param player Recipient wallet receiving ERC-20 rewards.
     * @param amount Token amount transferred (wei or smallest unit).
     * @param milestoneId Application-defined milestone identifier (e.g. lap target id).
     * @param raceId Unique race/session identifier supplied by the game backend.
     * @param claimDigest Replay-protection key stored in `_claimed`.
     */
    event RewardDisbursed(
        address indexed player,
        uint256 amount,
        uint256 indexed milestoneId,
        bytes32 indexed raceId,
        bytes32 claimDigest
    );

    /**
     * @notice Emitted when an admin or game treasury funds the vault using ERC-20 allowance.
     * @param from Address that owned the transferred balance (always `msg.sender` for {fundWithPull}).
     * @param amount Number of tokens pulled into this contract.
     */
    event VaultFunded(address indexed from, uint256 amount);

    /// @dev Reverts when `player` is the zero address (burn risk).
    error ZeroAddressPlayer();

    /// @dev Reverts when `amount` is zero (no-op transfers are rejected for clearer indexing).
    error ZeroAmount();

    /// @dev Reverts when a disbursement is attempted twice for the same claim digest.
    error AlreadyClaimed(bytes32 claimDigest);

    /// @dev Reverts when the constructor receives a zero admin address.
    error ZeroAdmin();

    /// @dev Reverts when the constructor receives a zero token address.
    error ZeroToken();

    /**
     * @notice Deploys the vault, wires the immutable reward asset, and grants admin + disburser roles to `admin`.
     * @param admin Address receiving `DEFAULT_ADMIN_ROLE` and initial `DISBURSER_ROLE` (rotate disburser later via `grantRole`).
     * @param rewardToken_ ERC-20 token used for all milestone payouts from this vault.
     */
    constructor(address admin, IERC20 rewardToken_) {
        if (admin == address(0)) {
            revert ZeroAdmin();
        }
        if (address(rewardToken_) == address(0)) {
            revert ZeroToken();
        }
        rewardToken = rewardToken_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(DISBURSER_ROLE, admin);
    }

    /**
     * @notice Pulls `amount` tokens from `msg.sender` into this contract using prior ERC-20 allowance.
     * @param amount Number of smallest-unit tokens to transfer from the caller to the vault.
     */
    function fundWithPull(uint256 amount) external {
        if (amount == 0) {
            revert ZeroAmount();
        }
        rewardToken.safeTransferFrom(msg.sender, address(this), amount);
        emit VaultFunded(msg.sender, amount);
    }

    /**
     * @notice Transfers `amount` reward tokens to `player` once per unique milestone attestation tuple.
     * @dev Callable only by accounts holding `DISBURSER_ROLE` (typically an automated race server using a hot key).
     * @param player Wallet that completed the milestone in-game.
     * @param amount Reward size for this milestone (must match signed/off-chain agreement).
     * @param milestoneId Identifier of the milestone template (e.g. bronze lap target).
     * @param raceId Opaque race/session id preventing cross-race replay with the same milestone id.
     */
    function disburse(address player, uint256 amount, uint256 milestoneId, bytes32 raceId) external onlyRole(DISBURSER_ROLE) {
        if (player == address(0)) {
            revert ZeroAddressPlayer();
        }
        if (amount == 0) {
            revert ZeroAmount();
        }
        bytes32 digest = keccak256(abi.encode(player, milestoneId, raceId, amount));
        if (_claimed[digest]) {
            revert AlreadyClaimed(digest);
        }
        _claimed[digest] = true;
        totalDisbursed += amount;
        rewardToken.safeTransfer(player, amount);
        emit RewardDisbursed(player, amount, milestoneId, raceId, digest);
    }

    /**
     * @notice Returns whether a payout digest was already consumed.
     * @param player Player address encoded in the original claim.
     * @param amount Amount encoded in the original claim.
     * @param milestoneId Milestone id encoded in the original claim.
     * @param raceId Race id encoded in the original claim.
     * @return used True if {disburse} already succeeded for this tuple.
     */
    function isClaimUsed(address player, uint256 amount, uint256 milestoneId, bytes32 raceId) external view returns (bool used) {
        bytes32 digest = keccak256(abi.encode(player, milestoneId, raceId, amount));
        return _claimed[digest];
    }

    /**
     * @notice ERC-20 balance currently held inside the vault (not yet disbursed).
     * @return balance `rewardToken.balanceOf(address(this))`.
     */
    function vaultBalance() external view returns (uint256 balance) {
        return rewardToken.balanceOf(address(this));
    }
}
