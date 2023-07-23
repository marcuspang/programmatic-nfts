import * as PushAPI from "@pushprotocol/restapi";
import { useQuery } from "@tanstack/react-query";
import { useWalletClient } from "wagmi";

export async function createGroup({
  userAddress,
  walletClient,
  chainId,
  groupDescription,
  tokenURI,
  contractAddress,
}: UseCreateGroupProps) {
  // pre-requisite API calls that should be made before
  // need to get user and through that encryptedPvtKey of the user
  const user = await PushAPI.user.get({
    account: "eip155:" + userAddress,
  });
  if (user === null) {
    await PushAPI.user.create({
      account: "eip155:" + userAddress,
    });
  }

  // need to decrypt the encryptedPvtKey to pass in the api using helper function
  const pgpDecryptedPvtKey = await PushAPI.chat.decryptPGPKey({
    encryptedPGPPrivateKey: user.encryptedPrivateKey,
    signer: walletClient,
  });

  return await PushAPI.chat.createGroup({
    groupName: `group:${chainId}:${contractAddress}`,
    groupDescription,
    members: [userAddress],
    groupImage: tokenURI,
    admins: [userAddress],
    isPublic: true,
    account: userAddress,
    pgpPrivateKey: pgpDecryptedPvtKey,
  });
}

interface UseCreateGroupProps {
  userAddress: string;
  contractAddress: string;
  chainId: number;
  groupDescription: string;
  tokenURI: string;
  walletClient: PushAPI.SignerType;
}

export function useCreateGroup(props: UseCreateGroupProps) {
  const { data: walletClient } = useWalletClient();

  return useQuery({
    queryFn: () => createGroup({ ...props, walletClient: walletClient as any }),
    queryKey: ["create-group", props.chainId, props.contractAddress],
    enabled:
      walletClient !== undefined &&
      props.chainId !== undefined &&
      props.contractAddress !== undefined,
  });
}
