import { NFTCollection } from "@/components/NFTCollection";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-72px)] flex-col items-center container mt-12">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl pb-12">
        Your Token-Bound Accounts (TBAs)
      </h1>
      <NFTCollection />
    </main>
  );
}
