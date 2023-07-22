import { chainIds } from "@/constants/chainIds";
import { chainRpcPrefix } from "@/constants/chainRpcPrefix";
import { txServiceUrl } from "@/constants/txServiceUrl";
import { isTestnet } from "@/lib/isTestnet";
import {
  AuthKitSignInData,
  Web3AuthEventListener,
  Web3AuthModalPack,
} from "@safe-global/auth-kit";
import {
  ADAPTER_EVENTS,
  CHAIN_NAMESPACES,
  SafeEventEmitterProvider,
  UserInfo,
  WALLET_ADAPTERS,
} from "@web3auth/base";
import { Web3AuthOptions } from "@web3auth/modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { ChevronDown, LogOutIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Address, useConnect, useEnsName } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { polygonMumbai } from "viem/chains";

const connectedHandler: Web3AuthEventListener = (data) =>
  console.log("CONNECTED", data);
const disconnectedHandler: Web3AuthEventListener = (data) =>
  console.log("DISCONNECTED", data);

// TODO: setup with other EVM chains
export const CURRENT_CHAIN: "polygon" | "eth" | "zkPolygon" = "polygon";

const modalConfig = {
  [WALLET_ADAPTERS.TORUS_EVM]: {
    label: "Torus Wallet",
    showOnModal: false,
  },
  [WALLET_ADAPTERS.METAMASK]: {
    label: "MetaMask",
    showOnDesktop: true,
    showOnMobile: false,
  },
};

const openloginAdapter = new OpenloginAdapter({
  loginSettings: {
    mfaLevel: "mandatory",
  },
  adapterSettings: {
    uxMode: "popup",
    whiteLabel: {
      name: "Safe",
    },
  },
});

const web3AuthModalPack = new Web3AuthModalPack({
  txServiceUrl:
    txServiceUrl[isTestnet() ? "testnet" : "mainnet"][CURRENT_CHAIN],
});

function generateConfig(theme?: string): Web3AuthOptions {
  return {
    clientId: process.env.WEB3AUTH_CLIENT_ID!,
    web3AuthNetwork: isTestnet() ? "testnet" : "mainnet",
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: chainIds[isTestnet() ? "testnet" : "mainnet"][CURRENT_CHAIN],
      rpcTarget: `${
        chainRpcPrefix[isTestnet() ? "testnet" : "mainnet"][CURRENT_CHAIN]
      }${process.env.INFURA_KEY!}`,
    },
    uiConfig: {
      theme: theme === "dark" || theme === "light" ? theme : "dark",
      loginMethodsOrder: ["google", "facebook", "email_passwordless"],
    },
  };
}
export function Wallet() {
  const [safeAuthSignInResponse, setSafeAuthSignInResponse] =
    useState<AuthKitSignInData | null>(null);
  const [userInfo, setUserInfo] = useState<Partial<UserInfo>>();
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
    null
  );
  const { theme } = useTheme();
  const { connect, reset } = useConnect({
    connector: new InjectedConnector(),
  });
  const { data, isError } = useEnsName({
    address: safeAuthSignInResponse?.eoa as Address | undefined,
  });

  useEffect(() => {
    const options = generateConfig(theme);

    web3AuthModalPack
      .init({
        options,
        // @ts-ignore
        adapters: [openloginAdapter],
        modalConfig,
      })
      .then(() => {
        web3AuthModalPack.subscribe(ADAPTER_EVENTS.CONNECTED, connectedHandler);

        web3AuthModalPack.subscribe(
          ADAPTER_EVENTS.DISCONNECTED,
          disconnectedHandler
        );
      });

    return () => {
      web3AuthModalPack.unsubscribe(ADAPTER_EVENTS.CONNECTED, connectedHandler);
      web3AuthModalPack.unsubscribe(
        ADAPTER_EVENTS.DISCONNECTED,
        disconnectedHandler
      );
    };
  }, []);

  useEffect(() => {
    if (web3AuthModalPack && web3AuthModalPack.getProvider()) {
      (async () => {
        await login();
      })();
    }
  }, [web3AuthModalPack]);

  const login = async () => {
    if (!web3AuthModalPack) return;

    const signInInfo = await web3AuthModalPack.signIn();
    const userInfo = await web3AuthModalPack.getUserInfo();

    connect({
      chainId: polygonMumbai.id,
    });

    setSafeAuthSignInResponse(signInInfo);
    setUserInfo(userInfo || undefined);
    setProvider(web3AuthModalPack.getProvider() as SafeEventEmitterProvider);
  };

  const logout = async () => {
    if (!web3AuthModalPack) return;

    await web3AuthModalPack.signOut();
    reset();

    setProvider(null);
    setSafeAuthSignInResponse(null);
  };

  return !!provider ? (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger className="font-mono flex">
          {!isError
            ? `${data?.slice(0, 10)}...`
            : `${safeAuthSignInResponse?.eoa.slice(0, 10)}...` ||
              userInfo?.name ||
              userInfo?.email}
          <ChevronDown />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="px-2">
          <DropdownMenuLabel>
            <span className="font-normal">
              Chain: {CURRENT_CHAIN.toUpperCase()}
            </span>{" "}
            <br />
            <span className="font-mono">
              {!isError
                ? data
                : safeAuthSignInResponse?.eoa ||
                  userInfo?.name ||
                  userInfo?.email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            Logout <LogOutIcon className="ml-2 h-4 w-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : (
    <Button onClick={login}>Login</Button>
  );
}
