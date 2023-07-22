import { getNfts } from "@/lib/alchemy";
import { useQuery } from "@tanstack/react-query";
import { RotateCw } from "lucide-react";
import { useAccount, useNetwork } from "wagmi";
import { NFTCollectionItem } from "./NFTCollectionItem";
import { useEffect } from "react";

export function NFTCollection() {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["nfts", address!],
    queryFn: () => getNfts(address!, chain!.id),
    enabled: address !== undefined && chain !== undefined,
  });

  useEffect(() => {
    refetch();
  }, [address]);

  if (!address) {
    return <div>No tokens found.</div>;
  }

  if (isLoading) {
    return <RotateCw className="animate-spin" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data?.ownedNfts
        .filter((nft) => nft.tokenType === "ERC721")
        .map((nft, index) => (
          <NFTCollectionItem key={index} {...nft} />
        ))}
    </div>
  );
}
