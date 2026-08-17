import React, { useEffect, useState, useCallback } from 'react';
import {
    Table, Button, Select, Switch, Space, Tooltip, Dropdown,
    Popconfirm, message, Tag,
} from 'antd';
import {
    PlusOutlined,
    ReloadOutlined,
    MoreOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    PercentageOutlined,
    GlobalOutlined,
    UserOutlined,
    DollarOutlined,
} from '@ant-design/icons';
import { mdrApi } from '../../api/modules/mdr';
import { useTheme } from '../../context/ThemeContext';
import {
    DEFAULT_PAGE_SIZE,
    SCOPE_OPTIONS,
    SCOPE_CONFIG,
    RATE_TYPE_CONFIG,
    WALLET_TYPE_OPTIONS,
} from '../../constants/mdr';
import { resolveMetaCounts } from '../../utils/resolveMetaCounts';
import CreateMdrModal from './CreateMdrModal';
import UpdateMdrModal from './UpdateMdrModal';
import MdrDetailDrawer from './MdrDetailDrawer';

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

/* ─── Stable default for MDR config counts ─── */
const MDR_COUNT_DEFAULTS = { active: 0, global: 0, merchantOverrides: 0 };

/* ─── MAIN PAGE ──────────────────────────────────────────────────────────── */
const MdrConfigList = () => {
    useTheme();

    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    /* ── Data state ── */
    const [configs, setConfigs]       = useState([]);
    const [loading, setLoading]       = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });
    const [mdrCounts, setMdrCounts]   = useState(MDR_COUNT_DEFAULTS);

    /* ── Filters ── */
    const [filterScope, setFilterScope]             = useState('');
    const [filterWalletType, setFilterWalletType]   = useState('');
    const [filterActiveOnly, setFilterActiveOnly]   = useState(true);

    /* ── Drawer ── */
    const [drawerOpen, setDrawerOpen]   = useState(false);
    const [drawerRecord, setDrawerRecord] = useState(null);

    /* ── Modals ── */
    const [createOpen, setCreateOpen]   = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    const [updateOpen, setUpdateOpen]   = useState(false);
    const [updateTarget, setUpdateTarget] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    const [deactivatingId, setDeactivatingId] = useState(null);

    /* ── Fetch ── */
    const fetchConfigs = useCallback(async (page = 1, limit = DEFAULT_PAGE_SIZE, scope = filterScope, walletType = filterWalletType, activeOnly = filterActiveOnly) => {
        setLoading(true);
        try {
            const params = { page, limit };
            if (scope)      params.scope      = scope;
            if (walletType) params.walletType  = walletType;
            if (activeOnly) params.activeOnly  = true;
            const res = await mdrApi.getAll(params);
            const data = res?.data ?? res ?? [];
            setConfigs(Array.isArray(data) ? data : []);
            setMdrCounts(resolveMetaCounts(res?.meta?.counts, MDR_COUNT_DEFAULTS));
            if (res?.meta?.pagination) {
                const p = res.meta.pagination;
                setPagination({ current: p.currentPage, pageSize: p.limit, total: p.totalRecords });
            }
        } catch {
            // axios interceptor handles error toast
        } finally {
            setLoading(false);
        }
    }, [filterScope, filterActiveOnly]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchConfigs(); }, []);

    const handleRefresh = () => fetchConfigs(pagination.current, pagination.pageSize, filterScope, filterWalletType, filterActiveOnly);

    /* ── Create ── */
    const handleCreateSubmit = async (payload) => {
        setCreateLoading(true);
        try {
            await mdrApi.create(payload);
            message.success('MDR config created successfully');
            setCreateOpen(false);
            fetchConfigs(1, pagination.pageSize, filterScope, filterWalletType, filterActiveOnly);
        } catch {
            // handled by interceptor
        } finally {
            setCreateLoading(false);
        }
    };

    /* ── Update ── */
    const handleUpdateSubmit = async (payload) => {
        setUpdateLoading(true);
        try {
            await mdrApi.update(updateTarget._id, payload);
            message.success('MDR config updated successfully');
            setUpdateOpen(false);
            fetchConfigs(pagination.current, pagination.pageSize, filterScope, filterWalletType, filterActiveOnly);
        } catch {
            // handled by interceptor
        } finally {
            setUpdateLoading(false);
        }
    };

    /* ── Deactivate ── */
    const handleDeactivate = async (record) => {
        setDeactivatingId(record._id);
        try {
            await mdrApi.deactivate(record._id);
            message.success('MDR config deactivated');
            fetchConfigs(pagination.current, pagination.pageSize, filterScope, filterWalletType, filterActiveOnly);
        } catch {
            // handled by interceptor
        } finally {
            setDeactivatingId(null);
        }
    };

    /* ── Drawer action handler ── */
    const handleDrawerEdit = (record) => {
        setDrawerOpen(false);
        setUpdateTarget(record);
        setUpdateOpen(true);
    };
    const handleDrawerDeactivate = (record) => {
        setDrawerOpen(false);
        handleDeactivate(record);
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
            ...(record.isActive ? [
                {
                    key: 'edit',
                    icon: <EditOutlined />,
                    label: 'Update Config',
                    onClick: () => { setUpdateTarget(record); setUpdateOpen(true); },
                },
                {
                    key: 'deactivate',
                    icon: <DeleteOutlined style={{ color: '#ef4444' }} />,
                    label: <span style={{ color: '#ef4444' }}>Deactivate</span>,
                    onClick: () => handleDeactivate(record),
                },
            ] : []),
        ],
    });

    /* ── Columns ── */
    const columns = [
        {
            title: 'Scope',
            dataIndex: 'scope',
            key: 'scope',
            render: (v) => {
                const cfg = SCOPE_CONFIG[v] ?? {};
                return (
                    <Tag style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, fontWeight: 600 }}>
                        {v ?? '—'}
                    </Tag>
                );
            },
        },
        {
            title: 'Wallet / Chain',
            key: 'walletChain',
            render: (_, r) => (
                <div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.walletType}</span>
                    <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{r.blockchain ?? 'All'}</span>
                </div>
            ),
            responsive: ['md'],
        },
        {
            title: 'Rate Type',
            dataIndex: 'rateType',
            key: 'rateType',
            render: (v) => {
                const cfg = RATE_TYPE_CONFIG[v] ?? {};
                return (
                    <Tag style={{ background: `${cfg.color}10`, border: `1px solid ${cfg.color}30`, color: cfg.color, fontWeight: 600 }}>
                        {cfg.label ?? v}
                    </Tag>
                );
            },
        },
        {
            title: 'Rate',
            key: 'rate',
            render: (_, r) => {
                if (r.rateType === 'Percentage') return <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{r.mdrRate}%</span>;
                if (r.rateType === 'Flat')       return <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>${r.flatFee}</span>;
                if (r.rateType === 'Tiered')     return <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.tieredRates?.length ?? 0} bands</span>;
                return '—';
            },
        },
        {
            title: 'Effective',
            key: 'effective',
            render: (_, r) => (
                <div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        From: {r.effectiveFrom ? new Date(r.effectiveFrom).toLocaleDateString() : '—'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        To: {r.effectiveTo ? new Date(r.effectiveTo).toLocaleDateString() : '∞'}
                    </div>
                </div>
            ),
            responsive: ['lg'],
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (v) => (
                v
                    ? <Tag style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 600 }}>Active</Tag>
                    : <Tag style={{ background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.2)', color: '#6b7280', fontWeight: 600 }}>Inactive</Tag>
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
                        loading={deactivatingId === r._id}
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
                        MDR Configuration
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Manage Merchant Discount Rate configs — global defaults and per-merchant overrides
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading} style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                        Refresh
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
                        New Config
                    </Button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard label="Active Configs"     value={mdrCounts.active}             color="#10b981" icon={<PercentageOutlined />} />
                <StatCard label="Global Configs"     value={mdrCounts.global}             color="#6366f1" icon={<GlobalOutlined />} />
                <StatCard label="Merchant Overrides" value={mdrCounts.merchantOverrides}  color="#f59e0b" icon={<UserOutlined />} />
            </div>

            {/* Filters */}
            <div className="rounded-xl p-4 flex flex-wrap gap-3 items-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
                <Select
                    value={filterScope}
                    onChange={(v) => { setFilterScope(v); fetchConfigs(1, pagination.pageSize, v, filterWalletType, filterActiveOnly); }}
                    options={SCOPE_OPTIONS}
                    style={{ width: 160 }}
                    styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                />
                <Select
                    value={filterWalletType}
                    onChange={(v) => { setFilterWalletType(v); fetchConfigs(1, pagination.pageSize, filterScope, v, filterActiveOnly); }}
                    options={WALLET_TYPE_OPTIONS}
                    style={{ width: 140 }}
                    styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                />
                <div className="flex items-center gap-2">
                    <Switch
                        checked={filterActiveOnly}
                        onChange={(v) => { setFilterActiveOnly(v); fetchConfigs(1, pagination.pageSize, filterScope, filterWalletType, v); }}
                        size="small"
                    />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active only</span>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
                <Table
                    dataSource={configs}
                    columns={columns}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (t) => `${t} configs`,
                        size: isMobile ? 'small' : 'default',
                    }}
                    onChange={(p) => fetchConfigs(p.current, p.pageSize, filterScope, filterWalletType, filterActiveOnly)}
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
            <MdrDetailDrawer
                open={drawerOpen}
                record={drawerRecord}
                onClose={() => setDrawerOpen(false)}
                onEdit={handleDrawerEdit}
                onDeactivate={handleDrawerDeactivate}
            />

            {/* Modals */}
            <CreateMdrModal
                open={createOpen}
                onCancel={() => setCreateOpen(false)}
                onSubmit={handleCreateSubmit}
                loading={createLoading}
            />
            <UpdateMdrModal
                open={updateOpen}
                record={updateTarget}
                onCancel={() => setUpdateOpen(false)}
                onSubmit={handleUpdateSubmit}
                loading={updateLoading}
            />
        </div>
    );
};

export default MdrConfigList;
