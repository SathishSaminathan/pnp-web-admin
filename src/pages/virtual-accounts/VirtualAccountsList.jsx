import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Table, Button, Select, Tag, Dropdown, Input, Tabs, message, Modal, InputNumber, Form } from 'antd';
import { useSearchParams } from 'react-router-dom';
import {
    ReloadOutlined,
    MoreOutlined,
    EyeOutlined,
    LockOutlined,
    UnlockOutlined,
    StopOutlined,
    BankOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    CloseCircleOutlined,
    SearchOutlined,
    PlusCircleOutlined,
} from '@ant-design/icons';
import { virtualAccountsApi } from '../../api/modules/virtualAccounts';
import { useTheme } from '../../context/ThemeContext';
import { formatAmount, safeAdd, sanitizeNumber } from '../../utils/number.utils';
import { extractMetaCounts } from '../../utils/extractMetaCounts';
import { mapCardsFromMeta } from '../../utils/mapCardsFromMeta';
import VirtualAccountDetailDrawer from './VirtualAccountDetailDrawer';

const DEFAULT_PAGE_SIZE = 20;
const IS_DEV = import.meta.env.VITE_APP_ENV === 'development';

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'frozen', label: 'Frozen' },
    { value: 'closed', label: 'Closed' },
];

const ACCOUNT_TYPE_OPTIONS = [
    { value: '',                  label: 'All Types' },
    { value: 'checking',          label: 'Checking' },
    { value: 'savings',           label: 'Savings' },
    { value: 'business_checking', label: 'Business Checking' },
    { value: 'business_savings',  label: 'Business Savings' },
];

const CURRENCY_TABS = [
    { label: 'All Currencies', value: 'all' },
    { label: '$ USD',          value: 'USD' },
    { label: '€ EUR',          value: 'EUR' },
];

const STATUS_CONFIG = {
    active:  { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  label: 'Active' },
    frozen:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  label: 'Frozen' },
    closed:  { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.2)', label: 'Closed' },
};

