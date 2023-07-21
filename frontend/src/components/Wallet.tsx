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
  const [web3AuthModalPack, setWeb3AuthModalPack] =
    useState<Web3AuthModalPack>();
  const [safeAuthSignInResponse, setSafeAuthSignInResponse] =
    useState<AuthKitSignInData | null>(null);
  const [userInfo, setUserInfo] = useState<Partial<UserInfo>>();
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
    null
  );
  const { theme } = useTheme();
  useEffect(() => {
    (async () => {
      const options: Web3AuthOptions = {
        clientId: process.env.WEB3AUTH_CLIENT_ID!,
        web3AuthNetwork:
          process.env.NODE_ENV === "development" ? "testnet" : "mainnet",
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: "0x1",
          rpcTarget: `https://polygon-mumbai.infura.io/v3/${process.env
            .INFURA_KEY!}`,
        },
        uiConfig: {
          theme: theme === "dark" || theme === "light" ? theme : "dark",
          loginMethodsOrder: ["google", "facebook", "email_passwordless"],
        },
      };

      const newWeb3AuthModalPack = new Web3AuthModalPack({
        txServiceUrl: "https://safe-transaction-polygon.safe.global",
      });

      await newWeb3AuthModalPack.init({
        options,
        adapters: [openloginAdapter],
        modalConfig,
      });

      newWeb3AuthModalPack.subscribe(
        ADAPTER_EVENTS.CONNECTED,
        connectedHandler
      );

      newWeb3AuthModalPack.subscribe(
        ADAPTER_EVENTS.DISCONNECTED,
        disconnectedHandler
      );

      setWeb3AuthModalPack(newWeb3AuthModalPack);

      return () => {
        newWeb3AuthModalPack.unsubscribe(
          ADAPTER_EVENTS.CONNECTED,
          connectedHandler
        );
        newWeb3AuthModalPack.unsubscribe(
          ADAPTER_EVENTS.DISCONNECTED,
          disconnectedHandler
        );
      };
    })();
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

    setSafeAuthSignInResponse(signInInfo);
    setUserInfo(userInfo || undefined);
    setProvider(web3AuthModalPack.getProvider() as SafeEventEmitterProvider);
  };

  const logout = async () => {
    if (!web3AuthModalPack) return;

    await web3AuthModalPack.signOut();

    setProvider(null);
    setSafeAuthSignInResponse(null);
  };

  return !!provider ? (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button>
            {safeAuthSignInResponse?.eoa.slice(0, 10) + "..." ||
              userInfo?.name ||
              userInfo?.email}
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="px-2">
          <DropdownMenuLabel className="whitespace-prewrap">
            {safeAuthSignInResponse?.eoa || userInfo?.name || userInfo?.email}
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
