import React, { useEffect } from 'react';
import { Modal, Form, Select, Switch, Button, Tag, Popconfirm, Divider } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { CURRENCY_OPTIONS } from '../../../constants/accountProviders';

const ManageCurrenciesModal = ({ open, provider, onCancel, onAdd, onRemove, loadingAdd }) => {
    const [form] = Form.useForm();
    const existing = (provider?.supportedCurrencies ?? []).map((c) => c.currencyCode);

    useEffect(() => {
        if (open) form.resetFields();
    }, [open, form]);

    const availableOptions = CURRENCY_OPTIONS.filter((o) => !existing.includes(o.value));

    const handleAdd = async () => {
        try {
            const { currencyCode, isEnabled } = await form.validateFields();
            onAdd(currencyCode, isEnabled ?? true);
        } catch {
            // Inline validation
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            title={
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    Manage Currencies — {provider?.providerName}
                </span>
            }
            centered
            width={460}
            styles={{
                content: { background: 'var(--bg-card)', border: '1px solid var(--border-color)' },
                header:  { background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' },
            }}
        >
            {/* Existing currencies */}
            <div className="mb-4 mt-2">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                    Current Currencies
                </p>
                {existing.length === 0 ? (
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>None added yet.</span>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {(provider?.supportedCurrencies ?? []).map((c) => (
                            <div key={c.currencyCode} className="flex items-center gap-1">
                                <Tag color={c.isEnabled ? 'blue' : 'default'} style={{ borderRadius: 20 }}>
                                    {c.currencyCode}
                                </Tag>
                                <Popconfirm
                                    title={`Remove ${c.currencyCode}?`}
                                    onConfirm={() => onRemove(c.currencyCode)}
                                    okText="Remove"
                                    okButtonProps={{ danger: true }}
                                >
                                    <DeleteOutlined
                                        className="cursor-pointer text-xs"
                                        style={{ color: '#ef4444' }}
                                    />
                                </Popconfirm>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0 16px' }} />

            {/* Add new currency */}
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                Add Currency
            </p>
            <Form form={form} layout="inline" className="flex flex-wrap gap-2">
                <Form.Item
                    name="currencyCode"
                    rules={[{ required: true, message: 'Select a currency' }]}
                    style={{ flex: 1, minWidth: 180 }}
                >
                    <Select
                        placeholder="Select currency"
                        options={availableOptions}
                        style={{ width: '100%' }}
                        showSearch
                        filterOption={(input, opt) =>
                            opt.label.toLowerCase().includes(input.toLowerCase())
                        }
                    />
                </Form.Item>
                <Form.Item name="isEnabled" valuePropName="checked" initialValue={true} label="Enabled">
                    <Switch size="small" />
                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        loading={loadingAdd}
                        onClick={handleAdd}
                        disabled={availableOptions.length === 0}
                    >
                        Add
                    </Button>
                </Form.Item>
            </Form>

            <div className="flex justify-end mt-4">
                <Button onClick={onCancel}>Close</Button>
            </div>
        </Modal>
    );
};

export default ManageCurrenciesModal;
