import React, { useEffect, useState } from "react";
import SuperfluidSDK from "@superfluid-finance/js-sdk";
import { Divider } from "antd";

import { Address, TokenBalance } from "../../components";

import CashflowDisplayer from "./CashflowDisplayer";
import RecipientForm from "./RecipientForm";
import FlowForm from "./FlowForm";
import FakeTokenMinter from "./FakeTokenMinter";
import SuperTokenUpgrader from "./SuperTokenUpgrader";

// TODO: need to do free up (the sdk?) when exiting component to avoid memory leak
export default function Super({ address, provider, mainnetProvider, tokens, chainId }) {
  const [sfSDK, setSfSDK] = useState();
  const [recipients, setRecipients] = useState([]);
  const [sfUser, setSfUser] = useState({});
  const [sfRecipients, setSfRecipients] = useState({});
  const [tokenContracts, setTokenContracts] = useState({});
  const [superTokenContracts, setSuperTokenContracts] = useState();
  const [initializationError, setInitializationError] = useState("");

  // scaffold-eth hooks
  // get user provider
  //const userProvider = useUserSigner(injectedProvider, localProvider);

  // Initialize Superfluid SDK, runs at component initialization or when the
  // web3 provider changes
  useEffect(async () => {
    if (provider) {
      const sf = new SuperfluidSDK.Framework({
        ethers: provider,
        // ethers: new Web3Provider(window.ethereum),
        tokens,
      });
      try {
        await sf.initialize();
        console.log("💧 Superfluid SDK: ", sf);
        setSfSDK(sf);

        const tContracts = sf.tokens;
        const superTContracts = sf.superTokens;
        setTokenContracts(tContracts);
        setSuperTokenContracts(superTContracts);
      } catch (err) {
        setInitializationError(err.toString());
      }
    }
  }, [provider]);

  // watch for sdk and load super fluid sdk user object for current user
  useEffect(async () => {
    if (sfSDK && tokenContracts) {
      for (const token of tokens) {
        if (tokenContracts.hasOwnProperty(token + "x")) {
          const superTokenAddress = tokenContracts[token + "x"].address;
          const user = sfSDK.user({
            address: address,
            token: superTokenAddress,
          });
          setSfUser(prevState => {
            return {
              ...prevState,
              [token]: user,
            };
          });
        }
      }
    }
  }, [tokenContracts]);

  // once user sets a new recipient, load its superfluid sdk user details
  useEffect(async () => {
    if (sfSDK && recipients.length && recipients[0].hasOwnProperty("address")) {
      for (const recipient of recipients) {
        for (const token of tokens) {
          if (tokenContracts.hasOwnProperty(token + "x")) {
            const superTokenAddress = tokenContracts[token + "x"].address;
            const recipientUser = sfSDK.user({
              address: recipient.address,
              token: superTokenAddress,
            });
            setSfRecipients(prevState => {
              const prevRecipient = prevState[recipient.address];
              return {
                ...prevState,
                [recipient.address]: {
                  ...prevRecipient,
                  [token]: recipientUser,
                },
              };
            });
          }
        }
      }
    }
  }, [recipients]);

  // Form handlers:
  const onRecipientSubmit = values => {
    setRecipients([...recipients, values]);
  };

  const onRecipientFailed = errorInfo => {
    console.log("Failed:", errorInfo);
  };

  const onFlowSubmit = async values => {
    const recipientAddress = values.sfRecipient[values.token].address;

    try {
      await sfUser[values.token].flow({
        recipient: recipientAddress,
        flowRate: values.flowRate.toString(),
      });
    } catch (err) {
      onFlowFailed(err.toString());
    }

    // force state update
    try {
      await sfUser[values.token].details();
      await sfRecipients[recipientAddress][values.token].details();
      setSfUser({ ...sfUser });
      setSfRecipients(prevState => {
        const prevRecipient = prevState[recipientAddress];
        return {
          ...prevState,
          [recipientAddress]: {
            ...prevRecipient,
          },
        };
      });
    } catch (err) {
      onFlowFailed("Flow failed ", err.toString());
    }
    console.log("Success:", values);
  };

  const onFlowFailed = errorInfo => {
    console.log("Flow Submit Failed:", errorInfo);
  };

  const fakeTokenMinters = [];
  const superTokenUpgraders = [];
  for (const token of tokens) {
    fakeTokenMinters.push(
      <FakeTokenMinter
        provider={provider}
        address={address}
        chainId={chainId}
        token={token}
        tokenContracts={tokenContracts}
      />,
    );

    superTokenUpgraders.push(
      <SuperTokenUpgrader
        name="Your"
        token={token}
        address={address}
        tokenContracts={tokenContracts}
        superTokenContracts={superTokenContracts}
        sfUser={sfUser}
        provider={provider}
      />,
    );
  }

  const template = [];
  template.push(
    <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, marginTop: 64, marginBottom: 64 }}>
      <h1>Superfluid </h1>
      <p style={{ color: "red" }}>{initializationError}</p>

      <h3>Fake token faucet</h3>

      {fakeTokenMinters}

      <Divider />
      {superTokenUpgraders}

      <RecipientForm
        mainnetProvider={mainnetProvider}
        onRecipientSubmit={onRecipientSubmit}
        onRecipientFailed={onRecipientFailed}
      />

      <Divider />
      <CashflowDisplayer name={"Your"} tokens={tokens} sfUser={sfUser} />
    </div>,
  );

  if (sfRecipients) {
    for (const [address, sfRecipient] of Object.entries(sfRecipients)) {
      const recipientBalances = [];
      for (const token of tokens) {
        if (sfRecipient[token]) {
          recipientBalances.push(
            <div>
              <TokenBalance
                img={token}
                name={token}
                provider={provider}
                address={sfRecipient[token].address}
                contracts={tokenContracts}
              />

              <TokenBalance
                img={token + "x"}
                name={token + "x"}
                provider={provider}
                address={sfRecipient[token].address}
                contracts={tokenContracts}
              />
            </div>,
          );
        }
      }

      template.push(
        <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, marginTop: 64, alignSelf: "flex-start" }}>
          <Address ensProvider={mainnetProvider} address={address} />

          <FlowForm tokens={tokens} sfRecipient={sfRecipient} onFlowSubmit={onFlowSubmit} onFlowFailed={onFlowFailed} />
          <h3>Balances</h3>

          {recipientBalances}

          <Divider />

          <CashflowDisplayer address={address} tokens={tokens} sfUser={sfRecipient} />
        </div>,
      );
    }
  }

  const containerStyle = {
    display: "flex",
    flexWrap: "wrap",
    minWidth: 400,
    margin: "auto",
    justifyContent: "space-evenly",
  };

  return <div style={containerStyle}>{template}</div>;
}
