import React, {useReducer, useEffect} from "react";

import { BigNumber, utils } from "ethers";

import {useTokenBalance} from "eth-hooks";

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

const roundBigNum = num => {
  const remainder = num.mod(1e8);
  return utils.formatUnits(num.sub(num.mod(1e12)));
};

export function StreamingBalance(props) {
	const {address, contract, netflow} = props

  const balance = useTokenBalance(contract, address, 1777);

  const [updatingBalance, dispatch] = useReducer(reducer, balance);

  useEffect(() => {
    const bigNumBalance = balance;
    const desync = Math.abs(updatingBalance.sub(balance))
    if (desync > Math.abs(netflow*100)) {
      dispatch({type: "Set", payload: bigNumBalance});
    }

    let frequency = 250; // in millisecs
    let increment = BigNumber.from(netflow).div(4);

    const interval = setInterval(() => {
      dispatch({type: "Increment", payload: increment});
    }, frequency);

    return function cleanup() {
      clearInterval(interval);
    }
  }, [netflow, balance])


  if (netflow != 0) {
    return <h4>{roundBigNum(updatingBalance)}</h4>;
  } else return <h4>{roundBigNum(balance)}</h4>;
}
