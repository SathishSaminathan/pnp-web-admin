import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Table, Button, Select, Input, Tag, Dropdown, Switch, message } from 'antd';
import {
    ReloadOutlined, MoreOutlined, EyeOutlined, CheckOutlined, StopOutlined,
    TeamOutlined, UserOutlined, ShopOutlined, GlobalOutlined, SearchOutlined,
} from '@ant-design/icons';
import { beneficiariesApi } from '../../api/modules/beneficiaries';
import { useTheme } from '../../context/ThemeContext';
import { extractMetaCounts } from '../../utils/extractMetaCounts';
import { mapCardsFromMeta } from '../../utils/mapCardsFromMeta';
import BeneficiaryDetailDrawer from './BeneficiaryDetailDrawer';

const DEFAULT_PAGE_SIZE = 20;

const TYPE_OPTIONS = [
    { value: '', label: 'All Types' },
    { value: 'Individual', label: 'Individual' },
    { value: 'Business', label: 'Business' },
];

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Disabled' },
];

const CARD_CONFIG = [
    { label: 'Active',      key: 'active',     color: '#10b981', icon: <TeamOutlined /> },
    { label: 'Individuals', key: 'individuals', color: '#6366f1', icon: <UserOutlined /> },
    { label: 'Businesses',  key: 'businesses',   color: '#f59e0b', icon: <ShopOutlined /> },
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
const BeneficiariesList = () => {
    useTheme();

    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const [beneficiaries, setBeneficiaries] = useState([]);
    const [loading, setLoading]             = useState(true);
    const [pagination, setPagination]       = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });
    const [metaCounts, setMetaCounts]       = useState({});

    const [filterType, setFilterType]     = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterEmail, setFilterEmail]   = useState('');
    const emailDebounce = useRef(null);

    const [drawerOpen, setDrawerOpen]     = useState(false);
    const [drawerRecord, setDrawerRecord] = useState(null);
    const [togglingId, setTogglingId]     = useState(null);

    const fetchBeneficiaries = useCallback(async (
        page = 1, limit = DEFAULT_PAGE_SIZE,
        beneficiaryType = filterType, isActive = filterStatus, email = filterEmail,
    ) => {
        setLoading(true);
        try {
            const params = { page, limit };
            if (beneficiaryType) params.beneficiaryType = beneficiaryType;
            if (isActive !== '')  params.isActive       = isActive;
            if (email)            params.email          = email;
            const res = await beneficiariesApi.getAll(params);
            const data = res?.data ?? res ?? [];
            setBeneficiaries(Array.isArray(data) ? data : []);
            if (res?.meta?.pagination) {
                const p = res.meta.pagination;
                setPagination({ current: p.currentPage, pageSize: p.limit, total: p.totalRecords });
            }
            setMetaCounts(extractMetaCounts(res?.meta));
        } catch { /* interceptor */ }
        finally { setLoading(false); }
    }, [filterType, filterStatus, filterEmail]);

    useEffect(() => { fetchBeneficiaries(); }, []); // eslint-disable-line

    const handleRefresh = () => fetchBeneficiaries(pagination.current, pagination.pageSize);

    /* ── Toggle ── */
    const handleToggle = async (record, isActive) => {
        setTogglingId(record._id);
        try {
            await beneficiariesApi.toggle(record._id, { isActive });
            message.success(`Beneficiary ${isActive ? 'enabled' : 'disabled'} successfully`);
            setDrawerOpen(false);
            fetchBeneficiaries(pagination.current, pagination.pageSize);
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
            title: 'Beneficiary',
            key: 'name',
            render: (_, r) => (
                <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {r.beneficiaryName ?? '—'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.beneficiaryEmail ?? ''}</div>
                </div>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'beneficiaryType',
            key: 'beneficiaryType',
            render: (v) => (
                <Tag style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#6366f1', fontWeight: 600 }}>
                    {v ?? '—'}
                </Tag>
            ),
        },
        {
            title: 'Contact',
            key: 'contact',
            render: (_, r) => (
                <div>
                    <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{r.beneficiaryMobile ?? '—'}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.country ?? ''}</div>
                </div>
            ),
            responsive: ['md'],
        },
        {
            title: 'Country',
            dataIndex: 'country',
            key: 'country',
            render: (v) => <span style={{ color: 'var(--text-secondary)' }}>{v ?? '—'}</span>,
            responsive: ['lg'],
        },
        {
            title: 'Merchant',
            key: 'merchant',
            render: (_, r) => {
                const user = r.userId;
                const name = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') : null;
                return (
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {name || '—'}
                    </span>
                );
            },
            responsive: ['lg'],
        },
        {
            title: 'Status',
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
                        Beneficiaries
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Manage merchant beneficiary accounts — individuals and businesses
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
                            fetchBeneficiaries(1, pagination.pageSize, filterType, filterStatus, v);
                        }, 350);
                    }}
                    onClear={() => { setFilterEmail(''); fetchBeneficiaries(1, pagination.pageSize, filterType, filterStatus, ''); }}
                    style={{ width: 210, background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
                <Select
                    value={filterType}
                    onChange={(v) => { setFilterType(v); fetchBeneficiaries(1, pagination.pageSize, v, filterStatus, filterEmail); }}
                    options={TYPE_OPTIONS}
                    style={{ width: 160 }}
                    styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                />
                <Select
                    value={filterStatus}
                    onChange={(v) => { setFilterStatus(v); fetchBeneficiaries(1, pagination.pageSize, filterType, v, filterEmail); }}
                    options={STATUS_OPTIONS}
                    style={{ width: 140 }}
                    styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                />
            </div>

            {/* Table */}
            <div className="rounded-xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
                <Table
                    dataSource={beneficiaries}
                    columns={columns}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (t) => `${t} beneficiaries`,
                        size: isMobile ? 'small' : 'default',
                    }}
                    onChange={(p) => fetchBeneficiaries(p.current, p.pageSize, filterType, filterStatus, filterEmail)}
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
            <BeneficiaryDetailDrawer
                open={drawerOpen}
                record={drawerRecord}
                onClose={() => setDrawerOpen(false)}
                onToggle={handleToggle}
                toggling={drawerRecord && togglingId === drawerRecord._id}
            />
        </div>
    );
};

export default BeneficiariesList;
