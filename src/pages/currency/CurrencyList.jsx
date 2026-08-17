import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Table, Button, Tag, Dropdown, Input, Select, message, Spin } from 'antd';
import {
    ReloadOutlined, MoreOutlined, EyeOutlined, PlusOutlined,
    EditOutlined, SwapOutlined, CheckCircleOutlined, StopOutlined,
    GlobalOutlined, SearchOutlined, DeleteOutlined,
} from '@ant-design/icons';
import { currencyApi } from '../../api/modules/currency';
import { countriesApi } from '../../api/modules/countries';

const COUNTRY_PAGE_SIZE = 50;
import { useTheme } from '../../context/ThemeContext';
import { formatInteger } from '../../utils/number.utils';
import { extractMetaCounts } from '../../utils/extractMetaCounts';
import { mapCardsFromMeta } from '../../utils/mapCardsFromMeta';
import CurrencyDetailDrawer       from './CurrencyDetailDrawer';
import CreateCurrencyModal        from './CreateCurrencyModal';
import UpdateCurrencyModal        from './UpdateCurrencyModal';
import BulkUpsertCurrencyModal    from './BulkUpsertCurrencyModal';

const DEFAULT_PAGE_SIZE = 20;

const CARD_CONFIG = [
    { label: 'Active', key: 'active', color: '#10b981', icon: <CheckCircleOutlined /> },
    { label: 'Fiat',   key: 'fiat',   color: '#6366f1', icon: <GlobalOutlined /> },
    { label: 'Crypto', key: 'crypto', color: '#f59e0b', icon: <SwapOutlined /> },
];

const StatCard = ({ label, value, color, icon }) => (
    <div className="rounded-2xl w-full flex flex-col overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color}09 0%, var(--bg-card) 60%)`, border: `1px solid ${color}25`, boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: `${color}18`, color }}>{icon}</div>
        </div>
        <div className="px-4 pb-4">
            <span className="font-extrabold tabular-nums leading-none" style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>{value ?? 0}</span>
        </div>
        <div style={{ height: 3, background: color, opacity: 0.65 }} />
    </div>
);

