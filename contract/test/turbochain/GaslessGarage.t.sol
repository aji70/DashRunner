// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {GaslessGarage} from "../../src/turbochain/GaslessGarage.sol";

/**
 * @title GaslessGarageTest
 * @notice Foundry tests for {GaslessGarage}: owner mint path, stat bounds, owner upgrades, and EIP-2771 suffix decoding.
 */
contract GaslessGarageTest is Test {
    GaslessGarage internal garage;
    address internal constant FORWARDER = address(uint160(0xF01D));
    address internal owner = address(this);
    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);

    function setUp() public {
        garage = new GaslessGarage("Turbo Garage", "TGAR", FORWARDER, owner);
    }

    /// @notice Owner can mint a car with valid stats and name.
    function testMintNew_assignsTokenOneAndEmits() public {
        vm.expectEmit(true, true, false, false);
        emit GaslessGarage.CarMinted(alice, 1, "", 0, 0, 0, 0);
        uint256 id = garage.mintNew(alice, "Neon Apex", 10, 20, 30);
        assertEq(id, 1);
        assertEq(garage.ownerOf(1), alice);
        GaslessGarage.CarSpecs memory s = garage.getCarSpecs(1);
        assertEq(s.speed, 10);
        assertEq(s.handling, 20);
        assertEq(s.acceleration, 30);
        assertEq(keccak256(bytes(garage.carName(1))), keccak256(bytes("Neon Apex")));
    }

    /// @notice Non-owner cannot mint.
    function testMintNew_revertsWhenNotOwner() public {
        vm.prank(alice);
        vm.expectRevert();
        garage.mintNew(alice, "x", 1, 1, 1);
    }

    /// @notice Stats above 100 revert during mint.
    function testMintNew_revertsOnInvalidStat() public {
        vm.expectRevert(abi.encodeWithSelector(GaslessGarage.StatOutOfRange.selector, uint8(101)));
        garage.mintNew(alice, "x", 101, 0, 0);
    }

    /// @notice Name longer than 64 bytes reverts.
    function testMintNew_revertsOnLongName() public {
        bytes memory tooLong = new bytes(65);
        vm.expectRevert(abi.encodeWithSelector(GaslessGarage.NameTooLong.selector, uint256(65)));
        garage.mintNew(alice, string(tooLong), 0, 0, 0);
    }

    /// @notice Token holder may upgrade stats when paying gas directly.
    function testUpgradeStats_directEOA() public {
        garage.mintNew(alice, "A", 5, 5, 5);
        vm.prank(alice);
        garage.upgradeStats(1, 50, 60, 70);
        GaslessGarage.CarSpecs memory s = garage.getCarSpecs(1);
        assertEq(s.speed, 50);
        assertEq(s.handling, 60);
        assertEq(s.acceleration, 70);
    }

    /// @notice Non-owner of token cannot upgrade.
    function testUpgradeStats_revertsForStranger() public {
        garage.mintNew(alice, "A", 1, 2, 3);
        vm.prank(bob);
        vm.expectRevert();
        garage.upgradeStats(1, 9, 9, 9);
    }

    /// @notice When `msg.sender` is the trusted forwarder and calldata ends with 20-byte `from`, `_msgSender` resolves to `from`.
    function testUpgradeStats_metaTxVia2771Suffix() public {
        garage.mintNew(alice, "A", 1, 2, 3);
        bytes memory callData = abi.encodeCall(GaslessGarage.upgradeStats, (1, 40, 41, 42));
        bytes memory forwarderCalldata = abi.encodePacked(callData, alice);
        vm.prank(FORWARDER);
        (bool ok, bytes memory ret) = address(garage).call(forwarderCalldata);
        assertTrue(ok, string(ret));
        GaslessGarage.CarSpecs memory s = garage.getCarSpecs(1);
        assertEq(s.speed, 40);
        assertEq(s.handling, 41);
        assertEq(s.acceleration, 42);
    }

    /// @notice Rename is restricted to the current holder and respects byte length.
    function testRenameCar_updatesName() public {
        garage.mintNew(alice, "Old", 1, 1, 1);
        vm.prank(alice);
        garage.renameCar(1, "New");
        assertEq(keccak256(bytes(garage.carName(1))), keccak256(bytes("New")));
    }

    /// @notice `tokenURI` concatenates configured base URI with decimal id.
    function testTokenURI_usesBase() public {
        garage.mintNew(alice, "A", 1, 1, 1);
        garage.setBaseURI("https://meta.turbochain.test/");
        assertEq(garage.tokenURI(1), "https://meta.turbochain.test/1");
    }
}
