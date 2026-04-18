// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {RewardVault} from "../../src/turbochain/RewardVault.sol";

/**
 * @title RewardVaultTest
 * @notice Foundry tests for {RewardVault}: funding, role-gated disbursement, replay protection, and emitted events.
 */
contract RewardVaultTest is Test {
    ERC20Mock internal token;
    RewardVault internal vault;
    address internal admin = address(this);
    address internal disburser = address(0xD15);
    address internal alice = address(0xA11CE);
    bytes32 internal constant RACE = bytes32(uint256(1));

    function setUp() public {
        token = new ERC20Mock();
        vault = new RewardVault(admin, IERC20(address(token)));
        token.mint(admin, 1_000_000 ether);
        token.approve(address(vault), type(uint256).max);
        vault.grantRole(vault.DISBURSER_ROLE(), disburser);
    }

    /// @notice Pull funding increases vault balance and emits {VaultFunded}.
    function testFundWithPull_increasesBalance() public {
        vm.expectEmit(true, false, false, true);
        emit RewardVault.VaultFunded(admin, 100 ether);
        vault.fundWithPull(100 ether);
        assertEq(token.balanceOf(address(vault)), 100 ether);
    }

    /// @notice Disburser can pay a milestone once and emit {RewardDisbursed}.
    function testDisburse_transfersAndMarksClaimed() public {
        vault.fundWithPull(500 ether);
        vm.prank(disburser);
        vm.expectEmit(true, false, true, true);
        bytes32 digest = keccak256(abi.encode(alice, uint256(7), RACE, uint256(25 ether)));
        emit RewardVault.RewardDisbursed(alice, 25 ether, 7, RACE, digest);
        vault.disburse(alice, 25 ether, 7, RACE);
        assertEq(token.balanceOf(alice), 25 ether);
        assertTrue(vault.isClaimUsed(alice, 25 ether, 7, RACE));
        assertEq(vault.totalDisbursed(), 25 ether);
    }

    /// @notice Second disburse with identical tuple reverts with {AlreadyClaimed}.
    function testDisburse_revertsOnReplay() public {
        vault.fundWithPull(500 ether);
        vm.startPrank(disburser);
        vault.disburse(alice, 25 ether, 7, RACE);
        vm.expectRevert(abi.encodeWithSelector(RewardVault.AlreadyClaimed.selector, keccak256(abi.encode(alice, 7, RACE, 25 ether))));
        vault.disburse(alice, 25 ether, 7, RACE);
        vm.stopPrank();
    }

    /// @notice Accounts without `DISBURSER_ROLE` cannot disburse.
    function testDisburse_revertsWithoutRole() public {
        vault.fundWithPull(100 ether);
        vm.prank(alice);
        vm.expectRevert();
        vault.disburse(alice, 1 ether, 1, RACE);
    }

    /// @notice Zero amount funding reverts with {ZeroAmount}.
    function testFundWithPull_revertsOnZero() public {
        vm.expectRevert(RewardVault.ZeroAmount.selector);
        vault.fundWithPull(0);
    }

    /// @notice Zero player disbursement reverts with {ZeroAddressPlayer}.
    function testDisburse_revertsOnZeroPlayer() public {
        vault.fundWithPull(10 ether);
        vm.prank(disburser);
        vm.expectRevert(RewardVault.ZeroAddressPlayer.selector);
        vault.disburse(address(0), 1 ether, 1, RACE);
    }
}
