import { getNfts } from "@/lib/alchemy";
import {
  useErc6551RegistryCreateAccount,
  usePrepareErc6551RegistryCreateAccount,
} from "@/lib/generated";
import { useQuery } from "@tanstack/react-query";
import { RotateCw } from "lucide-react";
import { useAccount } from "wagmi";
import { NFTCollectionItem } from "./NFTCollectionItem";

export function UserNFTCollection() {
  const { address } = useAccount();
  const { data, isLoading } = useQuery({
    queryKey: ["nfts", address!],
    queryFn: () => getNfts(address!),
    enabled: address !== undefined,
  });
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
