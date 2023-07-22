// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";

import {Smols} from "../test/mock/SmolBrains/MockSmolBrains.sol";

contract DeploySmolBrains is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        Smols tokenCollection = new Smols();

        console.log("SmolBrains address", address(tokenCollection));

        vm.stopBroadcast();
    }
}
