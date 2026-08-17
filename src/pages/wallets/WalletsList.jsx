import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Table, Button, Select, Tag, Dropdown, Input, message } from 'antd';
import {
    ReloadOutlined, MoreOutlined, EyeOutlined, SyncOutlined,
    WalletOutlined, CheckCircleOutlined, DollarOutlined, GlobalOutlined, SearchOutlined,
} from '@ant-design/icons';
import { walletsApi } from '../../api/modules/wallets';
import { useTheme } from '../../context/ThemeContext';
import { formatAmount, safeAdd } from '../../utils/number.utils';
import { extractMetaCounts } from '../../utils/extractMetaCounts';
import { mapCardsFromMeta } from '../../utils/mapCardsFromMeta';
import WalletDetailDrawer from './WalletDetailDrawer';

const DEFAULT_PAGE_SIZE = 20;

const CURRENCY_OPTIONS = [
    { value: '', label: 'All Currencies' },
    { value: 'USDC', label: 'USDC' },
    { value: 'EURC', label: 'EURC' },
];

const CARD_CONFIG = [
    { label: 'Total Wallets',   key: 'totalWallets',   color: '#6366f1', icon: <WalletOutlined /> },
    { label: 'Default Wallets', key: 'inactiveWallets', color: '#10b981', icon: <CheckCircleOutlined /> },
    { label: 'Active Wallets',  key: 'activeWallets',  color: '#f59e0b', icon: <GlobalOutlined /> },
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
const WalletsList = () => {
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
    const [metaCounts, setMetaCounts] = useState({});

    const [filterCurrency, setFilterCurrency] = useState('');
    const [filterEmail, setFilterEmail]       = useState('');
    const emailDebounce = useRef(null);

    const [drawerOpen, setDrawerOpen]     = useState(false);
    const [drawerRecord, setDrawerRecord] = useState(null);
    const [syncingId, setSyncingId]       = useState(null);

    const fetchWallets = useCallback(async (page = 1, limit = DEFAULT_PAGE_SIZE, currency = filterCurrency, email = filterEmail) => {
        setLoading(true);
        try {
            const params = { page, limit };
            if (currency) params.currency = currency;
            if (email)    params.email    = email;
            const res = await walletsApi.getAll(params);
            const data = res?.data ?? res ?? [];
            setWallets(Array.isArray(data) ? data : []);
            if (res?.meta?.pagination) {
                const p = res.meta.pagination;
                setPagination({ current: p.currentPage, pageSize: p.limit, total: p.totalRecords });
            }
            setMetaCounts(extractMetaCounts(res?.meta));
        } catch { /* interceptor */ }
        finally { setLoading(false); }
    }, [filterCurrency, filterEmail]);

    useEffect(() => { fetchWallets(); }, []); // eslint-disable-line

    const handleRefresh = () => fetchWallets(pagination.current, pagination.pageSize);

    /* ── Sync Balance ── */
    const handleSyncBalance = async (record) => {
        setSyncingId(record._id);
        try {
            await walletsApi.syncBalance(record._id);
            message.success('Balance synced successfully');
            fetchWallets(pagination.current, pagination.pageSize, filterCurrency, filterEmail);
        } catch { /* interceptor */ }
        finally { setSyncingId(null); }
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

    /* ── Columns ── */
    const columns = [
        {
            title: 'Wallet',
            key: 'wallet',
            render: (_, r) => (
                <div>
                    <div className="text-sm font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>
                        {typeof r.walletId === 'string' ? `${r.walletId.slice(0, 12)}…` : r.walletId ?? '—'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {r.blockchainName ?? r.blockchain ?? ''}
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
            title: 'Blockchain',
            key: 'blockchain',
            render: (_, r) => (
                <Tag style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 600 }}>
                    {r.blockchainName ?? r.blockchain ?? '—'}
                </Tag>
            ),
        },
        {
            title: 'Balance',
            key: 'balance',
            render: (_, r) => {
                const total = safeAdd(r.availableBalance, r.accountBalance);
                return (
                    <span className="font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                        {(r.availableBalance != null || r.accountBalance != null)
                            ? formatAmount(total, { maxDecimals: 6 })
                            : '—'}
                    </span>
                );
            },
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
            title: 'Last Synced',
            key: 'lastSynced',
            render: (_, r) => (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {r.lastSyncedAt ? new Date(r.lastSyncedAt).toLocaleDateString() : '—'}
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
                        Wallets
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        USDC/EURC Circle wallets for merchants — view details and sync balances
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
                            fetchWallets(1, pagination.pageSize, filterCurrency, v);
                        }, 350);
                    }}
                    onClear={() => { setFilterEmail(''); fetchWallets(1, pagination.pageSize, filterCurrency, ''); }}
                    style={{ width: 210, background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
                <Select
                    value={filterCurrency}
                    onChange={(v) => { setFilterCurrency(v); fetchWallets(1, pagination.pageSize, v, filterEmail); }}
                    options={CURRENCY_OPTIONS}
                    style={{ width: 160 }}
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
                    onChange={(p) => fetchWallets(p.current, p.pageSize, filterCurrency, filterEmail)}
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
            <WalletDetailDrawer
                open={drawerOpen}
                record={drawerRecord}
                onClose={() => setDrawerOpen(false)}
                onSyncBalance={handleSyncBalance}
                syncing={drawerRecord && syncingId === drawerRecord._id}
            />
        </div>
    );
};

export default WalletsList;
