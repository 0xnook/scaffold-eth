import React from "react";
import { Button, Form } from "antd";
import { AddressInput } from "../../components";

// form to add a new cashflow recipient
export default function RecipientForm({ onRecipientSubmit, onRecipientFailed, mainnetProvider }) {
  return (
    <Form
      style={{maxWidth: "90%", margin: "auto"}}
      name="basic"
      layout="vertical"
      onFinish={onRecipientSubmit}
      onFinishFailed={onRecipientFailed}
      requiredMark={false}
    >
      <Form.Item
        label="Address"
        name="address"
        rules={[{ required: true, message: "Please input the receipients address" }]}
      >
        <AddressInput ensProvider={mainnetProvider} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Create new recipient
        </Button>
      </Form.Item>
    </Form>
  );
}


