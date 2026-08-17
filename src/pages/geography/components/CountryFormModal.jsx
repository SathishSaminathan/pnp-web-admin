import React, { useEffect } from 'react';
import { Modal, Form, Input, Switch } from 'antd';

const MODAL_STYLES = {
    content: { background: 'var(--bg-card)' },
    header:  { background: 'var(--bg-card)' },
    footer:  { background: 'var(--bg-card)' },
};

const inputStyle = {
    background: 'var(--input-bg)',
    border:     '1px solid var(--border-color)',
    color:      'var(--text-primary)',
};
const labelStyle = { color: 'var(--text-secondary)' };

/* ════════════════════════════════════════════════════════════════════════════
   Country Form Modal — handles both Create and Edit
   ═══════════════════════════════════════════════════════════════════════════ */
const CountryFormModal = ({ open, record, onCancel, onSubmit, loading }) => {
    const [form] = Form.useForm();
    const isEdit = !!record;

    useEffect(() => {
        if (open) {
            if (isEdit) {
                form.setFieldsValue({
                    name:      record.name,
                    isoCode:   record.isoCode,
                    flag:      record.flag,
                    phonecode: record.phonecode,
                    currency:  record.currency,
                    latitude:  record.latitude,
                    longitude: record.longitude,
                    isActive:  record.isActive ?? true,
                });
            } else {
                form.setFieldsValue({ isActive: true });
            }
        } else {
            form.resetFields();
        }
    }, [open, record, form, isEdit]);

    const handleOk = () => {
        form.validateFields().then(onSubmit);
    };

    return (
        <Modal
            open={open}
            title={
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                    {isEdit ? 'Edit Country' : 'Create Country'}
                </span>
            }
            onOk={handleOk}
            onCancel={onCancel}
            okText={isEdit ? 'Save Changes' : 'Create Country'}
            cancelText="Cancel"
            confirmLoading={loading}
            width={520}
            styles={MODAL_STYLES}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                className="mt-4"
                requiredMark={(label, { required }) => (
                    <>{label}{required && <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>}</>
                )}
            >
                {/* Country Name — full width */}
                <Form.Item
                    name="name"
                    label={<span style={labelStyle}>Country Name</span>}
                    rules={[
                        { required: true, message: 'Country name is required' },
                        { whitespace: true, message: 'Cannot be blank' },
                    ]}
                >
                    <Input placeholder="e.g. United States" style={inputStyle} />
                </Form.Item>

                {/* 2-col grid */}
                <div className="grid grid-cols-2 gap-x-4">
                    <Form.Item
                        name="isoCode"
                        label={<span style={labelStyle}>ISO Code</span>}
                        rules={[{ required: true, message: 'ISO code is required' }]}
                    >
                        <Input placeholder="US" maxLength={3} style={inputStyle} />
                    </Form.Item>

                    <Form.Item
                        name="flag"
                        label={<span style={labelStyle}>Flag Emoji</span>}
                    >
                        <Input placeholder="🇺🇸" maxLength={8} style={inputStyle} />
                    </Form.Item>

                    <Form.Item
                        name="phonecode"
                        label={<span style={labelStyle}>Phone Code</span>}
                    >
                        <Input placeholder="1" addonBefore="+" style={inputStyle} />
                    </Form.Item>

                    <Form.Item
                        name="currency"
                        label={<span style={labelStyle}>Currency Code</span>}
                    >
                        <Input placeholder="USD" maxLength={10} style={inputStyle} />
                    </Form.Item>

                    <Form.Item
                        name="latitude"
                        label={<span style={labelStyle}>Latitude</span>}
                    >
                        <Input placeholder="38.00000000" style={inputStyle} />
                    </Form.Item>

                    <Form.Item
                        name="longitude"
                        label={<span style={labelStyle}>Longitude</span>}
                    >
                        <Input placeholder="-97.00000000" style={inputStyle} />
                    </Form.Item>
                </div>

                <Form.Item
                    name="isActive"
                    label={<span style={labelStyle}>Status</span>}
                    valuePropName="checked"
                >
                    <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CountryFormModal;
