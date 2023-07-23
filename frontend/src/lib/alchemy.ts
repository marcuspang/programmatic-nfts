import { Network } from "alchemy-sdk";
import type { Address } from "viem";
import { AlchemyMultichainClient } from "./alchemyMultichainClient";
import { CONTRACT_ADDRESS } from "@/constants/contractAddress";
import { goerli } from "viem/chains";

const settings = {
  apiKey: process.env.POLYGON_ALCHEMY_API_KEY,
  network: Network.MATIC_MAINNET,
};
const overrides = {
  [Network.MATIC_MUMBAI]: {
    apiKey: process.env.POLYGON_TESTNET_ALCHEMY_API_KEY,
    maxRetries: 10,
  },
  [Network.ETH_GOERLI]: { apiKey: process.env.GOERLI_ALCHEMY_API_KEY },
};

const alchemy = new AlchemyMultichainClient(settings, overrides);

export async function getNfts(address: Address, chainId: number) {
  const mumbaiNfts = await alchemy
    .forNetwork(Network.MATIC_MUMBAI)
    .nft.getNftsForOwner(address, {
      contractAddresses: [
        "0xcb25e9dcf86db259765ba7a986df142b41414036",
        "0xdbf2138593aec61d55d86e80b8ed86d7b9ba51f5",
        "0xec68056ad770e626662b1f74bc1e1291a17840ba",
        "0x6E352E6C77262520C89e21bf13bf417Cee168986",
      ],
    });
  const polygonNfts = await alchemy
    .forNetwork(Network.MATIC_MAINNET)
    .nft.getNftsForOwner(address);
  const goerliNfts = await alchemy
    .forNetwork(Network.ETH_GOERLI)
    .nft.getNftsForOwner(address, {
      contractAddresses: [
        "0xFA1F0dF0db6CbAbC1DEbA9b579c9ca1cB14b6595",
        "0x496AEbf46C832A371E63eDAc098b64a97AA6cf5c",
      ],
    });
  return {
    [Network.MATIC_MUMBAI]: mumbaiNfts,
    [Network.MATIC_MAINNET]: polygonNfts,
    [Network.ETH_GOERLI]: goerliNfts,
  };
}
