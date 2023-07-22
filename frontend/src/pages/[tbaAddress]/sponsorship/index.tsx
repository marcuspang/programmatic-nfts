import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAccountSponsorableTokenUri } from "@/lib/generated";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { isAddress } from "viem";
import { Address, useNetwork } from "wagmi";

export default function SponsorshipPage() {
  const router = useRouter();
  const { chain } = useNetwork();
  const { tbaAddress } = router.query;
  const [finalImageUrl, setFinalImageUrl] = useState("");
  const [parsedTokenUri, setParsedTokenUri] = useState("");

  const { data: tokenUri } = useAccountSponsorableTokenUri({
    account: tbaAddress as Address,
    address: tbaAddress as Address,
    chainId: chain?.id,
    enabled:
      tbaAddress !== undefined &&
      isAddress(tbaAddress.toString()) &&
      Boolean(chain),
  });
  useEffect(() => {
    if (tokenUri) {
      parseTokenUri(tokenUri).then(setFinalImageUrl);
    }
  }, [tokenUri]);

  async function parseTokenUri(tokenUri: string): Promise<string> {
    try {
      if (tokenUri.startsWith("https://")) {
        const res = await fetch(tokenUri);
        const parsedTokenUri = await res.json();
        setParsedTokenUri(parsedTokenUri);
        return parsedTokenUri.image;
      }
    } catch (e) {
      console.log("Error parsing", tokenUri, e);
    }
    return tokenUri;
  }

  return (
    <main className="min-h-[calc(100vh-72px)] container mt-12 grid grid-cols-5 gap-2">
      <div className="col-span-3 px-4">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl pb-4">
          Your TBA Sponsorship
        </h1>
        <span className="font-mono leading-7">{tbaAddress?.toString()}</span>
        <h2 className="pt-12 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors">
          Sponsorship Requests
        </h2>
        <h2 className="pt-12 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors">
          Active Sponsorships
        </h2>
      </div>
      {tokenUri ? (
        <div className="col-span-2 px-4 space-y-4">
          <img
            src={finalImageUrl}
            className="w-full h-full"
            alt="Your TBA image"
          />
          <Card>
            <CardHeader>
              <CardTitle className="font-semibold">Token URI</CardTitle>
              <CardDescription>
                Here you can see how the sponsorships have modified your
                TBA&apos;s tokenURI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="whitespace-prewrap overflow-hidden">
                <code>{JSON.stringify(parsedTokenUri, null, 2)}</code>
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
