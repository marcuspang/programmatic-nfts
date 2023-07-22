import { defineConfig } from "@wagmi/cli";
import { actions, react } from "@wagmi/cli/plugins";

import REGISTRY_ABI from "./src//abis/ERC6551Registry.json";
import ACCOUNT_ABI from "./src/abis/AccountSponsorable.json";

export default defineConfig({
  out: "src/lib/generated.ts",
  contracts: [
    {
      abi: REGISTRY_ABI.abi as any,
      address: "0x02101dfB77FDE026414827Fdc604ddAF224F0921",
      name: "ERC6551Registry",
    },
    {
      abi: ACCOUNT_ABI.abi as any,
      name: "AccountSponsorable",
    },
  ],
  plugins: [actions(), react()],
});
