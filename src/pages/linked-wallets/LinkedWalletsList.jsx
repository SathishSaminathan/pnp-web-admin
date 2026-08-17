import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Table, Button, Select, Input, Tag, Dropdown, message } from 'antd';
import {
    ReloadOutlined, MoreOutlined, EyeOutlined, CheckOutlined, StopOutlined,
    LinkOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, SearchOutlined,
} from '@ant-design/icons';
import { linkedWalletsApi } from '../../api/modules/linkedWallets';
import { useTheme } from '../../context/ThemeContext';
import { extractMetaCounts } from '../../utils/extractMetaCounts';
import { mapCardsFromMeta } from '../../utils/mapCardsFromMeta';
import LinkedWalletDetailDrawer from './LinkedWalletDetailDrawer';

const DEFAULT_PAGE_SIZE = 20;

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'Under Verification', label: 'Under Verification' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
];

const ACTIVE_OPTIONS = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Disabled' },
];

const STATUS_CONFIG = {
    'Under Verification': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)' },
    'Approved':           { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)' },
    'Rejected':           { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)' },
};

const CARD_CONFIG = [
    { label: 'Active',   key: 'active',   color: '#10b981', icon: <CheckCircleOutlined /> },
    { label: 'Pending',  key: 'pending',  color: '#f59e0b', icon: <ClockCircleOutlined /> },
    { label: 'Approved', key: 'approved', color: '#6366f1', icon: <LinkOutlined /> },
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
const LinkedWalletsList = () => {
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

    const [filterStatus, setFilterStatus]   = useState('');
    const [filterActive, setFilterActive]   = useState('');
    const [filterEmail, setFilterEmail]     = useState('');
    const emailDebounce = useRef(null);

    const [drawerOpen, setDrawerOpen]     = useState(false);
    const [drawerRecord, setDrawerRecord] = useState(null);
    const [togglingId, setTogglingId]     = useState(null);

    const fetchWallets = useCallback(async (
        page = 1, limit = DEFAULT_PAGE_SIZE,
        status = filterStatus, isActive = filterActive, email = filterEmail,
    ) => {
        setLoading(true);
        try {
            const params = { page, limit };
            if (status)   params.status   = status;
            if (isActive !== '') params.isActive = isActive;
            if (email)    params.email    = email;
            const res = await linkedWalletsApi.getAll(params);
            const data = res?.data ?? res ?? [];
            setWallets(Array.isArray(data) ? data : []);
            if (res?.meta?.pagination) {
                const p = res.meta.pagination;
                setPagination({ current: p.currentPage, pageSize: p.limit, total: p.totalRecords });
            }
            setMetaCounts(extractMetaCounts(res?.meta));
        } catch { /* interceptor */ }
        finally { setLoading(false); }
    }, [filterStatus, filterActive, filterEmail]);

    useEffect(() => { fetchWallets(); }, []); // eslint-disable-line

    const handleRefresh = () => fetchWallets(pagination.current, pagination.pageSize);

    /* ── Toggle ── */
    const handleToggle = async (record, isActive) => {
        setTogglingId(record._id);
        try {
            await linkedWalletsApi.toggle(record._id, { isActive });
            message.success(`Wallet ${isActive ? 'enabled' : 'disabled'} successfully`);
            setDrawerOpen(false);
            fetchWallets(pagination.current, pagination.pageSize);
        } catch { /* interceptor */ }
        finally { setTogglingId(null); }
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
            record.isActive ? {
                key: 'disable',
                icon: <StopOutlined style={{ color: '#ef4444' }} />,
                label: <span style={{ color: '#ef4444' }}>Disable</span>,
                onClick: () => handleToggle(record, false),
            } : {
                key: 'enable',
                icon: <CheckOutlined style={{ color: '#10b981' }} />,
                label: <span style={{ color: '#10b981' }}>Enable</span>,
                onClick: () => handleToggle(record, true),
            },
        ],
    });

    /* ── Columns ── */
    const columns = [
        {
            title: 'Wallet Address',
            key: 'walletAddress',
            render: (_, r) => (
                <div>
                    <div className="text-xs font-mono" style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                        {r.walletAddress
                            ? `${r.walletAddress.slice(0, 12)}…${r.walletAddress.slice(-6)}`
                            : '—'}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{r.blockchainId?.name ?? r.blockchainName ?? ''}</div>
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
            title: 'Network',
            key: 'networkId',
            render: (_, r) => (
                <Tag style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b', fontWeight: 600 }}>
                    {r.blockchainId?.name ?? r.blockchainName ?? '—'}
                </Tag>
            ),
            responsive: ['lg'],
        },
        {
            title: 'Verification',
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
            title: 'Active',
            key: 'isActive',
            render: (_, r) => (
                <Tag style={{
                    background: r.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
                    border: `1px solid ${r.isActive ? 'rgba(16,185,129,0.3)' : 'rgba(107,114,128,0.2)'}`,
                    color: r.isActive ? '#10b981' : '#6b7280',
                    fontWeight: 600,
                }}>
                    {r.isActive ? 'Active' : 'Disabled'}
                </Tag>
            ),
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
                        loading={togglingId === r._id}
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
                        Linked Wallets
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Manage externally linked crypto wallets — enable or disable access
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
                            fetchWallets(1, pagination.pageSize, filterStatus, filterActive, v);
                        }, 350);
                    }}
                    onClear={() => { setFilterEmail(''); fetchWallets(1, pagination.pageSize, filterStatus, filterActive, ''); }}
                    style={{ width: 210, background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
                <Select
                    value={filterStatus}
                    onChange={(v) => { setFilterStatus(v); fetchWallets(1, pagination.pageSize, v, filterActive, filterEmail); }}
                    options={STATUS_OPTIONS}
                    style={{ width: 180 }}
                    styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                />
                <Select
                    value={filterActive}
                    onChange={(v) => { setFilterActive(v); fetchWallets(1, pagination.pageSize, filterStatus, v, filterEmail); }}
                    options={ACTIVE_OPTIONS}
                    style={{ width: 130 }}
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
                    onChange={(p) => fetchWallets(p.current, p.pageSize, filterStatus, filterActive, filterEmail)}
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
            <LinkedWalletDetailDrawer
                open={drawerOpen}
                record={drawerRecord}
                onClose={() => setDrawerOpen(false)}
                onToggle={handleToggle}
                toggling={drawerRecord && togglingId === drawerRecord._id}
            />
        </div>
    );
};

export default LinkedWalletsList;
