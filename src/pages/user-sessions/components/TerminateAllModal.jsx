import React from 'react';
import { Modal, Form, Select, Input, Button } from 'antd';
import { PoweroffOutlined } from '@ant-design/icons';

const TerminateAllModal = ({
    open,
    loading,
    merchantOptions,
    merchantLoading,
    onMerchantSearch,
    onClose,
    onFinish,
}) => {
    const [form] = Form.useForm();

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    const handleFinish = async (values) => {
        await onFinish(values);
        form.resetFields();
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <PoweroffOutlined style={{ color: '#ef4444' }} />
                    <span style={{ color: 'var(--text-primary)' }}>Terminate All Sessions</span>
                </div>
            }
            open={open}
            onCancel={handleClose}
            footer={null}
            styles={{ content: { background: 'var(--bg-card)' }, header: { background: 'var(--bg-card)' } }}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item
                    name="userId"
                    label={<span style={{ color: 'var(--text-primary)' }}>Select Merchant</span>}
                    rules={[{ required: true, message: 'Please select a merchant' }]}
                >
                    <Select
                        showSearch
                        allowClear
                        placeholder="Search merchant..."
                        loading={merchantLoading}
                        filterOption={false}
                        onSearch={onMerchantSearch}
                        options={merchantOptions.map((o) => ({
                            value: o.value,
                            label: `${o.label} (${o.email})`,
                        }))}
                        notFoundContent={merchantLoading ? 'Searching…' : 'Type to search'}
                    />
                </Form.Item>
                <Form.Item
                    name="reason"
                    label={<span style={{ color: 'var(--text-primary)' }}>Reason</span>}
                    rules={[
                        { required: true, message: 'Reason is required' },
                        { min: 10, message: 'At least 10 characters' },
                        { max: 500, message: 'Max 500 characters' },
                    ]}
                >
                    <Input.TextArea rows={3} placeholder="Describe why all sessions are being terminated..." />
                </Form.Item>
                <div className="flex justify-end gap-2">
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button danger type="primary" htmlType="submit" loading={loading} icon={<PoweroffOutlined />}>
                        Terminate All
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default TerminateAllModal;
