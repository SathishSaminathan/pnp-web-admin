import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Table, Button, Tag, Dropdown, Modal, Form, Input, Select, Switch, InputNumber, Divider, Spin, message } from 'antd';
import {
    ReloadOutlined, MoreOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
    SwapOutlined, GlobalOutlined, EyeOutlined,
    CheckCircleOutlined, StopOutlined, FilterOutlined,
} from '@ant-design/icons';
import { exchangeRatesApi, currencyApi } from '../../api/modules/currency';
import { countriesApi } from '../../api/modules/countries';
import { accountProvidersApi } from '../../api/modules/accountProviders';
import { useTheme } from '../../context/ThemeContext';
import { formatRate } from '../../utils/number.utils';
import { extractMetaCounts } from '../../utils/extractMetaCounts';
import { mapCardsFromMeta } from '../../utils/mapCardsFromMeta';
import ExchangeRateDetailDrawer from './ExchangeRateDetailDrawer';
import { feeToForm, buildTransactionFeeForApi } from '../_shared/transactionFeeHelpers';
import FeeDetailFields from '../_shared/FeeDetailFields';

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE = 50;

const CARD_CONFIG = [
    { label: 'Total Rates',  key: 'totalExchangeRate',       color: '#6366f1', icon: <GlobalOutlined /> },
    { label: 'Active Rates', key: 'activeExchangeRate',      color: '#10b981', icon: <CheckCircleOutlined /> },
    { label: 'Inactive Rates', key: 'inactiveExchangeRate', color: '#f59e0b', icon: <SwapOutlined /> },
];

