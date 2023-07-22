import { useAccount } from "wagmi";
import { useQuery } from "@airstack/airstack-react";

const query = `query MyQuery($owner: [Identity!]) {
  TokenBalances(
    input: {filter: {owner: {_in: $owner}}, blockchain: polygon, limit: 200}
  ) {
    TokenBalance {
      tokenNfts {
        erc6551Accounts {
          address {
            addresses
          }
        }
      }
      tokenAddress
      tokenId
    }
  }
}`;

function transformTbaAddresses(data: any) {
  return data?.TokenBalances?.TokenBalance.filter(
    (balance: any) =>
      balance?.tokenNfts !== null && balance?.tokenNfts.erc6551Accounts !== null
  );
  // .reduce((acc: any[], balance: any) => {
  //   if (balance?.erc6551Accounts?.length > 0) {
  //     return acc.concat(balance?.erc6551Accounts[0]?.address?.addresses[0]);
  //   }
  //   return acc;
  // }, []);
}

export const useGetTbas = () => {
  const { address } = useAccount();
  const result = useQuery(query, { owner: address });

  return { ...result, data: transformTbaAddresses(result.data) };
};
