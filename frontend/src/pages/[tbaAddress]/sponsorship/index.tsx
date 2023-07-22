import { SponsorshipTables } from "@/components/SponsorshipTables";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  useAccountSponsorableIsSponsorable,
  useAccountSponsorableSetIsSponsorable,
  useAccountSponsorableSponsorships,
  useAccountSponsorableTokenUri,
  usePrepareAccountSponsorableSetIsSponsorable,
} from "@/lib/generated";
import { cn } from "@/lib/utils";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { isAddress } from "viem";
import { Address, useAccount, useNetwork } from "wagmi";

export default function SponsorshipPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { toast } = useToast();
  const { tbaAddress } = router.query;
  const [finalImageUrl, setFinalImageUrl] = useState("");
  const [parsedTokenUri, setParsedTokenUri] = useState("");

  const { data: tokenUri } = useAccountSponsorableTokenUri({
    account: address,
    address: tbaAddress as Address,
    chainId: chain?.id,
    enabled:
      address !== undefined &&
      tbaAddress !== undefined &&
      isAddress(tbaAddress.toString()) &&
      Boolean(chain),
  });
  const { data: isSponsorable } = useAccountSponsorableIsSponsorable({
    account: address,
    address: tbaAddress as Address,
    chainId: chain?.id,
    enabled:
      address !== undefined &&
      tbaAddress !== undefined &&
      isAddress(tbaAddress.toString()) &&
      Boolean(chain),
  });

  const { config } = usePrepareAccountSponsorableSetIsSponsorable({
    account: address,
    address: tbaAddress as Address,
    chainId: chain?.id,
    enabled:
      address !== undefined &&
      tbaAddress !== undefined &&
      isAddress(tbaAddress.toString()) &&
      Boolean(chain) &&
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
          title: "Successfully created sponsorship",
          description: (
            <div>
              Sponsorship successfully created, address:{" "}
              <span className="font-mono whitespace-[initial]">
                {tbaAddress}
              </span>
            </div>
          ),
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
    <main className="min-h-[calc(100vh-120px)] container mt-12 grid grid-cols-5 gap-2">
      <div className="col-span-3 px-4">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl pb-4">
          Your TBA Sponsorship
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
        <SponsorshipTables tbaAddress={tbaAddress?.toString()} />
      </div>
      {finalImageUrl ? (
        <div className="col-span-2 px-4 space-y-4">
          <div className="overflow-hidden">
            <img
              src={finalImageUrl}
              className="hover:scale-[105%] transition-transform ease-in-out w-full"
              alt="Your TBA image"
            />
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
                  {JSON.stringify(parsedTokenUri, null, 2)}
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
