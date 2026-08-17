import React, { useEffect, useState } from 'react';
import {
    Modal, Form, Input, Select, InputNumber, DatePicker, Button, Switch, Divider, Space,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    MDR_SCOPE, MDR_RATE_TYPE,
    RATE_TYPE_OPTIONS, WALLET_TYPE_OPTIONS, BLOCKCHAIN_OPTIONS,
} from '../../constants/mdr';

const SCOPE_OPTIONS_MODAL = [
    { value: 'Global',   label: 'Global (applies to all merchants)' },
    { value: 'Merchant', label: 'Merchant (specific merchant override)' },
];

const CreateMdrModal = ({ open, onCancel, onSubmit, loading }) => {
    const [form] = Form.useForm();
    const [scope, setScope]       = useState(MDR_SCOPE.GLOBAL);
    const [rateType, setRateType] = useState(MDR_RATE_TYPE.PERCENTAGE);

    useEffect(() => {
        if (!open) return;
        form.resetFields();
        form.setFieldsValue({
            scope:      MDR_SCOPE.GLOBAL,
            walletType: 'All',
            blockchain: 'All',
            rateType:   MDR_RATE_TYPE.PERCENTAGE,
            isActive:   true,
        });
        // Reset derived UI state after the form fields are set
        const timer = setTimeout(() => {
            setScope(MDR_SCOPE.GLOBAL);
            setRateType(MDR_RATE_TYPE.PERCENTAGE);
        }, 0);
        return () => clearTimeout(timer);
    }, [open, form]);

    const handleOk = async () => {
        let values;
        try { values = await form.validateFields(); } catch { return; }

        const payload = {
            scope:         values.scope,
            walletType:    values.walletType,
            blockchain:    values.blockchain ?? 'All',
            rateType:      values.rateType,
            effectiveFrom: values.effectiveFrom?.toISOString(),
        };

        if (values.effectiveTo)  payload.effectiveTo = values.effectiveTo.toISOString();
        if (values.merchantId)   payload.merchantId  = values.merchantId;
        if (values.minFee != null) payload.minFee    = values.minFee;
        if (values.maxFee != null) payload.maxFee    = values.maxFee;

        if (values.rateType === MDR_RATE_TYPE.PERCENTAGE) {
            payload.mdrRate = values.mdrRate;
        } else if (values.rateType === MDR_RATE_TYPE.FLAT) {
            payload.flatFee = values.flatFee;
        } else if (values.rateType === MDR_RATE_TYPE.TIERED) {
            payload.tieredRates = (values.tieredRates ?? []).map((t) => ({
                minVolume: t.minVolume,
                maxVolume: t.maxVolume ?? null,
                rate:      t.rate,
            }));
        }
        onSubmit(payload);
    };

    const inputStyle = { background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', width: '100%' };
    const labelStyle = { color: 'var(--text-secondary)' };

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            title={<span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Create MDR Config</span>}
            centered
            width={640}
            styles={{
                content: { background: 'var(--bg-card)', border: '1px solid var(--border-color)' },
                header:  { background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' },
            }}
        >
            <Form form={form} layout="vertical" className="mt-4"
                requiredMark={(label, { required }) => (
                    <>{label}{required && <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>}</>
                )}>
                {/* Scope */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Form.Item name="scope" label={<span style={labelStyle}>Scope</span>} rules={[{ required: true, message: 'Scope is required' }]}>
                        <Select
                            options={SCOPE_OPTIONS_MODAL}
                            onChange={(v) => setScope(v)}
                            style={inputStyle}
                            styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                        />
                    </Form.Item>

                    {scope === MDR_SCOPE.MERCHANT && (
                        <Form.Item name="merchantId" label={<span style={labelStyle}>Merchant ID</span>} rules={[{ required: true, message: 'Merchant ID is required for merchant scope' }]}>
                            <Input placeholder="ObjectId of the merchant" style={inputStyle} />
                        </Form.Item>
                    )}
                </div>

                {/* Wallet Type + Blockchain */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Form.Item name="walletType" label={<span style={labelStyle}>Wallet Type</span>} rules={[{ required: true, message: 'Wallet type is required' }]}>
                        <Select options={WALLET_TYPE_OPTIONS} style={inputStyle} styles={{ popup: { root: { background: 'var(--bg-card)' } } }} />
                    </Form.Item>
                    <Form.Item name="blockchain" label={<span style={labelStyle}>Blockchain</span>}>
                        <Select options={BLOCKCHAIN_OPTIONS} style={inputStyle} styles={{ popup: { root: { background: 'var(--bg-card)' } } }} />
                    </Form.Item>
                </div>

                {/* Rate Type */}
                <Form.Item name="rateType" label={<span style={labelStyle}>Rate Type</span>} rules={[{ required: true, message: 'Rate type is required' }]}>
                    <Select
                        options={RATE_TYPE_OPTIONS}
                        onChange={(v) => setRateType(v)}
                        style={inputStyle}
                        styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                    />
                </Form.Item>

                {/* Percentage fields */}
                {rateType === MDR_RATE_TYPE.PERCENTAGE && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Form.Item name="mdrRate" label={<span style={labelStyle}>MDR Rate (%)</span>} rules={[{ required: true, message: 'MDR rate is required' }, { type: 'number', min: 0, max: 100, message: 'Must be between 0 and 100' }]}>
                            <InputNumber min={0} max={100} step={0.01} placeholder="1.5" style={inputStyle} />
                        </Form.Item>
                        <Form.Item name="minFee" label={<span style={labelStyle}>Min Fee ($)</span>}
                            rules={[{ type: 'number', min: 0, message: 'Must be ≥ 0' }]}>
                            <InputNumber min={0} step={0.01} placeholder="0.10" style={inputStyle} />
                        </Form.Item>
                        <Form.Item name="maxFee" label={<span style={labelStyle}>Max Fee ($)</span>}
                            dependencies={['minFee']}
                            rules={[{
                                validator: (_, value) => {
                                    if (value == null) return Promise.resolve();
                                    if (value < 0) return Promise.reject(new Error('Must be ≥ 0'));
                                    const min = form.getFieldValue('minFee');
                                    if (min != null && value < min)
                                        return Promise.reject(new Error('Must be ≥ min fee'));
                                    return Promise.resolve();
                                },
                            }]}>
                            <InputNumber min={0} step={0.01} placeholder="50.00" style={inputStyle} />
                        </Form.Item>
                    </div>
                )}

                {/* Flat fee fields */}
                {rateType === MDR_RATE_TYPE.FLAT && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Form.Item name="flatFee" label={<span style={labelStyle}>Flat Fee ($)</span>} rules={[{ required: true, message: 'Flat fee is required' }, { type: 'number', min: 0, message: 'Must be ≥ 0' }]}>
                            <InputNumber min={0} step={0.01} placeholder="0.25" style={inputStyle} />
                        </Form.Item>
                        <Form.Item name="minFee" label={<span style={labelStyle}>Min Fee ($)</span>}
                            rules={[{ type: 'number', min: 0, message: 'Must be ≥ 0' }]}>
                            <InputNumber min={0} step={0.01} placeholder="0.10" style={inputStyle} />
                        </Form.Item>
                    </div>
                )}

                {/* Tiered fields */}
                {rateType === MDR_RATE_TYPE.TIERED && (
                    <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)' }}>
                        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>Tiered Rate Bands</p>
                        <Form.List name="tieredRates" initialValue={[{ minVolume: 0, maxVolume: null, rate: null }]}>
                            {(fields, { add, remove }) => (
                                <div className="space-y-3">
                                    {fields.map(({ key, name }) => (
                                        <div key={key} className="flex items-start gap-2">
                                            <Form.Item name={[name, 'minVolume']} noStyle rules={[{ required: true, message: 'Min volume is required' }, { type: 'number', min: 0, message: 'Must be ≥ 0' }]}>
                                                <InputNumber placeholder="Min Vol" min={0} style={{ ...inputStyle, width: 110 }} />
                                            </Form.Item>
                                            <span style={{ color: 'var(--text-muted)', lineHeight: '32px' }}>–</span>
                                            <Form.Item name={[name, 'maxVolume']} noStyle
                                                dependencies={[['tieredRates', name, 'minVolume']]}
                                                rules={[{
                                                    validator: (_, value) => {
                                                        if (value == null) return Promise.resolve();
                                                        const tiers = form.getFieldValue('tieredRates');
                                                        const min = tiers?.[name]?.minVolume;
                                                        if (min != null && value <= min)
                                                            return Promise.reject(new Error('Must be > min volume'));
                                                        return Promise.resolve();
                                                    },
                                                }]}>
                                                <InputNumber placeholder="Max Vol (∞)" min={0} style={{ ...inputStyle, width: 120 }} />
                                            </Form.Item>
                                            <Form.Item name={[name, 'rate']} noStyle rules={[{ required: true, message: 'Rate is required' }, { type: 'number', min: 0, max: 100, message: '0–100' }]}>
                                                <InputNumber placeholder="Rate %" min={0} max={100} step={0.01} style={{ ...inputStyle, width: 100 }} />
                                            </Form.Item>
                                            {fields.length > 1 && (
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => remove(name)}
                                                    style={{ marginTop: 0 }}
                                                />
                                            )}
                                        </div>
                                    ))}
                                    <Button
                                        type="dashed"
                                        onClick={() => add({ minVolume: null, maxVolume: null, rate: null })}
                                        icon={<PlusOutlined />}
                                        size="small"
                                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                                    >
                                        Add Band
                                    </Button>
                                </div>
                            )}
                        </Form.List>
                    </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Form.Item name="effectiveFrom" label={<span style={labelStyle}>Effective From</span>} rules={[{ required: true, message: 'Effective From is required' }]}>
                        <DatePicker
                            showTime
                            style={inputStyle}
                            disabledDate={(d) => d && d < dayjs().startOf('day')}
                        />
                    </Form.Item>
                    <Form.Item name="effectiveTo" label={<span style={labelStyle}>Effective To (optional)</span>}
                        dependencies={['effectiveFrom']}
                        rules={[{
                            validator: (_, value) => {
                                if (!value) return Promise.resolve();
                                const from = form.getFieldValue('effectiveFrom');
                                if (from && value.isBefore(from))
                                    return Promise.reject(new Error('Must be after Effective From'));
                                return Promise.resolve();
                            },
                        }]}>
                        <DatePicker showTime style={inputStyle} />
                    </Form.Item>
                </div>

                <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0 16px' }} />
                <div className="flex justify-end gap-2">
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button type="primary" loading={loading} onClick={handleOk}>Create Config</Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateMdrModal;
