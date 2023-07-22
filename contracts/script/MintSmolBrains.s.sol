// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";

import {Smols} from "../test/mock/SmolBrains/MockSmolBrains.sol";

contract MintSmolBrains is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        Smols tokenCollection = Smols(
            0x3E1C87b735B5aD0b5BBb4666D853293F2b2cEA2c
        );
        tokenCollection.privilegedMint(
            0x7730B4Cdc1B1E7a33A309AB7205411faD009C106,
            1
        );

        vm.stopBroadcast();
    }
}
