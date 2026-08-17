import React, { useEffect, useState, useCallback } from 'react';
import {
    Table, Tag, Button, Input, Select, Space, Tooltip,
    Popconfirm, message, Badge, Dropdown, Modal,
} from 'antd';
import {
    PlusOutlined,
    ReloadOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    HeartOutlined,
    DollarOutlined,
    PoweroffOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    BankOutlined,
    MoreOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons';
import { accountProvidersApi } from '../../api/modules/accountProviders';
import { useTheme } from '../../context/ThemeContext';
import { DEFAULT_PAGE_SIZE, HEALTH_STATUS_CONFIG, CURRENCY_OPTIONS } from '../../constants/accountProviders';
import { extractMetaCounts } from '../../utils/extractMetaCounts';
import { mapCardsFromMeta } from '../../utils/mapCardsFromMeta';
import {
    HealthStatusTag,
    EnabledStatusTag,
    ProviderDetailDrawer,
    CreateEditProviderModal,
    UpdateHealthModal,
    ManageCurrenciesModal,
} from './components';

const { Search } = Input;

const CARD_CONFIG = [
    { label: 'Total Providers', key: 'totalProviders',    color: '#2563eb', icon: <BankOutlined /> },
    { label: 'Enabled',         key: 'enabled',  color: '#22c55e', icon: <CheckCircleOutlined /> },
    { label: 'Disabled',        key: 'disabled', color: '#94a3b8', icon: <CloseCircleOutlined /> },
    { label: 'Healthy',         key: 'healthy',  color: '#22c55e', icon: <CheckCircleOutlined /> },
    { label: 'Degraded',        key: 'degraded', color: '#f59e0b', icon: <HeartOutlined /> },
    { label: 'Down',            key: 'down',     color: '#ef4444', icon: <CloseCircleOutlined /> },
    { label: 'Unknown',         key: 'unknown',  color: '#6b7280', icon: <QuestionCircleOutlined /> },
];

/* ─── STAT CARD ──────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, color, icon }) => (
    <div
        className="rounded-2xl w-full flex flex-col overflow-hidden"
        style={{
            background: `linear-gradient(135deg, ${color}09 0%, var(--bg-card) 60%)`,
            border: `1px solid ${color}25`,
            boxShadow: 'var(--shadow-card)',
        }}
    >
        {/* Top row: label + icon */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <span
                className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                style={{ color: 'var(--text-muted)' }}
            >
                {label}
            </span>
            <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                style={{ background: `${color}18`, color }}
            >
                {icon}
            </div>
        </div>
        {/* Big number */}
        <div className="px-4 pb-4">
            <span
                className="font-extrabold tabular-nums leading-none"
                style={{ fontSize: '2rem', color: 'var(--text-primary)' }}
            >
                {value ?? 0}
            </span>
        </div>
        {/* Full-width color bar at the very bottom */}
        <div style={{ height: 3, background: color, opacity: 0.65 }} />
    </div>
);

