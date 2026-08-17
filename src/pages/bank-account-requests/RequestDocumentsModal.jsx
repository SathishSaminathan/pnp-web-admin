import React from "react";
import { Modal, Form, Input, Select, Button, Checkbox } from "antd";
import { FileAddOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { MODAL_STYLES } from "../../constants/bankAccountRequests";

const RequestDocumentsModal = ({
  open,
  target,
  form,
  onOk,
  onCancel,
  loading,
  isDark,
  isMobile,
}) => (
  <Modal
    title={
      <div className="flex items-center gap-2">
        <FileAddOutlined style={{ color: "#f97316", fontSize: 18 }} />
        <span style={{ color: "var(--text-primary)" }}>
          Request Additional Documents
        </span>
      </div>
    }
    open={open}
    onOk={onOk}
    onCancel={onCancel}
    confirmLoading={loading}
    okText="Send Request"
    okButtonProps={{ style: { background: "#f97316", borderColor: "#f97316" } }}
    width={isMobile ? "95vw" : 680}
    styles={{ ...MODAL_STYLES, body: { maxHeight: "70vh", overflowY: "auto" } }}
  >
    <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
      Requesting documents for:{" "}
      <strong style={{ color: "var(--text-primary)" }}>
        {target?.metadata?.referenceNumber ?? target?.accountName ?? "—"}
      </strong>
    </p>

    <Form form={form} layout="vertical">
      <Form.Item
        name="message"
        label={
          <span style={{ color: "var(--text-secondary)" }}>Message to User</span>
        }
        rules={[{ required: true, message: "Please enter a message" }]}
      >
        <Input.TextArea
          rows={2}
          placeholder="Please upload the listed documents."
          style={{
            background: "var(--input-bg)",
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
          }}
        />
      </Form.Item>

      <Form.List name="documents">
        {(fields, { add, remove }) => (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Documents Required
              </span>
              <Button
                type="dashed"
                size="small"
                icon={<PlusOutlined />}
                onClick={() =>
                  add({ label: "", name: "", type: "text", description: "", isRequired: false })
                }
                style={{ borderColor: "#f97316", color: "#f97316", borderRadius: 8 }}
              >
                Add Document
              </Button>
            </div>

            {fields.map(({ key, name: fieldName, ...restField }) => (
              <div
                key={key}
                className="rounded-xl p-4"
                style={{
                  background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div className={isMobile ? "flex flex-col gap-0" : "flex gap-3"}>
                  <Form.Item
                    {...restField}
                    name={[fieldName, "label"]}
                    label={<span style={{ color: "var(--text-secondary)" }}>Label</span>}
                    rules={[{ required: true, message: "Required" }]}
                    style={{ flex: 1, marginBottom: 12 }}
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
                    {...restField}
                    name={[fieldName, "name"]}
                    label={<span style={{ color: "var(--text-secondary)" }}>Name</span>}
                    rules={[{ required: true, message: "Required" }]}
                    style={{ flex: 1, marginBottom: 12 }}
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
                    {...restField}
                    name={[fieldName, "type"]}
                    label={<span style={{ color: "var(--text-secondary)" }}>Type</span>}
                    rules={[{ required: true, message: "Required" }]}
                    style={{ flex: 1, marginBottom: 12 }}
                  >
                    <Select
                      placeholder="Select type"
                      dropdownStyle={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-color)",
                      }}
                      style={{ width: "100%" }}
                    >
                      {["string", "number", "document", "file", "text"].map((t) => (
                        <Select.Option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[fieldName, "description"]}
                    label={
                      <span style={{ color: "var(--text-secondary)" }}>
                        Description{" "}
                        <span style={{ color: "var(--text-muted)" }}>(optional)</span>
                      </span>
                    }
                    style={{ flex: 1, marginBottom: 12 }}
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

                <div className="flex items-center justify-between">
                  <Form.Item
                    {...restField}
                    name={[fieldName, "isRequired"]}
                    valuePropName="checked"
                    style={{ margin: 0 }}
                  >
                    <Checkbox style={{ color: "var(--text-secondary)" }}>Required</Checkbox>
                  </Form.Item>
                  {fields.length > 1 && (
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => remove(fieldName)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {fields.length === 0 && (
              <Button
                type="dashed"
                onClick={() =>
                  add({ label: "", name: "", type: "text", description: "", isRequired: true })
                }
                icon={<PlusOutlined />}
                style={{
                  width: "100%",
                  borderColor: "var(--border-color)",
                  color: "var(--text-muted)",
                  borderRadius: 10,
                }}
              >
                Add Document
              </Button>
            )}
          </div>
        )}
      </Form.List>
    </Form>
  </Modal>
);

export default RequestDocumentsModal;
