// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Optional collection called by {DashRunner} when a wallet beats its own best score.
interface IDashRunnerScoreNFT {
    function mintPersonalBest(address to, uint256 score) external returns (uint256 tokenId);
}
