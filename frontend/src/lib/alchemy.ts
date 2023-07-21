import type { Address } from "viem";
import { Network, Alchemy } from "alchemy-sdk";

const isTestnet = process.env.NODE_ENV === "development";

const settings = {
  apiKey: isTestnet
    ? process.env.POLYGON_TESTNET_ALCHEMY_API_KEY
    : process.env.POLYGON_ALCHEMY_API_KEY,
  network: isTestnet ? Network.MATIC_MUMBAI : Network.MATIC_MAINNET,
};

const alchemy = new Alchemy(settings);

export function getNfts(address: Address) {
  return alchemy.nft.getNftsForOwner(address);
}
