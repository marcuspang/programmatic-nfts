import { TBACollections } from "@/components/TBACollections";
import { UserNFTCollection } from "@/components/UserNFTCollection";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-between p-24">
      <h1>asdasda</h1>
      <TBACollections />
      <UserNFTCollection />
    </main>
  );
}
