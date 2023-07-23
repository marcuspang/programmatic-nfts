import { SponsorshipTables } from "@/components/SponsorshipTables";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  useAccountSponsorableIsSponsorable,
  useAccountSponsorableSetIsSponsorable,
  useAccountSponsorableTokenUri,
  usePrepareAccountSponsorableSetIsSponsorable,
} from "@/lib/generated";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { isAddress } from "viem";
import { Address, useAccount, useNetwork, useSwitchNetwork } from "wagmi";

export default function SponsorshipPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const { chain } = useNetwork();
  const { tbaAddress, chainId } = router.query;
  const [finalImageUrl, setFinalImageUrl] = useState("");
  const [parsedTokenUri, setParsedTokenUri] = useState("");
  const { switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    if (
      isConnected &&
      chain &&
      chain.id &&
      chainId !== undefined &&
      chain.id !== +chainId.toString()
    ) {
      switchNetwork?.(+chainId?.toString());
    }
  }, [chain, chainId, isConnected, switchNetwork]);

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
  const { data: isSponsorable } = useAccountSponsorableIsSponsorable({
    account: address,
    address: tbaAddress as Address,
    chainId: +chainId?.toString()!,
    enabled:
      address !== undefined &&
      tbaAddress !== undefined &&
      isAddress(tbaAddress.toString()) &&
      chain !== undefined,
  });

  const { config } = usePrepareAccountSponsorableSetIsSponsorable({
    account: address,
    address: tbaAddress as Address,
    chainId: +chainId?.toString()!,
    enabled:
      address !== undefined &&
      tbaAddress !== undefined &&
      isAddress(tbaAddress.toString()) &&
      chainId !== undefined &&
      isSponsorable !== undefined,
    args: [true],
  });
  const { data, isSuccess, isLoading, write } =
    useAccountSponsorableSetIsSponsorable(config);

  useEffect(() => {
    if (tokenUri) {
      parseTokenUri(tokenUri).then(setFinalImageUrl);
    }
  }, [tokenUri]);

  useEffect(() => {
    if (chain) {
      if (isSuccess) {
        toast({
          title: "Successfully enabled sponsorships",
        });
      } else if (isLoading) {
        toast({
          title: "Waiting for transaction",
          description: (
            <div>
              Transaction hash:{" "}
              <span className="font-mono whitespace-[initial]">
                {data?.hash}
              </span>
            </div>
          ),
        });
      }
    }
  }, [data?.hash, isLoading]);

  async function parseTokenUri(tokenUri: string): Promise<string> {
    try {
      if (tokenUri.startsWith("https://")) {
        const res = await fetch(tokenUri);
        const parsedTokenUri = await res.json();
        setParsedTokenUri(parsedTokenUri);
        return parsedTokenUri.image;
      } else if (tokenUri.startsWith("data:application/json;base64,")) {
        const parsedTokenUri = JSON.parse(
          Buffer.from(
            tokenUri.slice("data:application/json;base64,".length),
            "base64"
          ).toString()
        ).image;
        setParsedTokenUri(parsedTokenUri);
        return parsedTokenUri;
      }
    } catch (e) {
      console.log("Error parsing", tokenUri, e);
    }
    return tokenUri;
  }

  return (
    <main className="min-h-[calc(100vh-120px)] container mt-12 lg:grid grid-cols-5 gap-2 mb-12">
      <div className="col-span-3 px-4">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl pb-4 flex items-center justify-between">
          <span>Your TBA Sponsorship</span>
          <Badge className="lg:hidden py-1">
            scroll below to see your TBA!
          </Badge>
        </h1>
        <p className="font-mono leading-7">{tbaAddress?.toString()}</p>
        <Button
          size={"sm"}
          className={cn(
            "mt-1 cursor-pointer",
            isSponsorable
              ? "bg-green-700 dark:bg-green-400 hover:bg-green-600"
              : "bg-red-700 dark:bg-red-400 hover:bg-red-600"
          )}
          onClick={() => write?.()}
        >
          {isSponsorable ? "Sponsorable Enabled" : "Sponsorable Disabled"}
        </Button>
        <Link href={`/sponsorship/${tbaAddress}/${chainId}/chat`}>
          <Button
            className="block mt-6 bg-purple-700 text-lg dark:bg-purple-500 hover:bg-purple-600 mb-2"
            size="lg"
          >
            Chat (powered by Push)
          </Button>
        </Link>
        <Link href={`/sponsor/${tbaAddress}/${chainId}/`}>
          <Button size={"lg"} className="text-lg">
            Sponsor this TBA! <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </Link>
        <SponsorshipTables tbaAddress={tbaAddress?.toString()} />
      </div>
      {finalImageUrl ? (
        <div className="col-span-2 px-4 space-y-4">
          <div className="overflow-hidden">
            {tokenUri?.startsWith("https://") ? (
              <iframe
                src={tokenUri}
                className="w-full h-full min-h-[400px]"
              ></iframe>
            ) : (
              <img
                src={finalImageUrl}
                className="hover:scale-[105%] transition-transform ease-in-out w-full"
                alt="Your TBA image"
              />
            )}
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="font-semibold">Token URI</CardTitle>
              <CardDescription>
                Here you can see how the sponsorships have modified your
                TBA&apos;s tokenURI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <code className="whitespace-[initial]">
                  {JSON.stringify(parsedTokenUri || tokenUri, null, 2)}
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        "No image found!"
      )}
    </main>
  );
}
