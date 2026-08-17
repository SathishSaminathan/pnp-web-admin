import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Table, Button, Select, Input, Tag, Dropdown, message } from 'antd';
import {
    ReloadOutlined, MoreOutlined, EyeOutlined, CheckOutlined,
    BankOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, SearchOutlined,
} from '@ant-design/icons';
import { linkedBankAccountsApi } from '../../api/modules/linkedBankAccounts';
import { useTheme } from '../../context/ThemeContext';
import { formatAmount } from '../../utils/number.utils';
import { extractMetaCounts } from '../../utils/extractMetaCounts';
import { mapCardsFromMeta } from '../../utils/mapCardsFromMeta';
import LinkedBankDetailDrawer from './LinkedBankDetailDrawer';

const DEFAULT_PAGE_SIZE = 20;

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'Under Verification', label: 'Under Verification' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
];

const CURRENCY_OPTIONS = [
    { value: '', label: 'All Currencies' },
    { value: 'CAD', label: 'CAD' },
    { value: 'INR', label: 'INR' },
    { value: 'USD', label: 'USD' },
];

const STATUS_CONFIG = {
    'Under Verification': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)' },
    'Approved':           { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)' },
    'Rejected':           { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)' },
};

const CARD_CONFIG = [
    { label: 'Pending',  key: 'pending',  color: '#f59e0b', icon: <ClockCircleOutlined /> },
    { label: 'Approved', key: 'approved', color: '#10b981', icon: <CheckCircleOutlined /> },
    { label: 'Rejected', key: 'rejected', color: '#ef4444', icon: <CloseCircleOutlined /> },
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
const LinkedBankAccountsList = () => {
    useTheme();

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

    const [filterStatus, setFilterStatus]   = useState('');
    const [filterCurrency, setFilterCurrency] = useState('');
    const [filterEmail, setFilterEmail]       = useState('');
    const emailDebounce = useRef(null);

    const [drawerOpen, setDrawerOpen]     = useState(false);
    const [drawerRecord, setDrawerRecord] = useState(null);
    const [approvingId, setApprovingId]   = useState(null);

    const fetchAccounts = useCallback(async (
        page = 1, limit = DEFAULT_PAGE_SIZE,
        status = filterStatus, currency = filterCurrency, email = filterEmail,
    ) => {
        setLoading(true);
        try {
            const params = { page, limit };
            if (status)   params.status   = status;
            if (currency) params.currency = currency;
            if (email)    params.email    = email;
            const res = await linkedBankAccountsApi.getAll(params);
            const data = res?.data ?? res ?? [];
            setAccounts(Array.isArray(data) ? data : []);
            if (res?.meta?.pagination) {
                const p = res.meta.pagination;
                setPagination({ current: p.currentPage, pageSize: p.limit, total: p.totalRecords });
            }
            setMetaCounts(extractMetaCounts(res?.meta));
        } catch { /* interceptor */ }
        finally { setLoading(false); }
    }, [filterStatus, filterCurrency, filterEmail]);

    useEffect(() => { fetchAccounts(); }, []); // eslint-disable-line

    const handleRefresh = () => fetchAccounts(pagination.current, pagination.pageSize);

    /* ── Approve ── */
    const handleApprove = async (record) => {
        setApprovingId(record._id);
        try {
            await linkedBankAccountsApi.approve(record._id, {});
            message.success('Bank account approved successfully');
            setDrawerOpen(false);
            fetchAccounts(pagination.current, pagination.pageSize);
        } catch { /* interceptor */ }
        finally { setApprovingId(null); }
    };

    /* ── Row action menu ── */
    const getRowMenu = (record) => ({
        onClick: ({ domEvent }) => domEvent.stopPropagation(),
        items: [
            {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'View Details',
                onClick: () => { setDrawerRecord(record); setDrawerOpen(true); },
            },
            ...(record.status === 'Under Verification' ? [{
                key: 'approve',
                icon: <CheckOutlined style={{ color: '#10b981' }} />,
                label: <span style={{ color: '#10b981' }}>Approve</span>,
                onClick: () => handleApprove(record),
            }] : []),
        ],
    });

    /* ── Columns ── */
    const columns = [
        {
            title: 'Reference ID',
            key: 'institution',
            render: (_, r) => (
                <div>
                    <div className="text-sm font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>
                        {r.referenceId ?? '—'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {r.currency ?? ''}
                    </div>
                </div>
            ),
        },
        {
            title: 'Merchant',
            key: 'merchant',
            render: (_, r) => {
                const user = r.userId;
                const name = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') : null;
                return (
                    <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {name || '—'}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.emailId ?? ''}</div>
                    </div>
                );
            },
            responsive: ['md'],
        },
        {
            title: 'Balance',
            key: 'balance',
            render: (_, r) => (
                <span className="font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                    {r.accountBalance != null ? `${r.currency ?? ''} ${formatAmount(r.accountBalance)}` : '—'}
                </span>
            ),
            responsive: ['lg'],
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, r) => {
                const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG['Under Verification'];
                return (
                    <Tag style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, fontWeight: 600 }}>
                        {r.status ?? '—'}
                    </Tag>
                );
            },
        },
        {
            title: 'Created',
            key: 'createdAt',
            render: (_, r) => (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
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
                        loading={approvingId === r._id}
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
                        Linked Bank Accounts
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Review and approve externally linked Flinks bank accounts
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
                            fetchAccounts(1, pagination.pageSize, filterStatus, filterCurrency, v);
                        }, 350);
                    }}
                    onClear={() => { setFilterEmail(''); fetchAccounts(1, pagination.pageSize, filterStatus, filterCurrency, ''); }}
                    style={{ width: 210, background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
                <Select
                    value={filterStatus}
                    onChange={(v) => { setFilterStatus(v); fetchAccounts(1, pagination.pageSize, v, filterCurrency, filterEmail); }}
                    options={STATUS_OPTIONS}
                    style={{ width: 180 }}
                    styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                />
                <Select
                    value={filterCurrency}
                    onChange={(v) => { setFilterCurrency(v); fetchAccounts(1, pagination.pageSize, filterStatus, v, filterEmail); }}
                    options={CURRENCY_OPTIONS}
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
                    onChange={(p) => fetchAccounts(p.current, p.pageSize, filterStatus, filterCurrency, filterEmail)}
                    scroll={{ x: 600 }}
                    size={isMobile ? 'small' : 'middle'}
                    style={{ background: 'transparent' }}
                    onRow={(r) => ({
                        style: { cursor: 'pointer', background: 'transparent' },
                        onClick: () => { setDrawerRecord(r); setDrawerOpen(true); },
                    })}
                />
            </div>

            {/* Detail Drawer */}
            <LinkedBankDetailDrawer
                open={drawerOpen}
                record={drawerRecord}
                onClose={() => setDrawerOpen(false)}
                onApprove={handleApprove}
                approving={drawerRecord && approvingId === drawerRecord._id}
            />
        </div>
    );
};

export default LinkedBankAccountsList;
