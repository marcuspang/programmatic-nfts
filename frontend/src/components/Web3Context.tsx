import "@biconomy/web3-auth/dist/src/style.css";

import { isTestnet as checkIsTestnet } from "@/lib/isTestnet";
import { init } from "@airstack/airstack-react";
import SocialLogin from "@biconomy/web3-auth";
import { useTheme } from "next-themes";
import { ReactNode, createContext, useEffect, useState } from "react";
import { goerli, polygon, polygonMumbai } from "viem/chains";
import { WagmiConfig, configureChains, createConfig, mainnet } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { publicProvider } from "wagmi/providers/public";

// TODO: setup with other EVM chains
export type CustomChain = "polygon" | "eth" | "zkPolygon";

export interface Web3ContextInterface {
  currentChain: CustomChain;
  isTestnet: boolean;
  socialLogin?: SocialLogin;
}

const isTestnet = checkIsTestnet();

const defaultValues: Web3ContextInterface = {
  currentChain: "polygon",
  isTestnet,
};

export const Web3Context = createContext<Web3ContextInterface>(defaultValues);

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [goerli, mainnet, polygonMumbai, polygon],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
  connectors: [
    new InjectedConnector({
      chains,
      options: {
        name: "Injected Wallet",
        shimDisconnect: true,
      },
    }),
  ],
});

init(process.env.AIRSTACK_API_KEY!);

export function Web3Provider({ children }: { children?: ReactNode }) {
  const [chain, setChain] = useState<CustomChain>("polygon");
  const [socialLogin, setSocialLogin] = useState<SocialLogin>();

  useEffect(() => {
    if (window.document) {
      setSocialLogin(new SocialLogin());
    }
  }, []);

  useEf

  return (
    <WagmiConfig config={config}>
      <Web3Context.Provider
        value={{
          currentChain: chain,
          isTestnet,
          socialLogin,
        }}
      >
        {children}
      </Web3Context.Provider>
    </WagmiConfig>
  );
}
