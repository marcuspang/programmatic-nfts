import { useRouter } from "next/router";
import { Address, useAccount, useNetwork, useWalletClient } from "wagmi";
import {
  createGroup,
  useCreateGroup,
} from "../../../../../../hooks/useCreateGroup";
import { useAccountSponsorableTokenUri } from "@/lib/generated";
import { isAddress } from "viem";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { tbaAddress, chainId } = router.query;

  const { data: tokenUri } = useAccountSponsorableTokenUri({
    account: address,
    address: tbaAddress as Address,
    chainId: +chainId?.toString()!,
    enabled:
      address !== undefined &&
      tbaAddress !== undefined &&
      isAddress(tbaAddress.toString()) &&
      chain !== undefined,
  });
  const { data: walletClient } = useWalletClient();

  function createChatGroup() {
    const provider = new ethers.providers.Web3Provider(window?.ethereum, "any");
    const signer = provider.getSigner();

    createGroup({
      chainId: +chainId?.toString()!,
      contractAddress: tbaAddress?.toString()!,
      groupDescription: "",
      tokenURI: tokenUri!,
      userAddress: address?.toString()!,
      walletClient: signer,
    });
  }

  return (
    <main className="min-h-[calc(100vh-120px)] container mt-12 mb-12">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Chat with interested sponsors here
      </h1>
      <Button onClick={() => createChatGroup()}>Create Group</Button>
      <p>Room Name: </p>
    </main>
  );
}
