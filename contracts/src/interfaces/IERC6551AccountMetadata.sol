// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IERC6551Account} from "erc6551/interfaces/IERC6551Account.sol";

interface IERC6551AccountMetadata is IERC6551Account {
    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI() external view returns (string memory);
}
