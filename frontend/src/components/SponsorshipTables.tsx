import { useAccountSponsorableGetSponsorships } from "@/lib/generated";
import { Address, isAddress } from "viem";
import { useAccount, useNetwork } from "wagmi";
import { DataTable } from "./DataTable";

export function SponsorshipTables({ tbaAddress }: { tbaAddress?: string }) {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { data } = useAccountSponsorableGetSponsorships({
    account: address,
    address: tbaAddress as Address,
    chainId: chain?.id,
    enabled:
      address !== undefined &&
      tbaAddress !== undefined &&
      isAddress(tbaAddress.toString()) &&
      Boolean(chain),
  });

  return (
    <div className="pb-12">
      <h2 className="pt-12 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors">
        Sponsorship Requests
      </h2>
      <DataTable
        data={data?.filter((row) => !(row.isActive && row.isApproved)) || []}
      />
      <h2 className="pt-12 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors">
        Active & Approved Sponsorships
      </h2>
      <DataTable
        data={data?.filter((row) => row.isActive && row.isApproved) || []}
      />
    </div>
  );
}
