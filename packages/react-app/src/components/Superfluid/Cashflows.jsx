import React, {useEffect, useReducer} from "react";
import { Address  } from "../../components";
import { gql, useQuery } from "@apollo/client";
import FlowForm from "./FlowForm";
import { BigNumber, utils } from "ethers";


// Query to fetch cash-flows for a given user and tokens
const GET_TOKEN_FLOWS = gql`
  query getTokenFlows($owner: String!, $tokens: [String!]!) {      
    tokens(where: {symbol_in: $tokens}) {
      id
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
      accountWithToken(where: {account: $owner}) {
        balance
      }
    }
  }
`

const reducer = (state, action) => {
  switch(action.type) {
    case "Set":
      return action.payload;
    case "Increment":
      return state.add(action.payload);
    default:
      throw new Error("Invalid action");
  }
}

export function TokenCashflows({address, token, balance, mainnetProvider, inflows, outflows}) {

  const bigNumBalance = BigNumber.from(balance);
  const [updatingBalance, dispatch] = useReducer(reducer, bigNumBalance);


  if(!address) {
    return <h1>...</h1>;
  }

  let inflowSum = 0;
  if (inflows.length) {
    inflowSum = inflows.reduce((sum, flow) => sum + parseInt(flow.flowRate), 0);
  }

  let outflowSum = 0;
  if (outflows.length) {
    outflowSum = outflows.reduce((sum, flow) => sum + parseInt(flow.flowRate), 0);
  }

  const netflow = inflowSum - outflowSum;

  let inflowTemplate = "❌ No inflows";

  if(inflows.length) {
    inflowTemplate = inflows.map(flow => (
        <div key={"inflows-" + flow.owner + token}>
          <h4>Sender</h4>
          <Address ensProvider={mainnetProvider} address={flow.owner.id} fontSize={14} />

          <h4>Recipient</h4>

          <Address ensProvider={mainnetProvider} address={address} fontSize={14} />

          <h4>Flow Rate</h4>
          {flow.flowRate}
        </div>
      ))
  }

  
  let outflowTemplate = "❌ No outflows";
  if(outflows.length) {
    outflowTemplate = outflows.map(flow => (
        <div key={"outflows-" + flow.recipient.id + "-" + token}>
          <h4>Sender</h4>
          <Address ensProvider={mainnetProvider} address={address} fontSize={14} />

          <h4>Recipient</h4>

          <Address ensProvider={mainnetProvider} address={flow.recipient.id} fontSize={14} />

          <h4>Flow Rate</h4>
          {flow.flowRate}
        </div>
      ))  
  }


  useEffect(() => {
    const desync = Math.abs(updatingBalance-bigNumBalance)
    if (desync > netflow*100) {
      dispatch({type: "Set", payload: bigNumBalance})
    }

    let frequency = 1000; // 1000 millisecs = 1 sec
    let increment = netflow;

    // if increment is big enough, update balance every quater of second
    if(Math.round(netflow/250) != 0) {
      frequency = 250;
      increment = Math.round(netflow/frequency); 
    }

    const interval = setInterval(() => {
      dispatch({type: "Increment", payload: increment});
    }, frequency);

    return function cleanup() {
      clearInterval(interval);
    }
  }, [netflow, balance])

  return (
    <div>
      <h4>
      { token }  { utils.formatUnits(updatingBalance, 18) }
      </h4>


      <h3>Inflows </h3>
      {inflowTemplate}

      <h3>Outflows </h3>
      {outflowTemplate}

      <h3>Netflow </h3>
      {netflow}
    </div>
  );
}

export function UserCashflows({balanceAddress, connectedAddress, superTokenList, mainnetProvider, isRecipient, contracts, sfSDK}) {
  if(!balanceAddress) {
    return <h1>...</h1>;
  }
  // superfluid subgraph addresses are case sensitive and need to be lowercase
  balanceAddress = balanceAddress.toLowerCase();


  const { loading, error, data } = useQuery(GET_TOKEN_FLOWS, { 
    variables: {owner: balanceAddress, tokens: superTokenList},
    pollInterval: 30000,
    fetchPolicy: 'network-only'
  });

  if (loading) return 'Loading';
  if (error) return `Error! ${error.message}`;

  
  let flowForm;
  if(isRecipient) {
    flowForm = (
      <FlowForm address={connectedAddress} recipient={balanceAddress} tokenData={data.tokens} contracts={contracts} sfSDK={sfSDK}/>
    );
  } 

  const style = {
    display: "flex",
    margin: "auto",
    justifyContent: "space-evenly",
    flexWrap: "wrap"
  }

  return (
    <div style={style}> 
      {flowForm}
      
      {data.tokens.map(tokenData => { 
        const balance = tokenData.accountWithToken.length ? tokenData.accountWithToken[0].balance : 0;
        return (
        <div key={tokenData.id + balanceAddress + "flows"}>
          <TokenCashflows 
            key={tokenData.id + balanceAddress + "flows"}
            address={balanceAddress}
            balance={balance}
            mainnetProvider={mainnetProvider}
            token={tokenData.symbol}
            tokenAddress={tokenData.id}
            inflows={tokenData.inflows}
            outflows={tokenData.outflows}
            contracts={contracts}
            isRecipient={true}
            sfSDK={sfSDK}
          />
        </div>
      )})}
    </div>
  );
}

