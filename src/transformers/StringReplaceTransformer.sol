// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {LibString} from "solady/src/utils/LibString.sol";

import {ITransformer} from "../../src/interfaces/ITransformer.sol";

contract StringReplaceTransformer is ITransformer {
    string public baseURI;
    string public newBaseURI;

    constructor(string memory _baseURI, string memory _newBaseURI) {
        baseURI = _baseURI;
        newBaseURI = _newBaseURI;
    }

    function transform(
        string memory tokenURI
    ) external view override returns (string memory) {
        return LibString.replace(tokenURI, baseURI, newBaseURI);
    }
}
