// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ITransformer} from "../../src/interfaces/ITransformer.sol";

contract MockTransformer is ITransformer {
    function transform(string memory tokenURI) external view override returns (string memory) {
        return tokenURI;
    }
}
