// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script, console2 } from "forge-std/Script.sol";

import { DashRunner } from "../src/DashRunner.sol";

/**
 * @notice UUPS upgrade: deploy new `DashRunner` implementation and point the existing proxy at it.
 * @dev Tx sender must be the proxy owner (`Ownable`). Preserves storage and proxy address.
 */
contract UpgradeDashRunner is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address proxy = vm.envAddress("DASHRUNNER_PROXY");

        vm.startBroadcast(pk);

        DashRunner newImplementation = new DashRunner();
        DashRunner(payable(proxy)).upgradeToAndCall(address(newImplementation), "");

        vm.stopBroadcast();

        console2.log("DashRunner proxy (unchanged)", proxy);
        console2.log("New implementation", address(newImplementation));
    }
}
