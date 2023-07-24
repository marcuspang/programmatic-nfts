# Programmatic NFTs

https://www.youtube.com/watch?v=G7Z5iNDtcs8

## Description

Built in 36 hours for ETHParis 2023!

This projects aims to bring sponsorships to NFT owners with almost no gas fees, get liquidity to your project without taking on any risk.

## How it works

To make NFTs more customisable, we can introduce a `tokenURI()` method to a ERC6551 account (derived from the original NFT), which 
simply transforms a URI to a URI. We also store some auxiliary data structures to keep track of `Sponsorship`s, where each sponsorship
has a specific `Transformer` address, which has its own `transform(string memory uri)` method. 

### `tokenURI()` method

The `tokenURI()` method takes the underlying NFT's `tokenURI(uint256 tokenId)` through all the active sponsorship's 
`Transfoerm::transform(string memory uri)` methods, and returns the final transformed URI. 

Since the `Transformer` only has a `transform(string memory uri)` method, we can simply compose with infinitely such `Transformer`s 
as necessary.

### User Experience

With the help of Account Abstraction, we can use a simple Paymaster to create sponsorships for ERC6551 holders (e.g. Biconomy). These holders will then
be able to allow / deny sponsorships without paying any gas fees up front (challenge here is to create the ERC6551 with Account Abstraction, e.g. Safe).

Additionally, we can use cross-chain protocols to help with creating sponsorships of ERC6551s on other chains, and pay it forward with similar
mechanisms (e.g. Hyperlane).

Each TBA will have it's own Push group chat, with the aim of preserving / maintaining direction & vision of the underlying NFT. Tentative naming syntax
would be `tokenbound:{chainId}:{tokenId}:{tokenCollectionAddress}`, similar to how ERC6551s are derived.

## How it was built

- foundry to build smart contracts
- Next.js, React.js, TypeScript, tailwindcss, @shadcn/ui, wagmi for frontend
- WalletConnect for wallet authentication
- Airstack for querying ERC6551 TBA / owner data
- (incomplete) Push protocol for notifications, communication between TBA holders & sponsors, past owners
- (incomplete) Biconomy for Paymasters
- (incomplete) Hyperlane with Queries API and inter-chain gas payments



