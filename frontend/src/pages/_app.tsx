import "./globals.css";

import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { init } from "@airstack/airstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Metadata } from "next";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { goerli, polygon, polygonMumbai } from "viem/chains";
import { WagmiConfig, configureChains, createConfig, mainnet } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, goerli, polygon, polygonMumbai],
  [publicProvider()]
);

const config = createConfig({
  publicClient,
  webSocketPublicClient,
});

const queryClient = new QueryClient();

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Programmatic NFTs",
  description: "Paid sponsorships for your NFTs",
};

init(process.env.AIRSTACK_API_KEY!);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={inter.className}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <WagmiConfig config={config}>
          <QueryClientProvider client={queryClient}>
            <Navbar />
            <Component {...pageProps} />
          </QueryClientProvider>{" "}
        </WagmiConfig>
      </ThemeProvider>
    </div>
  );
}
