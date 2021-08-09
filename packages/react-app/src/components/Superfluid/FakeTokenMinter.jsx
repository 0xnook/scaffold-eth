import React, {useState} from "react";

import { Button, Form, InputNumber } from "antd";
import { utils } from "ethers";

import { useContractLoader } from "../../hooks";
import { Transactor } from "../../helpers";

export function SingleTokenMinter({provider, token, tokenContract}) {
  const [errMsg, setErrMsg] = useState("");

  // Handle fake token minting form submit
  const handleMintSubmit = async ({ amount }) => {
    const decimals = await tokenContracts[token].decimals();
    console.log("token decimals: ", decimals);

    const parsedAmount = utils.parseUnits(amount.toString(), 18);


    console.log(parsedAmount);
    
    // Execute mint tx
    const contractCall = tokenContract[token].mint(address, parsedAmount);

    // keep track of transaction status
    const tx = Transactor(provider);
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
    }).catch(err => {
      setErrMsg(err);
    });
  };

  const handleError = err => {
    setErrMsg(err);
  };

  return (
    <Form layout="vertical" onFinish={handleMintSubmit} onFinishFailed={handleError} requiredMark={false}>
      <h3>{token}</h3>
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
  if (!tokenContracts || !provider || !address) {
    console.log("ft contracts: ", tokenContracts);
    console.log("ft provider: ", provider);
    console.log("ft address: ", address);
    return <h1>...</h1>;
  }

  const template = [];
  for(const token of tokens) {
    template.push(
      <SingleTokenMinter
        key={"minter" + token}
        provider={provider}
        tokenList={tokenList}
        tokenContract={tokenContracts[token]}
      />
    )
  }
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
