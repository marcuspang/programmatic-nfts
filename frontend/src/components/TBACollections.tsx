import { useQuery } from "@airstack/airstack-react";
import { useAccount } from "wagmi";

const query = `query MyQuery($owner: [Identity!]) {
  TokenBalances(
    input: {filter: {owner: {_in: $owner}}, blockchain: ethereum, limit: 200}
  ) {
    TokenBalance {
      tokenNfts {
        erc6551Accounts {
          address {
            addresses
          }
        }
      }
    }
  }
}`;

export function TBACollections() {
  const { address } = useAccount();
  const { data, loading, error } = useQuery(query, { owner: address });

  console.log({ data });

  return <div></div>;
}
