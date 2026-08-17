import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Form, Input, Select, Switch, Button, InputNumber, Divider, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { countriesApi } from '../../api/modules/countries';
import { accountProvidersApi } from '../../api/modules/accountProviders';
import { feeToForm, buildTransactionFeeForApi } from '../_shared/transactionFeeHelpers';
import FeeDetailFields from '../_shared/FeeDetailFields';

const COUNTRY_PAGE_SIZE = 50;

const ACCOUNT_TYPE_OPTIONS = [
    { value: 'Business',   label: 'Business' },
    { value: 'Individual', label: 'Individual' },
    { value: 'Freelance',  label: 'Freelance' },
];

const PAYMENT_METHOD_OPTIONS = [
    { value: 'Card',                      label: 'Card' },
    { value: 'ACH',                       label: 'ACH' },
    { value: 'RTP',                       label: 'RTP' },
    { value: 'WIRE',                      label: 'WIRE' },
    { value: 'Internal Account Transfer', label: 'Internal Account Transfer' },
    { value: 'PayPal',                    label: 'PayPal' },
    { value: 'Venmo',                     label: 'Venmo' },
    { value: 'Withdrawal',                label: 'Withdrawal' },
    { value: 'Tag Id',                    label: 'Tag Id' },
    { value: 'Deposit',                   label: 'Deposit' },
    { value: 'Check',                     label: 'Check' },
    { value: 'Push to Card',              label: 'Push to Card' },
    { value: 'Bank Transfer',             label: 'Bank Transfer' },
    { value: 'UPI',                       label: 'UPI' },
    { value: 'Wallet Transfer',           label: 'Wallet Transfer' },
    { value: 'Account Transfer',          label: 'Account Transfer' },
];

const inputStyle = {
    background: 'var(--input-bg)',
    border:     '1px solid var(--border-color)',
    color:      'var(--text-primary)',
};
const labelStyle = { color: 'var(--text-secondary)' };

const buildPayload = (values) => ({
    ...values,
    perDayTransactionLimit:   String(values.perDayTransactionLimit   ?? ''),
    perMonthTransactionLimit: String(values.perMonthTransactionLimit ?? ''),
    transactionFee: buildTransactionFeeForApi(values.transactionFee),
});

