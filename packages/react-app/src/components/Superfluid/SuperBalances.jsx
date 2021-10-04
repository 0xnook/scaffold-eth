import React, {useEffect, useState} from "react";
import { useTokenBalance } from "eth-hooks";
import { utils } from "ethers";
import { Form, InputNumber, Button, Table } from "antd";
import { VerticalAlignTopOutlined, VerticalAlignBottomOutlined } from "@ant-design/icons";
import { Transactor } from "../../helpers";
import { Address } from "../../components";
import { StreamingBalance } from "./StreamingBalance";


function Downgrade(props) {
	const {provider, contract} = props;
	const [form] = Form.useForm();
	const tx = Transactor(provider);

	const downgrade = ({amount}) => {
		const parsedAmount = utils.parseUnits(amount.toString(), 18);
		tx(contract.downgrade(parsedAmount));
	};

	return (
		<Form onFinish={downgrade} form={form} layout="inline">
			<Form.Item name="amount" initialValue={0}>
				<InputNumber name="amount" style={{width: "7rem"}} addonAfter={<VerticalAlignBottomOutlined onClick={form.submit}/>} />
			</Form.Item>
		</Form>
	)
};


function ApproveOrUpgrade(props) {
	const {address, contract, superContract, superTokenAddress, provider} = props;
	const [form] = Form.useForm();
	const numberInput = <InputNumber name="amount" style={{width: "7rem"}} addonAfter={<VerticalAlignTopOutlined onClick={form.submit}/>} />

	const tx = Transactor(provider);

	const [inputOrButton, setInputOrButton] = useState(numberInput);

	const approve = (decimals) => {
    // given the scope of the template, we use unlimited token approvals
    const parsedBalance = utils.parseUnits("1000000000000", decimals);

		// helper to display tx status to user
		tx(contract.approve(superTokenAddress, parsedBalance), update => {
			if (update && (update.status === "confirmed" || update.status === 1)) {
				console.log(" 🍾 Transaction " + update.hash + " finished!");
				setTimeout(() => {}, 5000);
				setInputOrButton(numberInput);
			}
		});
	}


	const upgrade = async (value) => {
		const allowed = await contract.allowance(address, superTokenAddress);
  	const decimals = await contract.decimals();

		const approvalButton = <Button onClick={()=>approve(decimals)}>Approve</Button>;
		
		// if approval is needed for given amount 
		if(utils.parseUnits(value.amount.toString(), decimals).gt(allowed)) {
			setInputOrButton(approvalButton);
		// else upgrade token
		} else  {
			// upgrade always uses 18 decimals
			tx(superContract.upgrade(utils.parseUnits(value.amount.toString(), 18)), update => {
				if (update && (update.status === "confirmed" || update.status === 1)) {
					console.log(" 🍾 Transaction " + update.hash + " finished!");
					//setTimeout(() => {}, 5000);
					setInputOrButton(numberInput);
			}
		});
		}
	}

	return (
		<Form onFinish={upgrade} form={form} layout="inline">
			<Form.Item name="amount" initialValue={0}>
				{/* <InputNumber name="amount" style={{width: "7rem"}} addonAfter={<VerticalAlignTopOutlined onClick={form.submit}/>} /> */}
				{inputOrButton}
			</Form.Item>
		</Form>
	)
};


function TokBalance(props) {
	const {contract, address} = props;
	// formated balance
	const [fmtBalance, setFmtBalance] = useState("...");

	const tokBalance = useTokenBalance(contract, address);

	useEffect(async () => {
  	const decimals = await contract.decimals();
		setFmtBalance(utils.formatUnits(tokBalance.toString(), decimals));
	}, [tokBalance])

	return(
		<div>{fmtBalance}</div>
	);
}

export function SuperBalances(props) {
	const {provider, mainnetProvider, address, tokenData, contracts, netflows} = props;
	if(!tokenData) {
		return <h1>...</h1>;
	}
	
	const columns = [
		{
			title: "Token", 
			dataIndex: "token",
			key: "token"
		},
		{
			title: "Address",
			dataIndex: "address",
			key: "address"
		},
		{
			title: "Balance", 
			dataIndex: "tokenBalance",
			key: "tokenBalance"
		},
		{
			title: "SuperToken", 
			dataIndex: "superToken",
			key: "superToken"
		},
		{
			title: "Balance", 
			dataIndex: "superTokenBalance",
			key: "superTokenBalance"
		},
		{
			title: "Upgrade", 
			dataIndex: "upgrade",
			key: "upgrade"
		},
		{
			title: "Downgrade", 
			dataIndex: "downgrade",
			key: "downgrade"
		}
	];

	let dataSource=[];
	let i=0;
	for (const tok of tokenData) {
		let underlyingSymbol="UNKNOWN";
		if(tok.symbol.slice(-1) === "x") {
			underlyingSymbol=tok.symbol.slice(0, -1);
		};

		dataSource.push({
			key: i,
			token: underlyingSymbol,
			address: <Address address={tok.id} ensProvider={mainnetProvider} fontSize={14}/>,
			tokenBalance: <TokBalance key={"tokenbalance" + i} contract={contracts[tok.underlyingAddress]} address={address}/>,
			superToken: tok.symbol,
			superTokenBalance: <StreamingBalance address={address} contract={contracts[tok.id]} netflow={netflows[tok.symbol] ? netflows[tok.symbol].netflow : 0}/>, 
			upgrade: <ApproveOrUpgrade address={address} contract={contracts[tok.underlyingAddress]} superContract={contracts[tok.id]} superTokenAddress={tok.id} provider={provider}/>,
			downgrade: <Downgrade provider={provider} contract={contracts[tok.id]}/>
		});
		i++;
	};

	return (
		<Table dataSource={dataSource} columns={columns}/>
	);
}
