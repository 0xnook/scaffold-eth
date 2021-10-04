import React, {useState} from "react";

import { Button, Form, InputNumber } from "antd";
import { utils } from "ethers";

import { Transactor } from "../../helpers";

/*
  ~ What it does? ~

  Renders a form to mint fake tokens, such as fDAI.
  Useful to for testing Superfluid

  ~ How can I use? ~
  <FakeTokenMinter
    address={address}
    provider={injectedProvider}
    token="fDAI"
    tokenContract={tokenContract}
  />

*/
export function FakeTokenMinter({provider, address, token, tokenContract}) {
  const [errMsg, setErrMsg] = useState("");

  if (!tokenContract) {
    return <h1>...</h1>;
  }

  const tx = Transactor(provider);

  // Handle fake token minting form submit
  const handleMintSubmit = async ({ amount }) => {
    const decimals = await tokenContract.decimals();

    const parsedAmount = utils.parseUnits(amount.toString(), decimals);
    
    // Execute mint tx
    tx(tokenContract.mint(address, parsedAmount));
  };

  const handleError = err => {
    setErrMsg(err);
  };

  return (
    <Form onFinish={handleMintSubmit} onFinishFailed={handleError} requiredMark={false}>
      <h4>{token}</h4>
      <Form.Item name="amount" initialValue={0}>
        <InputNumber />
      </Form.Item>

      <Form.Item>
        <Button htmlType="submit">mint {token}</Button>
      </Form.Item>
      {errMsg}
    </Form>
  );
}

export default function FakeTokenMinters({provider, address, tokens, tokenContracts}) {
  if (!tokenContracts || !provider || !address || !tokens) {
    return <h1>...</h1>;
  }

  const style = {
    display: "flex",
    flexFlow: "row wrap",
    margin: "auto",
    justifyContent: "center",
    gap: "2rem"
  }


  console.log("DEBUG TOKENS: ", tokens);
  console.log("DEBUG contracts: ", tokenContracts);
  return (
    <div>
      <h2>Mint Fake tokens</h2>
      <div style={style}>
        {tokens.map(token => (
          <FakeTokenMinter
            address={address}
            key={"minter" + token.address}
            provider={provider}
            token={token.symbol}
            tokenContract={tokenContracts[token.address]}
          /> 
        ))}
      </div>
   </div>
  )
}
