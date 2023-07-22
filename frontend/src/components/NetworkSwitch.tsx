import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { Button } from "./ui/button";

export function NetworkSwitch() {
  const { chain } = useNetwork();
  const { chains, isLoading, pendingChainId, switchNetwork } =
    useSwitchNetwork();

  if (!chain) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>{chain?.name || "No network selected"}</Button>
        <ChevronDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="px-2">
        {chains.map((x) => (
          <DropdownMenuItem
            disabled={!switchNetwork || x.id === chain?.id}
            key={x.id}
            onClick={() => switchNetwork?.(x.id)}
          >
            {x.name}
            {isLoading && pendingChainId === x.id && " (switching)"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
