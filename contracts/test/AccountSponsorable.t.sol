// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import {Strings} from "openzeppelin-contracts/utils/Strings.sol";
import {EntryPoint} from "account-abstraction/core/EntryPoint.sol";
import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";
import {AccountProxy} from "tokenbound/AccountProxy.sol";
import {AccountGuardian} from "tokenbound/AccountGuardian.sol";
import {ERC6551Registry} from "erc6551/ERC6551Registry.sol";

import {AccountSponsorable, InvalidBlockNumbers} from "../src/AccountSponsorable.sol";
import {ITransformer} from "../src/interfaces/ITransformer.sol";

import {MockTransformer} from "./mock/MockTransformer.sol";
import {MockCounterTransformer} from "./mock/MockCounterTransformer.sol";
import {MockERC721} from "./mock/MockERC721.sol";

// solhint-disable func-name-mixedcase
contract AccountSponsorableTest is Test {
    using Strings for uint256;

    AccountSponsorable public implementation;
    ERC6551Registry public registry;
    AccountGuardian public guardian;
    AccountProxy public proxy;
    IEntryPoint public entryPoint;

    MockERC721 public tokenCollection;
    MockTransformer public mockTransformer;

    function setUp() public {
        entryPoint = new EntryPoint();
        guardian = new AccountGuardian();
        implementation = new AccountSponsorable(
            address(guardian),
            address(entryPoint)
        );
        proxy = new AccountProxy(address(implementation));

        registry = new ERC6551Registry();

        tokenCollection = new MockERC721();
        mockTransformer = new MockTransformer();
    }

    function test_AddSponsorship(uint256 tokenId) public {
        // Arrange
        address user = vm.addr(1);

        tokenCollection.mint(user, tokenId);
        assertEq(tokenCollection.ownerOf(tokenId), user);

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
        vm.deal(user, 1 ether);
        vm.prank(user);
        account.addSponsorship{value: 1 ether}(
            0,
            block.number + 1,
            address(mockTransformer)
        );

        // Assert
        assertEq(account.getSponsorships().length, 1);
        AccountSponsorable.Sponsorship memory sponsorship = account
            .getSponsorships()[0];

        assertEq(sponsorship.transformerAddress, address(mockTransformer));
        assertEq(sponsorship.startBlock, 0);
        assertEq(sponsorship.endBlock, block.number + 1);
        assertTrue(!sponsorship.isApproved);
        assertTrue(sponsorship.isActive);
        assertEq(sponsorship.fee, 1 ether);
        assertEq(sponsorship.sponsor, user);
    }

    function test_RevertIfInvalidBlockNumbers_AddSponsorship(
        uint256 tokenId
    ) public {
        // Arrange
        address user = vm.addr(1);

        tokenCollection.mint(user, tokenId);
        assertEq(tokenCollection.ownerOf(tokenId), user);

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

        // Act & Assert
        // should fail if user tries to use an end block that is too early
        vm.prank(user);
        vm.expectRevert(InvalidBlockNumbers.selector);
        account.addSponsorship(0, block.number, address(mockTransformer));

        // Act & Assert
        // should fail is user tries to use a start block greater than end block
        vm.prank(user);
        vm.expectRevert(InvalidBlockNumbers.selector);
        account.addSponsorship(
            block.number + 2,
            block.number + 1,
            address(mockTransformer)
        );

        assertEq(account.getSponsorships().length, 0);
    }

    function test_ApproveSponsorship(uint256 tokenId, uint256 counter) public {
        // Arrange
        address user = vm.addr(1);

        tokenCollection.mint(user, tokenId);
        assertEq(tokenCollection.ownerOf(tokenId), user);

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

        vm.deal(user, 1 ether);

        MockCounterTransformer mockCounterTransformer = new MockCounterTransformer(
                counter
            );

        vm.prank(user);
        uint256 sponsorshipId = account.addSponsorship{value: 1 ether}(
            0,
            block.number + 1,
            address(mockCounterTransformer)
        );

        assertEq(account.getSponsorships().length, sponsorshipId + 1);

        // Act
        vm.prank(user);
        account.approveSponsorship(sponsorshipId);

        // Assert
        assertEq(user.balance, 1 ether);
        assertEq(address(account).balance, 0);
        assertEq(
            account.tokenURI(),
            string(
                abi.encodePacked(
                    tokenCollection.tokenURI(tokenId),
                    counter.toString()
                )
            )
        );
    }
}
