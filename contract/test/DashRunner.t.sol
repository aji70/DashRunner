// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test } from "forge-std/Test.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import { DashRunner } from "../src/DashRunner.sol";

contract DashRunnerTest is Test {
    DashRunner internal implementation;
    DashRunner internal game;

    address internal constant PLAYER = address(0xBEEF);

    function setUp() public {
        implementation = new DashRunner();
        bytes memory init = abi.encodeCall(DashRunner.initialize, (address(this)));
        game = DashRunner(address(new ERC1967Proxy(address(implementation), init)));
    }

    function test_submitRun_tracksBests_and_global() public {
        vm.prank(PLAYER);
        game.submitRun(100, 5, 1000, 12, 3, 4, 2);

        (
            uint64 bestScore,
            uint64 bestCoins,
            uint64 bestDistance,
            ,
            uint64 bestJumps,
            uint64 bestLeft,
            uint64 bestRight,
            uint64 bestBoost
        ) = game.bestRun(PLAYER);
        assertEq(bestScore, 100);
        assertEq(bestCoins, 5);
        assertEq(bestDistance, 1000);
        assertEq(bestJumps, 12);
        assertEq(bestLeft, 3);
        assertEq(bestRight, 4);
        assertEq(bestBoost, 2);
        assertEq(game.globalBestScore(), 100);
        assertEq(game.globalBestHolder(), PLAYER);

        vm.prank(PLAYER);
        game.submitRun(50, 20, 500, 5, 8, 1, 6);
        (bestScore, bestCoins, bestDistance,, bestJumps, bestLeft, bestRight, bestBoost) = game.bestRun(PLAYER);
        assertEq(bestScore, 100);
        assertEq(bestCoins, 20);
        assertEq(bestDistance, 1000);
        assertEq(bestJumps, 12);
        assertEq(bestLeft, 8);
        assertEq(bestRight, 4);
        assertEq(bestBoost, 6);
    }

    function test_pause_blocks_submit() public {
        game.pause();
        vm.prank(PLAYER);
        vm.expectRevert();
        game.submitRun(1, 1, 1, 0, 0, 0, 0);
    }

    function test_buyCharacter_and_setLoadout() public {
        game.setCharacterPrice(3, 1 ether);
        vm.deal(PLAYER, 3 ether);
        vm.prank(PLAYER);
        game.buyCharacter{ value: 1.5 ether }(3);
        assertTrue(game.ownsCharacter(PLAYER, 3));

        vm.prank(PLAYER);
        game.setLoadout(3, 5);
        assertEq(game.selectedCharacterId(PLAYER), 3);
        assertEq(game.selectedCityId(PLAYER), 5);
    }

    function test_claimDailyReward_streak_and_doubleClaimReverts() public {
        vm.warp(10 days);
        vm.prank(PLAYER);
        game.claimDailyReward();
        assertEq(game.dailyClaimStreak(PLAYER), 1);

        vm.prank(PLAYER);
        vm.expectRevert();
        game.claimDailyReward();

        vm.warp(11 days);
        vm.prank(PLAYER);
        game.claimDailyReward();
        assertEq(game.dailyClaimStreak(PLAYER), 2);
    }

    function test_pause_blocks_buyCharacter() public {
        game.setCharacterPrice(2, 1 wei);
        game.pause();
        vm.deal(PLAYER, 1 ether);
        vm.prank(PLAYER);
        vm.expectRevert();
        game.buyCharacter{ value: 1 wei }(2);
    }

    function test_owner_can_upgrade() public {
        DashRunner nextImplementation = new DashRunner();
        game.upgradeToAndCall(address(nextImplementation), "");
        assertEq(_implementation(address(game)), address(nextImplementation));
    }

    function test_nonOwner_cannot_upgrade() public {
        DashRunner nextImplementation = new DashRunner();
        vm.prank(PLAYER);
        vm.expectRevert();
        game.upgradeToAndCall(address(nextImplementation), "");
    }

    function _implementation(address proxy) private view returns (address) {
        // ERC-1967 implementation slot (see OpenZeppelin `ERC1967Utils.IMPLEMENTATION_SLOT`).
        bytes32 slot = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
        return address(uint160(uint256(vm.load(proxy, slot))));
    }
}
