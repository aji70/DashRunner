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

    /**
     * @dev Reserved storage slots for future upgrades. Do not remove or reorder
     * variables above without a storage migration plan.
     */
    // forge-lint: disable-next-line(mixed-case-variable)
    uint256[47] private __gap;
}
