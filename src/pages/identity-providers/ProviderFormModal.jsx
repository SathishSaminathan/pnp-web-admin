import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Switch,
  Select,
  InputNumber,
  Button,
  Space,
  Divider,
  Alert,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { ENVIRONMENT_OPTIONS, MODAL_STYLES } from "../../constants/identityProviders";

const { TextArea } = Input;

const ProviderFormModal = ({ open, provider, form, onOk, onCancel, loading }) => {
  const isEdit = !!provider;

  useEffect(() => {
    if (open) {
      if (isEdit && provider) {
        // Normalize templateId object → array of { region, templateId }
        const templateId = provider.templateId ?? {};
        const templateEntries = Object.entries(templateId).map(([region, id]) => ({
          region,
          templateId: id,
        }));
        // Normalize notSupportedCountries (can be string or { code, reason })
        const notSupportedCountries = (provider.notSupportedCountries ?? []).map((c) =>
          typeof c === "string" ? { code: c, reason: "" } : { code: c.code, reason: c.reason ?? "" }
        );
        form.setFieldsValue({
          name: provider.name,
          apiKey: "",
          environment: provider.environment,
          isUSProvider: provider.isUSProvider ?? false,
          isNonUSProvider: provider.isNonUSProvider ?? false,
          priorityUS: provider.priorityUS ?? 1,
          priorityNonUS: provider.priorityNonUS ?? 1,
          isActive: provider.isActive ?? true,
          templateEntries,
          notSupportedCountries,
        });
      } else {
        form.setFieldsValue({
          isUSProvider: true,
          isNonUSProvider: true,
          priorityUS: 1,
          priorityNonUS: 1,
          isActive: true,
          environment: "sandbox",
          templateEntries: [{ region: "default", templateId: "" }],
          notSupportedCountries: [],
        });
      }
    }
  }, [open, provider, form, isEdit]);

  return (
    <Modal
      open={open}
      title={
        <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
          {isEdit ? "Edit Identity Provider" : "Create Identity Provider"}
        </span>
      }
      onOk={onOk}
      onCancel={onCancel}
      okText={isEdit ? "Save Changes" : "Create Provider"}
      cancelText="Cancel"
      confirmLoading={loading}
      width={620}
      styles={MODAL_STYLES}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4"
        requiredMark={(label, { required }) => (
          <>{label}{required && <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>}</>
        )}>
        {/* Basic Info */}
        <Form.Item
          name="name"
          label={<span style={{ color: "var(--text-secondary)" }}>Provider Name</span>}
          rules={[
            { required: true, message: "Provider name is required" },
            { whitespace: true, message: "Cannot be blank" },
            { min: 2, message: "At least 2 characters" },
          ]}
        >
          <Input placeholder="e.g. Persona, Sumsub, Onfido" style={{ background: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-primary)" }} />
        </Form.Item>

        <Form.Item
          name="environment"
          label={<span style={{ color: "var(--text-secondary)" }}>Environment</span>}
          rules={[{ required: true, message: "Environment is required" }]}
        >
          <Select options={ENVIRONMENT_OPTIONS} style={{ width: "100%" }} dropdownStyle={{ background: "var(--bg-card)" }} />
        </Form.Item>

        <Form.Item
          name="apiKey"
          label={<span style={{ color: "var(--text-secondary)" }}>{isEdit ? "New API Key (leave blank to keep current)" : "API Key"}</span>}
          rules={isEdit ? [] : [
            { required: true, message: "API key is required" },
            { whitespace: true, message: "Cannot be blank" },
          ]}
        >
          <Input.Password placeholder={isEdit ? "Enter only to rotate" : "sk_live_..."} style={{ background: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-primary)" }} />
        </Form.Item>

        <Divider style={{ borderColor: "var(--border-color)" }}>Coverage</Divider>

        <div className="grid grid-cols-2 gap-1">
          <Form.Item
            name="isUSProvider"
            label={<span style={{ color: "var(--text-secondary)" }}>US Provider</span>}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="isNonUSProvider"
            label={<span style={{ color: "var(--text-secondary)" }}>Non-US Provider</span>}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="priorityUS"
            label={<span style={{ color: "var(--text-secondary)" }}>Priority (US)</span>}
            rules={[{ type: 'number', min: 1, max: 99, message: 'Must be between 1 and 99' }]}
          >
            <InputNumber min={1} max={99} style={{ width: "100%", background: "var(--input-bg)", borderColor: "var(--border-color)" }} />
          </Form.Item>
          <Form.Item
            name="priorityNonUS"
            label={<span style={{ color: "var(--text-secondary)" }}>Priority (Non-US)</span>}
            rules={[{ type: 'number', min: 1, max: 99, message: 'Must be between 1 and 99' }]}
          >
            <InputNumber min={1} max={99} style={{ width: "100%", background: "var(--input-bg)", borderColor: "var(--border-color)" }} />
          </Form.Item>
        </div>

        <Form.Item
          name="isActive"
          label={<span style={{ color: "var(--text-secondary)" }}>Active</span>}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Divider style={{ borderColor: "var(--border-color)" }}>Template IDs</Divider>
        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
          Map region codes (e.g. <code>US</code>, <code>GB</code>) or <code>default</code> to template IDs.
        </p>
        <Form.List name="templateEntries">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} className="flex mb-2 w-full" align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, "region"]}
                    rules={[
                      { required: true, message: "Region required" },
                      { whitespace: true, message: "Cannot be blank" },
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input placeholder="US / GB / default" style={{ width: 110, background: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-primary)" }} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "templateId"]}
                    rules={[
                      { required: true, message: "Template ID required" },
                      { whitespace: true, message: "Cannot be blank" },
                    ]}
                    style={{ marginBottom: 0, flex: 1 }}
                  >
                    <Input placeholder="tmpl_..." style={{ background: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-primary)" }} />
                  </Form.Item>
                  {fields.length > 1 && (
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: "#ef4444" }} />
                  )}
                </Space>
              ))}
              <Button
                type="dashed"
                onClick={() => add({ region: "", templateId: "" })}
                icon={<PlusOutlined />}
                size="small"
                style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}
              >
                Add template ID
              </Button>
            </>
          )}
        </Form.List>

        <Divider style={{ borderColor: "var(--border-color)" }}>Unsupported Countries</Divider>
        <Form.List name="notSupportedCountries">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} className="flex mb-2 w-full" align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, "code"]}
                    rules={[
                      { required: true, message: "Country code required" },
                      { pattern: /^[A-Z]{2}$/i, message: "2-letter code (e.g. CN)" },
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input placeholder="CN" maxLength={2} style={{ width: 60, background: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-primary)", textTransform: "uppercase" }} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "reason"]}
                    style={{ marginBottom: 0, flex: 1 }}
                  >
                    <Input placeholder="Reason (optional)" style={{ background: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-primary)" }} />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} style={{ color: "#ef4444" }} />
                </Space>
              ))}
              <Button
                type="dashed"
                onClick={() => add({ code: "", reason: "" })}
                icon={<PlusOutlined />}
                size="small"
                style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}
              >
                Add country
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default ProviderFormModal;
