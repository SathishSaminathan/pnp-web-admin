import React, { useEffect, useRef, useState } from 'react';
import {
    Modal, Form, Input, Select, Switch, Button, InputNumber,
    Divider, Spin, Alert, Table, Tag,
} from 'antd';
import { PlusOutlined, DeleteOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { countriesApi } from '../../api/modules/countries';
import { accountProvidersApi } from '../../api/modules/accountProviders';
import { buildTransactionFeeForApi } from '../_shared/transactionFeeHelpers';
import FeeDetailFields from '../_shared/FeeDetailFields';

const COUNTRY_PAGE_SIZE = 50;

const ACCOUNT_TYPE_OPTIONS = [
    { value: 'ALL',        label: 'ALL (expand to all types)' },
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
    name:                     values.name,
    logo:                     values.logo,
    type:                     values.type,
    accountTypes:             values.accountTypes,
    countryCodes:             values.countryCodes,
    isActive:                 values.isActive ?? true,
    perDayTransactionLimit:   String(values.perDayTransactionLimit   ?? ''),
    perMonthTransactionLimit: String(values.perMonthTransactionLimit ?? ''),
    transactionFee:           buildTransactionFeeForApi(values.transactionFee),
});

/* ─── RESULT PANEL ──────────────────────────────────────────────────────── */
const ResultPanel = ({ result, onClose }) => {
    const { summary, failed } = result;
    const allOk = summary.failed === 0;

    const failedColumns = [
        { title: 'Country Code', dataIndex: 'countryCode', key: 'countryCode' },
        { title: 'Account Type', dataIndex: 'accountType', key: 'accountType' },
        { title: 'Reason',       dataIndex: 'reason',      key: 'reason',
            render: (v) => <Tag color="red">{v}</Tag> },
    ];

    return (
        <div className="space-y-4">
            <Alert
                type={allOk ? 'success' : 'warning'}
                icon={allOk ? <CheckCircleOutlined /> : <WarningOutlined />}
                showIcon
                message="Bulk Upsert Complete"
                description={
                    <div className="grid grid-cols-4 gap-3 mt-2">
                        {[
                            { label: 'Requested', value: summary.requested, color: '#6366f1' },
                            { label: 'Created',   value: summary.created,   color: '#10b981' },
                            { label: 'Updated',   value: summary.updated,   color: '#3b82f6' },
                            { label: 'Failed',    value: summary.failed,    color: summary.failed > 0 ? '#ef4444' : '#6b7280' },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="rounded-lg p-3 text-center"
                                style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                                <div className="text-lg font-bold" style={{ color }}>{value}</div>
                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
                            </div>
                        ))}
                    </div>
                }
            />

            {failed?.length > 0 && (
                <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Failed Items ({failed.length})
                    </p>
                    <Table
                        dataSource={failed}
                        columns={failedColumns}
                        rowKey={(r, i) => `${r.countryCode}-${r.accountType}-${i}`}
                        size="small"
                        pagination={{ pageSize: 10, size: 'small' }}
                        style={{ background: 'transparent' }}
                    />
                </div>
            )}

            <div className="flex justify-end">
                <Button type="primary" onClick={onClose}>Done</Button>
            </div>
        </div>
    );
};

