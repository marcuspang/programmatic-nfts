import { OwnedNft } from "alchemy-sdk";
import { Button } from "./ui/button";
import {
  usePrepareErc6551RegistryCreateAccount,
  useErc6551RegistryCreateAccount,
} from "@/lib/generated";
import { contractAddress } from "@/constants/contractAddress";
import { isTestnet } from "@/lib/isTestnet";
import { CURRENT_CHAIN } from "./Wallet";
import { chainIds } from "@/constants/chainIds";
import { Address } from "viem";

interface NFTCollectionItemProps extends OwnedNft {}

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
}: NFTCollectionItemProps) {
  console.log(contract.address, tokenId)
  const { config } = usePrepareErc6551RegistryCreateAccount({
    args: [
      contractAddress[isTestnet() ? "testnet" : "mainnet"][CURRENT_CHAIN]
        .accountProxy,
      BigInt(chainIds[isTestnet() ? "testnet" : "mainnet"][CURRENT_CHAIN]),
      contract.address as Address,
      BigInt(tokenId),
      BigInt(
        "0x6551655165516551655165516551655165516551655165516551655165516551"
      ),
      `0x0`,
    ],
    enabled: Boolean(contract.address) && Boolean(tokenId),
  });
  const { write } = useErc6551RegistryCreateAccount(config);

  return (
    <div className="col-span-1">
      <div className="bg-stone-900 rounded-lg overflow-hidden">
        {rawMetadata?.image?.startsWith("data") ? (
          <img
            style={{
              backgroundImage: "url(" + rawMetadata.image + ");",
            }}
          />
        ) : (
          <img
            className="hover:scale-[110%] transition-transform w-full h-full"
            src={transformTokenUri(rawMetadata?.image)}
            alt={rawMetadata?.description || description}
          />
        )}
      </div>
      <div className="space-x-8 pb-4 pt-6 flex justify-center">
        <Button disabled={!write} onClick={() => write?.()}>
          Mint TBA
        </Button>
        <Button>Sponsorships</Button>
      </div>
    </div>
  );
}
