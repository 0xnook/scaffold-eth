import React, {useState} from "react";
import { Button, Form, InputNumber, Select } from "antd";
const { Option } = Select;

// form to start a new flow/stream
export default function FlowForm({ address, recipient, tokenData, sfSDK, contracts }) {
  // error displayed to user
  const [errMsg, setErrMsg] = useState("");

  const handleFlowSubmit = async (values) => {
    
    try {
      const sfUser = sfSDK.user({
        address,
        token: values.contracts[values.token].address
      });
      await sfUser.flow({
        recipient,
        flowRate: values.flowRate.toString(),
      });
    } catch(e) {
      console.log("Flow submit error: ", e);
      setErrMsg(e);
      return;
    };
    setErrMsg("");
  };


  const tokenOptions = [];
  for (const token of tokenData) {
    tokenOptions.push(<Option key={"flowopt-" + token.symbol} value={token.symbol}>{token.symbol}</Option>);
  }

  return (
    <Form layout="vertical" onFinish={handleFlowSubmit} onFinishFailed={setErrMsg} requiredMark={false}>
      <h3>Flow rate</h3>
      <Form.Item labelAlign="left" name="flowRate" initialValue={0}>
        <InputNumber />
      </Form.Item>

      <Form.Item name="token">
        <Select>{tokenOptions}</Select>
      </Form.Item>

      <Form.Item name="contracts" initialValue={contracts} noStyle></Form.Item>
      <p style={{color: "red", wordWrap: "break-word"}}>{errMsg}</p>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Create new flow
        </Button>
      </Form.Item>
    </Form>
  );
}


