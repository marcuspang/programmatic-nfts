// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";

import "openzeppelin-contracts/token/ERC721/ERC721.sol";
import {StringInjectTransformer} from "../src/transformers/StringInjectTransformer.sol";

import {MockERC721} from "../test/mock/MockERC721.sol";

contract MockApes is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        MockERC721 tokenCollection = MockERC721(
            0x496AEbf46C832A371E63eDAc098b64a97AA6cf5c
        );

        for (uint256 i = 2; i < 15; i++) {
            tokenCollection.mint(
                0x7730B4Cdc1B1E7a33A309AB7205411faD009C106,
                i,
                "https://layer-apes.vercel.app/case-studies/layered-apes?layers=0000,0000,0000,0006,0000,0000,0000,0016,0000,0000,0000,002e,0000,0000,0000,0058,0000,0000,0000,007b,0000,0000,0000,0000"
            );
        }

        // console.log("721 address", address(tokenCollection));

        // new StringInjectTransformer(
        //     "0000,0000,0000,0016,",
        //     "0000,0000,0000,0052,"
        // );

        vm.stopBroadcast();
    }
}
