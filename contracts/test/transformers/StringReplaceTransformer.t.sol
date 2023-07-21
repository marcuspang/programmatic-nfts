// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import {EntryPoint} from "account-abstraction/core/EntryPoint.sol";
import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";

import {AccountProxy} from "tokenbound/AccountProxy.sol";
import {AccountGuardian} from "tokenbound/AccountGuardian.sol";
import {ERC6551Registry} from "erc6551/ERC6551Registry.sol";

import {AccountSponsorable, NotAuthorized} from "../../src/AccountSponsorable.sol";
import {ITransformer} from "../../src/interfaces/ITransformer.sol";
import {StringReplaceTransformer} from "../../src/transformers/StringReplaceTransformer.sol";

import {MockTransformer} from "../mock/MockTransformer.sol";
import {MockCounterTransformer} from "../mock/MockCounterTransformer.sol";
import {MockERC721} from "../mock/MockERC721.sol";

// solhint-disable func-name-mixedcase
contract StringReplaceTransformerTest is Test {
    AccountSponsorable public implementation;
    ERC6551Registry public registry;
    AccountGuardian public guardian;
    AccountProxy public proxy;
    IEntryPoint public entryPoint;

    MockERC721 public tokenCollection;

    function setUp() public {
        entryPoint = new EntryPoint();
        guardian = new AccountGuardian();
        implementation = new AccountSponsorable(
            address(guardian),
            address(entryPoint)
        );
        proxy = new AccountProxy(address(implementation));

        registry = new ERC6551Registry();
    }

    function test_Transform(
        uint256 tokenId,
        string memory baseURI,
        string memory newBaseURI
    ) public {
        // Arrange
        address user = vm.addr(1);

        tokenCollection = new MockERC721();
        tokenCollection.mint(user, tokenId, baseURI);

        address accountAddress = registry.createAccount(
            address(proxy),
            block.chainid,
            address(tokenCollection),
            tokenId,
            0,
            abi.encodeWithSignature("initialize()")
        );
        AccountSponsorable account = AccountSponsorable(
            payable(accountAddress)
        );
        vm.prank(user);
        account.setIsSponsorable(true);

        // Act
        ITransformer transformer = new StringReplaceTransformer(
            baseURI,
            newBaseURI
        );

        vm.deal(user, 1 ether);
        vm.prank(user);
        uint256 sponsorshipId = account.addSponsorship{value: 1 ether}(
            0,
            block.number + 1,
            address(transformer)
        );
        vm.prank(user);
        account.approveSponsorship(sponsorshipId);

        // Assert
        assertEq(account.getSponsorships().length, 1);
        assertEq(account.tokenURI(), newBaseURI);
    }
}
