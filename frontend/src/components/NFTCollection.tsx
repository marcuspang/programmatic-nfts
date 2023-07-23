import { getNfts } from "@/lib/alchemy";
import { useQuery } from "@tanstack/react-query";
import { OwnedNftsResponse } from "alchemy-sdk";
import { RotateCw } from "lucide-react";
import { useEffect } from "react";
import { useAccount, useNetwork } from "wagmi";
import { useGetMainnetTbas, useGetPolygonTbas } from "../../hooks/useGetTbas";
import { NFTCollectionItem } from "./NFTCollectionItem";
import { transformTbaAndNftData } from "@/lib/transformTbaAndNftData";

export function NFTCollection() {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["nfts", address!],
    queryFn: () => getNfts(address!, chain!.id),
    enabled: address !== undefined && chain !== undefined,
  });
  console.log({ data });
  const { data: polygonTbaData, loading: polygonLoading } = useGetPolygonTbas();
  const { data: mainnetTbaData, loading: mainnetLoading } = useGetMainnetTbas();
  useEffect(() => {
    refetch();
  }, [address, chain]);

  if (!address) {
    return <div>No tokens found.</div>;
  }

  if (isLoading || polygonLoading || mainnetLoading) {
    return <RotateCw className="animate-spin" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data !== undefined &&
        polygonTbaData !== undefined &&
        mainnetTbaData !== undefined &&
        transformTbaAndNftData(data, polygonTbaData, mainnetTbaData)
          .filter((nft) => nft.tokenType !== "ERC1155")
          .map((nft, index) => (
            <NFTCollectionItem key={index} {...nft} refetch={refetch} />
          ))}
    </div>
  );
}
