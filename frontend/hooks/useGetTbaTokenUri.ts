import { CONTRACT_ADDRESS } from "@/constants/contractAddress";
import { TokenboundClient } from "@tokenbound/sdk";
import { useCallback, useEffect } from "react";
import { Address, createWalletClient, http, custom, isAddress } from "viem";
import { useAccount, useNetwork } from "wagmi";

export function useGetTbaTokenUri(tbaAddress?: string) {
  const { chain } = useNetwork();
  const { address } = useAccount();

  const executeCall = useCallback(async () => {
    if (!tbaAddress || !isAddress(tbaAddress) || chain === undefined) return;

    const walletClient = createWalletClient({
      chain,
      account: address,
      // @ts-ignore
      transport: window.ethereum ? custom(window.ethereum) : http(),
    });

    const tokenboundClient =
      chain &&
      new TokenboundClient({
        walletClient,
        chainId: chain.id,
        implementationAddress: CONTRACT_ADDRESS[chain.id].accountProxy,
      });

    const result = await tokenboundClient?.executeCall({
      account: tbaAddress,
      to: tbaAddress,
      data: "tokenURI()",
      value: 0n,
    });
    return result;
  }, [tbaAddress]);

  return { executeCall };
}
