import React, {useState, useEffect} from "react";
import { gql, useQuery } from "@apollo/client";
import { Divider } from "antd";
import SuperfluidSDK from '@superfluid-finance/js-sdk'
import { BigNumber } from "ethers";

import { Address } from "../../components";

import { useThemeSwitcher } from "react-css-theme-switcher";

import {superTokenABI, fakeTokenABI} from "./abis";
import FakeTokenMinters from "./FakeTokenMinter";
import {Cashflows} from "./Cashflows";
import RecipientForm from "./RecipientForm";
import {SuperBalances} from "./SuperBalances";
import {CashflowForm} from "./CashflowForm";

import SuperfluidLogo from "./superfluidLogo.svg";


import { Contract } from "ethers";

// returns a dictionary of super and fake tokens with their address and ABI
const buildTokenMetadata = (provider, tokens) => {
  let contracts = {};

  // build fake and super token metadata
  for (const token of tokens) {
    const contractPart = {
      [token.id]: new Contract(token.id, superTokenABI, provider.getSigner()),
      [token.underlyingAddress]: new Contract(token.underlyingAddress, fakeTokenABI, provider.getSigner()),
    }

    contracts = {...contracts, ...contractPart}
  }
 
  return contracts;
}

// Augment getTokens subgraph query with an array of netflows per token
// TODO: reduce number of iterations
const augmentWithNetflows = (data) => {
  // an array of netflows per token will 
  let netflows = {};

  // make a set with all the token addresses
  const tokenAddresses = new Set([
    ...data.account.flowsReceived.map(flow => flow.token.id),
    ...data.account.flowsOwned.map(flow => flow.token.id),
  ]);

  // reducer to compute netflows, given an array of flows
  const netflowReducer = (prev, current) => prev.add(current.flowRate);
  
  for (const tokenAddress of tokenAddresses) {
    const filterByToken = flow => flow.token.id === tokenAddress;

    const tokenInflows = data.account.flowsReceived.filter(filterByToken);
    const tokenOutflows = data.account.flowsOwned.filter(filterByToken);

    const netInflow = tokenInflows.reduce(netflowReducer, BigNumber.from(0));
    const netOutflow = tokenOutflows.reduce(netflowReducer, BigNumber.from(0));

    let tokF = tokenInflows.find(filterByToken) || tokenOutflows.find(filterByToken);

    // like js 'delete' but makes a deep copy
    const removeKey = (key, {[key]: _, ...rest}) => rest;

    // remove flowrate property as it may be misleading
    const newTokF = removeKey("flowRate", tokF);

    const netflow = {
      [tokF.token.symbol]: {
        token: newTokF,
        netflow: netInflow.sub(netOutflow),
      }
    };
    
    netflows = {...netflows, ...netflow}
  }
  
  return netflows;
}



// start by retrieving the token addresses and contracts
const GET_TOKENS = gql`
    query getTokens($fakeSuperTokenList: [String!]!, $userTokens: [String!]!, $owner: String!) {
      fakeTokens: tokens(where: {symbol_in: $fakeSuperTokenList}) {
        id
        name
        symbol
        underlyingAddress
      }
      userTokens: tokens(where: {
        underlyingAddress_in: $userTokens
      }) {
        id
        name
        symbol
        underlyingAddress
      }
      account(id: $owner) {
        flowsOwned {
          id
          owner {
            id
          }
          recipient {
            id
          }
          token {
            id
            symbol
            underlyingAddress
          }
          flowRate
        }
        flowsReceived {
          id
          owner {
            id
          }
          recipient {
            id
          }
          token {
            id
            symbol
            underlyingAddress
          }
          flowRate
        }
      }
    }
  `

