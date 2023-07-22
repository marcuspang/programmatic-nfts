// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";

import {AccountProxy} from "tokenbound/AccountProxy.sol";
import {AccountGuardian} from "tokenbound/AccountGuardian.sol";
import {EntryPoint} from "account-abstraction/core/EntryPoint.sol";
import {ERC6551Registry} from "erc6551/ERC6551Registry.sol";

import {AccountSponsorable} from "../src/AccountSponsorable.sol";

contract Temp is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        ERC6551Registry registry = ERC6551Registry(0xE370fcA9D6379C8C56c999799C6dB50812865642);

        registry.createAccount(
            0x0E82CD2Cf7CC59bd93c1DbD16c8cFD4958B4A5E6,
            80001,
            0x5dcd776E717991311D0b020bD0a13951BA7a6e55,
            14,
            0x6551655165516551655165516551655165516551655165516551655165516551,
            ""
        );

        vm.stopBroadcast();
    }
}
