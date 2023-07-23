// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {LibString} from "solady/src/utils/LibString.sol";
import {Base64} from "solady/src/utils/Base64.sol";

import {ITransformer} from "../../src/interfaces/ITransformer.sol";

contract StringInjectTransformer is ITransformer {
    string public layer;
    string public target;

    constructor(string memory _target, string memory _layer) {
        layer = _layer;
        target = _target;
    }

    function transform(
        string memory tokenURI
    ) external view override returns (string memory) {
        uint256 startIndex = LibString.indexOf(tokenURI, target);
        string memory prefix = LibString.slice(
            tokenURI,
            0,
            startIndex + bytes(target).length
        );
        string memory suffix = LibString.slice(
            tokenURI,
            startIndex + bytes(target).length
        );
        return LibString.concat(prefix, LibString.concat(layer, suffix));
    }
}
