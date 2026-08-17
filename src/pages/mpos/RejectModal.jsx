import React, { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

const RejectModal = ({ open, record, onCancel, onSubmit, loading }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) form.resetFields();
    }, [open, form]);

    const handleOk = async () => {
        const values = await form.validateFields();
        onSubmit({ rejectionReason: values.rejectionReason, adminNote: values.adminNote ?? '' });
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            okText="Reject Account"
            okButtonProps={{ loading, danger: true, icon: <CloseCircleOutlined /> }}
            cancelButtonProps={{ disabled: loading }}
            title={
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                    Reject MPOS Account
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
                Reject <strong style={{ color: 'var(--text-primary)' }}>{record?.userId?.businessInfo?.businessName ?? 'this account'}</strong>.{' '}
                The rejection reason will be shown to the merchant.
            </p>
            <Form form={form} layout="vertical">
                <Form.Item
                    name="rejectionReason"
                    label={<span style={{ color: 'var(--text-secondary)' }}>Rejection Reason <span style={{ color: '#ef4444' }}>*</span></span>}
                    rules={[{ required: true, message: 'Rejection reason is required' }]}
                >
                    <Input.TextArea
                        rows={3}
                        placeholder="e.g. Business registration documents could not be verified."
                        style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                </Form.Item>
                <Form.Item name="adminNote" label={<span style={{ color: 'var(--text-secondary)' }}>Admin Note (internal only)</span>}>
                    <Input.TextArea
                        rows={2}
                        placeholder="e.g. Flagged for manual compliance review."
                        style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default RejectModal;