/* ─── UPDATE CURRENCY MODAL ──────────────────────────────────────────────── */
const UpdateCurrencyModal = ({ open, record, onCancel, onSubmit, loading }) => {
    const [form] = Form.useForm();

    // Country infinite-scroll state
    const [countries, setCountries]           = useState([]);
    const [seededCountry, setSeededCountry]   = useState(null); // keeps selected country visible
    const [countryFetching, setCountryFetching] = useState(false);
    const [countryHasMore, setCountryHasMore]   = useState(true);
    const countryPageRef    = useRef(1);
    const countrySearchRef  = useRef('');
    const countryFetchingRef = useRef(false);
    const debounceRef       = useRef(null);

    // Provider state
    const [providers, setProviders]           = useState([]);
    const [providerLoading, setProviderLoading] = useState(false);

    /* Reset + boot when modal opens */
    useEffect(() => {
        if (open) {
            countryPageRef.current   = 1;
            countrySearchRef.current = '';
            setCountries([]);
            setCountryHasMore(true);
            fetchCountries('', 1, false);
            fetchProviders();
        } else {
            form.resetFields();
            setSeededCountry(null);
            if (debounceRef.current) clearTimeout(debounceRef.current);
        }
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    /* Pre-fill form + seed selected country into options immediately */
    useEffect(() => {
        if (!open || !record) return;
        // Seed the record's populated country so its label shows before page 1 loads
        if (record.country && typeof record.country === 'object' && record.country._id) {
            setSeededCountry(record.country);
        }
        form.setFieldsValue({
            name:                     record.name,
            type:                     record.type,
            accountType:              record.accountType,
            country:                  record.country?._id ?? record.country ?? undefined,
            countryCode:              record.countryCode,
            logo:                     record.logo ?? '',
            perDayTransactionLimit:   record.perDayTransactionLimit,
            perMonthTransactionLimit: record.perMonthTransactionLimit,
            isActive:                 record.isActive ?? true,
            transactionFee:           (record.transactionFee || []).map(feeToForm),
        });
    }, [open, record]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchCountries = async (search, page, append) => {
        if (countryFetchingRef.current) return;
        countryFetchingRef.current = true;
        setCountryFetching(true);
        try {
            const res = await countriesApi.getAll({
                ...(search ? { search } : {}),
                page,
                limit: COUNTRY_PAGE_SIZE,
                sort: 'name:1',
            });
            const list    = res.data || [];
            const hasNext = res.meta?.pagination?.hasNextPage ?? false;
            setCountries(prev => append ? [...prev, ...list] : list);
            setCountryHasMore(hasNext);
        } catch {
            // silent
        } finally {
            countryFetchingRef.current = false;
            setCountryFetching(false);
        }
    };

    const fetchProviders = async () => {
        setProviderLoading(true);
        try {
            const res = await accountProvidersApi.getAll({ limit: 100 });
            setProviders(res.data || []);
        } catch {
            // silent
        } finally {
            setProviderLoading(false);
        }
    };

    const handleCountrySearch = (value) => {
        countrySearchRef.current = value;
        countryPageRef.current   = 1;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setCountries([]);
            setCountryHasMore(true);
            fetchCountries(value, 1, false);
        }, 300);
    };

    const handleCountryScroll = (e) => {
        const { scrollTop, offsetHeight, scrollHeight } = e.target;
        if (!countryFetchingRef.current && countryHasMore &&
            scrollTop + offsetHeight >= scrollHeight - 20) {
            const next = countryPageRef.current + 1;
            countryPageRef.current = next;
            fetchCountries(countrySearchRef.current, next, true);
        }
    };

    const handleCountryChange = (value) => {
        const c = countries.find((x) => x._id === value) ?? seededCountry;
        if (c && c._id === value) form.setFieldValue('countryCode', c.phonecode);
    };

    const handleFinish = (values) => onSubmit(buildPayload(values));

    /* Merge seeded country (so label always shows) with fetched pages */
    const countryOptions = useMemo(() => {
        const opts = countries.map((c) => ({
            value: c._id,
            label: `${c.flag ?? ''} ${c.name} (${c.isoCode})`.trim(),
        }));
        if (seededCountry && !countries.some((c) => c._id === seededCountry._id)) {
            opts.unshift({
                value: seededCountry._id,
                label: `${seededCountry.flag ?? ''} ${seededCountry.name} (${seededCountry.isoCode})`.trim(),
            });
        }
        return opts;
    }, [countries, seededCountry]);

    const providerOptions = providers.map((p) => ({
        value: p._id,
        label: `${p.providerName} (${p.providerCode})`,
    }));

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            centered
            width={600}
            title={<span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Update Currency</span>}
            styles={{
                content: { background: 'var(--bg-card)', borderRadius: 16, padding: '24px' },
                header:  { background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', paddingBottom: 12, marginBottom: 20 },
                mask:    { backdropFilter: 'blur(4px)' },
            }}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>

                {/* Row 1: Currency Name | Type */}
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="name" label={<span style={labelStyle}>Currency Name</span>}
                        rules={[{ required: true, message: 'Required' }]}>
                        <Input placeholder="e.g. USD, BTC" maxLength={20} style={inputStyle} />
                    </Form.Item>
                    <Form.Item name="type" label={<span style={labelStyle}>Type</span>}
                        rules={[{ required: true, message: 'Required' }]}>
                        <Select placeholder="Select type"
                            options={[{ value: 'Fiat', label: 'Fiat' }, { value: 'Crypto', label: 'Crypto' }]}
                            styles={{ popup: { root: { background: 'var(--bg-card)' } } }} />
                    </Form.Item>
                </div>

                {/* Row 2: Account Type (full width) */}
                <Form.Item name="accountType" label={<span style={labelStyle}>Account Type</span>}>
                    <Select placeholder="Select account type" allowClear options={ACCOUNT_TYPE_OPTIONS}
                        styles={{ popup: { root: { background: 'var(--bg-card)' } } }} />
                </Form.Item>

                {/* Row 3: Country dropdown — server search + infinite scroll */}
                <Form.Item name="country" label={<span style={labelStyle}>Country</span>}>
                    <Select
                        showSearch
                        allowClear
                        placeholder="Type to search country…"
                        filterOption={false}
                        options={countryOptions}
                        onSearch={handleCountrySearch}
                        onChange={handleCountryChange}
                        onPopupScroll={handleCountryScroll}
                        notFoundContent={
                            countryFetching
                                ? <div style={{ textAlign: 'center', padding: '8px 0' }}><Spin size="small" /></div>
                                : 'No countries found'
                        }
                        dropdownRender={(menu) => (
                            <>
                                {menu}
                                {countryFetching && countries.length > 0 && (
                                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                                        <Spin size="small" />
                                    </div>
                                )}
                            </>
                        )}
                        styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                    />
                </Form.Item>
                {/* Hidden countryCode — auto-populated from selected country's phonecode */}
                <Form.Item name="countryCode" hidden><Input /></Form.Item>

                {/* Row 4: Logo URL */}
                <Form.Item name="logo" label={<span style={labelStyle}>Logo URL</span>}>
                    <Input placeholder="https://cdn.meralot.com/currencies/usd.png" style={inputStyle} />
                </Form.Item>

                {/* Row 5: Daily Limit | Monthly Limit */}
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="perDayTransactionLimit" label={<span style={labelStyle}>Daily Limit</span>}>
                        <Input placeholder="50000" style={inputStyle} />
                    </Form.Item>
                    <Form.Item name="perMonthTransactionLimit" label={<span style={labelStyle}>Monthly Limit</span>}>
                        <Input placeholder="500000" style={inputStyle} />
                    </Form.Item>
                </div>

                {/* Row 6: Active toggle */}
                <Form.Item name="isActive" label={<span style={labelStyle}>Active</span>} valuePropName="checked">
                    <Switch />
                </Form.Item>

                <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0 16px' }}>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Transaction Fees</span>
                </Divider>

                {/* Dynamic transaction fees */}
                <Form.List name="transactionFee">
                    {(fields, { add, remove }) => (
                        <div className="space-y-3">
                            {fields.map(({ key, name, ...restField }) => (
                                <div key={key} className="rounded-lg p-3 relative"
                                    style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid var(--border-color)' }}>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Form.Item {...restField} name={[name, 'paymentMethod']}
                                            label={<span style={labelStyle}>Payment Method</span>} style={{ marginBottom: 8 }}>
                                            <Select placeholder="ACH, Wire…" allowClear options={PAYMENT_METHOD_OPTIONS}
                                                styles={{ popup: { root: { background: 'var(--bg-card)' } } }} />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'settlementDays']}
                                            label={<span style={labelStyle}>Settlement Days</span>} style={{ marginBottom: 8 }}>
                                            <InputNumber min={0} placeholder="2" style={{ width: '100%' }} />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'minimumAmount']}
                                            label={<span style={labelStyle}>Min Amount</span>} style={{ marginBottom: 8 }}>
                                            <Input placeholder="1" style={inputStyle} />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'maximumAmount']}
                                            label={<span style={labelStyle}>Max Amount</span>} style={{ marginBottom: 8 }}>
                                            <Input placeholder="10000" style={inputStyle} />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'priority']}
                                            label={<span style={labelStyle}>Priority</span>} style={{ marginBottom: 8 }}>
                                            <InputNumber min={1} placeholder="1" style={{ width: '100%' }} />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'serviceProvider']}
                                            label={<span style={labelStyle}>Service Provider</span>} style={{ marginBottom: 8 }}>
                                            <Select
                                                placeholder="Select provider (optional)"
                                                allowClear
                                                loading={providerLoading}
                                                options={providerOptions}
                                                styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                                            />
                                        </Form.Item>
                                    </div>
                                    <FeeDetailFields
                                        name={name}
                                        restField={restField}
                                        form={form}
                                        labelStyle={labelStyle}
                                        inputStyle={inputStyle}
                                    />
                                    <Button type="text" danger size="small" icon={<DeleteOutlined />}
                                        onClick={() => remove(name)}
                                        style={{ position: 'absolute', top: 8, right: 8 }} />
                                </div>
                            ))}
                            <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}
                                style={{ width: '100%', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                                Add Payment Method Fee
                            </Button>
                        </div>
                    )}
                </Form.List>

                <div className="flex gap-2 justify-end mt-6">
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>Save Changes</Button>
                </div>
            </Form>
        </Modal>
    );
};

export default UpdateCurrencyModal;
