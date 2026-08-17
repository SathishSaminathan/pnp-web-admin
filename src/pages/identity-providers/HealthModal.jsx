import React, { useEffect } from "react";
import { Modal, Form, Select, Input, Switch } from "antd";
import { HEALTH_STATUS_OPTIONS, MODAL_STYLES } from "../../constants/identityProviders";

const { TextArea } = Input;

const HealthModal = ({ open, provider, form, onOk, onCancel, loading }) => {
  useEffect(() => {
    if (open && provider) {
      form.setFieldsValue({
        status: provider.health?.status ?? "unknown",
        message: provider.health?.message ?? "",
        manualOverride: provider.health?.manualOverride ?? false,
      });
    }
  }, [open, provider, form]);

  return (
    <Modal
      open={open}
      title={
        <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          Update Health Status
        </span>
      }
      onOk={onOk}
      onCancel={onCancel}
      okText="Update Health"
      cancelText="Cancel"
      confirmLoading={loading}
      width={480}
      styles={MODAL_STYLES}
      destroyOnClose
    >
      {provider && (
        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          Updating health for <strong style={{ color: "var(--text-primary)" }}>{provider.name}</strong>
        </p>
      )}
      <Form form={form} layout="vertical">
        <Form.Item
          name="status"
          label={<span style={{ color: "var(--text-secondary)" }}>Health Status</span>}
          rules={[{ required: true, message: "Status is required" }]}
        >
          <Select
            options={HEALTH_STATUS_OPTIONS}
            dropdownStyle={{ background: "var(--bg-card)" }}
          />
        </Form.Item>
        <Form.Item
          name="message"
          label={<span style={{ color: "var(--text-secondary)" }}>Message (optional)</span>}
        >
          <TextArea
            rows={3}
            placeholder="e.g. Intermittent timeouts observed..."
            style={{ background: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
          />
        </Form.Item>
        <Form.Item
          name="manualOverride"
          label={<span style={{ color: "var(--text-secondary)" }}>Manual Override</span>}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default HealthModal;
