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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { CONTRACT_ADDRESS } from "@/constants/contractAddress";
import {
  useAccountSponsorableAddSponsorship,
  useAccountSponsorableIsSponsorable,
  usePrepareAccountSponsorableAddSponsorship,
} from "@/lib/generated";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeAlert, Check } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Address, isAddress } from "viem";
import { useAccount, useBlockNumber, useNetwork } from "wagmi";
import * as z from "zod";

const formSchema = z
  .object({
    startBlock: z.coerce.number().min(0),
    endBlock: z.coerce.number().min(0),
    sponsorshipAmount: z.coerce.number().gt(0),
    transformerAddress: z
      .string()
      .refine(isAddress, () => ({ message: "Must be a valid address" })),
  })
  .refine(
    (val) => val.endBlock > val.startBlock,
    () => ({ message: "End block must be greater than start block" })
  );

export default function SponsorTbaPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { data, isLoading } = useBlockNumber();
  const { chain } = useNetwork();
  const { toast } = useToast();
  const { tbaAddress } = router.query;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startBlock: 0,
      endBlock: 0,
      sponsorshipAmount: 1_000_000_000_000_000,
      transformerAddress: chain
        ? CONTRACT_ADDRESS[chain.id]?.svgLayerTransformer
        : undefined,
    },
  });

  useEffect(() => {
    if (
      !isLoading &&
      data &&
      form.getValues("startBlock") === 0 &&
      form.getValues("endBlock") === 0
    ) {
      form.setValue("startBlock", Number(data));
      form.setValue("endBlock", Number(data));
    }
  }, [data, isLoading]);

  const startBlock = form.watch("startBlock");
  const endBlock = form.watch("endBlock");
  const sponsorshipAmount = form.watch("sponsorshipAmount");
  const transformerAddress = form.watch("transformerAddress");

  const { data: isSponsorable } = useAccountSponsorableIsSponsorable({
    account: address,
    address: tbaAddress as Address,
    chainId: chain?.id,
    enabled:
      address !== undefined &&
      tbaAddress !== undefined &&
      isAddress(tbaAddress.toString()) &&
      chain !== undefined,
  });

  const { config } = usePrepareAccountSponsorableAddSponsorship({
    address: tbaAddress as Address,
    account: address,
    value: BigInt(sponsorshipAmount),
    // start, end, transformerAddress
    args: [BigInt(startBlock), BigInt(endBlock), transformerAddress!],
    enabled:
      transformerAddress !== undefined &&
      tbaAddress !== undefined &&
      isAddress(tbaAddress.toString()) &&
      address !== undefined,
  });
  const {
    write,
    isSuccess,
    data: sponsorshipData,
    isLoading: isSponsorshipLoading,
  } = useAccountSponsorableAddSponsorship(config);

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
      } else if (isSponsorshipLoading) {
        toast({
          title: "Waiting for transaction",
          description: (
            <div>
              Transaction hash:{" "}
              <span className="font-mono whitespace-[initial]">
                {sponsorshipData?.hash}
              </span>
            </div>
          ),
        });
      }
    }
  }, [sponsorshipData?.hash, isLoading]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    write?.();
  }

  return (
    <main className="flex min-h-[calc(100vh-120px)] flex-col items-center container my-12">
      <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl pb-2">
        Sponsor a TBA
      </h1>
      <Badge
        className={cn(
          "mt-1 cursor-pointer",
          isSponsorable
            ? "bg-green-700 dark:bg-green-400 hover:bg-green-600"
            : "bg-red-700 dark:bg-red-400 hover:bg-red-600"
        )}
      >
        {isSponsorable ? "Sponsorships Active" : "Sponsorships Not Active"}
      </Badge>
      <Card className="mt-12">
        <CardHeader>
          <CardTitle>
            <span className="font-mono">{tbaAddress?.toString()}</span>
          </CardTitle>
          <CardDescription>
            Configure your sponsorship for this TBA.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="startBlock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Block</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is when the sponsorship will start.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endBlock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Block</FormLabel>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <span className="text-muted-foreground text-sm">
                        ~{+((endBlock - startBlock) * 2).toString()}s
                      </span>
                    </div>
                    <FormDescription>
                      This is when the sponsorship will end.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sponsorshipAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sponsorship Amount (wei)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is how much wei you want to give the TBA owner.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="transformerAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transformer Address</FormLabel>
                    <FormControl>
                      <Input type="string" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the address of the token URI transformer.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="space-x-4">
              <Button className="w-full" type="submit">
                <Check className="mr-2 h-4 w-4" /> Submit
              </Button>
              <Button
                className="w-full"
                type="button"
                onClick={() => router.back()}
              >
                Go Back
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </main>
  );
}
