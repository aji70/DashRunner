// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script, console2 } from "forge-std/Script.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import { DashRunner } from "../src/DashRunner.sol";
import { DashRunnerScoreNFT } from "../src/DashRunnerScoreNFT.sol";

contract DeployDashRunner is Script {
    /// @dev Celo mainnet native USDC (Circle); override with env `USDC_ADDRESS` when needed.
    address internal constant CELO_MAINNET_USDC = 0xCEba93000B7B6b0D2C6F1ab9b17b22C4B6C4E8de;

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address owner = vm.addr(pk);

        address usdcAddr = CELO_MAINNET_USDC;
        try vm.envAddress("USDC_ADDRESS") returns (address envUsdc) {
            if (envUsdc != address(0)) usdcAddr = envUsdc;
        } catch { }

        vm.startBroadcast(pk);

        DashRunner implementation = new DashRunner();
        bytes memory init = abi.encodeCall(DashRunner.initialize, (owner));
        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), init);

        DashRunner game = DashRunner(payable(address(proxy)));
        game.setUsdc(usdcAddr);
        DashRunnerScoreNFT nft = new DashRunnerScoreNFT(owner, address(proxy), "Dash Runner High Score", "DRUNHS");
        game.setScoreNft(address(nft));

        vm.stopBroadcast();

        console2.log("DashRunner implementation", address(implementation));
        console2.log("DashRunner proxy (app address)", address(proxy));
        console2.log("DashRunnerScoreNFT", address(nft));
        console2.log("owner", owner);
        console2.log("USDC", usdcAddr);
    }
}
