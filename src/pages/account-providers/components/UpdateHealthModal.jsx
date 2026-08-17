import React, { useEffect } from 'react';
import { Modal, Form, Select, Button } from 'antd';
import { HEALTH_STATUS_OPTIONS } from '../../../constants/accountProviders';

const UpdateHealthModal = ({ open, provider, onCancel, onSubmit, loading }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open && provider) {
            form.setFieldsValue({ healthStatus: provider.metadata?.healthStatus ?? 'unknown' });
        }
    }, [open, provider, form]);

    const handleOk = async () => {
        try {
            const { healthStatus } = await form.validateFields();
            onSubmit(healthStatus);
        } catch {
            // Validation failure is displayed inline
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            title={
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    Update Health Status
                </span>
            }
            centered
            width={380}
            styles={{
                content: { background: 'var(--bg-card)', border: '1px solid var(--border-color)' },
                header:  { background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' },
            }}
        >
            <p className="text-sm mb-4 mt-2" style={{ color: 'var(--text-secondary)' }}>
                Set the health status for{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{provider?.providerName}</strong>.
            </p>
            <Form form={form} layout="vertical">
                <Form.Item
                    name="healthStatus"
                    label={<span style={{ color: 'var(--text-secondary)' }}>Health Status</span>}
                    rules={[{ required: true, message: 'Please select a health status' }]}
                >
                    <Select options={HEALTH_STATUS_OPTIONS} style={{ width: '100%' }} />
                </Form.Item>
                <div className="flex justify-end gap-2 mt-2">
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button type="primary" loading={loading} onClick={handleOk}>
                        Update
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default UpdateHealthModal;
