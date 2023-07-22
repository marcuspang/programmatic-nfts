import { getNfts } from "@/lib/alchemy";
import { useQuery } from "@tanstack/react-query";
import { OwnedNftsResponse } from "alchemy-sdk";
import { RotateCw } from "lucide-react";
import { useEffect } from "react";
import { useAccount, useNetwork } from "wagmi";
import { useGetTbas } from "../../hooks/useGetTbas";
import { NFTCollectionItem } from "./NFTCollectionItem";

function transformTbaAndNftData(nftData: OwnedNftsResponse, tbaData: any) {
  return nftData.ownedNfts.map((nft) => {
    let tbaAddress: string | undefined;
    tbaData.forEach((tba: any) => {
      if (
        nft.tokenId === tba.tokenId &&
        nft.contract.address === tba.tokenAddress
      ) {
        tbaAddress = tba.tokenNfts.erc6551Accounts[0].address.addresses[0];
        return;
      }
    });

    return { ...nft, tbaAddress };
  });
}

export function NFTCollection() {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["nfts", address!],
    queryFn: () => getNfts(address!, chain!.id),
    enabled: address !== undefined && chain !== undefined,
  });
  const { data: tbaData, loading } = useGetTbas();

  useEffect(() => {
    refetch();
  }, [address, chain]);

  if (!address) {
    return <div>No tokens found.</div>;
  }

  if (isLoading || loading) {
    return <RotateCw className="animate-spin" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data !== undefined &&
        tbaData !== undefined &&
        transformTbaAndNftData(data, tbaData)
          .filter((nft) => nft.tokenType === "ERC721")
          .map((nft, index) => <NFTCollectionItem key={index} {...nft} refetch={refetch} />)}
    </div>
  );
}
