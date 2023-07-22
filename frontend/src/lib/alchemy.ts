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

  return alchemy.nft.getNftsForOwner(address, {
    contractAddresses: [
      "0xcb25e9dcf86db259765ba7a986df142b41414036",
      "0xdbf2138593aec61d55d86e80b8ed86d7b9ba51f5",
      "0xec68056ad770e626662b1f74bc1e1291a17840ba",
      "0x6E352E6C77262520C89e21bf13bf417Cee168986",
    ],
  });
}
