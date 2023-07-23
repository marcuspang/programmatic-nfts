import { NFTCollection } from "@/components/NFTCollection";
import { NotificationItem, chainNameType } from "@pushprotocol/uiweb";
import { useEffect, useState } from "react";
import * as PushAPI from "@pushprotocol/restapi";
import { ENV } from "@pushprotocol/restapi/src/lib/constants";
import { useTheme } from "next-themes";

export default function Home() {
  const [notifications, setNotifications] = useState([]);
  const { theme } = useTheme();

  useEffect(() => {
    PushAPI?.user
      .getFeeds({
        user: "eip155:5:0xD8634C39BBFd4033c0d3289C4515275102423681", // user address in CAIP
        env: ENV.STAGING,
      })
      .then(setNotifications);
  }, []);

  return (
    <main className="flex min-h-[calc(100vh-72px)] flex-col items-center container mt-12">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl pb-12">
        Your NFTs
      </h1>
      <NFTCollection />
    </main>
  );
}