export default function SuperfluidGraph(props) {
  const {provider, chainId, address, mainnetProvider, isRecipient, addRecipientHandler} = props;
  const fakeTokenList = ["fDAI", "fUSDC", "fTUSD"];
  // append x to every token from list, not the most reliable way but works for testing purposes
  const fakeSuperTokenList = fakeTokenList.map(token => token+"x");

  const userTokens = [{
    symbol: "WBTC",
    address: "0xd1b98b6607330172f1d991521145a22bce793277",
  }]

  const userTokenAddressList = userTokens.map(token => token.address.toLowerCase());

  if(!address || !chainId || !address || !mainnetProvider || !chainId || !provider) {
    return <h1>...</h1>;
  }
  // superfluid subgraph addresses are case sensitive and need to be lowercase
  const lcAddress = address.toLowerCase();


  // superfluid SDK
  const [sfSDK, setSfSDK] = useState();
  // error displayed to user
  const [errMsg, setErrMsg] = useState("");

  // logo style for light or dark theme
  const [logoStyle, setLogoStyle] = useState({});
  // keep track of current change to invert logo colors
  const { currentTheme } = useThemeSwitcher();

  
  useEffect(() => {
    const style = currentTheme === "dark" ? {filter: "invert(1)"} : {};
    setLogoStyle(style);
  }, [currentTheme]);


  // load SuperfluidSDK and stores it in state, updates if the chain or address changes
  useEffect(async ()=>{
    if(provider) {
      const sf = new SuperfluidSDK.Framework({
        ethers: provider,
      });
      try {
        await sf.initialize();
        setSfSDK(sf);
      } catch(e) {
        console.log("SuperfluidSDK initialization error: ", e);
        setErrMsg("SuperfluidSDK initialization error");
      };
    };
  }, [address, provider]);  



  // fetch data from subgraph
  const { loading, error, data } = useQuery(GET_TOKENS, { 
    variables: {owner: lcAddress, fakeSuperTokenList, userTokens: userTokenAddressList}, 
    // pollInterval: 30000,
    fetchPolicy: 'network-only',
  });


  if (loading) return 'Loading';


  // build dictionary of token addresses and ABIs
  let fakeSuperTokens;
  let userSuperTokens;

  let tokenContracts;
  // useContractLoader hook does not listen to external contract changes, but it does listed to chainId, hence we use that to triger hook rerender
  let superTokens;
  let tokenData;


  // useEffect(async () => {
  if(data && data.hasOwnProperty("fakeTokens") && data.hasOwnProperty("userTokens")) {
    tokenData = data.fakeTokens.concat(data.userTokens);

    userSuperTokens = data.userTokens.map((token) => {
      return {
        symbol: token.symbol,
        address: token.id
      };
    })
    fakeSuperTokens = data.fakeTokens.map((token) => {
      return {
        symbol: token.symbol,
        address: token.id
      };
    })
    
    superTokens = userSuperTokens.concat(fakeSuperTokens);

    tokenContracts =  buildTokenMetadata(provider, tokenData, chainId);
  }; 


  if (error) return `Error! ${error.message}`;

  if (!tokenContracts || !superTokens) {
    return 'Loading contracts'
  };

  const netflows = augmentWithNetflows(data);

  const containerStyle = {
    border: "1px solid #cccccc",
    width: 900,
    margin: "2rem",
    padding: "2rem"
  }

  return (
    <div style={{display: "flex", flexWrap: "wrap", margin: "auto", justifyContent: "center"}}>
      <div style={containerStyle}>
        {!isRecipient && 
          <div>
            <img src={SuperfluidLogo} type="image/svg+xml" alt="Superfluid" style={logoStyle}/>
            <p style={{color: "red"}}>{errMsg}</p>
            <Divider/>
          </div>
        }
        <Address 
          address={lcAddress}
          ensProvider={mainnetProvider}
        />

        <Divider/>
        {!isRecipient && 
          <div>
            <FakeTokenMinters 
              provider={provider}
              address={lcAddress}
              tokens={fakeSuperTokens}
              tokenContracts={tokenContracts}
            />
            <Divider/>
          </div>
        }
        
        <SuperBalances tokenData={tokenData} address={address} contracts={tokenContracts} provider={provider} netflows={netflows}/>

        <Divider/>

        {!isRecipient && 
          <div>
            <CashflowForm 
              address={address}
              mainnetProvider={mainnetProvider}
              sfSDK={sfSDK}
              superTokens={superTokens}
            />
            <Divider/>
          </div>
        }

        <Cashflows mainnetProvider={mainnetProvider} provider={provider} inflows={data.account.flowsReceived} outflows={data.account.flowsOwned} netflows={netflows} isRecipient={isRecipient}/>

        {!isRecipient && 
          <div>
            <RecipientForm
              mainnetProvider={mainnetProvider}
              onRecipientSubmit={addRecipientHandler}
              onRecipientFailed={setErrMsg}
            />
            <Divider/>
          </div>
        }

      </div>
    </div>
  )
}