const CurrencyList = () => {
    useTheme();
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
    useEffect(() => {
        const h = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', h);
        return () => window.removeEventListener('resize', h);
    }, []);

    const [currencies, setCurrencies] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });
    const [metaCounts, setMetaCounts] = useState({});

    // Filter state (server-side)
    const [search, setSearch]               = useState('');
    const [filterType, setFilterType]       = useState('');
    const [filterAccType, setFilterAccType] = useState('');
    const [filterStatus, setFilterStatus]   = useState('');
    const [filterCountry, setFilterCountry] = useState(''); // ObjectId

    // Country dropdown state (infinite-scroll + search)
    const [countryOpts, setCountryOpts]           = useState([]);
    const [countryFetching, setCountryFetching]   = useState(false);
    const [countryHasMore, setCountryHasMore]     = useState(true);
    const countryPageRef     = useRef(1);
    const countrySearchRef   = useRef('');
    const countryFetchingRef = useRef(false);
    const countryDebounce    = useRef(null);

    // Debounce for currency name search
    const searchDebounce = useRef(null);

    const [drawerOpen, setDrawerOpen]       = useState(false);
    const [drawerRecord, setDrawerRecord]   = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    const [createOpen, setCreateOpen]       = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [updateOpen, setUpdateOpen]       = useState(false);
    const [updateTarget, setUpdateTarget]   = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [bulkOpen, setBulkOpen]           = useState(false);
    const [bulkLoading, setBulkLoading]     = useState(false);

    const fetchCurrencies = useCallback(async (
        page = 1, limit = DEFAULT_PAGE_SIZE,
        type = filterType, accountType = filterAccType, status = filterStatus,
        currencySearch = search, country = filterCountry,
    ) => {
        setLoading(true);
        try {
            const params = { page, limit };
            if (type)           params.type        = type;
            if (accountType)    params.accountType = accountType;
            if (status)         params.isActive    = status === 'active';
            if (currencySearch) params.search      = currencySearch;
            if (country)        params.country     = country;
            const res  = await currencyApi.getAll(params);
            const data = res?.data ?? res ?? [];
            setCurrencies(Array.isArray(data) ? data : []);
            if (res?.meta?.pagination) {
                const p = res.meta.pagination;
                setPagination({ current: p.currentPage, pageSize: p.limit, total: p.totalRecords });
            }
            setMetaCounts(extractMetaCounts(res?.meta));
        } catch { /* interceptor */ }
        finally { setLoading(false); }
    }, [filterType, filterAccType, filterStatus, search, filterCountry]);

    // Country dropdown fetch (paginated + searchable)
    const fetchCountryOpts = useCallback(async (q, page, append) => {
        if (countryFetchingRef.current) return;
        countryFetchingRef.current = true;
        setCountryFetching(true);
        try {
            const res = await countriesApi.getAll({
                ...(q ? { search: q } : {}),
                page,
                limit: COUNTRY_PAGE_SIZE,
                sort: 'name:1',
            });
            const list    = res.data || [];
            const hasNext = res.meta?.pagination?.hasNextPage ?? false;
            setCountryOpts(prev => append ? [...prev, ...list] : list);
            setCountryHasMore(hasNext);
        } catch { /* silent */ }
        finally { countryFetchingRef.current = false; setCountryFetching(false); }
    }, []);

    useEffect(() => {
        fetchCurrencies();
        // Boot country dropdown
        fetchCountryOpts('', 1, false);
    }, []); // eslint-disable-line

    const handleRefresh = () =>
        fetchCurrencies(pagination.current, pagination.pageSize, filterType, filterAccType, filterStatus, search, filterCountry);

    // Debounced currency name search → server
    const handleSearchChange = (value) => {
        setSearch(value);
        if (searchDebounce.current) clearTimeout(searchDebounce.current);
        searchDebounce.current = setTimeout(() => {
            fetchCurrencies(1, pagination.pageSize, filterType, filterAccType, filterStatus, value, filterCountry);
        }, 350);
    };

    // Country dropdown handlers
    const handleCountrySearch = (q) => {
        countrySearchRef.current = q;
        countryPageRef.current   = 1;
        if (countryDebounce.current) clearTimeout(countryDebounce.current);
        countryDebounce.current = setTimeout(() => {
            setCountryOpts([]);
            setCountryHasMore(true);
            fetchCountryOpts(q, 1, false);
        }, 300);
    };

    const handleCountryScroll = (e) => {
        const { scrollTop, offsetHeight, scrollHeight } = e.target;
        if (!countryFetchingRef.current && countryHasMore &&
            scrollTop + offsetHeight >= scrollHeight - 20) {
            const next = countryPageRef.current + 1;
            countryPageRef.current = next;
            fetchCountryOpts(countrySearchRef.current, next, true);
        }
    };

    const handleCountryFilter = (value) => {
        const v = value ?? '';
        setFilterCountry(v);
        fetchCurrencies(1, pagination.pageSize, filterType, filterAccType, filterStatus, search, v);
    };

    const countrySelectOpts = countryOpts.map((c) => ({
        value: c._id,
        label: `${c.flag ?? ''} ${c.name}`.trim(),
    }));

    const displayed = currencies;

    const handleCreate = async (values) => {
        setCreateLoading(true);
        try {
            await currencyApi.create(values);
            message.success('Currency created successfully');
            setCreateOpen(false);
            fetchCurrencies(1, pagination.pageSize, filterType, filterAccType, filterStatus);
        } catch { /* interceptor */ }
        finally { setCreateLoading(false); }
    };

    const handleBulkUpsert = async (values) => {
        setBulkLoading(true);
        try {
            const res = await currencyApi.bulkUpsert(values);
            const resultData = res?.data ?? res ?? {};
            fetchCurrencies(1, pagination.pageSize, filterType, filterAccType, filterStatus);
            return resultData;
        } catch { /* interceptor */ }
        finally { setBulkLoading(false); }
        return null;
    };

    const handleUpdate = async (values) => {
        setUpdateLoading(true);
        try {
            await currencyApi.update(updateTarget._id, values);
            message.success('Currency updated successfully');
            setUpdateOpen(false);
            if (drawerOpen && drawerRecord?._id === updateTarget._id)
                setDrawerRecord((prev) => ({ ...prev, ...values }));
            fetchCurrencies(pagination.current, pagination.pageSize, filterType, filterAccType, filterStatus);
        } catch { /* interceptor */ }
        finally { setUpdateLoading(false); }
    };

    const handleToggle = async (record) => {
        setActionLoading('toggle');
        try {
            await currencyApi.update(record._id, { isActive: !record.isActive });
            message.success(`Currency ${record.isActive ? 'disabled' : 'enabled'} successfully`);
            fetchCurrencies(pagination.current, pagination.pageSize, filterType, filterAccType, filterStatus);
        } catch { /* interceptor */ }
        finally { setActionLoading(null); }
    };

    const handleDelete = async (record) => {
        setActionLoading('delete');
        try {
            await currencyApi.delete(record._id);
            message.success('Currency deleted');
            setDrawerOpen(false);
            fetchCurrencies(pagination.current, pagination.pageSize, filterType, filterAccType, filterStatus);
        } catch { /* interceptor */ }
        finally { setActionLoading(null); }
    };

    const openDrawer       = (record) => { setDrawerRecord(record); setDrawerOpen(true); };
    const handleDrawerEdit = (record) => { setDrawerOpen(false); setUpdateTarget(record); setUpdateOpen(true); };

    const applyFilter = (key, value) => {
        const next = { type: filterType, accountType: filterAccType, status: filterStatus, [key]: value };
        if (key === 'type')        { setFilterType(value);    fetchCurrencies(1, pagination.pageSize, value, next.accountType, next.status, search, filterCountry); }
        if (key === 'accountType') { setFilterAccType(value); fetchCurrencies(1, pagination.pageSize, next.type, value, next.status, search, filterCountry); }
        if (key === 'status')      { setFilterStatus(value);  fetchCurrencies(1, pagination.pageSize, next.type, next.accountType, value, search, filterCountry); }
    };

    const clearFilters = () => {
        setSearch(''); setFilterType(''); setFilterAccType(''); setFilterStatus(''); setFilterCountry('');
        fetchCurrencies(1, pagination.pageSize, '', '', '', '', '');
    };
    const hasFilters = search || filterType || filterAccType || filterStatus || filterCountry;

    const getRowMenu = (record) => ({
        onClick: ({ domEvent }) => domEvent.stopPropagation(),
        items: [
            { key: 'view',   icon: <EyeOutlined />, label: 'View Details', onClick: () => openDrawer(record) },
            { key: 'edit',   icon: <EditOutlined />, label: 'Edit', onClick: () => { setUpdateTarget(record); setUpdateOpen(true); } },
            {
                key: 'toggle',
                icon: record.isActive ? <StopOutlined style={{ color: '#ef4444' }} /> : <CheckCircleOutlined style={{ color: '#10b981' }} />,
                label: record.isActive ? <span style={{ color: '#ef4444' }}>Disable</span> : <span style={{ color: '#10b981' }}>Enable</span>,
                onClick: () => handleToggle(record),
            },
            {
                key: 'delete',
                icon: <DeleteOutlined style={{ color: '#ef4444' }} />,
                label: <span style={{ color: '#ef4444' }}>Delete</span>,
                onClick: () => handleDelete(record),
            },
        ],
    });

    const columns = [
        {
            title: 'Currency', key: 'currency',
            render: (_, r) => (
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => openDrawer(r)}>
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}>
                        {r.name?.slice(0, 1) ?? '—'}
                    </span>
                    <div>
                        <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{r.name ?? '—'}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.country?.name ?? r.countryCode ?? ''}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Type', dataIndex: 'type', key: 'type', responsive: ['md'],
            render: (v) => {
                const colors = { Fiat: '#6366f1', Crypto: '#f59e0b' };
                const c = colors[v] ?? '#6b7280';
                return <Tag style={{ background: `${c}15`, border: `1px solid ${c}30`, color: c, fontWeight: 600 }}>{v ?? '—'}</Tag>;
            },
        },
        {
            title: 'Account Type', dataIndex: 'accountType', key: 'accountType', responsive: ['lg'],
            render: (v) => <span style={{ color: 'var(--text-secondary)' }}>{v ?? '—'}</span>,
        },
        {
            title: 'Limits', key: 'limits', responsive: ['xl'],
            render: (_, r) => (
                <div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Day: {r.perDayTransactionLimit != null ? formatInteger(r.perDayTransactionLimit) : '—'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Month: {r.perMonthTransactionLimit != null ? formatInteger(r.perMonthTransactionLimit) : '—'}
                    </div>
                </div>
            ),
        },
        {
            title: 'Status', key: 'isActive',
            render: (_, r) => (
                <Tag style={{
                    background: r.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
                    border: `1px solid ${r.isActive ? 'rgba(16,185,129,0.3)' : 'rgba(107,114,128,0.2)'}`,
                    color: r.isActive ? '#10b981' : '#6b7280', fontWeight: 600,
                }}>
                    {r.isActive ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        {
            title: '', key: 'actions', width: 48,
            render: (_, r) => (
                <Dropdown menu={getRowMenu(r)} trigger={['click']} placement="bottomRight">
                    <Button type="text" icon={<MoreOutlined />} style={{ color: 'var(--text-secondary)' }} onClick={(e) => e.stopPropagation()} />
                </Dropdown>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Currencies</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage supported fiat and crypto currencies</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}
                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Refresh</Button>
                    <Button onClick={() => setBulkOpen(true)}>Bulk Upsert</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>Add Currency</Button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {mapCardsFromMeta(CARD_CONFIG, metaCounts).map((card) => (
                    <StatCard key={card.key} {...card} />
                ))}
            </div>

            <div className="rounded-xl p-4 flex flex-wrap gap-3 items-center"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
                {/* Search by currency name */}
                <Input
                    prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
                    placeholder="Search by currency name…"
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onClear={() => handleSearchChange('')}
                    allowClear
                    style={{ width: 220, background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
                {/* Search by country */}
                <Select
                    showSearch
                    allowClear
                    placeholder="Filter by country…"
                    filterOption={false}
                    value={filterCountry || undefined}
                    options={countrySelectOpts}
                    onSearch={handleCountrySearch}
                    onChange={handleCountryFilter}
                    onPopupScroll={handleCountryScroll}
                    style={{ width: 200 }}
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
                <Select value={filterType || undefined} onChange={(v) => applyFilter('type', v ?? '')} placeholder="All Types" allowClear
                    options={[{ value: 'Fiat', label: 'Fiat' }, { value: 'Crypto', label: 'Crypto' }]}
                    style={{ width: 130 }} styles={{ popup: { root: { background: 'var(--bg-card)' } } }} />
                <Select value={filterAccType || undefined} onChange={(v) => applyFilter('accountType', v ?? '')} placeholder="All Account Types" allowClear
                    options={[{ value: 'Business', label: 'Business' }, { value: 'Individual', label: 'Individual' }, { value: 'Freelance', label: 'Freelance' }]}
                    style={{ width: 160 }} styles={{ popup: { root: { background: 'var(--bg-card)' } } }} />
                <Select value={filterStatus || undefined} onChange={(v) => applyFilter('status', v ?? '')} placeholder="All Statuses" allowClear
                    options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
                    style={{ width: 130 }} styles={{ popup: { root: { background: 'var(--bg-card)' } } }} />
                {hasFilters && <Button size="small" onClick={clearFilters} style={{ color: 'var(--text-muted)' }}>Clear Filters</Button>}
                <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>{pagination.total} currencies</span>
            </div>

            <div className="rounded-xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
                <Table
                    dataSource={displayed} columns={columns} rowKey="_id" loading={loading}
                    onRow={(r) => ({ onClick: () => openDrawer(r), style: { cursor: 'pointer' } })}
                    pagination={{
                        current: pagination.current, pageSize: pagination.pageSize, total: pagination.total,
                        showSizeChanger: true, showTotal: (t) => `${t} currencies`, size: isMobile ? 'small' : 'default',
                    }}
                    onChange={(p) => fetchCurrencies(p.current, p.pageSize, filterType, filterAccType, filterStatus, search, filterCountry)}
                    scroll={{ x: 500 }} size={isMobile ? 'small' : 'middle'} style={{ background: 'transparent' }}
                />
            </div>

            <CurrencyDetailDrawer open={drawerOpen} record={drawerRecord} onClose={() => setDrawerOpen(false)}
                onEdit={handleDrawerEdit}
                onToggle={(record) => { setDrawerOpen(false); handleToggle(record); }}
                onDelete={handleDelete} actionLoading={actionLoading} />
            <CreateCurrencyModal open={createOpen} onCancel={() => setCreateOpen(false)} onSubmit={handleCreate} loading={createLoading} />
            <UpdateCurrencyModal open={updateOpen} record={updateTarget}
                onCancel={() => { setUpdateOpen(false); setUpdateTarget(null); }}
                onSubmit={handleUpdate} loading={updateLoading} />
            <BulkUpsertCurrencyModal open={bulkOpen} onCancel={() => setBulkOpen(false)} onSubmit={handleBulkUpsert} loading={bulkLoading} />
        </div>
    );
};

export default CurrencyList;
