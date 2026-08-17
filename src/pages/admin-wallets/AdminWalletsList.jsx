import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Select, Tag, Dropdown, message } from 'antd';
import {
    ReloadOutlined, MoreOutlined, EyeOutlined, SyncOutlined,
    WalletOutlined, DollarOutlined, GlobalOutlined, BankOutlined,
} from '@ant-design/icons';
import { adminWalletsApi } from '../../api/modules/adminWallets';
import { useTheme } from '../../context/ThemeContext';
import { formatAmount, safeAdd } from '../../utils/number.utils';
import AdminWalletDetailDrawer from './AdminWalletDetailDrawer';

const DEFAULT_PAGE_SIZE = 20;

const TYPE_OPTIONS = [
    { value: '', label: 'All Types' },
    { value: 'admin', label: 'Admin' },
    { value: 'fee', label: 'Fee' },
    { value: 'USD', label: 'USD' },
];

const STATE_OPTIONS = [
    { value: '', label: 'All States' },
    { value: 'LIVE', label: 'Live' },
    { value: 'FROZEN', label: 'Frozen' },
];

const TYPE_TAG_COLORS = {
    admin: { bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.3)', color: '#6366f1' },
    fee:   { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b' },
    USD:   { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', color: '#10b981' },
};

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
                {value ?? '—'}
            </span>
        </div>
        <div style={{ height: 3, background: color, opacity: 0.65 }} />
    </div>
);

/* ─── MAIN PAGE ──────────────────────────────────────────────────────────── */
const AdminWalletsList = () => {
    useTheme();

    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const [wallets, setWallets]       = useState([]);
    const [loading, setLoading]       = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });

    const [filterType, setFilterType]           = useState('');
    const [filterBlockchain, setFilterBlockchain] = useState('');
    const [filterState, setFilterState]         = useState('');

    const [drawerOpen, setDrawerOpen]     = useState(false);
    const [drawerRecord, setDrawerRecord] = useState(null);
    const [syncingId, setSyncingId]       = useState(null);

    /* Balance summary */
    const [summary, setSummary] = useState(null);

    /* Blockchain options derived from summary */
    const blockchainOptions = [
        { value: '', label: 'All Blockchains' },
        ...(summary?.blockchainSummary
            ? [...new Map(summary.blockchainSummary.map(b => [b.blockchain, b])).values()]
                .map(b => ({ value: b.blockchain, label: b.blockchainName || b.blockchain }))
            : []),
    ];

    /* ── Fetch wallets ── */
    const fetchWallets = useCallback(async (page = 1, limit = DEFAULT_PAGE_SIZE, type = filterType, blockchain = filterBlockchain, state = filterState) => {
        setLoading(true);
        try {
            const params = { page, limit, sort: 'createdAt:-1' };
            if (type)       params.type       = type;
            if (blockchain) params.blockchain = blockchain;
            if (state)      params.state      = state;
            const res = await adminWalletsApi.getAll(params);
            const data = res?.data ?? res ?? [];
            setWallets(Array.isArray(data) ? data : []);
            if (res?.meta?.pagination) {
                const p = res.meta.pagination;
                setPagination({ current: p.currentPage, pageSize: p.limit, total: p.totalRecords });
            }
        } catch { /* interceptor */ }
        finally { setLoading(false); }
    }, [filterType, filterBlockchain, filterState]);

    /* ── Fetch balance summary ── */
    const fetchSummary = useCallback(async () => {
        try {
            const res = await adminWalletsApi.getBalanceSummary();
            const data = res?.data ?? res;
            if (data && typeof data === 'object') setSummary(data);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => { fetchWallets(); fetchSummary(); }, []); // eslint-disable-line

    const handleRefresh = () => {
        fetchWallets(pagination.current, pagination.pageSize);
        fetchSummary();
    };

    /* ── Sync Balance ── */
    const handleSyncBalance = async (record) => {
        setSyncingId(record._id);
        try {
            const res = await adminWalletsApi.syncBalance(record._id);
            const data = res?.data ?? res;
            if (data?.synced) {
                message.success('Balance synced successfully from Circle');
            } else {
                message.success('Sync request completed');
            }
            fetchWallets(pagination.current, pagination.pageSize, filterType, filterBlockchain, filterState);
            fetchSummary();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message;
            if (msg) message.error(msg);
        } finally {
            setSyncingId(null);
        }
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
            {
                key: 'sync',
                icon: <SyncOutlined style={{ color: '#6366f1' }} />,
                label: <span style={{ color: '#6366f1' }}>Sync Balance</span>,
                onClick: () => handleSyncBalance(record),
            },
        ],
    });

    /* ── Stats from summary ── */
    const totalBalance    = safeAdd(summary?.grandTotals?.totalAccountBalance, summary?.grandTotals?.totalAvailableBalance) || undefined;
    const activeWallets   = summary?.activeWalletCount;
    const totalTokenEntries = summary?.grandTotals?.totalTokenEntries;

    /* ── Columns ── */
    const columns = [
        {
            title: 'Wallet',
            key: 'wallet',
            render: (_, r) => (
                <div>
                    <div className="text-sm font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>
                        {typeof r.walletId === 'string' ? `${r.walletId.slice(0, 16)}…` : r.walletId ?? '—'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {r.blockchainName ?? r.blockchain ?? ''}
                    </div>
                </div>
            ),
        },
        {
            title: 'Type',
            key: 'type',
            width: 90,
            render: (_, r) => {
                const tc = TYPE_TAG_COLORS[r.type] || TYPE_TAG_COLORS.admin;
                return (
                    <Tag style={{ background: tc.bg, border: `1px solid ${tc.border}`, color: tc.color, fontWeight: 600, textTransform: 'uppercase' }}>
                        {r.type ?? '—'}
                    </Tag>
                );
            },
        },
        {
            title: 'Owner',
            key: 'owner',
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
            title: 'Blockchain',
            key: 'blockchain',
            render: (_, r) => (
                <Tag style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 600 }}>
                    {r.blockchainName ?? r.blockchain ?? '—'}
                </Tag>
            ),
            responsive: ['sm'],
        },
        {
            title: 'Total Balance',
            key: 'balance',
            render: (_, r) => {
                const total = safeAdd(r.accountBalance, r.availableBalance);
                return (
                    <span className="font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                        {(r.availableBalance != null || r.accountBalance != null)
                            ? formatAmount(total)
                            : '—'}
                    </span>
                );
            },
        },
        {
            title: 'State',
            key: 'state',
            width: 80,
            render: (_, r) => {
                const live = r.state === 'LIVE';
                return (
                    <Tag style={{
                        background: live ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
                        border: `1px solid ${live ? 'rgba(16,185,129,0.3)' : 'rgba(107,114,128,0.2)'}`,
                        color: live ? '#10b981' : '#6b7280',
                        fontWeight: 600,
                    }}>
                        {r.state ?? '—'}
                    </Tag>
                );
            },
            responsive: ['lg'],
        },
        {
            title: 'Address',
            key: 'address',
            render: (_, r) => (
                <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {r.address ? `${r.address.slice(0, 10)}…${r.address.slice(-6)}` : '—'}
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
                        loading={syncingId === r._id}
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
                        Admin Wallets
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Manage admin, fee, and USD wallets — view balances and sync from Circle
                    </p>
                </div>
                <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                    Refresh
                </Button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    label="Active Wallets"
                    value={activeWallets}
                    color="#6366f1"
                    icon={<WalletOutlined />}
                />
                <StatCard
                    label="Total Balance"
                    value={totalBalance != null ? formatAmount(totalBalance) : undefined}
                    color="#10b981"
                    icon={<DollarOutlined />}
                />
                <StatCard
                    label="Token Entries"
                    value={totalTokenEntries}
                    color="#f59e0b"
                    icon={<GlobalOutlined />}
                />
            </div>

            {/* Balance Summary by Blockchain */}
            {summary?.blockchainSummary?.length > 0 && (
                <div className="rounded-xl p-4"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                        Balance by Blockchain & Token
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {summary.blockchainSummary.map((item, i) => (
                            <div key={i} className="rounded-lg p-3 flex justify-between items-center"
                                style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid var(--border-color)' }}>
                                <div>
                                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                        {item.tokenSymbol}
                                    </p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                        {item.blockchainName || item.blockchain} · {item.walletCount} wallet{item.walletCount !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <p className="font-bold tabular-nums text-sm" style={{ color: '#10b981' }}>
                                    {formatAmount(safeAdd(item.totalAccountBalance, item.totalAvailableBalance))}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="rounded-xl p-4 flex flex-wrap gap-3 items-center"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
                <Select
                    value={filterType}
                    onChange={(v) => { setFilterType(v); fetchWallets(1, pagination.pageSize, v, filterBlockchain, filterState); }}
                    options={TYPE_OPTIONS}
                    style={{ width: 140 }}
                    styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                />
                <Select
                    value={filterBlockchain}
                    onChange={(v) => { setFilterBlockchain(v); fetchWallets(1, pagination.pageSize, filterType, v, filterState); }}
                    options={blockchainOptions}
                    style={{ width: 180 }}
                    styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                />
                <Select
                    value={filterState}
                    onChange={(v) => { setFilterState(v); fetchWallets(1, pagination.pageSize, filterType, filterBlockchain, v); }}
                    options={STATE_OPTIONS}
                    style={{ width: 140 }}
                    styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                />
            </div>

            {/* Table */}
            <div className="rounded-xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
                <Table
                    dataSource={wallets}
                    columns={columns}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (t) => `${t} wallets`,
                        size: isMobile ? 'small' : 'default',
                    }}
                    onChange={(p) => fetchWallets(p.current, p.pageSize, filterType, filterBlockchain, filterState)}
                    scroll={{ x: 700 }}
                    size={isMobile ? 'small' : 'middle'}
                    style={{ background: 'transparent' }}
                    onRow={(r) => ({
                        style: { cursor: 'pointer', background: 'transparent' },
                        onClick: () => { setDrawerRecord(r); setDrawerOpen(true); },
                    })}
                />
            </div>

            {/* Detail Drawer */}
            <AdminWalletDetailDrawer
                open={drawerOpen}
                record={drawerRecord}
                onClose={() => setDrawerOpen(false)}
                onSyncBalance={handleSyncBalance}
                syncing={drawerRecord && syncingId === drawerRecord._id}
            />
        </div>
    );
};

export default AdminWalletsList;
