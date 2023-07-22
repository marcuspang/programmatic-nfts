import { Alchemy, Network } from "alchemy-sdk";
import type { Address } from "viem";
import { polygonMumbai } from "viem/chains";

export function getNfts(address: Address, chainId: number) {
  const settings = {
    apiKey:
      chainId === polygonMumbai.id
        ? process.env.POLYGON_TESTNET_ALCHEMY_API_KEY
        : process.env.POLYGON_ALCHEMY_API_KEY,
    network:
      chainId === polygonMumbai.id
        ? Network.MATIC_MUMBAI
        : Network.MATIC_MAINNET,
  };

  const alchemy = new Alchemy(settings);

  return alchemy.nft.getNftsForOwner(address);
}
