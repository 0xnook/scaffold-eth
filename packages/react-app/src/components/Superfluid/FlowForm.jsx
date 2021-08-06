import React from "react";
import { Button, Form, InputNumber, Select } from "antd";

const { Option } = Select;

// form to start a new flow/stream
export default function FlowForm({ tokens, sfRecipient, onFlowSubmit, onFlowFailed }) {
  const tokenOptions = [];
  for (const token of tokens) {
    tokenOptions.push(<Option value={token}>{token + "x"}</Option>);
  }
  return (
    <Form layout="vertical" onFinish={onFlowSubmit} onFinishFailed={onFlowFailed} requiredMark={false}>
      <h3>Flow rate</h3>
      <Form.Item labelAlign="left" name="flowRate" initialValue={0}>
        <InputNumber name="flowRate" />
      </Form.Item>

      <Form.Item name="token">
        <Select>{tokenOptions}</Select>
      </Form.Item>

      <Form.Item name="sfRecipient" initialValue={sfRecipient}></Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Create new flow
        </Button>
      </Form.Item>
    </Form>
  );
}


