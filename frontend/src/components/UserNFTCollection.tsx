import { getNfts } from "@/lib/alchemy";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

export function UserNFTCollection() {
  const { address } = useAccount();
  const { data, isLoading } = useQuery({
    queryKey: ["nfts", address!],
    queryFn: () => getNfts(address!),
    enabled: address !== undefined,
  });

  console.log({ asd: "asd", data, address });

  return <div></div>;
}
