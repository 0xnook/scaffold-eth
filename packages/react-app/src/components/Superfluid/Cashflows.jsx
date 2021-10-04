import React, {useEffect, useReducer} from "react";
import { Table } from "antd";
import { utils } from "ethers";

import { Address } from "../../components";


export function Cashflows(props) {
	const {mainnetProvider, inflows, outflows, netflows} = props;

	const flowColumns = [
		{
			title: "Owner", 
			dataIndex: "owner",
			key: "owner"
		},
		{
			title: "Recipient", 
			dataIndex: "recipient",
			key: "recipient"
		},
		{
			title: "superToken", 
			dataIndex: "superToken",
			key: "superToken"
		},
		{
			title: "Flowrate", 
			dataIndex: "flowRate",
			key: "flowRate"
		}
	];

	const outflowTableData = outflows.map(flow=> {
		return {
			key: flow.id,
			owner: <Address address={flow.owner.id} provider={mainnetProvider} fontSize={16}/>,
			recipient: <Address address={flow.recipient.id} provider={mainnetProvider} fontSize={16}/>,
			superToken: <div>{flow.token.symbol} &nbsp; <Address address={flow.token.id} fontSize={16}/></div>,
			flowRate: flow.flowRate
		}
	});


	const inflowTableData = inflows.map(flow=> {
		return {
			key: flow.id,
			owner: <Address address={flow.owner.id} provider={mainnetProvider} fontSize={16}/>,
			recipient: <Address address={flow.recipient.id} provider={mainnetProvider} fontSize={16}/>,
			superToken: <div><Address address={flow.token.id} fontSize={16}/> &nbsp; {flow.token.symbol} </div>,
			flowRate: flow.flowRate
		}
	});

	const netflowColumns = [
		{
			title: "Token",
			dataIndex: "superToken",
			key: "superToken",
		},
		{
			title: "Netflow",
			dataIndex: "netflow",
			key: "netflow",
		},
	];
	

	const netflowTableData = Object.keys(netflows).map(token => {
		return { 
			superToken: token, 
			netflow: utils.formatEther(netflows[token].netflow),
		}
	});
	
	return (
		<div>
			<h2>Cashflows</h2>
			<h3>Outflows</h3>
			<Table columns={flowColumns} dataSource={outflowTableData}/>
			<h3>Inflows</h3>
			<Table columns={flowColumns} dataSource={inflowTableData}/>
			<h3>Netflows</h3>
			<Table columns={netflowColumns} dataSource={netflowTableData}/>
		</div>
	);
}
