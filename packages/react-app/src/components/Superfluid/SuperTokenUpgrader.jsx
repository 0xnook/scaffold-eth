import React from "react";

import { utils } from "ethers";
import { Button, Form, InputNumber } from "antd";

import { TokenBalance } from "../../components";
import { Transactor } from "../../helpers";


export function SuperTokenUpgraders({provider, address, tokenList, tokenContracts}) {
  if (!tokenContracts || !provider || !address || !tokenList) {
    return <h1>...</h1>;
  }


  const style = {
    display: "flex",
    flexFlow: "row wrap",
    margin: "auto",
    justifyContent: "center",
    gap: "2rem"
  }

  return (
    <div>
      <h2>Token upgrader</h2>
      <div style={style}>
        {tokenList.map(token => (
          <SuperTokenUpgrader
            key={token + address + "-upgrader"}
            address={address}
            provider={provider}
            token={token}
            tokenContract={tokenContracts[token]}
            superTokenContract={tokenContracts[token+"x"]}
          />
        ))}
      </div>
    </div>
  );
}


// Retrieves and displays passed token and supertoken balance, and proivdes
// form to wrap/unwrap them
export default function SuperTokenUpgrader({ address, token, tokenContract, superTokenContract, provider }) {
  if (!address || !tokenContract) {
    console.log("sc contract: ", tokenContract);
    return <h1>...</h1>;
  }

  const superTokenAddress = superTokenContract.address;

  // helper to display tx status to user
  const tx = Transactor(provider);

  const onTokenApprove = async (e) => {
    e.preventDefault();

    const decimals = await tokenContract.decimals();
    // given the scope of the template, we use unlimited token approvals
    const parsedBalance = utils.parseUnits("1000000000000", decimals);
    // call contract 
    tx(tokenContract.approve(superTokenAddress, parsedBalance));
  };

  const transformToken = async (amount, transformType) => {
    // parse user submitted amount
    const decimals = await tokenContract.decimals();
    const parsedAmount = utils.parseUnits(amount.toString(), decimals);
    // call contract 
    tx(superTokenContract[transformType](parsedAmount));

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

  return (
    <div>
      <h3>{token}: </h3>
      <TokenBalance name={token} provider={provider} address={address} contracts={{[token]: tokenContract}} />
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
      <TokenBalance name={token + "x"} provider={provider} address={address} contracts={{[token+"x"]: superTokenContract}} />
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
    </div>
  );
}
