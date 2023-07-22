import { getNfts } from "@/lib/alchemy";
import { useQuery } from "@tanstack/react-query";
import { RotateCw } from "lucide-react";
import { useAccount } from "wagmi";
import { NFTCollectionItem } from "./NFTCollectionItem";

export function NFTCollection() {
  const { address } = useAccount();
  const { data, isLoading } = useQuery({
    queryKey: ["nfts", address!],
    queryFn: () => getNfts(address!),
    enabled: address !== undefined,
  });
  if (!address) {
    return <div>No tokens found.</div>;
  }

  if (isLoading) {
    return <RotateCw className="animate-spin" />;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {data?.ownedNfts
        .filter((nft) => nft.tokenType === "ERC721")
        .slice(0, 1)
        .map((nft, index) => (
          <NFTCollectionItem key={index} {...nft} />
        ))}
    </div>
  );
}
