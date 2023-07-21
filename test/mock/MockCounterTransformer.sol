// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ITransformer} from "../../src/interfaces/ITransformer.sol";
import {Strings} from "openzeppelin-contracts/utils/Strings.sol";

contract MockCounterTransformer is ITransformer {
    using Strings for uint256;

    uint256 public counter;

    constructor(uint256 _counter) {
        counter = _counter;
    }

    function transform(string memory tokenURI) external view override returns (string memory) {
        return string(abi.encodePacked(tokenURI, counter.toString()));
    }
}
