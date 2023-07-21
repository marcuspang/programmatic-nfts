// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface ITransformer {
    function transform(string memory tokenURI) external view returns (string memory);
}