/* ─── MAIN PAGE ──────────────────────────────────────────────────────────── */
const AccountProvidersList = () => {
    useTheme(); // ensures theme context is consumed for dark mode propagation via AntD ConfigProvider

    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    /* ── Data state ── */
    const [providers, setProviders]   = useState([]);
    const [loading, setLoading]       = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });
    const [metaCounts, setMetaCounts] = useState({});

    /* ── Filters ── */
    const [search, setSearch]               = useState('');
    const [filterEnabled, setFilterEnabled]  = useState('');
    const [filterHealth, setFilterHealth]    = useState('');
    const [filterCurrency, setFilterCurrency] = useState('');
    const [filterUsUsers, setFilterUsUsers]  = useState('');

    /* ── Modal / drawer state ── */
    const [drawerOpen, setDrawerOpen]         = useState(false);
    const [selectedId, setSelectedId]         = useState(null);
    const [createEditOpen, setCreateEditOpen] = useState(false);
    const [editTarget, setEditTarget]         = useState(null);
    const [healthOpen, setHealthOpen]         = useState(false);
    const [healthTarget, setHealthTarget]     = useState(null);
    const [currenciesOpen, setCurrenciesOpen] = useState(false);
    const [currenciesTarget, setCurrenciesTarget] = useState(null);

    /* ── Loading flags for actions ── */
    const [submitting, setSubmitting]   = useState(false);
    const [loadingAdd, setLoadingAdd]   = useState(false);
    const [togglingId, setTogglingId]   = useState(null);
    const [deletingId, setDeletingId]   = useState(null);

    /* ── Fetch list ──
     * Supported server-side query params: page, limit, search, isEnabled,
     * providerCode, currencyCode, usUsers, nonUsUsers.
     * healthStatus is NOT supported by the API — filtered client-side.
     */
    const fetchProviders = useCallback(async (page = 1, limit = DEFAULT_PAGE_SIZE, params = {}) => {
        setLoading(true);
        try {
            const q = { page, limit };
            if (params.search)       q.search       = params.search;
            if (params.isEnabled)    q.isEnabled    = params.isEnabled;
            if (params.currencyCode) q.currencyCode = params.currencyCode;
            if (params.usUsers)      q.usUsers      = params.usUsers;
            if (params.nonUsUsers)   q.nonUsUsers   = params.nonUsUsers;

            const res = await accountProvidersApi.getAll(q);
            const data = res?.data ?? res ?? [];
            setProviders(Array.isArray(data) ? data : []);
            if (res?.meta?.pagination) {
                setPagination({
                    current:  res.meta.pagination.currentPage,
                    pageSize: res.meta.pagination.limit,
                    total:    res.meta.pagination.totalRecords,
                });
            }
            setMetaCounts(extractMetaCounts(res?.meta));
        } catch {
            // Axios interceptor handles error toast
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProviders(1, DEFAULT_PAGE_SIZE, { search, isEnabled: filterEnabled, currencyCode: filterCurrency, usUsers: filterUsUsers });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const reload = () => {
        fetchProviders(pagination.current, pagination.pageSize, { search, isEnabled: filterEnabled, currencyCode: filterCurrency, usUsers: filterUsUsers });
    };

    const handleTableChange = (p) =>
        fetchProviders(p.current, p.pageSize, { search, isEnabled: filterEnabled, currencyCode: filterCurrency, usUsers: filterUsUsers });

    const applyFilters = (overrides = {}) => {
        const params = {
            search,
            isEnabled: filterEnabled,
            currencyCode: filterCurrency,
            usUsers: filterUsUsers,
            ...overrides,
        };
        // healthStatus is client-side only — strip it out before hitting the API
        const { healthStatus: _h, ...apiParams } = params;
        fetchProviders(1, pagination.pageSize, apiParams);
    };

    const clearAllFilters = () => {
        setSearch('');
        setFilterEnabled('');
        setFilterHealth('');
        setFilterCurrency('');
        setFilterUsUsers('');
        fetchProviders(1, pagination.pageSize, {});
    };

    const hasActiveFilters = search || filterEnabled || filterHealth || filterCurrency || filterUsUsers;

    /* ── Create / Edit ── */
    const handleCreateSubmit = async (payload) => {
        setSubmitting(true);
        try {
            await accountProvidersApi.create(payload);
            message.success('Provider created successfully');
            setCreateEditOpen(false);
            reload();
        } catch {
            // Handled by interceptor
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditSubmit = async (payload) => {
        setSubmitting(true);
        try {
            await accountProvidersApi.update(editTarget._id, payload);
            message.success('Provider updated successfully');
            setCreateEditOpen(false);
            setEditTarget(null);
            reload();
        } catch {
            // Handled by interceptor
        } finally {
            setSubmitting(false);
        }
    };

    const openEdit = (record) => {
        setEditTarget(record);
        setCreateEditOpen(true);
    };

    /* ── Toggle enable/disable ── */
    const handleToggle = async (record) => {
        setTogglingId(record._id);
        try {
            await accountProvidersApi.toggle(record._id);
            message.success(`Provider ${record.isEnabled ? 'disabled' : 'enabled'}`);
            reload();
        } catch {
            // Handled by interceptor
        } finally {
            setTogglingId(null);
        }
    };

    /* ── Health update ── */
    const handleHealthSubmit = async (healthStatus) => {
        setSubmitting(true);
        try {
            await accountProvidersApi.updateHealth(healthTarget._id, healthStatus);
            message.success('Health status updated');
            setHealthOpen(false);
            setHealthTarget(null);
            reload();
        } catch {
            // Handled by interceptor
        } finally {
            setSubmitting(false);
        }
    };

    /* ── Currencies ── */
    const handleAddCurrency = async (currencyCode, isEnabled) => {
        setLoadingAdd(true);
        try {
            await accountProvidersApi.addCurrency(currenciesTarget._id, currencyCode, isEnabled);
            message.success(`${currencyCode} added`);
            // Refresh modal data inline
            const refreshed = await accountProvidersApi.getById(currenciesTarget._id);
            setCurrenciesTarget(refreshed?.data ?? refreshed);
            reload();
        } catch {
            // Handled by interceptor
        } finally {
            setLoadingAdd(false);
        }
    };

    const handleRemoveCurrency = async (currencyCode) => {
        try {
            await accountProvidersApi.removeCurrency(currenciesTarget._id, currencyCode);
            message.success(`${currencyCode} removed`);
            const refreshed = await accountProvidersApi.getById(currenciesTarget._id);
            setCurrenciesTarget(refreshed?.data ?? refreshed);
            reload();
        } catch {
            // Handled by interceptor
        }
    };

    /* ── Soft delete ── */
    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            await accountProvidersApi.softDelete(id);
            message.success('Provider removed');
            reload();
        } catch {
            // Handled by interceptor
        } finally {
            setDeletingId(null);
        }
    };

    /* ── Table columns ── */
    const columns = [
        {
            title: 'Provider',
            key: 'provider',
            fixed: isMobile ? undefined : 'left',
            width: isMobile ? 160 : 220,
            render: (_, r) => (
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
                    >
                        {(r.providerName || 'P')[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                            {r.providerName}
                        </span>
                        <code
                            className="text-xs px-1.5 py-0.5 rounded self-start"
                            style={{ background: 'var(--border-color)', color: 'var(--text-muted)', fontFamily: 'monospace' }}
                        >
                            {r.providerCode}
                        </code>
                        {r.description && (
                            <span className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }} title={r.description}>
                                {r.description}
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'Currencies',
            key: 'currencies',
            width: 160,
            render: (_, r) => {
                const currencies = r.supportedCurrencies ?? [];
                if (!currencies.length) return <span style={{ color: 'var(--text-muted)' }} className="text-xs">—</span>;
                return (
                    <div className="flex flex-wrap gap-1">
                        {currencies.slice(0, 3).map((c) => (
                            <Tag
                                key={c.currencyCode}
                                color={c.isEnabled ? 'blue' : 'default'}
                                style={{ borderRadius: 12, fontSize: 11, padding: '0 6px', margin: 0 }}
                            >
                                {c.currencyCode}
                            </Tag>
                        ))}
                        {currencies.length > 3 && (
                            <Tag style={{ borderRadius: 12, fontSize: 11, padding: '0 6px', margin: 0 }}>
                                +{currencies.length - 3}
                            </Tag>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Eligibility',
            key: 'eligibility',
            width: 130,
            render: (_, r) => (
                <div className="flex flex-wrap gap-1">
                    {r.eligibility?.usUsers && (
                        <Tag color="geekblue" style={{ borderRadius: 12, fontSize: 11, margin: 0, lineHeight: '18px' }}>US</Tag>
                    )}
                    {r.eligibility?.nonUsUsers && (
                        <Tag color="purple" style={{ borderRadius: 12, fontSize: 11, margin: 0, lineHeight: '18px' }}>Non-US</Tag>
                    )}
                    {!r.eligibility?.usUsers && !r.eligibility?.nonUsUsers && (
                        <span style={{ color: 'var(--text-muted)' }} className="text-xs">—</span>
                    )}
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'isEnabled',
            key: 'isEnabled',
            width: 110,
            render: (v) => <EnabledStatusTag isEnabled={v} />,
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            width: 80,
            responsive: ['md'],
            render: (v) => (
                v != null
                    ? <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{v}</span>
                    : <span style={{ color: 'var(--text-muted)' }} className="text-xs">—</span>
            ),
        },
        {
            title: 'Health',
            key: 'healthStatus',
            width: 120,
            render: (_, r) => <HealthStatusTag status={r.metadata?.healthStatus} />,
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 110,
            responsive: ['md'],
            render: (v) => (
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {v ? new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—'}
                </span>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: isMobile ? 80 : 220,
            render: (_, r) =>
                isMobile ? (
                    <Dropdown
                        trigger={['click']}
                        menu={{
                            items: [
                                { key: 'view',       label: 'View Details',       icon: <EyeOutlined /> },
                                { key: 'edit',       label: 'Edit',               icon: <EditOutlined /> },
                                { key: 'currencies', label: 'Manage Currencies',  icon: <DollarOutlined /> },
                                { key: 'health',     label: 'Update Health',      icon: <HeartOutlined /> },
                                { type: 'divider' },
                                {
                                    key:    'toggle',
                                    label:  r.isEnabled ? 'Disable' : 'Enable',
                                    icon:   <PoweroffOutlined />,
                                    danger: r.isEnabled,
                                },
                                { key: 'delete', label: 'Delete', icon: <DeleteOutlined />, danger: true },
                            ],
                            onClick: ({ key }) => {
                                if (key === 'view') {
                                    setSelectedId(r._id); setDrawerOpen(true);
                                } else if (key === 'edit') {
                                    openEdit(r);
                                } else if (key === 'currencies') {
                                    setCurrenciesTarget(r); setCurrenciesOpen(true);
                                } else if (key === 'health') {
                                    setHealthTarget(r); setHealthOpen(true);
                                } else if (key === 'toggle') {
                                    Modal.confirm({
                                        title:         `${r.isEnabled ? 'Disable' : 'Enable'} this provider?`,
                                        onOk:          () => handleToggle(r),
                                        okButtonProps: { danger: r.isEnabled },
                                        okText:        'Yes',
                                        cancelText:    'No',
                                    });
                                } else if (key === 'delete') {
                                    Modal.confirm({
                                        title:         'Remove this provider?',
                                        content:       'This is a soft delete and can be restored.',
                                        onOk:          () => handleDelete(r._id),
                                        okButtonProps: { danger: true },
                                        okText:        'Delete',
                                    });
                                }
                            },
                        }}
                    >
                        <Button size="small" icon={<MoreOutlined />} />
                    </Dropdown>
                ) : (
                    <Space size={4}>
                        <Tooltip title="View Details">
                            <Button
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={() => { setSelectedId(r._id); setDrawerOpen(true); }}
                            />
                        </Tooltip>
                        <Tooltip title="Edit">
                            <Button
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => openEdit(r)}
                            />
                        </Tooltip>
                        <Tooltip title="Manage Currencies">
                            <Button
                                size="small"
                                icon={<DollarOutlined />}
                                onClick={() => { setCurrenciesTarget(r); setCurrenciesOpen(true); }}
                            />
                        </Tooltip>
                        <Tooltip title="Update Health">
                            <Button
                                size="small"
                                icon={<HeartOutlined />}
                                onClick={() => { setHealthTarget(r); setHealthOpen(true); }}
                            />
                        </Tooltip>
                        <Tooltip title={r.isEnabled ? 'Disable' : 'Enable'}>
                            <Popconfirm
                                title={`${r.isEnabled ? 'Disable' : 'Enable'} this provider?`}
                                onConfirm={() => handleToggle(r)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button
                                    size="small"
                                    icon={<PoweroffOutlined />}
                                    loading={togglingId === r._id}
                                    danger={r.isEnabled}
                                />
                            </Popconfirm>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <Popconfirm
                                title="Remove this provider?"
                                description="This is a soft delete and can be restored."
                                onConfirm={() => handleDelete(r._id)}
                                okText="Delete"
                                okButtonProps={{ danger: true }}
                            >
                                <Button
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    loading={deletingId === r._id}
                                />
                            </Popconfirm>
                        </Tooltip>
                    </Space>
                ),
        },
    ];

    /* ── Stats summary (meta-driven) ── */

    // Health filter is client-side only (not a supported API query param)
    const displayProviders = filterHealth
        ? providers.filter((p) => (p.metadata?.healthStatus ?? 'unknown') === filterHealth)
        : providers;

    return (
        <div className="space-y-6">
            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>
                        Account Providers
                    </h1>
                    <p className="text-sm mt-1 m-0" style={{ color: 'var(--text-muted)' }}>
                        Manage bank and payment service providers
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Tooltip title="Refresh">
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={reload}
                            loading={loading}
                            style={{ color: 'var(--text-secondary)' }}
                        />
                    </Tooltip>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => { setEditTarget(null); setCreateEditOpen(true); }}
                        size="middle"
                    >
                        {isMobile ? 'Add' : 'Create Provider'}
                    </Button>
                </div>
            </div>

            {/* ── Stats Cards ─────────────────────────────────────────────── */}
            {/* 2-col on mobile → 3-col on sm → 6-col on lg: all cards always fill their rows evenly */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {mapCardsFromMeta(CARD_CONFIG, metaCounts).map((card) => (
                    <StatCard key={card.key} {...card} />
                ))}
            </div>

            {/* ── Filters ─────────────────────────────────────────────────── */}
            <div
                className="rounded-xl p-4"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}
            >
                {/* All filters visible inline — search spans full width on mobile */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {/* Search: full width on all sizes */}
                    <div className="col-span-2 sm:col-span-4">
                        <Search
                            placeholder="Search by name or code…"
                            allowClear
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onSearch={(v) => { setSearch(v.trim()); applyFilters({ search: v.trim() }); }}
                            style={{ width: '100%' }}
                        />
                    </div>
                    {/* Status */}
                    <Select
                        placeholder="Status"
                        allowClear
                        value={filterEnabled || undefined}
                        onChange={(v) => { setFilterEnabled(v ?? ''); applyFilters({ isEnabled: v ?? '' }); }}
                        style={{ width: '100%' }}
                        options={[
                            { label: 'Enabled',  value: 'true' },
                            { label: 'Disabled', value: 'false' },
                        ]}
                    />
                    {/* Health */}
                    <Select
                        placeholder="Health"
                        allowClear
                        value={filterHealth || undefined}
                        onChange={(v) => { setFilterHealth(v ?? ''); }}
                        style={{ width: '100%' }}
                        options={[
                            { label: 'Healthy',  value: 'healthy' },
                            { label: 'Degraded', value: 'degraded' },
                            { label: 'Down',     value: 'down' },
                            { label: 'Unknown',  value: 'unknown' },
                        ]}
                    />
                    {/* Currency */}
                    <Select
                        placeholder="Currency"
                        allowClear
                        value={filterCurrency || undefined}
                        onChange={(v) => { setFilterCurrency(v ?? ''); applyFilters({ currencyCode: v ?? '' }); }}
                        style={{ width: '100%' }}
                        showSearch
                        filterOption={(input, opt) => opt.label.toLowerCase().includes(input.toLowerCase())}
                        options={CURRENCY_OPTIONS}
                    />
                    {/* User Type */}
                    <Select
                        placeholder="User Type"
                        allowClear
                        value={filterUsUsers || undefined}
                        onChange={(v) => {
                            setFilterUsUsers(v ?? '');
                            applyFilters({ usUsers: v === 'us' ? 'true' : '', nonUsUsers: v === 'non-us' ? 'true' : '' });
                        }}
                        style={{ width: '100%' }}
                        options={[
                            { label: 'US Users',     value: 'us' },
                            { label: 'Non-US Users', value: 'non-us' },
                        ]}
                    />
                </div>

                {/* Action row: only when filters are active or there is a count to show */}
                {(hasActiveFilters || (!loading && pagination.total > 0)) && (
                    <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                        {hasActiveFilters && (
                            <Button size="small" type="link" danger onClick={clearAllFilters} style={{ fontSize: 12, padding: '0 4px' }}>
                                Clear all
                            </Button>
                        )}
                        {!loading && pagination.total > 0 && (
                            <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
                                {pagination.total} provider{pagination.total !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* ── Table ───────────────────────────────────────────────────── */}
            <div
                className="rounded-xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}
            >
                <Table
                    dataSource={displayProviders}
                    columns={columns}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        current:    pagination.current,
                        pageSize:   pagination.pageSize,
                        total:      pagination.total,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                        showTotal: (total, range) => `${range[0]}–${range[1]} of ${total}`,
                        size: 'small',
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 900 }}
                    size="middle"
                    style={{ background: 'transparent' }}
                    onRow={(record) => ({
                        style: { cursor: 'pointer' },
                        onClick: (e) => {
                            // Only open drawer on row click if not clicking an action
                            if (e.target.closest('.ant-btn') || e.target.closest('.ant-popconfirm')) return;
                            setSelectedId(record._id);
                            setDrawerOpen(true);
                        },
                    })}
                    className="custom-minimal-table"
                />
            </div>

            {/* ── Modals & Drawer ─────────────────────────────────────────── */}
            <ProviderDetailDrawer
                open={drawerOpen}
                providerId={selectedId}
                onClose={() => { setDrawerOpen(false); setSelectedId(null); }}
                onEdit={(p) => { setDrawerOpen(false); openEdit(p); }}
            />

            <CreateEditProviderModal
                open={createEditOpen}
                initialValues={editTarget}
                onCancel={() => { setCreateEditOpen(false); setEditTarget(null); }}
                onSubmit={editTarget ? handleEditSubmit : handleCreateSubmit}
                loading={submitting}
            />

            <UpdateHealthModal
                open={healthOpen}
                provider={healthTarget}
                onCancel={() => { setHealthOpen(false); setHealthTarget(null); }}
                onSubmit={handleHealthSubmit}
                loading={submitting}
            />

            <ManageCurrenciesModal
                open={currenciesOpen}
                provider={currenciesTarget}
                onCancel={() => { setCurrenciesOpen(false); setCurrenciesTarget(null); }}
                onAdd={handleAddCurrency}
                onRemove={handleRemoveCurrency}
                loadingAdd={loadingAdd}
            />
        </div>
    );
};

export default AccountProvidersList;
