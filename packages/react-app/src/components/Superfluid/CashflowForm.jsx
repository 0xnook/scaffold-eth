import React from "react";
import { Button, Form, InputNumber, Select } from "antd";
const { Option } = Select;

import { Address, AddressInput } from "../../components";

export function CashflowForm(props) {
	const {address, sfSDK, mainnetProvider, superTokens} = props;

	const handleSubmit = async (values) => {
    try {
      const sfUser = sfSDK.user({
        address,
        token: values.token
      });
      await sfUser.flow({
				recipient: values.recipient,
        flowRate: values.flowRate.toString(),
      });
    } catch(e) {
      console.log("Flow submit error: ", e);
    };
  };


	const selectOptions = superTokens.map((token)=>{
		return <Option key={token.address} value={token.address}>
			<Address address={token.address} fontSize={14}/>
			&nbsp;
			&nbsp;
			{token.symbol}
		</Option>
	});


	return (
		<Form
      style={{maxWidth: "90%", margin: "auto"}}
			layout="vertical"
			onFinish={handleSubmit}
		>
			<h2>Create new cashflow</h2>

			<Form.Item
				label="Flowrate"
				name="flowRate"
			>
				<InputNumber style={{ width: "100%" }}
/>
			</Form.Item>

			<Form.Item
				label="Recipient"
				name="recipient"
			>
        <AddressInput ensProvider={mainnetProvider} />
			</Form.Item>

      <Form.Item name="token" label="Token">
        <Select>{selectOptions}</Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Set cashflow
        </Button>
      </Form.Item>
		</Form>
	);
};
