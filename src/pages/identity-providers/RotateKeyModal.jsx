import React from "react";
import { Modal, Form, Input, Alert } from "antd";
import { KeyOutlined, WarningFilled } from "@ant-design/icons";
import { MODAL_STYLES } from "../../constants/identityProviders";

const RotateKeyModal = ({ open, provider, form, onOk, onCancel, loading }) => (
  <Modal
    open={open}
    title={
      <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
        Rotate API Key
      </span>
    }
    onOk={onOk}
    onCancel={onCancel}
    okText="Rotate Key"
    okButtonProps={{ danger: true }}
    cancelText="Cancel"
    confirmLoading={loading}
    width={460}
    styles={MODAL_STYLES}
    destroyOnClose
  >
    {provider && (
      <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
        Rotating API key for <strong style={{ color: "var(--text-primary)" }}>{provider.name}</strong>
      </p>
    )}
    <Alert
      type="warning"
      icon={<WarningFilled />}
      showIcon
      className="mb-4"
      message="The old API key will be immediately invalidated."
    />
    <Form form={form} layout="vertical">
      <Form.Item
        name="apiKey"
        label={
          <span style={{ color: "var(--text-secondary)" }}>
            <KeyOutlined className="mr-1" />
            New API Key
          </span>
        }
        rules={[{ required: true, message: "New API key is required" }]}
      >
        <Input.Password
          placeholder="sk_live_new_key_here"
          style={{ background: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
        />
      </Form.Item>
    </Form>
  </Modal>
);

export default RotateKeyModal;
