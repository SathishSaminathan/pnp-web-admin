import React, { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

const ReviewModal = ({ open, record, onCancel, onSubmit, loading }) => {
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
            okText="Mark Under Review"
            okButtonProps={{ loading, icon: <EyeOutlined /> }}
            cancelButtonProps={{ disabled: loading }}
            title={
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                    Mark as Under Review
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
                Move <strong style={{ color: 'var(--text-primary)' }}>{record?.userId?.businessInfo?.businessName ?? 'this account'}</strong> to{' '}
                <strong style={{ color: '#3b82f6' }}>Under Review</strong> status.
            </p>
            <Form form={form} layout="vertical">
                <Form.Item name="adminNote" label={<span style={{ color: 'var(--text-secondary)' }}>Admin Note (internal only)</span>}>
                    <Input.TextArea
                        rows={3}
                        placeholder="e.g. Reviewing business registration documents…"
                        style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ReviewModal;
