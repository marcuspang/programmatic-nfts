import { CHAIN_RPC_PREFIX } from "@/constants/chainRpcPrefix";
import { TX_SERVICE_URL } from "@/constants/txServiceUrl";
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
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { ChevronDown, LogOutIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { polygonMumbai } from "viem/chains";
import { Address, useConnect, useEnsName, useNetwork } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { NetworkSwitch } from "./NetworkSwitch";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const connectedHandler: Web3AuthEventListener = (data) =>
  console.log("CONNECTED", data);
const disconnectedHandler: Web3AuthEventListener = (data) =>
  console.log("DISCONNECTED", data);

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

export function Wallet() {
  const { chain, chains } = useNetwork();
  console.log({ chains });
  const [safeAuthSignInResponse, setSafeAuthSignInResponse] =
    useState<AuthKitSignInData | null>(null);
  const [userInfo, setUserInfo] = useState<Partial<UserInfo>>();
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
    null
  );
  const [web3AuthModal, setWeb3AuthModal] = useState<Web3AuthModalPack>();
  const { theme } = useTheme();
  const { connect, reset } = useConnect({
    connector: new InjectedConnector(),
  });
  const { data, isError } = useEnsName({
    address: safeAuthSignInResponse?.eoa as Address | undefined,
  });

  useEffect(() => {
    const web3AuthModalPack = new Web3AuthModalPack({
      txServiceUrl: TX_SERVICE_URL[chains[0].id],
    });

    web3AuthModalPack
      .init({
        options: {
          clientId: process.env.WEB3AUTH_CLIENT_ID!,
          web3AuthNetwork:
            chains[0].id === polygonMumbai.id ? "testnet" : "mainnet",
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x" + chains[0].id.toString(16),
            rpcTarget: `${CHAIN_RPC_PREFIX[chains[0].id]}${process.env
              .INFURA_KEY!}`,
          },
          uiConfig: {
            theme: (theme === "light" ? theme : "dark") as "light" | "dark",
            loginMethodsOrder: ["google", "facebook", "email_passwordless"],
          },
        },
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

    setWeb3AuthModal(web3AuthModalPack);

    return () => {
      web3AuthModalPack.unsubscribe(ADAPTER_EVENTS.CONNECTED, connectedHandler);
      web3AuthModalPack.unsubscribe(
        ADAPTER_EVENTS.DISCONNECTED,
        disconnectedHandler
      );
    };
  }, []);

  useEffect(() => {
    if (web3AuthModal && web3AuthModal.getProvider()) {
      (async () => {
        await login();
      })();
    }
  }, [web3AuthModal]);

  const login = async () => {
    if (!web3AuthModal) return;

    const signInInfo = await web3AuthModal.signIn();
    const userInfo = await web3AuthModal.getUserInfo();

    // connect({
    //   chainId: polygonMumbai.id,
    // });

    setSafeAuthSignInResponse(signInInfo);
    setUserInfo(userInfo || undefined);
    setProvider(web3AuthModal.getProvider() as SafeEventEmitterProvider);
  };

  const logout = async () => {
    if (!web3AuthModal) return;

    await web3AuthModal?.signOut();
    // reset();

    setProvider(null);
    setSafeAuthSignInResponse(null);
  };

  return !!provider ? (
    <div className="flex items-center">
      <NetworkSwitch />
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
            <span className="font-mono">
              {!isError
                ? data
                : safeAuthSignInResponse?.eoa ||
                  userInfo?.name ||
                  userInfo?.email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              if (chain?.id === polygonMumbai.id) {
              }
            }}
          >
            Switch to
          </DropdownMenuItem>
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
