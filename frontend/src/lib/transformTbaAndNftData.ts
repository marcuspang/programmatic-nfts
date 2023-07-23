import { Network, OwnedNftsResponse } from "alchemy-sdk";
import { mainnet } from "wagmi";
import { goerli, polygon, polygonMumbai } from "viem/chains";

export function transformTbaAndNftData(
  nftData: Record<string, OwnedNftsResponse>,
  polygonTbaData: any,
  mainnetTbaData: any
) {
  // Airstack only has polygon / eth mainnet 6551 tracking
  return Object.keys(nftData).flatMap((network) => {
    if (network === Network.ETH_MAINNET) {
      return nftData[Network.ETH_MAINNET].ownedNfts.map((nft) => {
        let tbaAddress: string | undefined;
        mainnetTbaData.forEach((tba: any) => {
          if (
            nft.tokenId === tba.tokenId &&
            nft.contract.address === tba.tokenAddress
          ) {
            tbaAddress = tba.tokenNfts.erc6551Accounts[0].address.addresses[0];
            return;
          }
        });

        return { ...nft, tbaAddress, chain: mainnet.id };
      });
    } else if (network === Network.MATIC_MAINNET) {
      return nftData[Network.MATIC_MAINNET].ownedNfts.map((nft) => {
        let tbaAddress: string | undefined;
        polygonTbaData.forEach((tba: any) => {
          if (
            nft.tokenId === tba.tokenId &&
            nft.contract.address === tba.tokenAddress
          ) {
            tbaAddress = tba.tokenNfts.erc6551Accounts[0].address.addresses[0];
            return;
          }
        });

        return { ...nft, tbaAddress, chain: polygon.id };
      });
    }
    // Everything else is goerli
    return nftData[network as keyof typeof nftData]?.ownedNfts.map((nft) => ({
      ...nft,
      chain: goerli.id,
    }));
  });
}
