import React, {useState} from "react";

import { Button, Form, InputNumber } from "antd";
import { utils } from "ethers";

import { useContractLoader } from "../../hooks";
import { Transactor } from "../../helpers";

/*
  ~ What it does? ~

  Allows you to mint fake tokens, like fDAI, using a simple form.
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

export default function FakeTokenMinters({provider, address, tokenList, tokenContracts}) {
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
      <h2>Mint Fake tokens</h2>
      <div style={style}>
        {tokenList.map(token => (
          <FakeTokenMinter
            address={address}
            key={"minter" + token}
            provider={provider}
            token={token}
            tokenContract={tokenContracts[token]}
          /> 
        ))}
      </div>
   </div>
  )
}


// export function FakeTokenMinter({ provider, address, chainId, token, tokenContracts }) {
//   if (!token || !tokenContracts[token] || !provider || !address || !chainId) {
//     return <h1>...</h1>;
//   }

//   // fakeToken contracts include a mint function that is not present in the abi returned by the js-sdk
//   const mintABI = [
//     {
//       inputs: [
//         {
//           internalType: "address",
//           name: "account",
//           type: "address",
//         },
//         {
//           internalType: "uint256",
//           name: "amount",
//           type: "uint256",
//         },
//       ],
//       name: "mint",
//       outputs: [
//         {
//           internalType: "bool",
//           name: "",
//           type: "bool",
//         },
//       ],
//       stateMutability: "nonpayable",
//       type: "function",
//     },
//   ];

//   const mintContractMetadata = {
//     [chainId]: {
//       contracts: {
//         [token]: {
//           address: tokenContracts[token].address,
//           abi: mintABI,
//         },
//       },
//     },
//   };

//   const mintContract = useContractLoader(provider, { chainId, externalContracts: mintContractMetadata });

//   const handleMintSubmit = async ({ amount }) => {
//     const decimals = await tokenContracts[token].decimals();
//     console.log("token decimals: ", decimals);

//     const parsedAmount = utils.parseUnits(amount.toString(), 18);


//     console.log(parsedAmount);
//     const contractCall = mintContract[token].mint(address, parsedAmount);

//     // keep track of transaction
//     const tx = Transactor(provider);

//     tx(contractCall, update => {
//       console.log("📡 Transaction Update:", update);
//       if (update && (update.status === "confirmed" || update.status === 1)) {
//         console.log(" 🍾 Transaction " + update.hash + " finished!");
//         console.log(
//           " ⛽️ " +
//             update.gasUsed +
//             "/" +
//             (update.gasLimit || update.gas) +
//             " @ " +
//             parseFloat(update.gasPrice) / 1000000000 +
//             " gwei",
//         );
//       }
//     }).then(result => {
//       console.log(result);
//     });
//   };

//   const handleError = errMsg => {
//     console.log("Failed:", errMsg);
//   };

//   return (
//     <Form layout="vertical" onFinish={handleMintSubmit} onFinishFailed={handleError} requiredMark={false}>
//       <h3>{token}</h3>
//       <Form.Item name="amount" initialValue={0}>
//         <InputNumber />
//       </Form.Item>

//       <Form.Item>
//         <Button htmlType="submit">mint {token}</Button>
//       </Form.Item>
//     </Form>
//   );
// }
