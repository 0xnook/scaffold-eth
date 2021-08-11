import React from "react";
import { Divider } from "antd";
import { Address } from "../../components";
import { gql, useQuery } from "@apollo/client";
import FlowForm from "./FlowForm";

// Query to fetch cash-flows for a given user and tokens
const GET_TOKEN_FLOWS = gql`
  query getTokenFlows($owner: String!, $tokens: [String!]!) {      
    tokens(where: {symbol_in: $tokens}) {
      symbol
      outflows: flows(where: {owner: $owner}) {
        id
        flowRate
        recipient {
          id
        }
      }
      inflows: flows(where: {recipient: $owner}) {
        id
        flowRate
        owner {
          id
        }
      }
    }
  }
`

export function TokenCashflows({address, token, mainnetProvider, inflows, outflows}) {
  if(!address) {
    return <h1>...</h1>;
  }

  const style = {
    display: "flex",
    flexDirection: "column",
    // justifyContent: "space-between"
  };
  
  return (
    <div>

      <h2>{token} </h2>
      <h3>Inflows </h3>
      {inflows.map(flow => (
        <div key={"inflows-" + flow.owner + token}>
          <h4>Sender</h4>
          <Address ensProvider={mainnetProvider} address={flow.owner.id} fontSize={14} />

          <h4>Recipient</h4>

          <Address ensProvider={mainnetProvider} address={address} fontSize={14} />

          <h4>Flow Rate</h4>
          {flow.flowRate}
        </div>
      ))}


      <h3>Outflows </h3>
      {outflows.map(flow => (
        <div key={"outflows-" + flow.owner + token}>
          <h4>Sender</h4>
          <Address ensProvider={mainnetProvider} address={address} fontSize={14} />

          <h4>Recipient</h4>

          <Address ensProvider={mainnetProvider} address={flow.recipient.id} fontSize={14} />

          <h4>Flow Rate</h4>
          {flow.flowRate}
        </div>
        
      ))}
    </div>
  );
}

export function UserCashflows({address, superTokenList, mainnetProvider, isRecipient}) {
  if(!address) {
    return <h1>...</h1>;
  }
  // superfluid subgraph addresses are case sensitive and need to be lowercase
  address = address.toLowerCase();


  const { loading, error, data } = useQuery(GET_TOKEN_FLOWS, { variables: {owner: address, tokens: superTokenList}});

  if (loading) return 'Loading';
  if (error) return `Error! ${error.message}`;
  
  let flowForm;
  if(isRecipient) {
    flowForm = (
      <FlowForm tokens={superTokenList}  onFlowSubmit={()=>{}} onFlowFailed={()=>{}} />
    )
  } 


  const style = {
    display: "flex",
    margin: "auto",
    justifyContent: "space-evenly"
  }


  return (
    <div style={style}> 
      {flowForm}
      {data.tokens.map(tokenData => (
        <TokenCashflows 
          key={tokenData.symbol + address + "flows"}
          address={address}
          mainnetProvider={mainnetProvider}
          token={tokenData.symbol}
          inflows={tokenData.inflows}
          outflows={tokenData.outflows}
        />
      ))}
    </div>
  );
}

