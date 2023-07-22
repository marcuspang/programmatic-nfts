import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { init } from "@airstack/airstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Metadata } from "next";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import {
  polygon,
  polygonMumbai,
  polygonZkEvm,
  polygonZkEvmTestnet,
  goerli,
  mainnet,
  lineaTestnet,
} from "viem/chains";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { Toaster } from "@/components/ui/toaster";
import { isTestnet } from "@/lib/isTestnet";

const { chains, publicClient } = configureChains(
  [
    polygon,
    polygonZkEvm,
    mainnet,
    polygonMumbai,
    lineaTestnet,
    polygonZkEvmTestnet,
    goerli,
  ],
  [
    publicProvider(),
    alchemyProvider({
      apiKey: isTestnet()
        ? process.env.POLYGON_TESTNET_ALCHEMY_API_KEY!
        : process.env.POLYGON_ALCHEMY_API_KEY!,
    }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Programmatic NFTs",
  projectId: process.env.WALLET_CONNECT_PROJECT_ID!,
  chains,
});

const config = createConfig({
  publicClient,
  connectors,
  autoConnect: true,
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
          <RainbowKitProvider chains={chains}>
            <QueryClientProvider client={queryClient}>
              <Navbar />
              <Toaster />
              <Component {...pageProps} />
            </QueryClientProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </ThemeProvider>
    </div>
  );
}
