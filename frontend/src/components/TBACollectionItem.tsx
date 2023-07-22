import { CONTRACT_ADDRESS } from "@/constants/contractAddress";
import { TokenboundClient } from "@tokenbound/sdk";
import { OwnedNft } from "alchemy-sdk";
import { MoveRight, Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Address, createWalletClient, custom, http } from "viem";
import { useAccount, useNetwork, useWaitForTransaction } from "wagmi";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

interface TBACollectionItemProps extends OwnedNft {
  tbaAddress: string;
}

function transformTokenUri(uri?: string) {
  if (uri?.startsWith("ipfs://")) {
    return uri.replace("ipfs://", "https://gateway.ipfs.io/ipfs/");
  }

  return uri;
}

export function TBACollectionItem({
  rawMetadata,
  description,
  contract,
  tokenId,
  tbaAddress,
}: TBACollectionItemProps) {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { toast } = useToast();

  const [txHash, setTxHash] = useState<string>();

  const walletClient = createWalletClient({
    chain,
    account: address,
    // @ts-ignore
    transport: window.ethereum ? custom(window.ethereum) : http(),
  });
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: txHash as Address,
    enabled: txHash !== undefined,
  });

  const tokenboundClient =
    chain &&
    new TokenboundClient({
      walletClient,
      chainId: chain?.id,
      implementationAddress: CONTRACT_ADDRESS[chain.id].accountProxy,
    });

  const createAccount = useCallback(async () => {
    if (!tokenboundClient || !address) return;
    try {
      const transaction = await tokenboundClient.prepareCreateAccount({
        tokenContract: contract.address as Address,
        tokenId: `${tokenId}`,
        implementationAddress: CONTRACT_ADDRESS[chain.id].accountProxy,
      });

      const txHash = await walletClient.sendTransaction({
        ...transaction,
        account: address,
      });
      setTxHash(txHash);
    } catch (err) {
      console.log(err);
    }
  }, [tokenboundClient]);

  useEffect(() => {
    if (chain) {
      if (isSuccess) {
        const tbaAddress = tokenboundClient?.getAccount({
          tokenContract: contract.address as Address,
          tokenId: `${tokenId}`,
          implementationAddress: CONTRACT_ADDRESS[chain.id].accountProxy,
        });
        toast({
          title: "Successfully created account",
          description: (
            <div>
              TBA successfully deployed, address:{" "}
              <span className="font-mono">{tbaAddress}</span>
            </div>
          ),
        });
      } else if (isLoading) {
        toast({
          title: "Waiting for transaction",
          description: (
            <div>
              Transaction hash: <span className="font-mono">{txHash}</span>
            </div>
          ),
        });
      }
    }
  }, [txHash, isLoading]);

  return (
    <div className="col-span-1">
      <div className="bg-stone-900 rounded-lg overflow-hidden">
        {rawMetadata?.image?.startsWith("data") ? (
          <img
            style={{
              backgroundImage: `url(${rawMetadata.image});`,
            }}
          />
        ) : (
          <img
            className="hover:scale-[105%] transition-transform ease-in-out w-full h-full"
            src={transformTokenUri(rawMetadata?.image)}
            alt={rawMetadata?.description || description}
          />
        )}
      </div>
      <div className="space-x-6 pb-4 pt-6 flex justify-center">
        <Button disabled={tokenboundClient === undefined} asChild>
          <Link href={`/sponsor/${tbaAddress}`}>
            <Plus className="w-5 h-5 mr-1" />
            Sponsor
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/${tbaAddress}/sponsorship`}>
            View Sponsorships <MoveRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}