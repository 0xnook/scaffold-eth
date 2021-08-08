import React, {useEffect} from "react";
import { gql, useQuery } from "@apollo/client";
import { useContractLoader } from "../../hooks";

import {superTokenABI, fakeTokenABI} from "./abis";

const buildContractMetadata = (tokens, chainId) => {
  let metadata = {};
  for (const token of tokens) {
   const underlyingTokenSymbol = token.symbol.slice(0, -1); 
   console.log("under ", underlyingTokenSymbol)
   const metadataPart = {
      [chainId]: {
        contracts: {
          [token.symbol]: {
            address: token.id,
            abi: superTokenABI
          },
          [underlyingTokenSymbol]: {
            address: token.underlyingAddress,
            abi: fakeTokenABI
          }
        },
      },
    };

    

    metadata = {...metadataPart, ...metadata}
    console.log("new ", metadata);
  }
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

export default function SuperfluidGraph({provider, tokenList, chainId}) {
  // append x to every token from list
  const superTokenList = tokenList.map(token => token+"x");

  const { loading, error, data } = useQuery(GET_TOKENS, { variables: {tokens: superTokenList}});
  
  let contractMetadata;
  if (data && data.hasOwnProperty("tokens")) {
    contractMetadata = buildContractMetadata(data.tokens, chainId);
  }

  const tokenContracts = useContractLoader(provider, {chainId, externalContracts:contractMetadata});

  console.log(tokenContracts);


  if (loading) return 'Loading'
  if (error) return `Error! ${error.message}`;

  return (
    <div>
     {data.tokens.map(token => (
        <h1 key={token.id} value={token.id}>
          {token.symbol}
          {JSON.stringify(token, 4)}
        </h1>
      ))}
    </div>
  )
}
