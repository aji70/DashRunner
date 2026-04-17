// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test } from "forge-std/Test.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import { DashRunner } from "../src/DashRunner.sol";
import { DashRunnerScoreNFT } from "../src/DashRunnerScoreNFT.sol";

contract DashRunnerNftTest is Test {
    DashRunner internal implementation;
    DashRunner internal game;
    DashRunnerScoreNFT internal nft;

    address internal constant PLAYER = address(0xBEEF);

    function setUp() public {
        implementation = new DashRunner();
        bytes memory init = abi.encodeCall(DashRunner.initialize, (address(this)));
        game = DashRunner(payable(address(new ERC1967Proxy(address(implementation), init))));
        nft = new DashRunnerScoreNFT(address(this), address(game), "Dash Runner PB", "DRPB");
        game.setScoreNft(address(nft));
    }

    function test_newPersonalBest_mintsEachTime() public {
        vm.prank(PLAYER);
        game.submitRun(10, 0, 0, 0, 0, 0, 0);
        assertEq(nft.balanceOf(PLAYER), 1);
        assertEq(nft.scoreOf(1), 10);

        vm.prank(PLAYER);
        game.submitRun(20, 0, 0, 0, 0, 0, 0);
        assertEq(nft.balanceOf(PLAYER), 2);
        assertEq(nft.scoreOf(2), 20);

        vm.prank(PLAYER);
        game.submitRun(15, 0, 0, 0, 0, 0, 0);
        assertEq(nft.balanceOf(PLAYER), 2);
    }

    function test_nonReceiver_recordsScore_noBalance() public {
        BadRecipient br = new BadRecipient();
        vm.prank(address(br));
        br.run(game, 100);
        (uint64 bestScore,,,,,,,) = game.bestRun(address(br));
        assertEq(bestScore, 100);
        assertEq(nft.balanceOf(address(br)), 0);
    }
}

contract BadRecipient {
    function run(DashRunner g, uint256 score) external {
        g.submitRun(score, 0, 0, 0, 0, 0, 0);
    }
}
