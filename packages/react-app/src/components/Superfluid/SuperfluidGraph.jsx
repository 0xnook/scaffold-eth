import React, {useEffect} from "react";
import { gql, useQuery } from "@apollo/client";
import { Divider } from "antd";

import { Address, TokenBalance } from "../../components";
import { useContractLoader } from "../../hooks";

import {superTokenABI, fakeTokenABI} from "./abis";
import FakeTokenMinters from "./FakeTokenMinter";

const buildContractMetadata = (tokens, chainId) => {
  let metadata = {
    [chainId]: {
      contracts: {}
    }
  }
  for (const token of tokens) {
   const underlyingTokenSymbol = token.symbol.slice(0, -1); 
   const metadataPart = {
      [token.symbol]: {
        address: token.id,
        abi: superTokenABI
      },
      [underlyingTokenSymbol]: {
        address: token.underlyingAddress,
        abi: fakeTokenABI
      }
    };
    metadata[chainId].contracts = {...metadataPart, ...metadata[chainId].contracts};

  console.log(token.symbol);
  }

  console.log(metadata);
  return metadata;
}


// start by retrieving the token addresses and contracts
const GET_TOKENS = gql`
    query getTokens($tokens: [String!]!) {
      tokens(where: {symbol_in: $tokens}) {
        id
        name
        symbol
        underlyingAddress
      }
    }
  `

export default function SuperfluidGraph({provider, tokenList, chainId, address}) {
  // append x to every token from list
  const superTokenList = tokenList.map(token => token+"x");
  const { loading, error, data } = useQuery(GET_TOKENS, { variables: {tokens: superTokenList}});
  
  let contractMetadata;
  if (data && data.hasOwnProperty("tokens")) {
    contractMetadata = buildContractMetadata(data.tokens, chainId);
  }

  const tokenContracts = useContractLoader(provider, {chainId, externalContracts: contractMetadata});

  if (loading) return 'Loading';
  if (error) return `Error! ${error.message}`;

  return (
    <div>

      <h1>Superfluid</h1>

      <Divider/>
      <h2>Balances</h2>
     {tokenList.map(token => (
        <div>
          <TokenBalance
            img={token}
            name={token}
            provider={provider}
            address={address}
            contracts={tokenContracts}
          />
          <TokenBalance
            img={token + "x"}
            name={token + "x"}
            provider={provider}
            address={address}
            contracts={tokenContracts}
          />
        </div>
      ))}
      <Divider/>
      <FakeTokenMinters 
        provider={provider}
        address={address}
        tokenList={tokenList}
        tokenContracts={tokenContracts}
      />
      <Divider/>
      
    </div>
  )
}
