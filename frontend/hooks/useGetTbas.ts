import { useAccount } from "wagmi";
import { useQuery } from "@airstack/airstack-react";

const query = `query MyQuery($owner: [Identity!], $blockchain: TokenBlockchain!) {
  TokenBalances(
    input: {filter: {owner: {_in: $owner}}, blockchain: $blockchain, limit: 200}
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

export const useGetPolygonTbas = () => {
  const { address } = useAccount();
  const result = useQuery(query, { owner: address, blockchain: "polygon" });

  return { ...result, data: transformTbaAddresses(result.data) };
};
export const useGetMainnetTbas = () => {
  const { address } = useAccount();
  const result = useQuery(query, { owner: address, blockchain: "ethereum" });

  return { ...result, data: transformTbaAddresses(result.data) };
};
