import React from "react";
import { Modal, Form, Input, Select, Checkbox } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { MODAL_STYLES } from "../../constants/bankAccountRequests";

const DOC_TYPES = ["string", "number", "document", "file", "text"];

const EditDocumentModal = ({
  open,
  target,
  form,
  onOk,
  onCancel,
  loading,
  isMobile,
}) => (
  <Modal
    title={
      <div className="flex items-center gap-2">
        <EditOutlined style={{ color: "#8b5cf6", fontSize: 18 }} />
        <span style={{ color: "var(--text-primary)" }}>Edit Document</span>
      </div>
    }
    open={open}
    onOk={onOk}
    onCancel={onCancel}
    confirmLoading={loading}
    okText="Save Changes"
    okButtonProps={{ style: { background: "#8b5cf6", borderColor: "#8b5cf6" } }}
    width={isMobile ? "95vw" : 520}
    styles={MODAL_STYLES}
  >
    <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
      Editing:{" "}
      <strong style={{ color: "var(--text-primary)" }}>
        {target?.label ?? "—"}
      </strong>
    </p>

    <Form form={form} layout="vertical">
      <div className={isMobile ? "flex flex-col gap-0" : "flex gap-3"}>
        <Form.Item
          name="label"
          label={<span style={{ color: "var(--text-secondary)" }}>Label</span>}
          rules={[{ required: true, message: "Required" }]}
          style={{ flex: 1 }}
        >
          <Input
            placeholder="e.g. Government ID"
            style={{
              background: "var(--input-bg)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          />
        </Form.Item>
        <Form.Item
          name="name"
          label={<span style={{ color: "var(--text-secondary)" }}>Name</span>}
          rules={[{ required: true, message: "Required" }]}
          style={{ flex: 1 }}
        >
          <Input
            placeholder="e.g. government_id"
            style={{
              background: "var(--input-bg)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          />
        </Form.Item>
      </div>

      <div className={isMobile ? "flex flex-col gap-0" : "flex gap-3"}>
        <Form.Item
          name="type"
          label={<span style={{ color: "var(--text-secondary)" }}>Type</span>}
          rules={[{ required: true, message: "Required" }]}
          style={{ flex: 1 }}
        >
          <Select
            placeholder="Select type"
            dropdownStyle={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
            }}
            style={{ width: "100%" }}
          >
            {DOC_TYPES.map((t) => (
              <Select.Option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="description"
          label={
            <span style={{ color: "var(--text-secondary)" }}>
              Description{" "}
              <span style={{ color: "var(--text-muted)" }}>(optional)</span>
            </span>
          }
          style={{ flex: 1 }}
        >
          <Input
            placeholder="Brief description"
            style={{
              background: "var(--input-bg)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          />
        </Form.Item>
      </div>

      <Form.Item
        name="isRequired"
        valuePropName="checked"
        style={{ marginBottom: 0 }}
      >
        <Checkbox style={{ color: "var(--text-secondary)" }}>Required</Checkbox>
      </Form.Item>
    </Form>
  </Modal>
);

export default EditDocumentModal;
