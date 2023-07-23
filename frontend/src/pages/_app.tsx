import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";

import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { isTestnet } from "@/lib/isTestnet";
import { init } from "@airstack/airstack-react";
import { Web3Modal } from "@web3modal/react";
// import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import type { Metadata } from "next";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import {
  goerli,
  lineaTestnet,
  mainnet,
  polygon,
  polygonMumbai,
  polygonZkEvm,
  polygonZkEvmTestnet,
} from "viem/chains";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

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
    w3mProvider({ projectId: process.env.WALLET_CONNECT_PROJECT_ID! }),
  ]
);

// const { connectors } = getDefaultWallets({
//   appName: "Programmatic NFTs",
//   projectId: process.env.WALLET_CONNECT_PROJECT_ID!,
//   chains,
// });

const config = createConfig({
  publicClient,
  connectors: w3mConnectors({
    projectId: process.env.WALLET_CONNECT_PROJECT_ID!,
    chains,
  }),
  autoConnect: true,
});
const ethereumClient = new EthereumClient(config, chains);

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
            <Toaster />
            <Component {...pageProps} />
          </QueryClientProvider>
        </WagmiConfig>
        <Web3Modal
          projectId={process.env.WALLET_CONNECT_PROJECT_ID!}
          ethereumClient={ethereumClient}
        />
      </ThemeProvider>
    </div>
  );
}
