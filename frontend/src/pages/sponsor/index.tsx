import { TBACollection } from "@/components/TBACollection";

export default function SponsorPage() {
  return (
    <main className="flex min-h-[calc(100vh-120px)] flex-col items-center container mt-12">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl pb-12">
        Sponsor Token-Bound Accounts (TBAs)
      </h1>
      <TBACollection />
    </main>
  );
}
