// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";

import {AccountProxy} from "tokenbound/AccountProxy.sol";
import {AccountGuardian} from "tokenbound/AccountGuardian.sol";

import {AccountSponsorable} from "../src/AccountSponsorable.sol";

contract DeployAccountSponsorable is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        AccountGuardian guardian = new AccountGuardian();

        new AccountProxy{
            salt: 0x6551655165516551655165516551655165516551655165516551655165516551
        }(address(guardian));

        vm.stopBroadcast();
    }
}
