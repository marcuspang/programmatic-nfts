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
import {
  useAccountSponsorableAddSponsorship,
  usePrepareAccountSponsorableAddSponsorship,
} from "@/lib/generated";
import { BellRing, Check } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Address, etherUnits, isAddress } from "viem";
import { useBlockNumber } from "wagmi";
import * as z from "zod";
import { useForm } from "react-hook-form";

const formSchema = z
  .object({
    startBlock: z.number().min(0),
    endBlock: z.number().min(0),
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
  const { data } = useBlockNumber();
  const { tbaAddress } = router.query;

  const [startBlock, setStartBlock] = useState(data);
  const [endBlock, setEndBlock] = useState(data);
  const [transformerAddress, setTransformerAddress] = useState<Address>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startBlock,
      endBlock,
      transformerAddress,
    },
  });

  const { config } = usePrepareAccountSponsorableAddSponsorship({
    value: 1000000000000000000n,
    // start, end, transformerAddress
    args: [startBlock!, endBlock!, transformerAddress!],
    enabled:
      startBlock !== undefined &&
      endBlock !== undefined &&
      transformerAddress !== undefined,
  });

  useAccountSponsorableAddSponsorship(config);

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <main className="flex min-h-[calc(100vh-72px)] flex-col items-center container mt-12">
      <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl pb-12">
        Sponsor a TBA
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="font-mono">{tbaAddress?.toString()}</span>
          </CardTitle>
          <CardDescription>
            Configure your sponsorship for this TBA.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is when the sponsorship will end.
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
          </form>
        </Form>
        <CardFooter>
          <Button className="w-full" type="submit">
            <Check className="mr-2 h-4 w-4" /> Submit
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
