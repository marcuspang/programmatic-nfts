import { CONTRACT_ADDRESS } from "@/constants/contractAddress";
import { TokenboundClient } from "@tokenbound/sdk";
import { OwnedNft } from "alchemy-sdk";
import { MoveRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Address, createWalletClient, custom, http } from "viem";
import {
  useAccount,
  useNetwork,
  useSwitchNetwork,
  useWaitForTransaction,
} from "wagmi";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { Badge } from "./ui/badge";
import { goerli } from "viem/chains";

interface NFTCollectionItemProps extends OwnedNft {
  tbaAddress?: string;
  chain: number;
  refetch: () => void;
}

function transformTokenUri(uri?: string) {
  if (uri?.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "https://gateway.ipfs.io/ipfs/");
  }

  return uri;
}

export function NFTCollectionItem({
  rawMetadata,
  description,
  contract,
  chain: chainId,
  tokenId,
  tbaAddress,
  refetch,
}: NFTCollectionItemProps) {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { toast } = useToast();

  const [txHash, setTxHash] = useState<string>();

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: txHash as Address,
    enabled: txHash !== undefined,
  });
  const { switchNetworkAsync } = useSwitchNetwork();

  const createAccount = useCallback(async () => {
    if (!chain || !address || !switchNetworkAsync) return;
    try {
      if (chain?.id !== chainId) {
        await switchNetworkAsync?.(chainId);
      }
      const walletClient = createWalletClient({
        chain,
        account: address,
        // @ts-ignore
        transport: window.ethereum ? custom(window.ethereum) : http(),
      });
      const tokenboundClient = new TokenboundClient({
        walletClient,
        chainId: chain?.id,
        implementationAddress: CONTRACT_ADDRESS[chain?.id]?.accountProxy,
      });
      const transaction = await tokenboundClient.prepareCreateAccount({
        tokenContract: contract.address as Address,
        tokenId: `${tokenId}`,
        implementationAddress: CONTRACT_ADDRESS[chainId]?.accountProxy,
      });

      const txHash = await walletClient.sendTransaction({
        ...transaction,
        account: address,
      });
      setTxHash(txHash);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: "Check the console for more details!",
      });
      console.error(err);
    }
  }, [chainId]);

  useEffect(() => {
    if (chain) {
      if (isSuccess) {
        const walletClient = createWalletClient({
          chain,
          account: address,
          // @ts-ignore
          transport: window.ethereum ? custom(window.ethereum) : http(),
        });
        const tokenboundClient = new TokenboundClient({
          walletClient,
          chainId: chain?.id,
          implementationAddress: CONTRACT_ADDRESS[chain?.id]?.accountProxy,
        });
        const tbaAddress = tokenboundClient?.getAccount({
          tokenContract: contract.address as Address,
          tokenId: `${tokenId}`,
          implementationAddress: CONTRACT_ADDRESS[chain.id]?.accountProxy,
        });
        toast({
          title: "Successfully created account",
          description: (
            <div>
              TBA successfully deployed, address:{" "}
              <span className="font-mono whitespace-[initial]">
                {tbaAddress}
              </span>
            </div>
          ),
        });
        refetch();
      } else if (isLoading) {
        toast({
          title: "Waiting for transaction",
          description: (
            <div>
              Transaction hash:{" "}
              <span className="font-mono whitespace-[initial]">{txHash}</span>
            </div>
          ),
        });
      }
    }
  }, [txHash, isLoading]);

  return (
    <div className="col-span-1">
      <div className="bg-stone-900 rounded-lg overflow-hidden relative">
        <img
          className="hover:scale-[105%] transition-transform ease-in-out w-full h-full"
          src={transformTokenUri(rawMetadata?.image)}
          alt={rawMetadata?.description || description}
        />
        <Badge className="absolute top-[5%] left-[5%]">
          {chainId} {chainId === goerli.id && "- No TBA indexing yet!"}
        </Badge>
      </div>
      <div className="space-x-6 pb-4 pt-6 flex justify-center">
        <Button
          disabled={tbaAddress !== undefined}
          onClick={() => createAccount()}
        >
          {tbaAddress !== undefined ? "TBA Minted!" : "Mint TBA"}
        </Button>
        <Button
          disabled={tbaAddress === undefined}
          asChild={tbaAddress !== undefined}
        >
          {tbaAddress === undefined ? (
            "Not Sponsorable!"
          ) : (
            <Link href={`/sponsorship/${tbaAddress}/${chainId}`}>
              Sponsorships <MoveRight className="w-4 h-4 ml-2" />
            </Link>
          )}
        </Button>
      </div>
    </div>
  );
}
