import React, {useState} from "react";
import { gql, useQuery } from "@apollo/client";
import { Divider } from "antd";

import { Address, TokenBalance } from "../../components";
import { useContractLoader } from "../../hooks";

import {superTokenABI, fakeTokenABI} from "./abis";
import FakeTokenMinters from "./FakeTokenMinter";
import {UserCashflows} from "./Cashflows";
import RecipientForm from "./RecipientForm";


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

  }

  return metadata;
}

// const GET_TOKEN_FLOWS = gql`
//   query getTokenFlows($owner: String!, $tokens: [String!]!) {      
//     tokens(where: {symbol_in: $tokens}) {
//       id
//       symbol
//       name
//       underlyingAddress
//       outflows: flows(where: {owner: $owner}) {
//         id
//         flowRate
//         recipient {
//           id
//         }
//       }
//       inflows: flows(where: {recipient: $owner}) {
//         id
//         flowRate
//         owner {
//           id
//         }
//       }
//     }
//   }
// `

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

export default function SuperfluidGraph({provider, tokenList, chainId, address, mainnetProvider}) {
  if(!address) {
    return <h1>...</h1>;
  }

  const [recipients, setRecipients] = useState([]);

  // superfluid subgraph addresses are case sensitive and need to be lowercase
  address = address.toLowerCase();
  // append x to every token from list
  const superTokenList = tokenList.map(token => token+"x");
  const { loading, error, data } = useQuery(GET_TOKENS, { variables: {owner: address, tokens: superTokenList}});
  
  let contractMetadata;
  if (data && data.hasOwnProperty("tokens")) {
    contractMetadata = buildContractMetadata(data.tokens, chainId);
  } 

  const tokenContracts = useContractLoader(provider, {chainId, externalContracts: contractMetadata});

  if (loading || !tokenContracts || !tokenContracts[tokenList[0]]) return 'Loading';
  if (error) return `Error! ${error.message}`;

  const containerStyle = {
    border: "1px solid #cccccc",
    width: 600,
    margin: "auto"
  }

  return (
    <div style={{display: "flex", flexWrap: "wrap"}}>
      <div style={containerStyle}>
        <h1>Superfluid</h1>
        <Divider/>
        
        <Address 
          address={address}
          ensProvider={mainnetProvider}
        />

        <Divider/>
        <h1>Balances</h1>
        {tokenList.map(token => (
          <div key={"owner-balances" + token }>
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

        <RecipientForm
          mainnetProvider={mainnetProvider}
          onRecipientSubmit={(recipient)=>{setRecipients([...recipients, recipient])}}
          onRecipientFailed={(err)=>console.log(err)}
        />
          
        <Divider/>
        <h1>Cashflows</h1>
        <UserCashflows
          address={address}
          superTokenList={superTokenList}
          mainnetProvider={mainnetProvider}
        />
      </div>


      <div style={containerStyle}>
        {recipients.map(recipient => (
          <div key={"recipient-flows" + recipient}>
            <Address address={recipient.address} ensProvider={mainnetProvider}/>
            <h2>Cashflows</h2>
            <UserCashflows
              key={recipient.address + "flows"}
              isRecipient={true}
              address={recipient.address}
              superTokenList={superTokenList}
              mainnetProvider={mainnetProvider}
            />

            <Divider/>
          </div>

        ))}
      </div>
    </div>
  )
}
