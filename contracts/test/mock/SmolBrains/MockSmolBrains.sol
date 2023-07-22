// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/*

Smols.sol

Written by: mousedev.eth

*/

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "./UtilitiesV2Upgradeable.sol";
import "./ISmolsAddressRegistry.sol";
import "./ITransferBlocker.sol";
import "./ISmolsRenderer.sol";
import "./SmolsLibrary.sol";

contract Smols is UtilitiesV2Upgradeable, ERC721Upgradeable {
    bytes32 internal constant PRIVILIGED_MINTER_ROLE =
        keccak256("PRIVILIGED_MINTER");

    uint256 public totalSupply;

    ISmolsAddressRegistry smolsAddressRegistry;

    mapping(address => bool) public privilegedMinters;

    function initialize() public initializer {
        __ERC721_init("Smol Brain", "SmolBrain");
        UtilitiesV2Upgradeable.__Utilities_init();
    }

    /// @dev Mints a certain token as a privileged minter.
    /// @param _to The address to mint to.
    /// @param _tokenId The token to mint.
    function privilegedMint(
        address _to,
        uint256 _tokenId
    ) external requiresEitherRole(OWNER_ROLE, SMOLS_PRIVILIGED_MINTER_ROLE) {
        require(_tokenId < 13422, "TokenID must be within range");
        _mint(_to, _tokenId);
        totalSupply++;
    }

    /// @dev Gets the on chain tokenURI of a smol.
    /// @param tokenId The smol to get the tokenURI of.
    /// @return tokenURI a string that represents the base64 smol
    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        address smolsRendererAddress = smolsAddressRegistry.getAddress(
            SmolAddressEnum.SMOLSRENDERERADDRESS
        );
        return ISmolsRenderer(smolsRendererAddress).tokenURI(tokenId);
    }

    /// @dev Sets the smols address registry address.
    /// @param _smolsAddressRegistry The address of the registry.
    function setSmolsAddressRegistry(
        address _smolsAddressRegistry
    ) external requiresRole(OWNER_ROLE) {
        smolsAddressRegistry = ISmolsAddressRegistry(_smolsAddressRegistry);
    }

    /// @dev Overrides the before token transfer hook, in order to stop transfers of staked tokens.
    /// @param from The address transferring the token
    /// @param tokenId The token being transferred.
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        address transferBlockerAddress = smolsAddressRegistry.getAddress(
            SmolAddressEnum.TRANSFERBLOCKERADDRESS
        );
        //This means its being minted.
        if (from == address(0)) return;
        if (transferBlockerAddress == address(0)) return;

        require(
            ITransferBlocker(transferBlockerAddress).isTransferrable(
                address(this),
                tokenId
            ),
            "Token Not Currently Transferrable"
        );

        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function walletOfOwner(
        address _address
    ) public view virtual returns (uint256[] memory) {
        //Thanks 0xinuarashi for da inspo

        uint256 _balance = balanceOf(_address);
        uint256[] memory _tokens = new uint256[](_balance);
        uint256 _addedTokens;
        for (uint256 i = 0; i < 13422; i++) {
            if (_exists(i) && ownerOf(i) == _address) {
                _tokens[_addedTokens] = i;
                _addedTokens++;
            }

            if (_addedTokens == _balance) break;
        }
        return _tokens;
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(AccessControlEnumerableUpgradeable, ERC721Upgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    uint256[50] private __gap;
}
