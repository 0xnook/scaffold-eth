import React, {useEffect} from "react";
import { Button, Form, InputNumber, Select } from "antd";
import SuperfluidSDK from '@superfluid-finance/js-sdk'
import {utils} from "ethers";
const { Option } = Select;

// form to start a new flow/stream
export default function FlowForm({ address, recipient, tokenData, sfSDK, contracts }) {

  console.log("tokdat ", tokenData)
  const handleFlowSubmit = async (values) => {
    console.log("form values: ", values);
    const sfUser = sfSDK.user({
      address,
      token: values.contracts[values.token].address
    });


    
    try {
      await sfUser.flow({
        recipient,
        flowRate: values.flowRate.toString(),
      });
    } catch(e) {
      console.log("Flow submit error: ", e);
    };
  };

  const handleFlowFailed = () => {};

  const tokenOptions = [];
  for (const token of tokenData) {
    tokenOptions.push(<Option key={"flowopt-" + token.symbol} value={token.symbol}>{token.symbol}</Option>);
  }

  return (
    <Form layout="vertical" onFinish={handleFlowSubmit} onFinishFailed={handleFlowFailed} requiredMark={false}>
      <h3>Flow rate</h3>
      <Form.Item labelAlign="left" name="flowRate" initialValue={0}>
        <InputNumber />
      </Form.Item>

      <Form.Item name="token">
        <Select>{tokenOptions}</Select>
      </Form.Item>

      <Form.Item name="contracts" initialValue={contracts}></Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Create new flow
        </Button>
      </Form.Item>
    </Form>
  );
}


