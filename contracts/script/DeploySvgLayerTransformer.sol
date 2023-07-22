// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";

import {SvgLayerTransformer} from "../src/transformers/SvgLayerTransformer.sol";

contract DeploySvgLayerTransformer is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        SvgLayerTransformer transformer = new SvgLayerTransformer();

        console.log("Transformer address", address(transformer));

        vm.stopBroadcast();
    }
}
