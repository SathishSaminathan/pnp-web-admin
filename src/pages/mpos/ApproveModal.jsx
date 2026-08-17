import React, { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const ApproveModal = ({ open, record, onCancel, onSubmit, loading }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) form.resetFields();
    }, [open, form]);

    const handleOk = async () => {
        const values = await form.validateFields();
        onSubmit({ adminNote: values.adminNote ?? '' });
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            okText="Approve Account"
            okButtonProps={{ loading, danger: false, style: { background: '#10b981', borderColor: '#10b981' }, icon: <CheckCircleOutlined /> }}
            cancelButtonProps={{ disabled: loading }}
            title={
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                    Approve MPOS Account
                </span>
            }
            centered
            width={480}
            styles={{
                content: { background: 'var(--bg-card)', border: '1px solid var(--border-color)' },
                header:  { background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' },
                footer:  { background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)' },
            }}
        >
            <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Approve <strong style={{ color: 'var(--text-primary)' }}>{record?.userId?.businessInfo?.businessName ?? 'this account'}</strong>.{' '}
                This will trigger <strong style={{ color: '#10b981' }}>Circle wallet provisioning</strong>.
            </p>
            <Form form={form} layout="vertical">
                <Form.Item name="adminNote" label={<span style={{ color: 'var(--text-secondary)' }}>Admin Note (internal only)</span>}>
                    <Input.TextArea
                        rows={3}
                        placeholder="e.g. All documents verified. Approved."
                        style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ApproveModal;
