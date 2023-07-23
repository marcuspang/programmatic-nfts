import { Network, OwnedNftsResponse } from "alchemy-sdk";
import { mainnet } from "wagmi";
import { goerli, polygon } from "viem/chains";
import { Address, isAddressEqual } from "viem";

const goerliTbas = [
  {
    tbaAddress: "0x8572565a2867042a78Cd63Ee5722472C2682099C",
    tokenId: "1",
    tokenCollection: "0xFA1F0dF0db6CbAbC1DEbA9b579c9ca1cB14b6595",
  },
];

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
        mainnetTbaData?.forEach((tba: any) => {
          if (
            nft.tokenId === tba.tokenId &&
            isAddressEqual(nft.contract.address as Address, tba.tokenAddress)
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
        polygonTbaData?.forEach((tba: any) => {
          if (
            nft.tokenId === tba.tokenId &&
            isAddressEqual(nft.contract.address as Address, tba.tokenAddress)
          ) {
            tbaAddress = tba.tokenNfts.erc6551Accounts[0].address.addresses[0];
            return;
          }
        });

        return { ...nft, tbaAddress, chain: polygon.id };
      });
    }
    // Everything else is goerli
    return nftData[network as keyof typeof nftData]?.ownedNfts.map((nft) => {
      let tbaAddress: string | undefined;
      goerliTbas.forEach((tba) => {
        if (
          tba.tokenId === nft.tokenId &&
          isAddressEqual(tba.tokenCollection as Address, nft.contract.address)
        ) {
          tbaAddress = tba.tbaAddress;
        }
      });
      return {
        ...nft,
        tbaAddress,
        chain: goerli.id,
      };
    });
  });
}
