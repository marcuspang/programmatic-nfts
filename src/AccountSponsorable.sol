// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Account, NotAuthorized} from "tokenbound/Account.sol";

import {ERC721} from "openzeppelin-contracts/token/ERC721/ERC721.sol";

import {IERC6551AccountMetadata} from "./interfaces/IERC6551AccountMetadata.sol";
import {ITransformer} from "./interfaces/ITransformer.sol";

error ExceedsSponsorshipsLength();
error NotApproved();
error AlreadyApproved();
error NotActive();
error InvalidBlockNumbers();
error FailToTransferFee();
error SponsorshipFeeTooLow();

contract AccountSponsorable is Account, IERC6551AccountMetadata {
    // TODO: optimise ordering to minimise struct size
    struct Sponsorship {
        address transformerAddress;
        uint256 startBlock;
        uint256 endBlock;
        // indicates swhether TBA owner has approved this sponsorship
        bool isApproved;
        // indicates whether the sponsor has enabled this sponsorship
        bool isActive;
        uint256 fee;
        address sponsor;
    }

    Sponsorship[] public sponsorships;

    event AddSponsorship(
        uint256 indexed sponsorshipId,
        uint256 startBlock,
        uint256 endBlock,
        address transformerAddress
    );

    event ApproveSponsorship(uint256 indexed sponsorshipId);
    event DisapproveSponsorship(uint256 indexed sponsorshipId);
    event DeactivateSponsorship(uint256 indexed sponsorshipId);

    constructor(
        address _guardian,
        address entryPoint_
    ) Account(_guardian, entryPoint_) {}

    function getSponsorships() external view returns (Sponsorship[] memory) {
        return sponsorships;
    }

    /// @notice Approves sponsorship and collect sponsorship fee.
    /// @dev Must only be called by Account owner.
    function approveSponsorship(uint256 sponsorshipId) external {
        if (!this.isAuthorized(msg.sender)) {
            revert NotAuthorized();
        }
        if (sponsorshipId > sponsorships.length) {
            revert ExceedsSponsorshipsLength();
        }
        if (sponsorships[sponsorshipId].isApproved) {
            revert AlreadyApproved();
        }

        sponsorships[sponsorshipId].isApproved = true;
        // transfer the sponsorship fee to owner
        // TODO: figure out best way to transfer fees + check re-entrancy
        (bool success, ) = msg.sender.call{
            value: sponsorships[sponsorshipId].fee
        }("");
        if (!success) {
            revert FailToTransferFee();
        }

        emit ApproveSponsorship(sponsorshipId);
    }

    /// @notice Disapproves sponsorship and return sponsorship fee back to contract.
    /// @dev Must only be called by Account owner.
    function disapproveSponsorship(uint256 sponsorshipId) external payable {
        if (!this.isAuthorized(msg.sender)) {
            revert NotAuthorized();
        }
        if (sponsorshipId > sponsorships.length) {
            revert ExceedsSponsorshipsLength();
        }
        if (!sponsorships[sponsorshipId].isApproved) {
            revert NotApproved();
        }
        if (sponsorships[sponsorshipId].fee > msg.value) {
            revert SponsorshipFeeTooLow();
        }

        sponsorships[sponsorshipId].isApproved = false;
        // transfer the sponsorship fee to owner
        (bool success, ) = address(this).call{value: msg.value}("");
        if (!success) {
            revert FailToTransferFee();
        }

        emit DisapproveSponsorship(sponsorshipId);
    }

    /// @notice Deactivates sponsorship and returns fee back to sponsor, can only be called once for each sponsorship.
    ///         Sponsorships cannot be activated again.
    /// @dev Must only be called by sponsor.
    function deactivateSponsorship(uint256 sponsorshipId) external {
        if (sponsorshipId > sponsorships.length) {
            revert ExceedsSponsorshipsLength();
        }
        if (sponsorships[sponsorshipId].sponsor != msg.sender) {
            revert NotAuthorized();
        }
        if (!sponsorships[sponsorshipId].isActive) {
            revert NotActive();
        }

        sponsorships[sponsorshipId].isActive = false;
        // transfer the sponsorship fee to sponsor
        (bool success, ) = msg.sender.call{
            value: sponsorships[sponsorshipId].fee
        }("");
        if (!success) {
            revert FailToTransferFee();
        }

        emit DeactivateSponsorship(sponsorshipId);
    }

    /// @notice Creates a new sponsorship entry, which is active by default.
    function addSponsorship(
        uint256 startBlock,
        uint256 endBlock,
        address transformerAddress
    ) external payable returns (uint256 sponsorshipId) {
        if (startBlock >= endBlock || endBlock <= block.number) {
            revert InvalidBlockNumbers();
        }

        sponsorships.push(
            Sponsorship({
                transformerAddress: transformerAddress,
                startBlock: startBlock,
                endBlock: endBlock,
                isApproved: false,
                isActive: true,
                fee: msg.value,
                sponsor: msg.sender
            })
        );
        sponsorshipId = sponsorships.length - 1;
        emit AddSponsorship(
            sponsorshipId,
            startBlock,
            endBlock,
            transformerAddress
        );
    }

    function tokenURI()
        external
        view
        override
        returns (string memory modifiedTokenURI)
    {
        (, address tokenCollection, uint256 tokenId) = this.token();

        modifiedTokenURI = ERC721(tokenCollection).tokenURI(tokenId);
        for (uint256 i = 0; i < sponsorships.length; i++) {
            Sponsorship memory sponsorship = sponsorships[i];
            if (_shouldApplySponsorship(sponsorship)) {
                // TODO: is this implementation safe? i.e. calling ITransformer::transform
                modifiedTokenURI = ITransformer(sponsorship.transformerAddress)
                    .transform(modifiedTokenURI);
            }
        }
    }

    function _shouldApplySponsorship(
        Sponsorship memory sponsorship
    ) private view returns (bool) {
        return
            sponsorship.isActive &&
            sponsorship.isApproved &&
            sponsorship.startBlock <= block.number &&
            sponsorship.endBlock > block.number;
    }
}
