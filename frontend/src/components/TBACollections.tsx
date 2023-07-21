import { useQuery } from "@airstack/airstack-react";

const query = `query MyQuery($tokenAddress: [Address!]) {
  Accounts(
    input: {filter: {tokenAddress: {_in: $tokenAddress}}, blockchain: ethereum, limit: 200}
  ) {
    Account {
      address {
        addresses
        domains {
          name
          isPrimary
        }
        socials {
          dappName
          profileName
        }
      }
    }
  }
}`;

const variables = {
  tokenAddress: ["0x26727ed4f5ba61d3772d1575bca011ae3aef5d36"],
};

export function TBACollections() {
  // const { data, loading, error } = useQuery(query, variables);

  return <div></div>;
}
