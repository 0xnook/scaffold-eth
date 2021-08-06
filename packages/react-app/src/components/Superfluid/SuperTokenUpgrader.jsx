import React from "react";

import { utils } from "ethers";
import { Button, Divider, Form, InputNumber } from "antd";

import { TokenBalance } from "../../components";
import { Transactor } from "../../helpers";


// Retrieves and displays passed token and supertoken balance, and proivdes
// form to wrap/unwrap them
export default function SuperTokenUpgrader({ address, token, tokenContracts, superTokenContracts, provider }) {
  if (!address || !tokenContracts.hasOwnProperty(token + "x")) {
    return <h1>...</h1>;
  }

  const superTokenAddress = tokenContracts[token + "x"].address;

  const onTokenApprove = e => {
    e.preventDefault();
    // given the scope of the template, we use unlimited token approvals
    const parsedBalance = utils.parseUnits("1000000000000", 18);

    // create and execute approval tx
    const tx = Transactor(provider);
    tx(tokenContracts[token].approve(superTokenAddress, parsedBalance), update => {
      console.log("📡 Transaction Update:", update);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log(" 🍾 Transaction " + update.hash + " finished!");
        console.log(
          " ⛽️ " +
            update.gasUsed +
            "/" +
            (update.gasLimit || update.gas) +
            " @ " +
            parseFloat(update.gasPrice) / 1000000000 +
            " gwei",
        );
      }
    }).then(result => {
      console.log(result);
    });
  };

  const transformToken = (amount, transformType) => {
    // parse user submitted amount
    const parsedAmount = utils.parseUnits(amount.toString(), 18);
    // retrieve supertoken contract object
    const contractCall = superTokenContracts[token + "x"][transformType](parsedAmount);

    // create and execute transaction
    const tx = Transactor(provider);
    // TODO: decide wether to keep tx logging or not (modals already displayed)
    tx(contractCall, update => {
      console.log("📡 Transaction Update:", update);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log(" 🍾 Transaction " + update.hash + " finished!");
        console.log(
          " ⛽️ " +
            update.gasUsed +
            "/" +
            (update.gasLimit || update.gas) +
            " @ " +
            parseFloat(update.gasPrice) / 1000000000 +
            " gwei",
        );
      }
    }).then(result => {
      console.log(result);
    });
  };

  // handle upgrade token form submit
  const handleUpgradeSubmit = ({ amount }) => {
    transformToken(amount, "upgrade");
  };

  // handle downgrade token form submit
  const handleDowngradeSubmit = ({ amount }) => {
    transformToken(amount, "downgrade");
  };

  const handleError = errMsg => {
    console.log("Failed:", errMsg);
  };

  const template = [];
  template.push(
    <div>
      <h3>{token}: </h3>

      <TokenBalance img={token} name={token} provider={provider} address={address} contracts={tokenContracts} />
      <Form
        name="basic"
        layout="vertical"
        onFinish={handleUpgradeSubmit}
        onFinishFailed={handleError}
        requiredMark={false}
      >
        <Form.Item name="amount" initialValue={0}>
          <InputNumber />
        </Form.Item>
        <Button display="block" onClick={onTokenApprove}>
          Approve unlimited {token} spending
        </Button>
        <Form.Item>
          <Button htmlType="submit">Upgrade to supertoken</Button>
        </Form.Item>
      </Form>
      <h3>{token}x: </h3>
      <TokenBalance name={token + "x"} provider={provider} address={address} contracts={superTokenContracts} />
      <Form
        name="basic"
        layout="vertical"
        onFinish={handleDowngradeSubmit}
        onFinishFailed={handleError}
        requiredMark={false}
      >
        <Form.Item name="amount" initialValue={0}>
          <InputNumber />
        </Form.Item>

        <Form.Item>
          <Button htmlType="submit">Downgrade to unwrapped token</Button>
        </Form.Item>
      </Form>
      <Divider />
    </div>,
  );
  return template;
}
