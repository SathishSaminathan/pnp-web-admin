import React, { useEffect } from 'react';
import { Modal, Form, DatePicker, Divider, Button } from 'antd';
import dayjs from 'dayjs';

const UpdateMdrModal = ({ open, record, onCancel, onSubmit, loading }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open && record) {
            form.setFieldsValue({
                effectiveTo: record.effectiveTo ? dayjs(record.effectiveTo) : null,
            });
        }
        if (!open) form.resetFields();
    }, [open, record, form]);

    const handleOk = async () => {
        let values;
        try { values = await form.validateFields(); } catch { return; }
        const payload = {
            effectiveTo: values.effectiveTo ? values.effectiveTo.toISOString() : null,
        };
        onSubmit(payload);
    };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            title={<span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Update MDR Config</span>}
            centered
            width={420}
            styles={{
                content: { background: 'var(--bg-card)', border: '1px solid var(--border-color)' },
                header:  { background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' },
            }}
        >
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Best practice:</strong> set <code>effectiveTo</code> to today on this config and create a new one with updated rates. This preserves a full audit history.
            </p>
            <Form form={form} layout="vertical">
                <Form.Item name="effectiveTo" label={<span style={{ color: 'var(--text-secondary)' }}>Effective To</span>}>
                    <DatePicker
                        showTime
                        style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', width: '100%' }}
                    />
                </Form.Item>
            </Form>
            <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0 16px' }} />
            <div className="flex justify-end gap-2">
                <Button onClick={onCancel}>Cancel</Button>
                <Button type="primary" loading={loading} onClick={handleOk}>Save Changes</Button>
            </div>
        </Modal>
    );
};

export default UpdateMdrModal;