/* ─── STAT CARD ─────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, color, icon }) => (
    <div
        className="rounded-2xl w-full flex flex-col overflow-hidden"
        style={{
            background: `linear-gradient(135deg, ${color}09 0%, var(--bg-card) 60%)`,
            border: `1px solid ${color}25`,
            boxShadow: 'var(--shadow-card)',
        }}
    >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {label}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: `${color}18`, color }}>
                {icon}
            </div>
        </div>
        <div className="px-4 pb-4">
            <span className="font-extrabold tabular-nums leading-none" style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>
                {value ?? 0}
            </span>
        </div>
        <div style={{ height: 3, background: color, opacity: 0.65 }} />
    </div>
);

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

const LS = { color: 'var(--text-secondary)' };
const IS = { background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' };

const buildExchangePayload = (values) => ({
    country:          values.country,
    countryName:      values.countryName,
    accountType:      values.accountType,
    fromCurrency:     values.fromCurrency,
    fromCurrencyName: values.fromCurrencyName,
    toCurrency:       values.toCurrency,
    toCurrencyName:   values.toCurrencyName,
    exchangeRate:     String(values.exchangeRate ?? ''),
    isActive:         values.isActive ?? true,
    transactionFee:   buildTransactionFeeForApi(values.transactionFee),
});

/* ─── EXCHANGE RATE FORM MODAL ─────────────────────────────────────────────────── */
const ExchangeRateFormModal = ({ open, record, onCancel, onSubmit, loading }) => {
    const [form] = Form.useForm();
    const isEdit = !!record;

    /* ── Country dropdown ── */
    const [countryOpts, setCountryOpts]         = useState([]);
    const [seededCountry, setSeededCountry]     = useState(null);
    const [countryFetching, setCountryFetching] = useState(false);
    const [countryHasMore, setCountryHasMore]   = useState(true);
    const cPageRef = useRef(1); const cSearchRef = useRef(''); const cFetchRef = useRef(false); const cDebounce = useRef(null);

    /* ── From-Currency dropdown ── */
    const [fromOpts, setFromOpts]         = useState([]);
    const [seededFrom, setSeededFrom]     = useState(null);
    const [fromFetching, setFromFetching] = useState(false);
    const [fromHasMore, setFromHasMore]   = useState(true);
    const fPageRef = useRef(1); const fSearchRef = useRef(''); const fFetchRef = useRef(false); const fDebounce = useRef(null);

    /* ── To-Currency dropdown ── */
    const [toOpts, setToOpts]         = useState([]);
    const [seededTo, setSeededTo]     = useState(null);
    const [toFetching, setToFetching] = useState(false);
    const [toHasMore, setToHasMore]   = useState(true);
    const tPageRef = useRef(1); const tSearchRef = useRef(''); const tFetchRef = useRef(false); const tDebounce = useRef(null);

    /* ── Selected country + account type (drive currency lists) ── */
    const [selectedCountryId, setSelectedCountryId]     = useState(null);
    const [selectedAccountType, setSelectedAccountType] = useState(null);

    /* ── Service Provider dropdown ── */
    const [providers, setProviders]         = useState([]);
    const [providerLoading, setProviderLoading] = useState(false);

    const fetchProviders = async () => {
        setProviderLoading(true);
        try {
            const res = await accountProvidersApi.getAll({ limit: 100 });
            setProviders(res.data || []);
        } catch { /* interceptor */ }
        finally { setProviderLoading(false); }
    };

    useEffect(() => {
        if (open) {
            [cPageRef, fPageRef, tPageRef].forEach(r => { r.current = 1; });
            [cSearchRef, fSearchRef, tSearchRef].forEach(r => { r.current = ''; });
            if (record) {
                const country  = record.country      && typeof record.country      === 'object' ? record.country      : null;
                const fromCurr = record.fromCurrency && typeof record.fromCurrency === 'object' ? record.fromCurrency : null;
                const toCurr   = record.toCurrency   && typeof record.toCurrency   === 'object' ? record.toCurrency   : null;
                const countryId = record.country?._id ?? (typeof record.country === 'string' ? record.country : null);
                const acctType  = record.accountType ?? null;
                setSeededCountry(country); setSeededFrom(fromCurr); setSeededTo(toCurr);
                setSelectedCountryId(countryId);
                setSelectedAccountType(acctType);
                form.setFieldsValue({
                    country:          record.country?._id      ?? record.country      ?? undefined,
                    countryName:      record.countryName       ?? country?.name       ?? '',
                    accountType:      record.accountType,
                    fromCurrency:     record.fromCurrency?._id ?? record.fromCurrency ?? undefined,
                    fromCurrencyName: record.fromCurrencyName  ?? fromCurr?.name      ?? '',
                    toCurrency:       record.toCurrency?._id   ?? record.toCurrency   ?? undefined,
                    toCurrencyName:   record.toCurrencyName    ?? toCurr?.name        ?? '',
                    exchangeRate:     record.exchangeRate,
                    isActive:         record.isActive ?? true,
                    transactionFee:   (record.transactionFee || []).map(feeToForm),
                });
                setFromOpts([]); setFromHasMore(true); fetchCurrList('from', '', 1, false, countryId, acctType);
                setToOpts([]);   setToHasMore(true);   fetchCurrList('to',   '', 1, false, countryId, acctType);
            } else {
                setSeededCountry(null); setSeededFrom(null); setSeededTo(null);
                setSelectedCountryId(null);
                setSelectedAccountType(null);
                form.resetFields();
                form.setFieldsValue({ isActive: true, transactionFee: [] });
                setFromOpts([]); setToOpts([]);
            }
            setCountryOpts([]); setCountryHasMore(true); fetchCountryList('', 1, false);
            fetchProviders();
        } else {
            form.resetFields();
            [cDebounce, fDebounce, tDebounce].forEach(r => { if (r.current) clearTimeout(r.current); });
            setSeededCountry(null); setSeededFrom(null); setSeededTo(null);
            setSelectedCountryId(null);
            setSelectedAccountType(null);
        }
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchCountryList = async (q, page, append) => {
        if (cFetchRef.current) return;
        cFetchRef.current = true; setCountryFetching(true);
        try {
            const res  = await countriesApi.getAll({ ...(q ? { search: q } : {}), page, limit: PAGE_SIZE, sort: 'name:1' });
            const list = res.data || [];
            setCountryOpts(prev => append ? [...prev, ...list] : list);
            setCountryHasMore(res.meta?.pagination?.hasNextPage ?? false);
        } catch { /* interceptor */ }
        finally { cFetchRef.current = false; setCountryFetching(false); }
    };

    const fetchCurrList = async (which, q, page, append, countryId, accountType) => {
        const fetchRef   = which === 'from' ? fFetchRef  : tFetchRef;
        const setOptsFn  = which === 'from' ? setFromOpts  : setToOpts;
        const setFetchFn = which === 'from' ? setFromFetching : setToFetching;
        const setMoreFn  = which === 'from' ? setFromHasMore  : setToHasMore;
        if (fetchRef.current) return;
        fetchRef.current = true; setFetchFn(true);
        try {
            const params = { ...(q ? { search: q } : {}), page, limit: PAGE_SIZE };
            if (countryId)   params.country     = countryId;
            if (accountType) params.accountType = accountType;
            const res  = await currencyApi.getAll(params);
            const list = res.data || [];
            setOptsFn(prev => append ? [...prev, ...list] : list);
            setMoreFn(res.meta?.pagination?.hasNextPage ?? false);
        } catch { /* interceptor */ }
        finally { fetchRef.current = false; setFetchFn(false); }
    };

    const handleCountrySearch = (q) => {
        cSearchRef.current = q; cPageRef.current = 1;
        if (cDebounce.current) clearTimeout(cDebounce.current);
        cDebounce.current = setTimeout(() => { setCountryOpts([]); setCountryHasMore(true); fetchCountryList(q, 1, false); }, 300);
    };
    const handleFromSearch = (q) => {
        // Ant Design fires onSearch('') when the dropdown opens — skip to avoid
        // clearing already-loaded options with no actual user search.
        if (q === '' && fSearchRef.current === '') return;
        fSearchRef.current = q; fPageRef.current = 1;
        if (fDebounce.current) clearTimeout(fDebounce.current);
        fDebounce.current = setTimeout(() => { setFromOpts([]); setFromHasMore(true); fetchCurrList('from', q, 1, false, selectedCountryId, selectedAccountType); }, 300);
    };
    const handleToSearch = (q) => {
        // Same guard as handleFromSearch.
        if (q === '' && tSearchRef.current === '') return;
        tSearchRef.current = q; tPageRef.current = 1;
        if (tDebounce.current) clearTimeout(tDebounce.current);
        tDebounce.current = setTimeout(() => { setToOpts([]); setToHasMore(true); fetchCurrList('to', q, 1, false, selectedCountryId, selectedAccountType); }, 300);
    };

    const handleCountryChange = (val) => {
        const c = [...countryOpts, ...(seededCountry ? [seededCountry] : [])].find(x => x._id === val);
        form.setFieldValue('countryName', c?.name ?? '');
        // Reset currency selections and reload filtered by the chosen country + current account type
        form.setFieldsValue({ fromCurrency: undefined, fromCurrencyName: '', toCurrency: undefined, toCurrencyName: '' });
        setSeededFrom(null); setSeededTo(null);
        setSelectedCountryId(val ?? null);
        setFromOpts([]); setFromHasMore(true); fPageRef.current = 1; fSearchRef.current = '';
        setToOpts([]);   setToHasMore(true);   tPageRef.current = 1; tSearchRef.current = '';
        if (val && selectedAccountType) {
            fetchCurrList('from', '', 1, false, val, selectedAccountType);
            fetchCurrList('to',   '', 1, false, val, selectedAccountType);
        }
    };

    const handleAccountTypeChange = (val) => {
        const v = val ?? null;
        setSelectedAccountType(v);
        // Reset currency selections and reload filtered by country + new account type
        form.setFieldsValue({ fromCurrency: undefined, fromCurrencyName: '', toCurrency: undefined, toCurrencyName: '' });
        setSeededFrom(null); setSeededTo(null);
        setFromOpts([]); setFromHasMore(true); fPageRef.current = 1; fSearchRef.current = '';
        setToOpts([]);   setToHasMore(true);   tPageRef.current = 1; tSearchRef.current = '';
        if (selectedCountryId) {
            fetchCurrList('from', '', 1, false, selectedCountryId, v);
            fetchCurrList('to',   '', 1, false, selectedCountryId, v);
        }
    };
    const handleFromChange = (val) => {
        const c = [...fromOpts, ...(seededFrom ? [seededFrom] : [])].find(x => x._id === val);
        form.setFieldValue('fromCurrencyName', c?.name ?? '');
    };
    const handleToChange = (val) => {
        const c = [...toOpts, ...(seededTo ? [seededTo] : [])].find(x => x._id === val);
        form.setFieldValue('toCurrencyName', c?.name ?? '');
    };

    const mergedCountry = useMemo(() => {
        const base = countryOpts.map(c => ({ value: c._id, label: `${c.flag ?? ''} ${c.name} (${c.isoCode})`.trim() }));
        if (seededCountry && !countryOpts.some(c => c._id === seededCountry._id))
            base.unshift({ value: seededCountry._id, label: `${seededCountry.flag ?? ''} ${seededCountry.name} (${seededCountry.isoCode})`.trim() });
        return base;
    }, [countryOpts, seededCountry]);

    const mergedFrom = useMemo(() => {
        const base = fromOpts.map(c => ({ value: c._id, label: c.name }));
        if (seededFrom && !fromOpts.some(c => c._id === seededFrom._id))
            base.unshift({ value: seededFrom._id, label: seededFrom.name });
        return base;
    }, [fromOpts, seededFrom]);

    const mergedTo = useMemo(() => {
        const base = toOpts.map(c => ({ value: c._id, label: c.name }));
        if (seededTo && !toOpts.some(c => c._id === seededTo._id))
            base.unshift({ value: seededTo._id, label: seededTo.name });
        return base;
    }, [toOpts, seededTo]);

    const spinFooter = (fetching, opts) => (menu) => (
        <>{menu}{fetching && opts.length > 0 && <div style={{ textAlign: 'center', padding: '6px 0' }}><Spin size="small" /></div>}</>
    );
    const spinEmpty = (fetching) => fetching
        ? <div style={{ textAlign: 'center', padding: '8px 0' }}><Spin size="small" /></div>
        : 'No results';

    const handleFinish = (values) => onSubmit(buildExchangePayload(values));

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            centered
            width={600}
            title={
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                    {isEdit ? 'Update Exchange Rate' : 'Add Exchange Rate'}
                </span>
            }
            styles={{
                content: { background: 'var(--bg-card)', borderRadius: 16, padding: '24px' },
                header:  { background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', paddingBottom: 12, marginBottom: 20 },
                mask:    { backdropFilter: 'blur(4px)' },
            }}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>

                {/* Country — must be selected first to drive currency lists */}
                <Form.Item name="country" label={<span style={LS}>Country</span>}
                    rules={[{ required: true, message: 'Please select a country first' }]}>
                    <Select
                        showSearch allowClear filterOption={false}
                        placeholder="Type to search country…"
                        options={mergedCountry}
                        onSearch={handleCountrySearch}
                        onChange={handleCountryChange}
                        onPopupScroll={(e) => {
                            const { scrollTop, offsetHeight, scrollHeight } = e.target;
                            if (!cFetchRef.current && countryHasMore && scrollTop + offsetHeight >= scrollHeight - 20)
                                { cPageRef.current++; fetchCountryList(cSearchRef.current, cPageRef.current, true); }
                        }}
                        notFoundContent={spinEmpty(countryFetching)}
                        dropdownRender={spinFooter(countryFetching, countryOpts)}
                        styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                    />
                </Form.Item>
                {/* Hidden — auto-filled from country select */}
                <Form.Item name="countryName" hidden><Input /></Form.Item>

                {/* Account Type — after country, also drives currency filter */}
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="accountType" label={<span style={LS}>Account Type</span>}>
                        <Select
                            placeholder="Select account type" allowClear
                            onChange={handleAccountTypeChange}
                            options={[
                                { value: 'Business',   label: 'Business' },
                                { value: 'Individual', label: 'Individual' },
                                { value: 'Freelance',  label: 'Freelance' },
                            ]}
                            styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                        />
                    </Form.Item>
                    <Form.Item name="isActive" label={<span style={LS}>Active</span>} valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </div>

                {/* From Currency — loaded based on selected country + account type */}
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="fromCurrency" label={<span style={LS}>From Currency</span>}
                        rules={[{ required: true, message: 'Required' }]}>
                        <Select
                            showSearch allowClear filterOption={false}
                            placeholder={!selectedCountryId ? 'Select a country first' : !selectedAccountType ? 'Select an account type first' : 'Search currency…'}
                            disabled={!selectedCountryId || !selectedAccountType}
                            options={mergedFrom}
                            onSearch={handleFromSearch}
                            onChange={handleFromChange}
                            onPopupScroll={(e) => {
                                const { scrollTop, offsetHeight, scrollHeight } = e.target;
                                if (!fFetchRef.current && fromHasMore && scrollTop + offsetHeight >= scrollHeight - 20)
                                    { fPageRef.current++; fetchCurrList('from', fSearchRef.current, fPageRef.current, true, selectedCountryId, selectedAccountType); }
                            }}
                            notFoundContent={spinEmpty(fromFetching)}
                            dropdownRender={spinFooter(fromFetching, fromOpts)}
                            styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                        />
                    </Form.Item>
                    <Form.Item name="fromCurrencyName" label={<span style={LS}>From Currency Name</span>}>
                        <Input placeholder="USD" style={IS} maxLength={20} />
                    </Form.Item>
                </div>

                {/* To Currency — loaded based on selected country + account type */}
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="toCurrency" label={<span style={LS}>To Currency</span>}
                        rules={[{ required: true, message: 'Required' }]}>
                        <Select
                            showSearch allowClear filterOption={false}
                            placeholder={!selectedCountryId ? 'Select a country first' : !selectedAccountType ? 'Select an account type first' : 'Search currency…'}
                            disabled={!selectedCountryId || !selectedAccountType}
                            options={mergedTo}
                            onSearch={handleToSearch}
                            onChange={handleToChange}
                            onPopupScroll={(e) => {
                                const { scrollTop, offsetHeight, scrollHeight } = e.target;
                                if (!tFetchRef.current && toHasMore && scrollTop + offsetHeight >= scrollHeight - 20)
                                    { tPageRef.current++; fetchCurrList('to', tSearchRef.current, tPageRef.current, true, selectedCountryId, selectedAccountType); }
                            }}
                            notFoundContent={spinEmpty(toFetching)}
                            dropdownRender={spinFooter(toFetching, toOpts)}
                            styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                        />
                    </Form.Item>
                    <Form.Item name="toCurrencyName" label={<span style={LS}>To Currency Name</span>}>
                        <Input placeholder="BRL" style={IS} maxLength={20} />
                    </Form.Item>
                </div>

                {/* Exchange Rate */}
                <Form.Item name="exchangeRate" label={<span style={LS}>Exchange Rate</span>}
                    rules={[{ required: true, message: 'Required' }]}>
                    <Input placeholder="5.52" style={IS} />
                </Form.Item>

                <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0 16px' }}>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Transaction Fees (optional)</span>
                </Divider>

                <Form.List name="transactionFee">
                    {(fields, { add, remove }) => (
                        <div className="space-y-3">
                            {fields.map(({ key, name, ...restField }) => (
                                <div key={key} className="rounded-lg p-3 relative"
                                    style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid var(--border-color)' }}>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Form.Item {...restField} name={[name, 'paymentMethod']}
                                            label={<span style={LS}>Payment Method</span>} style={{ marginBottom: 8 }}>
                                            <Select placeholder="ACH, Wire…" allowClear options={PAYMENT_METHOD_OPTIONS}
                                                styles={{ popup: { root: { background: 'var(--bg-card)' } } }} />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'settlementDays']}
                                            label={<span style={LS}>Settlement Days</span>} style={{ marginBottom: 8 }}>
                                            <InputNumber min={0} placeholder="1" style={{ width: '100%' }} />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'minimumAmount']}
                                            label={<span style={LS}>Min Amount</span>} style={{ marginBottom: 8 }}>
                                            <Input placeholder="10" style={IS} />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'maximumAmount']}
                                            label={<span style={LS}>Max Amount</span>} style={{ marginBottom: 8 }}>
                                            <Input placeholder="1000" style={IS} />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'priority']}
                                            label={<span style={LS}>Priority</span>} style={{ marginBottom: 8 }}>
                                            <InputNumber min={1} placeholder="1" style={{ width: '100%' }} />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'serviceProvider']}
                                            label={<span style={LS}>Service Provider</span>} style={{ marginBottom: 8 }}>
                                            <Select
                                                allowClear
                                                placeholder="Select provider"
                                                loading={providerLoading}
                                                options={(providers || []).map(p => ({ value: p._id, label: `${p.providerName} (${p.providerCode})` }))}
                                                styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                                            />
                                        </Form.Item>
                                    </div>
                                    <FeeDetailFields
                                        name={name}
                                        restField={restField}
                                        form={form}
                                        labelStyle={LS}
                                        inputStyle={IS}
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

                <div className="flex gap-2 justify-end mt-4">
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {isEdit ? 'Update' : 'Create'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

/* ─── MAIN PAGE ──────────────────────────────────────────────────────────── */
const ExchangeRateList = () => {
    useTheme();

    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const [rates, setRates]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });
    const [metaCounts, setMetaCounts] = useState({});

    /* ── Filters ── */
    const [filterAccType, setFilterAccType]           = useState('');
    const [filterStatus, setFilterStatus]             = useState('');
    const [filterCountry, setFilterCountry]           = useState('');
    const [filterFromCurrency, setFilterFromCurrency] = useState('');
    const [filterToCurrency, setFilterToCurrency]     = useState('');

    /* ── Currency name text filter debounce refs ── */
    const fcDebounce = useRef(null);
    const tcDebounce = useRef(null);

    /* ── Country filter dropdown (infinite-scroll) ── */
    const [countryOpts, setCountryOpts]         = useState([]);
    const [countryFetching, setCountryFetching] = useState(false);
    const [countryHasMore, setCountryHasMore]   = useState(true);
    const cPageRef   = useRef(1);
    const cSearchRef = useRef('');
    const cFetchRef  = useRef(false);
    const cDebounce  = useRef(null);

    /* ── Form modal ── */
    const [modalOpen, setModalOpen]         = useState(false);
    const [editRecord, setEditRecord]       = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    /* ── Detail drawer ── */
    const [drawerOpen, setDrawerOpen]       = useState(false);
    const [drawerRecord, setDrawerRecord]   = useState(null);
    const [actionLoading, setActionLoading] = useState('');

    /* ── Helpers ── */
    const fromName = (r) => r.fromCurrencyName ?? r.fromCurrency?.name ?? r.fromCurrency ?? '';
    const toName   = (r) => r.toCurrencyName   ?? r.toCurrency?.name   ?? r.toCurrency   ?? '';

    const fetchRates = useCallback(async (
        page = 1, limit = DEFAULT_PAGE_SIZE,
        accountType = filterAccType, isActive = filterStatus,
        country = filterCountry,
        fromCurrency = filterFromCurrency, toCurrency = filterToCurrency,
    ) => {
        setLoading(true);
        try {
            const params = { page, limit };
            if (accountType)     params.accountType      = accountType;
            if (isActive !== '') params.isActive          = isActive === 'true';
            if (country)         params.country           = country;
            if (fromCurrency)    params.fromCurrencyName = fromCurrency;
            if (toCurrency)      params.toCurrencyName   = toCurrency;
            const res = await exchangeRatesApi.getAll(params);
            const data = res?.data ?? res ?? [];
            setRates(Array.isArray(data) ? data : []);
            if (res?.meta?.pagination) {
                const p = res.meta.pagination;
                setPagination({ current: p.currentPage, pageSize: p.limit, total: p.totalRecords });
            }
            setMetaCounts(extractMetaCounts(res?.meta));
        } catch { /* interceptor */ }
        finally { setLoading(false); }
    }, [filterAccType, filterStatus, filterCountry, filterFromCurrency, filterToCurrency]);

    const fetchCountryOpts = useCallback(async (q, page, append) => {
        if (cFetchRef.current) return;
        cFetchRef.current = true; setCountryFetching(true);
        try {
            const res  = await countriesApi.getAll({ ...(q ? { search: q } : {}), page, limit: PAGE_SIZE, sort: 'name:1' });
            const list = res.data || [];
            setCountryOpts(prev => append ? [...prev, ...list] : list);
            setCountryHasMore(res.meta?.pagination?.hasNextPage ?? false);
        } catch { /* interceptor */ }
        finally { cFetchRef.current = false; setCountryFetching(false); }
    }, []);

    useEffect(() => {
        fetchRates();
        fetchCountryOpts('', 1, false);
    }, []); // eslint-disable-line

    const handleRefresh = () => fetchRates(pagination.current, pagination.pageSize, filterAccType, filterStatus, filterCountry, filterFromCurrency, filterToCurrency);

    /* ── Country filter handlers ── */
    const handleCountrySearch = (q) => {
        cSearchRef.current = q; cPageRef.current = 1;
        if (cDebounce.current) clearTimeout(cDebounce.current);
        cDebounce.current = setTimeout(() => { setCountryOpts([]); setCountryHasMore(true); fetchCountryOpts(q, 1, false); }, 300);
    };
    const handleCountryFilter = (val) => {
        const v = val ?? '';
        setFilterCountry(v);
        fetchRates(1, pagination.pageSize, filterAccType, filterStatus, v, filterFromCurrency, filterToCurrency);
    };
    const countryFilterOpts = countryOpts.map(c => ({ value: c._id, label: `${c.flag ?? ''} ${c.name}`.trim() }));

    /* ── From / To Currency name text filter handlers (debounced) ── */
    const handleFromCurrFilter = (e) => {
        const v = e.target.value ?? '';
        setFilterFromCurrency(v);
        if (fcDebounce.current) clearTimeout(fcDebounce.current);
        fcDebounce.current = setTimeout(() => {
            fetchRates(1, pagination.pageSize, filterAccType, filterStatus, filterCountry, v, filterToCurrency);
        }, 350);
    };
    const handleToCurrFilter = (e) => {
        const v = e.target.value ?? '';
        setFilterToCurrency(v);
        if (tcDebounce.current) clearTimeout(tcDebounce.current);
        tcDebounce.current = setTimeout(() => {
            fetchRates(1, pagination.pageSize, filterAccType, filterStatus, filterCountry, filterFromCurrency, v);
        }, 350);
    };

    /* ── Displayed (server-side — no client filter) ── */
    const displayed = rates;

    /* ── Apply filters ── */
    const applyFilters = (accType, status) => {
        setFilterAccType(accType);
        setFilterStatus(status);
        fetchRates(1, pagination.pageSize, accType, status, filterCountry, filterFromCurrency, filterToCurrency);
    };

    const clearFilters = () => {
        setFilterAccType(''); setFilterStatus(''); setFilterCountry('');
        setFilterFromCurrency(''); setFilterToCurrency('');
        fetchRates(1, pagination.pageSize, '', '', '', '', '');
    };

    const hasFilters = filterAccType || filterStatus || filterCountry || filterFromCurrency || filterToCurrency;

    /* ── Submit (create / update) ── */
    const handleSubmit = async (payload) => {
        setSubmitLoading(true);
        try {
            if (editRecord) {
                await exchangeRatesApi.update(editRecord._id, payload);
                message.success('Exchange rate updated');
                if (drawerRecord?._id === editRecord._id) setDrawerRecord({ ...drawerRecord, ...payload });
            } else {
                await exchangeRatesApi.create(payload);
                message.success('Exchange rate created');
            }
            setModalOpen(false);
            setEditRecord(null);
            fetchRates(pagination.current, pagination.pageSize);
        } catch { /* interceptor */ }
        finally { setSubmitLoading(false); }
    };

    /* ── Toggle active ── */
    const handleToggle = async (record) => {
        setActionLoading('toggle');
        try {
            await exchangeRatesApi.update(record._id, { isActive: !record.isActive });
            message.success(`Exchange rate ${record.isActive ? 'disabled' : 'enabled'}`);
            if (drawerRecord?._id === record._id) setDrawerRecord({ ...drawerRecord, isActive: !record.isActive });
            fetchRates(pagination.current, pagination.pageSize);
        } catch { /* interceptor */ }
        finally { setActionLoading(''); }
    };

    /* ── Delete ── */
    const handleDelete = async (record) => {
        setActionLoading('delete');
        try {
            await exchangeRatesApi.remove(record._id);
            message.success('Exchange rate removed');
            if (drawerRecord?._id === record._id) setDrawerOpen(false);
            fetchRates(pagination.current, pagination.pageSize);
        } catch { /* interceptor */ }
        finally { setActionLoading(''); }
    };

    /* ── Drawer helpers ── */
    const openDrawer = (record) => { setDrawerRecord(record); setDrawerOpen(true); };

    /* ── Row action menu ── */
    const getRowMenu = (record) => ({
        onClick: ({ domEvent }) => domEvent.stopPropagation(),
        items: [
            {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'View Details',
                onClick: () => openDrawer(record),
            },
            {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => { setEditRecord(record); setModalOpen(true); },
            },
            {
                key: 'toggle',
                icon: record.isActive ? <StopOutlined style={{ color: '#f59e0b' }} /> : <CheckCircleOutlined style={{ color: '#10b981' }} />,
                label: <span style={{ color: record.isActive ? '#f59e0b' : '#10b981' }}>{record.isActive ? 'Disable' : 'Enable'}</span>,
                onClick: () => handleToggle(record),
            },
            { type: 'divider' },
            {
                key: 'delete',
                icon: <DeleteOutlined style={{ color: '#ef4444' }} />,
                label: <span style={{ color: '#ef4444' }}>Delete</span>,
                onClick: () => handleDelete(record),
            },
        ],
    });

    /* ── Columns ── */
    const columns = [
        {
            title: 'Pair',
            key: 'pair',
            render: (_, r) => (
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => openDrawer(r)}
                >
                    <Tag style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#6366f1', fontWeight: 700, fontSize: 13 }}>
                        {fromName(r) || '—'}
                    </Tag>
                    <SwapOutlined style={{ color: 'var(--text-muted)', fontSize: 12 }} />
                    <Tag style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 700, fontSize: 13 }}>
                        {toName(r) || '—'}
                    </Tag>
                </div>
            ),
        },
        {
            title: 'Rate',
            key: 'exchangeRate',
            render: (_, r) => (
                <span className="font-semibold tabular-nums text-sm" style={{ color: 'var(--text-primary)' }}>
                    {r.exchangeRate != null ? formatRate(r.exchangeRate) : '—'}
                </span>
            ),
        },
        {
            title: 'Account Type',
            dataIndex: 'accountType',
            key: 'accountType',
            render: (v) => v ? (
                <Tag style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#6366f1' }}>{v}</Tag>
            ) : <span style={{ color: 'var(--text-muted)' }}>—</span>,
            responsive: ['md'],
        },
        {
            title: 'Country',
            key: 'country',
            render: (_, r) => <span style={{ color: 'var(--text-secondary)' }}>{r.countryName ?? r.country?.name ?? '—'}</span>,
            responsive: ['lg'],
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, r) => (
                <Tag style={{
                    background: r.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
                    border:     `1px solid ${r.isActive ? 'rgba(16,185,129,0.3)' : 'rgba(107,114,128,0.2)'}`,
                    color:      r.isActive ? '#10b981' : '#6b7280',
                    fontWeight: 600,
                }}>
                    {r.isActive ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        {
            title: 'Updated',
            key: 'updatedAt',
            render: (_, r) => (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {r.updatedAt ? new Date(r.updatedAt).toLocaleString() : '—'}
                </span>
            ),
            responsive: ['lg'],
        },
        {
            title: '',
            key: 'actions',
            width: 48,
            render: (_, r) => (
                <Dropdown menu={getRowMenu(r)} trigger={['click']} placement="bottomRight">
                    <Button
                        type="text"
                        icon={<MoreOutlined />}
                        style={{ color: 'var(--text-secondary)' }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </Dropdown>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Exchange Rates
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Manage currency exchange rates used across the platform
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}
                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                        Refresh
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditRecord(null); setModalOpen(true); }}>
                        Add Rate
                    </Button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-4">
                {mapCardsFromMeta(CARD_CONFIG, metaCounts).map((card) => (
                    <StatCard key={card.key} {...card} />
                ))}
            </div>

            {/* Filter Bar */}
            <div className="rounded-xl p-4 flex flex-wrap gap-3 items-center"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
                <FilterOutlined style={{ color: 'var(--text-muted)' }} />
                {/* From Currency name text filter */}
                <Input
                    placeholder="From Currency…"
                    value={filterFromCurrency}
                    onChange={handleFromCurrFilter}
                    onClear={() => { setFilterFromCurrency(''); fetchRates(1, pagination.pageSize, filterAccType, filterStatus, filterCountry, '', filterToCurrency); }}
                    allowClear
                    style={{ width: 150, background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
                {/* To Currency name text filter */}
                <Input
                    placeholder="To Currency…"
                    value={filterToCurrency}
                    onChange={handleToCurrFilter}
                    onClear={() => { setFilterToCurrency(''); fetchRates(1, pagination.pageSize, filterAccType, filterStatus, filterCountry, filterFromCurrency, ''); }}
                    allowClear
                    style={{ width: 150, background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
                {/* Filter by country (infinite-scroll) */}
                <Select
                    showSearch
                    allowClear
                    placeholder="Filter by country…"
                    filterOption={false}
                    value={filterCountry || undefined}
                    options={countryFilterOpts}
                    onSearch={handleCountrySearch}
                    onChange={handleCountryFilter}
                    onPopupScroll={(e) => {
                        const { scrollTop, offsetHeight, scrollHeight } = e.target;
                        if (!cFetchRef.current && countryHasMore && scrollTop + offsetHeight >= scrollHeight - 20)
                            { cPageRef.current++; fetchCountryOpts(cSearchRef.current, cPageRef.current, true); }
                    }}
                    style={{ width: 190 }}
                    notFoundContent={
                        countryFetching
                            ? <div style={{ textAlign: 'center', padding: '8px 0' }}><Spin size="small" /></div>
                            : 'No countries'
                    }
                    dropdownRender={(menu) => (
                        <>
                            {menu}
                            {countryFetching && countryOpts.length > 0 && (
                                <div style={{ textAlign: 'center', padding: '6px 0' }}><Spin size="small" /></div>
                            )}
                        </>
                    )}
                    styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                />
                <Select
                    placeholder="Account Type"
                    allowClear
                    value={filterAccType || undefined}
                    onChange={(v) => applyFilters(v ?? '', filterStatus)}
                    options={[
                        { value: 'Business',   label: 'Business' },
                        { value: 'Individual', label: 'Individual' },
                        { value: 'Freelance',  label: 'Freelance' },
                    ]}
                    style={{ width: 145 }}
                    styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                />
                <Select
                    placeholder="Status"
                    allowClear
                    value={filterStatus || undefined}
                    onChange={(v) => applyFilters(filterAccType, v ?? '')}
                    options={[
                        { value: 'true',  label: 'Active' },
                        { value: 'false', label: 'Inactive' },
                    ]}
                    style={{ width: 120 }}
                    styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                />
                {hasFilters && (
                    <Button size="small" onClick={clearFilters} style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>
                        Clear
                    </Button>
                )}
                <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
                    {pagination.total} result{pagination.total !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Table */}
            <div className="rounded-xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
                <Table
                    dataSource={displayed}
                    columns={columns}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (t) => `${t} rates`,
                        size: isMobile ? 'small' : 'default',
                    }}
                    onChange={(p) => fetchRates(p.current, p.pageSize, filterAccType, filterStatus, filterCountry, filterFromCurrency, filterToCurrency)}
                    onRow={(r) => ({ onClick: () => openDrawer(r), style: { cursor: 'pointer' } })}
                    scroll={{ x: 400 }}
                    size={isMobile ? 'small' : 'middle'}
                    style={{ background: 'transparent' }}
                />
            </div>

            {/* Exchange Rate Form Modal */}
            <ExchangeRateFormModal
                open={modalOpen}
                record={editRecord}
                onCancel={() => { setModalOpen(false); setEditRecord(null); }}
                onSubmit={handleSubmit}
                loading={submitLoading}
            />

            {/* Detail Drawer */}
            <ExchangeRateDetailDrawer
                open={drawerOpen}
                record={drawerRecord}
                onClose={() => setDrawerOpen(false)}
                onEdit={(r) => { setDrawerOpen(false); setEditRecord(r); setModalOpen(true); }}
                onToggle={handleToggle}
                onDelete={handleDelete}
                actionLoading={actionLoading}
            />
        </div>
    );
};

export default ExchangeRateList;
