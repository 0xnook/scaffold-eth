import React, {useState, useEffect} from "react";
import { gql, useQuery } from "@apollo/client";
import { Divider } from "antd";
import SuperfluidSDK from '@superfluid-finance/js-sdk'


import { Address, TokenBalance } from "../../components";
import { useContractLoader } from "../../hooks";

import { useThemeSwitcher } from "react-css-theme-switcher";

import {superTokenABI, fakeTokenABI} from "./abis";
import FakeTokenMinters from "./FakeTokenMinter";
import {UserCashflows} from "./Cashflows";
import RecipientForm from "./RecipientForm";


import SuperfluidLogo from "./superfluidLogo.svg";



// returns a dictionary of super and fake tokens with their address and ABI
const buildTokenMetadata = (tokens, chainId) => {
  let metadata = {
    [chainId]: {
      contracts: {}
    }
  }

  // build fake and super token metadata
  for (const token of tokens) {
   const underlyingTokenSymbol = token.symbol.slice(0, -1); 
   const metadataPart = {
      [token.symbol]: {
        address: token.id,
        abi: superTokenABI
      },
      [underlyingTokenSymbol]: {
        address: token.underlyingAddress,
        abi: fakeTokenABI // like ERC20 but with mint funtion for testing
      }
    };
    metadata[chainId].contracts = {...metadata[chainId].contracts, ...metadataPart};
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

export default function SuperfluidGraph({provider, tokenList, chainId, address, mainnetProvider}) {
  if(!address) {
    return <h1>...</h1>;
  }
  // superfluid subgraph addresses are case sensitive and need to be lowercase
  address = address.toLowerCase();

  // user added recipients, we use a set since they are unique
  const [recipients, setRecipients] = useState(new Set());
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
        tokenList
      });
      try {
        await sf.initialize();
        setSfSDK(sf);
      } catch(e) {
        console.log("SuperfluidSDK initialization error: ", e);
        setErrMsg("SuperfluidSDK initialization error");
      };
    };
  }, [address, provider])
  

  // append x to every token from list, not the most reliable way but works for testing purposes
  const superTokenList = tokenList.map(token => token+"x");

  // fetch data from subgraph
  const { loading, error, data } = useQuery(GET_TOKENS, { variables: {owner: address, tokens: superTokenList}});

  // build dictionary of token addresses and ABIs
  let metadata;
  if(data && data.hasOwnProperty("tokens")) {
    metadata = buildTokenMetadata(data.tokens, chainId, provider);
  }

  // build contract objects with given metadata
  const tokenContracts = useContractLoader(provider, {chainId, externalContracts: metadata});

  
  if (loading || !tokenContracts || !tokenContracts[tokenList[0]]) return 'Loading';

  if (error) return `Error! ${error.message}`;

  // method to handle user recipient submission, throws error if user tries to add himself as recipient
  const addRecipient = (value) => {
    const recipient = value.address;
    console.log("checkval ", recipient);
    if (recipient == address) {
      setErrMsg("Can't use your own address as a recipient address.");
      return;
    }
    setRecipients(new Set(recipients).add(recipient))
    setErrMsg("");
  }

  const containerStyle = {
    border: "1px solid #cccccc",
    width: 600,
    margin: "2rem",
    padding: "2rem"
  }

  return (
    <div style={{display: "flex", flexWrap: "wrap"}}>
      <div style={containerStyle}>
        <img src={SuperfluidLogo} type="image/svg+xml" alt="Superfluid" style={logoStyle}/>

        <p style={{color: "red"}}>{errMsg}</p>
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
          onRecipientSubmit={addRecipient}
          onRecipientFailed={setErrMsg}
        />
          
        <Divider/>
        <h1>Cashflows</h1>
        <UserCashflows
          balanceAddress={address}
          superTokenList={superTokenList}
          mainnetProvider={mainnetProvider}
          contracts={tokenContracts}
          isRecipient={false}
        />
      </div>
      {/* Recipient section */}
      <div style={containerStyle}>
        {recipients.size > 0 ? "" : "Add a recipient to create or edit a flow"}
        {[...recipients].map(recipient => (
          <div key={"recipient-flows" + recipient}>
           <Address address={recipient} ensProvider={mainnetProvider}/>
           <h2>Cashflows</h2>
            <UserCashflows
              key={recipient + "flows"}
              isRecipient={true}
              connectedAddress={address}
              balanceAddress={recipient}
              superTokenList={superTokenList}
              mainnetProvider={mainnetProvider}
              contracts={tokenContracts}
              sfSDK={sfSDK}
            />
            <Divider/>
          </div>
        ))}
      </div>
    </div>
  )
}
