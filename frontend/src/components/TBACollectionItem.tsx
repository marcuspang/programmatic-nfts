import { OwnedNft } from "alchemy-sdk";
import { MoveRight, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

interface TBACollectionItemProps extends OwnedNft {
  tbaAddress?: string;
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
  tbaAddress,
}: TBACollectionItemProps) {
  if (!tbaAddress) {
    return null;
  }

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
        <Button asChild>
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
