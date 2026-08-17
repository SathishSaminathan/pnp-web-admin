import React, { useEffect } from 'react';
import { Modal, Form, Input, Switch, Select, Button, Space } from 'antd';
import { CURRENCY_OPTIONS } from '../../../constants/accountProviders';
import { sanitizeNumber } from '../../../utils/number.utils';

const { Option } = Select;

const CreateEditProviderModal = ({ open, initialValues, onCancel, onSubmit, loading }) => {
    const [form] = Form.useForm();
    const isEdit = !!initialValues?._id;

    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue({
                    providerName:        initialValues.providerName ?? '',
                    providerCode:        initialValues.providerCode ?? '',
                    description:         initialValues.description ?? '',
                    isEnabled:           initialValues.isEnabled ?? true,
                    usUsers:             initialValues.eligibility?.usUsers ?? false,
                    nonUsUsers:          initialValues.eligibility?.nonUsUsers ?? false,
                    supportedCurrencies: (initialValues.supportedCurrencies ?? []).map((c) => c.currencyCode),
                    priority:            initialValues.priority ?? undefined,
                    webhookUrl:          initialValues.webhookUrl ?? '',
                    rateLimitsPerMinute: initialValues.rateLimits?.requestsPerMinute ?? undefined,
                    rateLimitsPerDay:    initialValues.rateLimits?.requestsPerDay ?? undefined,
                    environment:         initialValues.credentials?.environment ?? undefined,
                    publicKey:           '',
                    privateKey:          '',
                });
            } else {
                form.resetFields();
                form.setFieldsValue({ isEnabled: true, usUsers: false, nonUsUsers: false });
            }
        }
    }, [open, initialValues, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                providerName:        values.providerName.trim(),
                providerCode:        values.providerCode.trim().toUpperCase(),
                isEnabled:           values.isEnabled,
                eligibility:         { usUsers: values.usUsers, nonUsUsers: values.nonUsUsers },
                supportedCurrencies: (values.supportedCurrencies ?? []).map((code) => ({ currencyCode: code, isEnabled: true })),
            };
            if (values.description?.trim())  payload.description = values.description.trim();
            if (values.priority != null)     payload.priority    = sanitizeNumber(values.priority);
            if (values.webhookUrl?.trim())   payload.webhookUrl  = values.webhookUrl.trim();
            if (values.rateLimitsPerMinute != null || values.rateLimitsPerDay != null) {
                payload.rateLimits = {};
                if (values.rateLimitsPerMinute != null) payload.rateLimits.requestsPerMinute = sanitizeNumber(values.rateLimitsPerMinute);
                if (values.rateLimitsPerDay    != null) payload.rateLimits.requestsPerDay    = sanitizeNumber(values.rateLimitsPerDay);
            }
            if (values.publicKey?.trim() || values.privateKey?.trim() || values.environment) {
                payload.credentials = {};
                if (values.publicKey?.trim())  payload.credentials.publicKey   = values.publicKey.trim();
                if (values.privateKey?.trim()) payload.credentials.privateKey  = values.privateKey.trim();
                if (values.environment)        payload.credentials.environment = values.environment;
            }
            onSubmit(payload);
        } catch {
            // Validation failed — form will display inline errors
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            title={
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {isEdit ? 'Edit Provider' : 'Create Provider'}
                </span>
            }
            centered
            width={600}
            styles={{
                content: { background: 'var(--bg-card)', border: '1px solid var(--border-color)' },
                header:  { background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' },
            }}
        >
            <Form form={form} layout="vertical" className="mt-4"
                requiredMark={(label, { required }) => (
                    <>{label}{required && <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>}</>
                )}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                    <Form.Item
                        name="providerName"
                        label={<span style={{ color: 'var(--text-secondary)' }}>Provider Name</span>}
                        rules={[
                            { required: true, message: 'Provider name is required' },
                            { whitespace: true, message: 'Cannot be blank' },
                            { min: 2, message: 'At least 2 characters' },
                        ]}
                    >
                        <Input
                            placeholder="e.g. Checkbook"
                            style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="providerCode"
                        label={<span style={{ color: 'var(--text-secondary)' }}>Provider Code</span>}
                        rules={[
                            { required: true, message: 'Provider code is required' },
                            { whitespace: true, message: 'Cannot be blank' },
                            { pattern: /^[A-Z0-9_]+$/i, message: 'Letters, numbers and underscores only' },
                        ]}
                    >
                        <Input
                            placeholder="e.g. CHECKBOOK"
                            disabled={isEdit}
                            style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    name="description"
                    label={<span style={{ color: 'var(--text-secondary)' }}>Description <span style={{ color: 'var(--text-muted)' }}>(optional)</span></span>}
                >
                    <Input.TextArea
                        rows={2}
                        placeholder="Short description of this provider"
                        style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                </Form.Item>

                <Form.Item
                    name="supportedCurrencies"
                    label={<span style={{ color: 'var(--text-secondary)' }}>Supported Currencies</span>}
                    rules={[{ required: true, type: 'array', min: 1, message: 'At least one currency is required' }]}
                >
                    <Select
                        mode="multiple"
                        placeholder="Select currencies"
                        options={CURRENCY_OPTIONS}
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
                    <Form.Item
                        name="isEnabled"
                        label={<span style={{ color: 'var(--text-secondary)' }}>Enabled</span>}
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                    <Form.Item
                        name="usUsers"
                        label={<span style={{ color: 'var(--text-secondary)' }}>US Users</span>}
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                    <Form.Item
                        name="nonUsUsers"
                        label={<span style={{ color: 'var(--text-secondary)' }}>Non-US Users</span>}
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                    <Form.Item
                        name="priority"
                        label={<span style={{ color: 'var(--text-secondary)' }}>Priority <span style={{ color: 'var(--text-muted)' }}>(optional)</span></span>}
                        rules={[{
                            validator: (_, value) => {
                                if (value === '' || value === null || value === undefined) return Promise.resolve();
                                const n = Number(value);
                                if (isNaN(n) || n < 0) return Promise.reject(new Error('Must be a non-negative number'));
                                return Promise.resolve();
                            },
                        }]}
                    >
                        <Input
                            type="number"
                            min={0}
                            placeholder="e.g. 10"
                            style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="webhookUrl"
                        label={<span style={{ color: 'var(--text-secondary)' }}>Webhook URL <span style={{ color: 'var(--text-muted)' }}>(optional)</span></span>}
                        rules={[{
                            validator: (_, value) => {
                                if (!value || !value.trim()) return Promise.resolve();
                                try { new URL(value); return Promise.resolve(); }
                                catch { return Promise.reject(new Error('Enter a valid URL')); }
                            },
                        }]}
                    >
                        <Input
                            placeholder="https://api.example.com/webhooks/..."
                            style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                    <Form.Item
                        name="rateLimitsPerMinute"
                        label={<span style={{ color: 'var(--text-secondary)' }}>Rate Limit / Min <span style={{ color: 'var(--text-muted)' }}>(optional)</span></span>}
                        rules={[{
                            validator: (_, value) => {
                                if (value === '' || value === null || value === undefined) return Promise.resolve();
                                const n = Number(value);
                                if (isNaN(n) || n < 0) return Promise.reject(new Error('Must be a non-negative number'));
                                return Promise.resolve();
                            },
                        }]}
                    >
                        <Input
                            type="number"
                            min={0}
                            placeholder="e.g. 60"
                            style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="rateLimitsPerDay"
                        label={<span style={{ color: 'var(--text-secondary)' }}>Rate Limit / Day <span style={{ color: 'var(--text-muted)' }}>(optional)</span></span>}
                        rules={[{
                            validator: (_, value) => {
                                if (value === '' || value === null || value === undefined) return Promise.resolve();
                                const n = Number(value);
                                if (isNaN(n) || n < 0) return Promise.reject(new Error('Must be a non-negative number'));
                                return Promise.resolve();
                            },
                        }]}
                    >
                        <Input
                            type="number"
                            min={0}
                            placeholder="e.g. 10000"
                            style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        />
                    </Form.Item>
                </div>

                {/* Credentials — keys are optional on edit, environment always editable */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                    <Form.Item
                        name="publicKey"
                        label={
                            <span style={{ color: 'var(--text-secondary)' }}>
                                Public Key <span style={{ color: 'var(--text-muted)' }}>(optional{isEdit ? ', leave blank to keep existing' : ''})</span>
                            </span>
                        }
                    >
                        <Input
                            placeholder="Provider public key"
                            style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="privateKey"
                        label={
                            <span style={{ color: 'var(--text-secondary)' }}>
                                Private Key <span style={{ color: 'var(--text-muted)' }}>(optional{isEdit ? ', leave blank to keep existing' : ''})</span>
                            </span>
                        }
                    >
                        <Input.Password
                            placeholder="Provider private key"
                            style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    name="environment"
                    label={<span style={{ color: 'var(--text-secondary)' }}>Environment <span style={{ color: 'var(--text-muted)' }}>(optional)</span></span>}
                >
                    <Select
                        placeholder="Select environment"
                        allowClear
                        options={[
                            { label: 'Sandbox',    value: 'sandbox' },
                            { label: 'Production', value: 'production' },
                        ]}
                        style={{ background: 'var(--input-bg)' }}
                    />
                </Form.Item>

                <div className="flex justify-end gap-2 mt-2">
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button type="primary" loading={loading} onClick={handleOk}>
                        {isEdit ? 'Save Changes' : 'Create Provider'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateEditProviderModal;
