// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Application storage for {DashRunner}. Kept in a dedicated contract so future
 * implementation versions can extend this layout predictably and preserve the gap.
 */
abstract contract DashRunnerStorage {
    struct BestRun {
        uint64 bestScore;
        uint64 bestCoins;
        uint64 bestDistance;
        uint64 lastSubmittedAt;
        uint64 bestJumps;
        uint64 bestLeft;
        uint64 bestRight;
        uint64 bestBoostCollected;
    }

    /// @notice Best validated run per wallet (proxy-facing `msg.sender`).
    mapping(address => BestRun) public bestRun;

    /// @notice Global best score and holder (optional leaderboard head).
    uint256 public globalBestScore;
    address public globalBestHolder;

    /// @notice ERC-721 collection that receives {IDashRunnerScoreNFT.mintPersonalBest} on new personal bests (optional).
    address public scoreNft;

    /// @notice Bitmask of owned character IDs (bit `i` => owns character `i`). Character `0` is the free default.
    mapping(address => uint256) public characterOwnershipMask;

    /// @notice Equipped character ID (must be owned, or `0`).
    mapping(address => uint8) public selectedCharacterId;

    /// @notice Selected city / route theme ID (opaque to the contract; used by clients).
    mapping(address => uint8) public selectedCityId;

    /// @notice UTC day index of last successful `claimDailyReward` (`block.timestamp / 1 days`).
    mapping(address => uint32) public lastDailyClaimDayIndex;

    /// @notice Consecutive UTC-day claim streak after last claim (minimum 1 right after a claim).
    mapping(address => uint16) public dailyClaimStreak;

    /// @notice USDC amount in token smallest units (e.g. 6 decimals on Celo USDC) for `buyCharacter(id)` when `id > 0`. `0` means not sold on-chain.
    mapping(uint8 => uint256) public characterPriceUsdc;

    /// @notice USDC token (`IERC20`) used for character purchases and withdrawals.
    address public usdc;

    /// @notice On-chain step counter per wallet; incremented by `dashStep()` (campaigns / light activity).
    mapping(address => uint64) public dashSteps;

    /**
     * @dev Reserved storage slots for future upgrades. Do not remove or reorder
     * variables above without a storage migration plan.
     */
    // forge-lint: disable-next-line(mixed-case-variable)
    uint256[38] private __gap;
}
