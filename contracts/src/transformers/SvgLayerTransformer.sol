// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {LibString} from "solady/src/utils/LibString.sol";
import {Base64} from "solady/src/utils/Base64.sol";

import {ITransformer} from "../../src/interfaces/ITransformer.sol";

contract SvgLayerTransformer is ITransformer {
    string _layer =
        "url(data:image/jpeg;base64,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)";

    function transform(
        string memory tokenURI
    ) external view override returns (string memory) {
        string memory target = ";base64,";
        uint256 startIndex = LibString.indexOf(tokenURI, target);
        string memory json = LibString.slice(
            tokenURI,
            startIndex + bytes(target).length
        );
        json = string(Base64.decode(json));

        startIndex = LibString.indexOf(json, target);
        uint256 endIndex = LibString.indexOf(json, '="');

        string memory svg = LibString.slice(
            json,
            startIndex + bytes(target).length,
            endIndex
        );
        svg = string(Base64.decode(svg));

        target = "data:image/png;base64,";

        uint256[] memory indices = LibString.indicesOf(svg, target);
        require(indices.length >= 1, "svg should have at least 1 layer");
        string memory prefix = LibString.slice(
            svg,
            0,
            indices[indices.length - 1] - bytes("url(").length
        );
        string memory suffix = LibString.slice(
            svg,
            indices[indices.length - 1] - bytes("url(").length
        );

        suffix = LibString.slice(suffix, LibString.indexOf(suffix, ")"));

        return (
            LibString.concat(
                prefix,
                LibString.concat(_layer, LibString.concat(",", suffix))
            )
        );
    }
}
