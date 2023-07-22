import { CONTRACT_ADDRESS } from "@/constants/contractAddress";
import { TokenboundClient } from "@tokenbound/sdk";
import { OwnedNft } from "alchemy-sdk";
import { MoveRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Address, createWalletClient, custom, http } from "viem";
import { useAccount, useNetwork, useWaitForTransaction } from "wagmi";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { base64url } from "@web3auth/openlogin-adapter";

interface NFTCollectionItemProps extends OwnedNft {
  tbaAddress?: string;
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
  tokenId,
  tbaAddress,
  refetch,
}: NFTCollectionItemProps) {
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
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: "Check the console for more details!",
      });
      console.error(err);
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
        refetch();
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
        <img
          className="hover:scale-[105%] transition-transform ease-in-out w-full h-full"
          src={transformTokenUri(rawMetadata?.image)}
          alt={rawMetadata?.description || description}
        />
      </div>
      <div className="space-x-6 pb-4 pt-6 flex justify-center">
        <Button
          disabled={tbaAddress !== undefined || tokenboundClient === undefined}
          onClick={() => createAccount()}
        >
          {tbaAddress !== undefined ? "TBA Minted!" : "Mint TBA"}
        </Button>
        {tbaAddress === undefined ? (
          <Button disabled>Not Sponsorable!</Button>
        ) : (
          <Button disabled={tbaAddress === undefined} asChild>
            <Link href={`/${tbaAddress}/sponsorship`}>
              Sponsorships <MoveRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