/* ─── BULK UPSERT CURRENCY MODAL ────────────────────────────────────────── */
const BulkUpsertCurrencyModal = ({ open, onCancel, onSubmit, loading }) => {
    const [form] = Form.useForm();
    const [result, setResult] = useState(null);

    // Country ISO code infinite-scroll state
    const [countries, setCountries]             = useState([]);
    const [countryFetching, setCountryFetching] = useState(false);
    const [countryHasMore, setCountryHasMore]   = useState(true);
    const countryPageRef     = useRef(1);
    const countrySearchRef   = useRef('');
    const countryFetchingRef = useRef(false);
    const debounceRef        = useRef(null);

    // Provider state (for transaction fee rows)
    const [providers, setProviders]             = useState([]);
    const [providerLoading, setProviderLoading] = useState(false);

    useEffect(() => {
        if (open) {
            form.setFieldsValue({
                isActive:     true,
                accountTypes: ['ALL'],
                countryCodes: ['ALL'],
                transactionFee: [],
            });
            setResult(null);
            countryPageRef.current   = 1;
            countrySearchRef.current = '';
            setCountries([]);
            setCountryHasMore(true);
            fetchCountries('', 1, false);
            fetchProviders();
        } else {
            form.resetFields();
            setResult(null);
            if (debounceRef.current) clearTimeout(debounceRef.current);
        }
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

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
        } catch { /* silent */ }
        finally { countryFetchingRef.current = false; setCountryFetching(false); }
    };

    const fetchProviders = async () => {
        setProviderLoading(true);
        try {
            const res = await accountProvidersApi.getAll({ limit: 100 });
            setProviders(res.data || []);
        } catch { /* silent */ }
        finally { setProviderLoading(false); }
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

    // Prevent mixing "ALL" with other values
    const handleAccountTypesChange = (values) => {
        if (!values || values.length === 0) return;
        const last = values[values.length - 1];
        if (last === 'ALL') {
            form.setFieldValue('accountTypes', ['ALL']);
        } else {
            form.setFieldValue('accountTypes', values.filter((v) => v !== 'ALL'));
        }
    };

    const handleCountryCodesChange = (values) => {
        if (!values || values.length === 0) return;
        const last = values[values.length - 1];
        if (last === 'ALL') {
            form.setFieldValue('countryCodes', ['ALL']);
        } else {
            form.setFieldValue('countryCodes', values.filter((v) => v !== 'ALL'));
        }
    };

    const handleFinish = async (values) => {
        const res = await onSubmit(buildPayload(values));
        if (res) setResult(res);
    };

    const countryCodeOptions = [
        { value: 'ALL', label: 'ALL (expand to all active countries)' },
        ...countries.map((c) => ({
            value: c.isoCode,
            label: `${c.flag ?? ''} ${c.name} (${c.isoCode})`.trim(),
        })),
    ];

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
            width={680}
            title={<span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Bulk Upsert Currency</span>}
            styles={{
                content: { background: 'var(--bg-card)', borderRadius: 16, padding: '24px' },
                header:  { background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', paddingBottom: 12, marginBottom: 20 },
                mask:    { backdropFilter: 'blur(4px)' },
            }}
        >
            {result ? (
                <ResultPanel result={result} onClose={onCancel} />
            ) : (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    requiredMark={(label, { required }) => (
                        <>{label}{required && <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>}</>
                    )}
                >
                    {/* Description */}
                    <Alert
                        type="info"
                        showIcon
                        message={
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                Upserts a currency definition across a matrix of (accountType × countryCode) tuples.
                                Use <strong>ALL</strong> to expand to all values — mixing ALL with other values is not allowed.
                            </span>
                        }
                        style={{ marginBottom: 16, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}
                    />

                    {/* Row 1: Currency Name | Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="name"
                            label={<span style={labelStyle}>Currency Name</span>}
                            rules={[
                                { required: true, message: 'Currency name is required' },
                                { whitespace: true, message: 'Cannot be blank' },
                                { min: 2, message: 'At least 2 characters' },
                            ]}
                        >
                            <Input placeholder="e.g. USD, BTC" maxLength={20} style={inputStyle} />
                        </Form.Item>
                        <Form.Item
                            name="type"
                            label={<span style={labelStyle}>Type</span>}
                            rules={[{ required: true, message: 'Currency type is required' }]}
                        >
                            <Select
                                placeholder="Select type"
                                options={[{ value: 'Fiat', label: 'Fiat' }, { value: 'Crypto', label: 'Crypto' }]}
                                styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                            />
                        </Form.Item>
                    </div>

                    {/* Row 2: Account Types */}
                    <Form.Item
                        name="accountTypes"
                        label={<span style={labelStyle}>Account Types</span>}
                        rules={[{ required: true, message: 'At least one account type is required' }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select account types or ALL"
                            options={ACCOUNT_TYPE_OPTIONS}
                            onChange={handleAccountTypesChange}
                            styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                        />
                    </Form.Item>

                    {/* Row 3: Country Codes */}
                    <Form.Item
                        name="countryCodes"
                        label={<span style={labelStyle}>Country Codes</span>}
                        rules={[{ required: true, message: 'At least one country code is required' }]}
                    >
                        <Select
                            mode="multiple"
                            showSearch
                            placeholder="Select country codes or ALL"
                            filterOption={false}
                            options={countryCodeOptions}
                            onSearch={handleCountrySearch}
                            onChange={handleCountryCodesChange}
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
                                        <div style={{ textAlign: 'center', padding: '8px 0' }}><Spin size="small" /></div>
                                    )}
                                </>
                            )}
                            styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                        />
                    </Form.Item>

                    {/* Row 4: Logo URL */}
                    <Form.Item
                        name="logo"
                        label={<span style={labelStyle}>Logo URL</span>}
                        rules={[
                            { required: true, message: 'Logo URL is required' },
                            {
                                validator: (_, value) => {
                                    if (!value) return Promise.resolve();
                                    try { new URL(value); return Promise.resolve(); }
                                    catch { return Promise.reject(new Error('Enter a valid URL')); }
                                },
                            },
                        ]}
                    >
                        <Input placeholder="https://cdn.meralot.com/currencies/usd.png" style={inputStyle} />
                    </Form.Item>

                    {/* Row 5: Daily Limit | Monthly Limit */}
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="perDayTransactionLimit"
                            label={<span style={labelStyle}>Daily Limit</span>}
                            required
                            rules={[{
                                validator: (_, value) => {
                                    if (value === '' || value === null || value === undefined)
                                        return Promise.reject(new Error('Daily limit is required'));
                                    const n = Number(value);
                                    if (isNaN(n) || n <= 0) return Promise.reject(new Error('Must be a positive number'));
                                    return Promise.resolve();
                                },
                            }]}
                        >
                            <Input placeholder="10000" style={inputStyle} />
                        </Form.Item>
                        <Form.Item
                            name="perMonthTransactionLimit"
                            label={<span style={labelStyle}>Monthly Limit</span>}
                            required
                            dependencies={['perDayTransactionLimit']}
                            rules={[{
                                validator: (_, value) => {
                                    if (value === '' || value === null || value === undefined)
                                        return Promise.reject(new Error('Monthly limit is required'));
                                    const n = Number(value);
                                    if (isNaN(n) || n <= 0) return Promise.reject(new Error('Must be a positive number'));
                                    const daily = form.getFieldValue('perDayTransactionLimit');
                                    if (daily && Number(daily) > 0 && n < Number(daily))
                                        return Promise.reject(new Error('Must be ≥ daily limit'));
                                    return Promise.resolve();
                                },
                            }]}
                        >
                            <Input placeholder="300000" style={inputStyle} />
                        </Form.Item>
                    </div>

                    {/* Row 6: Active toggle */}
                    <Form.Item name="isActive" label={<span style={labelStyle}>Active</span>} valuePropName="checked">
                        <Switch />
                    </Form.Item>

                    <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0 16px' }}>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Transaction Fees (optional)</span>
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
                                                label={<span style={labelStyle}>Payment Method</span>} style={{ marginBottom: 8 }}
                                                rules={[{ required: true, message: 'Payment method is required' }]}>
                                                <Select placeholder="ACH, Wire…" allowClear options={PAYMENT_METHOD_OPTIONS}
                                                    styles={{ popup: { root: { background: 'var(--bg-card)' } } }} />
                                            </Form.Item>
                                            <Form.Item {...restField} name={[name, 'settlementDays']}
                                                label={<span style={labelStyle}>Settlement Days</span>} style={{ marginBottom: 8 }}>
                                                <InputNumber min={0} placeholder="2" style={{ width: '100%' }} />
                                            </Form.Item>
                                            <Form.Item {...restField} name={[name, 'minimumAmount']}
                                                label={<span style={labelStyle}>Min Amount</span>} style={{ marginBottom: 8 }}
                                                rules={[{
                                                    validator: (_, value) => {
                                                        if (value === '' || value === null || value === undefined) return Promise.resolve();
                                                        const n = Number(value);
                                                        if (isNaN(n) || n < 0) return Promise.reject(new Error('Must be ≥ 0'));
                                                        return Promise.resolve();
                                                    },
                                                }]}>
                                                <Input placeholder="1" style={inputStyle} />
                                            </Form.Item>
                                            <Form.Item {...restField} name={[name, 'maximumAmount']}
                                                label={<span style={labelStyle}>Max Amount</span>} style={{ marginBottom: 8 }}
                                                dependencies={[['transactionFee', name, 'minimumAmount']]}
                                                rules={[{
                                                    validator: (_, value) => {
                                                        if (value === '' || value === null || value === undefined) return Promise.resolve();
                                                        const n = Number(value);
                                                        if (isNaN(n) || n < 0) return Promise.reject(new Error('Must be ≥ 0'));
                                                        const fees = form.getFieldValue('transactionFee');
                                                        const min = fees?.[name]?.minimumAmount;
                                                        if (min !== '' && min !== null && min !== undefined && !isNaN(Number(min)) && n < Number(min))
                                                            return Promise.reject(new Error('Must be ≥ min amount'));
                                                        return Promise.resolve();
                                                    },
                                                }]}>
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
                        <Button type="primary" htmlType="submit" loading={loading}>Bulk Upsert</Button>
                    </div>
                </Form>
            )}
        </Modal>
    );
};

export default BulkUpsertCurrencyModal;
