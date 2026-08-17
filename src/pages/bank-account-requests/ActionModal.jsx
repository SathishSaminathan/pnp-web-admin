import React from "react";
import { Modal, Form, Input, Select } from "antd";
import { MODAL_STYLES, MODAL_ACTION_CONFIG } from "../../constants/bankAccountRequests";

const ActionModal = ({
  type,
  open,
  target,
  form,
  onOk,
  onCancel,
  loading,
  providers,
  providersLoading,
}) => {
  const cfg = MODAL_ACTION_CONFIG[type] ?? {};
  const ref = target?.metadata?.referenceNumber;
  return (
    <Modal
      title={<span style={{ color: "var(--text-primary)" }}>{cfg.title}</span>}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={cfg.okText}
      okButtonProps={cfg.okButtonProps}
      styles={MODAL_STYLES}
    >
      <Form form={form} layout="vertical">
        {type === "process" ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            This will create the Checkbook account for request{" "}
            <strong style={{ color: "var(--text-primary)" }}>{ref}</strong>. Are
            you sure you want to proceed?
          </p>
        ) : (
          <>
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
              {cfg.descPrefix}:{" "}
              <strong style={{ color: "var(--text-primary)" }}>{ref}</strong>
            </p>

            {type === "approve" && (
              <Form.Item
                name="notes"
                label={
                  <span style={{ color: "var(--text-secondary)" }}>
                    Approval Notes
                  </span>
                }
              >
                <Input.TextArea
                  rows={3}
                  placeholder="All documents verified and approved."
                  style={{
                    background: "var(--input-bg)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </Form.Item>
            )}

            {(type === "reject" || type === "cancel") && (
              <Form.Item
                name="reason"
                label={
                  <span style={{ color: "var(--text-secondary)" }}>
                    {type === "reject" ? "Rejection Reason" : "Cancellation Reason"}
                  </span>
                }
                rules={[{ required: true, message: "Please provide a reason" }]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder={
                    type === "reject"
                      ? "Incomplete documentation provided."
                      : "Cancelled at user's request."
                  }
                  style={{
                    background: "var(--input-bg)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
              </Form.Item>
            )}

            {type === "assign" && (
              <Form.Item
                name="providerId"
                label={
                  <span style={{ color: "var(--text-secondary)" }}>
                    Service Provider
                  </span>
                }
                rules={[{ required: true, message: "Please select a provider" }]}
              >
                <Select
                  loading={providersLoading}
                  placeholder="Select a provider"
                  dropdownStyle={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                  }}
                  style={{ width: "100%" }}
                >
                  {providers.map((p) => (
                    <Select.Option key={p._id} value={p._id}>
                      {p.providerName} ({p.providerCode})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </>
        )}
      </Form>
    </Modal>
  );
};

export default ActionModal;
