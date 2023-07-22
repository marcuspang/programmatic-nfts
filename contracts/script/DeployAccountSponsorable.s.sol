// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";

import {AccountProxy} from "tokenbound/AccountProxy.sol";
import {AccountGuardian} from "tokenbound/AccountGuardian.sol";
import {EntryPoint} from "account-abstraction/core/EntryPoint.sol";
import {ERC6551Registry} from "erc6551/ERC6551Registry.sol";

import {AccountSponsorable} from "../src/AccountSponsorable.sol";

contract DeployAccountSponsorable is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // ERC6551Registry registry = new ERC6551Registry();
        // console.log("Registry address", address(registry));

        // EntryPoint entryPoint = new EntryPoint();
        // AccountGuardian guardian = new AccountGuardian();

        AccountSponsorable implementation = new AccountSponsorable(
            0xA578341F43F6CFcb5D871e827cebaB9bc7dAb150,
            0xb9491f0aB924a1D9D565a4105123919F010a760a
            // address(guardian),
            // address(entryPoint)
        );

        AccountProxy accountProxy = new AccountProxy{
            salt: 0x6551655165516551655165516551655165516551655165516551655165516551
        }(address(implementation));

        console.log("Account proxy address", address(accountProxy));

        vm.stopBroadcast();
    }
}