const CARD_CONFIG = [
    { label: 'Active', key: 'active', color: '#10b981', icon: <CheckCircleOutlined /> },
    { label: 'Frozen', key: 'frozen', color: '#f59e0b', icon: <WarningOutlined /> },
    { label: 'Closed', key: 'closed', color: '#6b7280', icon: <CloseCircleOutlined /> },
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

/* ─── MAIN PAGE ──────────────────────────────────────────────────────────── */
const VirtualAccountsList = () => {
    useTheme();

    const [searchParams, setSearchParams] = useSearchParams();
    const rawTab = searchParams.get('currency');
    const activeCurrency = CURRENCY_TABS.find((t) => t.value === rawTab) ? rawTab : 'all';

    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const [accounts, setAccounts]     = useState([]);
    const [loading, setLoading]       = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });
    const [metaCounts, setMetaCounts] = useState({});

    const [filterStatus, setFilterStatus]           = useState('');
    const [filterAccountType, setFilterAccountType] = useState('');
    const [filterCurrency, setFilterCurrency]       = useState(() => (rawTab && rawTab !== 'all' ? rawTab : ''));
    const [filterEmail, setFilterEmail]             = useState('');
    const emailDebounce = useRef(null);

    const [drawerOpen, setDrawerOpen]     = useState(false);
    const [drawerRecord, setDrawerRecord] = useState(null);
    const [actionLoading, setActionLoading] = useState(null); // 'freeze' | 'unfreeze' | 'close'

    const [addFundsModal, setAddFundsModal] = useState({ open: false, record: null });
    const [addFundsLoading, setAddFundsLoading] = useState(false);
    const [addFundsForm] = Form.useForm();

    const fetchAccounts = useCallback(async (
        page = 1, limit = DEFAULT_PAGE_SIZE,
        status = filterStatus, accountType = filterAccountType, currency = filterCurrency,
        email = filterEmail,
    ) => {
        setLoading(true);
        try {
            const params = { page, limit };
            if (status)      params.status      = status;
            if (accountType) params.accountType = accountType;
            if (currency)    params.currency    = currency;
            if (email)       params.email       = email;
            const res = await virtualAccountsApi.getAll(params);
            const data = res?.data ?? res ?? [];
            setAccounts(Array.isArray(data) ? data : []);
            if (res?.meta?.pagination) {
                const p = res.meta.pagination;
                setPagination({ current: p.currentPage, pageSize: p.limit, total: p.totalRecords });
            }
            setMetaCounts(extractMetaCounts(res?.meta));
        } catch { /* interceptor handles */ }
        finally { setLoading(false); }
    }, [filterStatus, filterAccountType, filterCurrency, filterEmail]);

    useEffect(() => { fetchAccounts(); }, []); // eslint-disable-line

    /* ── Tab change ── */
    const handleTabChange = (key) => {
        const next = new URLSearchParams(searchParams);
        if (key === 'all') next.delete('currency');
        else next.set('currency', key);
        setSearchParams(next);
        const currencyParam = key === 'all' ? '' : key;
        setFilterCurrency(currencyParam);
        fetchAccounts(1, pagination.pageSize, filterStatus, filterAccountType, currencyParam, filterEmail);
    };

    const handleRefresh = () => fetchAccounts(pagination.current, pagination.pageSize);

    /* ── Actions ── */
    const handleFreeze = async (record) => {
        setActionLoading('freeze');
        try {
            await virtualAccountsApi.freeze(record._id, {});
            message.success('Account frozen successfully');
            setDrawerOpen(false);
            fetchAccounts(pagination.current, pagination.pageSize);
        } catch { /* interceptor */ }
        finally { setActionLoading(null); }
    };

    const handleUnfreeze = async (record) => {
        setActionLoading('unfreeze');
        try {
            await virtualAccountsApi.unfreeze(record._id, {});
            message.success('Account unfrozen successfully');
            setDrawerOpen(false);
            fetchAccounts(pagination.current, pagination.pageSize);
        } catch { /* interceptor */ }
        finally { setActionLoading(null); }
    };

    const handleClose = async (record) => {
        setActionLoading('close');
        try {
            await virtualAccountsApi.close(record._id, {});
            message.success('Account closed successfully');
            setDrawerOpen(false);
            fetchAccounts(pagination.current, pagination.pageSize);
        } catch { /* interceptor */ }
        finally { setActionLoading(null); }
    };

    const handleAddFunds = async (values) => {
        setAddFundsLoading(true);
        const amount = sanitizeNumber(values.amount);
        const targetId = addFundsModal.record._id;
        try {
            await virtualAccountsApi.simulateFiatDeposit({
                accountId: targetId,
                amount,
                note: values.note || 'Manual sandbox top-up',
            });
            setAccounts((prev) =>
                prev.map((a) =>
                    a._id === targetId
                        ? { ...a, availableBalance: String(safeAdd(a.availableBalance, amount)) }
                        : a
                )
            );
            if (drawerRecord?._id === targetId) {
                setDrawerRecord((prev) => ({
                    ...prev,
                    availableBalance: String(safeAdd(prev.availableBalance, amount)),
                }));
            }
            message.success(`${amount} ${addFundsModal.record.currency ?? ''} added to account`);
            setAddFundsModal({ open: false, record: null });
            addFundsForm.resetFields();
        } catch { /* interceptor handles error notification */ }
        finally { setAddFundsLoading(false); }
    };

    /* ── Row action menu ── */
    const getRowMenu = (record) => {
        const status = record.status?.toLowerCase() ?? 'active';
        return {
            onClick: ({ domEvent }) => domEvent.stopPropagation(),
            items: [
                {
                    key: 'view',
                    icon: <EyeOutlined />,
                    label: 'View Details',
                    onClick: () => { setDrawerRecord(record); setDrawerOpen(true); },
                },
                ...(IS_DEV ? [
                    {
                        key: 'addFunds',
                        icon: <PlusCircleOutlined style={{ color: '#6366f1' }} />,
                        label: <span style={{ color: '#6366f1' }}>Add Funds <span style={{ fontSize: 10, opacity: 0.7 }}>(dev)</span></span>,
                        onClick: () => { setAddFundsModal({ open: true, record }); },
                    },
                ] : []),
                ...(status !== 'closed' ? [
                    status === 'active' ? {
                        key: 'freeze',
                        icon: <LockOutlined style={{ color: '#f59e0b' }} />,
                        label: <span style={{ color: '#f59e0b' }}>Freeze Account</span>,
                        onClick: () => handleFreeze(record),
                    } : {
                        key: 'unfreeze',
                        icon: <UnlockOutlined style={{ color: '#10b981' }} />,
                        label: <span style={{ color: '#10b981' }}>Unfreeze Account</span>,
                        onClick: () => handleUnfreeze(record),
                    },
                    {
                        key: 'close',
                        icon: <StopOutlined style={{ color: '#ef4444' }} />,
                        label: <span style={{ color: '#ef4444' }}>Close Account</span>,
                        onClick: () => handleClose(record),
                    },
                ] : []),
            ],
        };
    };

    /* ── Columns ── */
    const columns = [
        {
            title: 'Account Number / IBAN',
            key: 'accountNumber',
            width: 220,
            render: (_, r) => {
                const isEur = r.currency?.toUpperCase() === 'EUR';
                const primary = isEur ? (r.iban ?? '—') : (r.accountNumber ?? '—');
                const secondary = isEur ? (r.bic ?? '') : (r.routingNumber ?? '');
                return (
                    <div>
                        <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {primary}
                        </div>
                        {secondary && (
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {secondary}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Merchant',
            key: 'merchant',
            width: 200,
            render: (_, r) => {
                const user = r.userId;
                const name = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') : null;
                return (
                    <div>
                        <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {name || '—'}
                        </div>
                        <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.emailId ?? ''}</div>
                    </div>
                );
            },
            responsive: ['md'],
        },
        {
            title: 'Currency',
            dataIndex: 'currency',
            key: 'currency',
            width: 100,
            render: (v) => (
                <Tag style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#6366f1', fontWeight: 600 }}>
                    {v ?? '—'}
                </Tag>
            ),
        },
        {
            title: 'Balance',
            key: 'balance',
            width: 130,
            render: (_, r) => {
                const total = safeAdd(r.availableBalance, r.accountBalance);
                return (
                    <span className="font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                        {(r.availableBalance != null || r.accountBalance != null)
                            ? formatAmount(total)
                            : '—'}
                    </span>
                );
            },
            responsive: ['lg'],
        },
        {
            title: 'Provider',
            key: 'provider',
            width: 120,
            render: (_, r) => (
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {r.serviceProvider?.providerName ?? '—'}
                </span>
            ),
            responsive: ['lg'],
        },
        {
            title: 'Status',
            key: 'status',
            width: 110,
            render: (_, r) => {
                const cfg = STATUS_CONFIG[r.status?.toLowerCase()] ?? STATUS_CONFIG.active;
                return (
                    <Tag style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, fontWeight: 600 }}>
                        {cfg.label}
                    </Tag>
                );
            },
        },
        {
            title: '',
            key: 'actions',
            width: 48,
            fixed: isMobile ? undefined : 'right',
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
                        Virtual Accounts
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Manage merchant virtual bank accounts — freeze, unfreeze, and close accounts
                    </p>
                </div>
                <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                    Refresh
                </Button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-4">
                {mapCardsFromMeta(CARD_CONFIG, metaCounts).map((card) => (
                    <StatCard key={card.key} {...card} />
                ))}
            </div>

            {/* Currency Tabs */}
            <Tabs
                activeKey={activeCurrency}
                onChange={handleTabChange}
                items={CURRENCY_TABS.map((t) => ({ key: t.value, label: t.label }))}
                style={{ marginBottom: -8 }}
            />

            {/* Filters */}
            <div className="rounded-xl p-4 flex flex-wrap gap-3 items-center"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
                <Input
                    prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
                    placeholder="Filter by email…"
                    value={filterEmail}
                    allowClear
                    onChange={(e) => {
                        const v = e.target.value;
                        setFilterEmail(v);
                        if (emailDebounce.current) clearTimeout(emailDebounce.current);
                        emailDebounce.current = setTimeout(() => {
                            fetchAccounts(1, pagination.pageSize, filterStatus, filterAccountType, filterCurrency, v);
                        }, 350);
                    }}
                    onClear={() => { setFilterEmail(''); fetchAccounts(1, pagination.pageSize, filterStatus, filterAccountType, filterCurrency, ''); }}
                    style={{ width: 210, background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
                <Select
                    value={filterStatus}
                    onChange={(v) => { const val = v ?? ''; setFilterStatus(val); fetchAccounts(1, pagination.pageSize, val, filterAccountType, filterCurrency, filterEmail); }}
                    options={STATUS_OPTIONS}
                    allowClear
                    style={{ width: 160 }}
                    styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                />
                <Select
                    value={filterAccountType}
                    onChange={(v) => { const val = v ?? ''; setFilterAccountType(val); fetchAccounts(1, pagination.pageSize, filterStatus, val, filterCurrency, filterEmail); }}
                    options={ACCOUNT_TYPE_OPTIONS}
                    allowClear
                    style={{ width: 140 }}
                    styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                />
            </div>

            {/* Table */}
            <div className="rounded-xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
                <Table
                    dataSource={accounts}
                    columns={columns}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (t) => `${t} accounts`,
                        size: isMobile ? 'small' : 'default',
                    }}
                    onChange={(p) => fetchAccounts(p.current, p.pageSize, filterStatus, filterAccountType, filterCurrency, filterEmail)}
                    scroll={{ x: 930 }}
                    size={isMobile ? 'small' : 'middle'}
                    style={{ background: 'transparent' }}
                    onRow={(r) => ({
                        style: { cursor: 'pointer', background: 'transparent' },
                        onClick: () => { setDrawerRecord(r); setDrawerOpen(true); },
                    })}
                />
            </div>

            {/* Detail Drawer */}
            <VirtualAccountDetailDrawer
                open={drawerOpen}
                record={drawerRecord}
                onClose={() => setDrawerOpen(false)}
                onFreeze={handleFreeze}
                onUnfreeze={handleUnfreeze}
                onCloseAccount={handleClose}
                actionLoading={actionLoading}
                onAddFunds={IS_DEV ? (record) => setAddFundsModal({ open: true, record }) : undefined}
            />

            {/* Add Funds Modal (dev only) */}
            {IS_DEV && (
                <Modal
                    open={addFundsModal.open}
                    title={
                        <div className="flex items-center gap-2">
                            <PlusCircleOutlined style={{ color: '#6366f1' }} />
                            <span>Add Funds</span>
                            <span style={{ fontSize: 11, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 4, padding: '1px 6px' }}>DEV ONLY</span>
                        </div>
                    }
                    onCancel={() => { setAddFundsModal({ open: false, record: null }); addFundsForm.resetFields(); }}
                    onOk={() => addFundsForm.submit()}
                    okText="Add Funds"
                    okButtonProps={{ loading: addFundsLoading, style: { background: '#6366f1', borderColor: '#6366f1' } }}
                    destroyOnClose
                >
                    {addFundsModal.record && (
                        <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                            Account: <strong style={{ color: 'var(--text-primary)' }}>
                                {addFundsModal.record.currency === 'EUR'
                                    ? (addFundsModal.record.iban ?? addFundsModal.record._id)
                                    : (addFundsModal.record.accountNumber ?? addFundsModal.record._id)}
                            </strong>
                        </p>
                    )}
                    <Form form={addFundsForm} layout="vertical" onFinish={handleAddFunds}>
                        <Form.Item
                            name="amount"
                            label="Amount"
                            rules={[{ required: true, message: 'Please enter an amount' }, { type: 'number', min: 0.01, message: 'Amount must be greater than 0' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0.01}
                                step={0.01}
                                precision={2}
                                placeholder="0.00"
                                addonBefore={addFundsModal.record?.currency ?? '$'}
                            />
                        </Form.Item>
                        <Form.Item name="note" label="Note" initialValue="Manual sandbox top-up for QA">
                            <Input placeholder="Optional note" />
                        </Form.Item>
                    </Form>
                </Modal>
            )}
        </div>
    );
};

export default VirtualAccountsList;
