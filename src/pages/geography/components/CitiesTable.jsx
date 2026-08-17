import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Table, Button, Input, Select, Tooltip, Dropdown, Drawer, Divider, Modal, message,
} from 'antd';
import {
    EyeOutlined,
    ReloadOutlined,
    MoreOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    UndoOutlined,
} from '@ant-design/icons';
import { useTheme } from '../../../context/ThemeContext';
import {
    fetchCities,
    selectCitiesList,
    selectCitiesMeta,
    selectCitiesLoading,
} from '../../../store/slices/citiesSlice';
import { countriesApi } from '../../../api/modules/countries';
import { statesApi } from '../../../api/modules/states';
import { citiesApi } from '../../../api/modules/cities';
import ActiveStatusTag from './ActiveStatusTag';
import CityFormModal from './CityFormModal';

const { Option } = Select;
const DEFAULT_PAGE_SIZE = 20;

/* ── Tiny info row ── */
const InfoRow = ({ label, value }) => (
    <div
        className="flex justify-between items-start gap-4 py-2.5"
        style={{ borderBottom: '1px solid var(--border-color)' }}
    >
        <span
            className="text-xs font-semibold uppercase tracking-wide shrink-0"
            style={{ color: 'var(--text-muted)', minWidth: 120 }}
        >
            {label}
        </span>
        <span
            className="text-sm text-right font-medium break-all"
            style={{ color: 'var(--text-primary)' }}
        >
            {value ?? '—'}
        </span>
    </div>
);

/* ══════════════════════════════════════════════════════════════════════════ */
const CitiesTable = () => {
    const dispatch   = useDispatch();
    const { isDark } = useTheme();

    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const list    = useSelector(selectCitiesList);
    const meta    = useSelector(selectCitiesMeta);
    const loading = useSelector(selectCitiesLoading);

    const [pagination,      setPagination]      = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });
    const [search,          setSearch]          = useState('');
    const [filterActive,    setFilterActive]    = useState('');
    const [filterCountryId, setFilterCountryId] = useState('');
    const [filterStateId,   setFilterStateId]   = useState('');
    const [drawerOpen,      setDrawerOpen]      = useState(false);
    const [selectedRecord,  setSelectedRecord]  = useState(null);

    /* ── CRUD state ── */
    const [formOpen,      setFormOpen]      = useState(false);
    const [formRecord,    setFormRecord]    = useState(null);
    const [formLoading,   setFormLoading]   = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    /* ── Country options ── */
    const [countryOptions, setCountryOptions] = useState([]);
    const [countryLoading, setCountryLoading] = useState(false);
    const countryDebounce = useRef(null);

    const searchCountries = useCallback((q) => {
        setCountryLoading(true);
        countriesApi.getAll({ ...(q ? { search: q } : {}), limit: 50, sort: 'name:1' })
            .then((res) => {
                if (res.success) {
                    setCountryOptions(
                        res.data.map((c) => ({ value: c._id, label: `${c.flag ?? ''} ${c.name}`.trim() }))
                    );
                }
            })
            .catch(() => {})
            .finally(() => setCountryLoading(false));
    }, []);

    /* ── State options (depend on selected country) ── */
    const [stateOptions, setStateOptions] = useState([]);
    const [stateLoading, setStateLoading] = useState(false);
    const stateDebounce = useRef(null);

    const searchStates = useCallback((q, countryId) => {
        setStateLoading(true);
        const params = { limit: 100, sort: 'name:1' };
        if (q) params.search = q;
        if (countryId) params.countryId = countryId;
        statesApi.getAll(params)
            .then((res) => {
                if (res.success) {
                    setStateOptions(res.data.map((s) => ({ value: s._id, label: s.name })));
                }
            })
            .catch(() => {})
            .finally(() => setStateLoading(false));
    }, []);

    useEffect(() => { searchCountries(''); }, []); // eslint-disable-line

    /* Reload state options when country filter changes */
    useEffect(() => {
        setFilterStateId('');
        setStateOptions([]);
        if (filterCountryId) searchStates('', filterCountryId);
    }, [filterCountryId]); // eslint-disable-line

    /* ── Params builder ── */
    const buildParams = useCallback((page, limit, overrides = {}) => {
        const active = { search, filterActive, filterCountryId, filterStateId, ...overrides };
        const params = { page, limit, sort: 'name:1' };
        if (active.search?.trim())   params.search    = active.search.trim();
        if (active.filterActive)     params.isActive  = active.filterActive;
        if (active.filterCountryId)  params.countryId = active.filterCountryId;
        if (active.filterStateId)    params.stateId   = active.filterStateId;
        return params;
    }, [search, filterActive, filterCountryId, filterStateId]);

    const load = useCallback((page = 1, limit = DEFAULT_PAGE_SIZE, overrides = {}) => {
        dispatch(fetchCities(buildParams(page, limit, overrides)));
    }, [dispatch, buildParams]);

    useEffect(() => {
        const p = meta?.pagination;
        if (p) setPagination({ current: p.currentPage, pageSize: p.limit, total: p.totalRecords });
    }, [meta]);

    useEffect(() => { load(); }, []); // eslint-disable-line

    const handleView = (record) => {
        setSelectedRecord(record);
        setDrawerOpen(true);
    };

    /* ── CRUD handlers ── */
    const handleOpenCreate = () => { setFormRecord(null); setFormOpen(true); };
    const handleOpenEdit   = (record) => { setDrawerOpen(false); setFormRecord(record); setFormOpen(true); };

    const handleSave = async (values) => {
        setFormLoading(true);
        try {
            if (formRecord) {
                await citiesApi.update(formRecord._id, values);
                message.success('City updated successfully');
            } else {
                await citiesApi.create(values);
                message.success('City created successfully');
            }
            setFormOpen(false);
            load(formRecord ? pagination.current : 1, pagination.pageSize);
        } catch { /* interceptor */ }
        finally { setFormLoading(false); }
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete City',
            content: `Delete "${record.name}"?`,
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                setActionLoading(record._id);
                try {
                    await citiesApi.softDelete(record._id);
                    message.success('City deleted');
                    if (drawerOpen && selectedRecord?._id === record._id) setDrawerOpen(false);
                    load(pagination.current, pagination.pageSize);
                } catch { /* interceptor */ }
                finally { setActionLoading(null); }
            },
        });
    };

    const handleRestore = (record) => {
        Modal.confirm({
            title: 'Restore City',
            content: `Restore "${record.name}"?`,
            okText: 'Restore',
            onOk: async () => {
                setActionLoading(record._id);
                try {
                    await citiesApi.restore(record._id);
                    message.success('City restored');
                    load(pagination.current, pagination.pageSize);
                } catch { /* interceptor */ }
                finally { setActionLoading(null); }
            },
        });
    };
    const columns = [
        {
            title: 'City',
            key: 'city',
            fixed: isMobile ? undefined : 'left',
            width: isMobile ? 160 : 200,
            render: (_, r) => (
                <span
                    className="font-semibold text-sm"
                    style={{ color: 'var(--text-primary)' }}
                >
                    {r.name}
                </span>
            ),
        },
        {
            title: 'State / Region',
            key: 'state',
            width: 180,
            render: (_, r) => {
                const s = r.stateId;   /* API populates stateId as an object */
                if (!s) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
                if (typeof s === 'object') {
                    return (
                        <span
                            className="text-sm truncate"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            {s.name}{s.isoCode ? ` (${s.isoCode})` : ''}
                        </span>
                    );
                }
                return <span style={{ color: 'var(--text-muted)' }}>—</span>;
            },
        },
        {
            title: 'Country',
            key: 'country',
            width: 180,
            render: (_, r) => {
                const c = r.countryId;   /* API populates countryId as an object (or raw string) */
                if (!c) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
                if (typeof c === 'object') {
                    return (
                        <div className="flex items-center gap-1.5">
                            <span style={{ fontSize: 16 }}>{c.flag ?? ''}</span>
                            <span
                                className="text-sm truncate"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                {c.name}
                            </span>
                        </div>
                    );
                }
                /* Unpopulated string ID — look up from cached countryOptions */
                const opt = countryOptions.find((o) => o.value === c);
                if (opt) {
                    return (
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {opt.label}
                        </span>
                    );
                }
                return <span style={{ color: 'var(--text-muted)' }}>—</span>;
            },
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 110,
            render: (v, r) => <ActiveStatusTag isActive={v} isDelete={r.isDelete} />,
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 110,
            render: (d) => (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {d ? new Date(d).toLocaleDateString() : '—'}
                </span>
            ),
        },
        {
            title: '',
            key: 'actions',
            width: 60,
            fixed: isMobile ? undefined : 'right',
            render: (_, record) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Dropdown
                        trigger={['click']}
                        menu={{
                            items: [
                                { key: 'view', label: 'View Details', icon: <EyeOutlined /> },
                                { key: 'edit', label: 'Edit', icon: <EditOutlined />, disabled: record.isDelete },
                                { type: 'divider' },
                                record.isDelete
                                    ? { key: 'restore', label: <span style={{ color: '#10b981' }}>Restore</span>, icon: <UndoOutlined style={{ color: '#10b981' }} /> }
                                    : { key: 'delete', label: <span style={{ color: '#ef4444' }}>Delete</span>, icon: <DeleteOutlined style={{ color: '#ef4444' }} /> },
                            ],
                            onClick: ({ key }) => {
                                if (key === 'view')    handleView(record);
                                if (key === 'edit')    handleOpenEdit(record);
                                if (key === 'delete')  handleDelete(record);
                                if (key === 'restore') handleRestore(record);
                            },
                        }}
                    >
                        <Button
                            type="text"
                            size="small"
                            icon={<MoreOutlined />}
                            loading={actionLoading === record._id}
                        />
                    </Dropdown>
                </div>
            ),
        },
    ];

    /* ── Render ── */
    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2">
                <Input.Search
                    placeholder="Search by city name…"
                    allowClear
                    className="w-full sm:w-auto"
                    style={{ maxWidth: isMobile ? undefined : 240 }}
                    onSearch={(v) => {
                        const trimmed = v.trim();
                        setSearch(trimmed);
                        load(1, pagination.pageSize, { search: trimmed });
                    }}
                />
                <Select
                    showSearch
                    allowClear
                    placeholder="Filter by country"
                    className="w-full sm:w-auto"
                    style={{ minWidth: isMobile ? undefined : 180 }}
                    loading={countryLoading}
                    filterOption={false}
                    onSearch={(v) => {
                        clearTimeout(countryDebounce.current);
                        countryDebounce.current = setTimeout(() => searchCountries(v), 300);
                    }}
                    onChange={(v) => {
                        const val = v ?? '';
                        setFilterCountryId(val);
                        load(1, pagination.pageSize, { filterCountryId: val, filterStateId: '' });
                    }}
                    options={countryOptions}
                    notFoundContent={countryLoading ? 'Searching…' : 'No countries'}
                    styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                />
                <Select
                    showSearch
                    allowClear
                    placeholder="Filter by state"
                    className="w-full sm:w-auto"
                    style={{ minWidth: isMobile ? undefined : 180 }}
                    loading={stateLoading}
                    disabled={!filterCountryId}
                    filterOption={false}
                    onSearch={(v) => {
                        clearTimeout(stateDebounce.current);
                        stateDebounce.current = setTimeout(() => searchStates(v, filterCountryId), 300);
                    }}
                    onChange={(v) => {
                        const val = v ?? '';
                        setFilterStateId(val);
                        load(1, pagination.pageSize, { filterStateId: val });
                    }}
                    value={filterStateId || undefined}
                    options={stateOptions}
                    notFoundContent={
                        !filterCountryId
                            ? 'Select a country first'
                            : stateLoading ? 'Searching…' : 'No states'
                    }
                    styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                />
                <Select
                    allowClear
                    placeholder="Filter by status"
                    className="w-full sm:w-auto"
                    style={{ minWidth: isMobile ? undefined : 160 }}
                    onChange={(v) => {
                        const val = v ?? '';
                        setFilterActive(val);
                        load(1, pagination.pageSize, { filterActive: val });
                    }}
                    value={filterActive || undefined}
                    styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                >
                    <Option value="true">Active</Option>
                    <Option value="false">Inactive</Option>
                </Select>
                <div className="flex items-center gap-2 sm:contents">
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => load(pagination.current, pagination.pageSize)}
                        loading={loading}
                        style={{
                            borderRadius: 10,
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-secondary)',
                            background: 'var(--input-bg)',
                        }}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleOpenCreate}
                        style={{ borderRadius: 10, marginLeft: 'auto' }}
                    >
                        {!isMobile && 'Add City'}
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-card)',
                }}
            >
                <Table
                    className="custom-minimal-table"
                    rowKey="_id"
                    dataSource={list}
                    columns={columns}
                    loading={loading}
                    scroll={{ x: 'max-content' }}
                    sticky
                    components={{
                        header: {
                            cell: (props) => (
                                <th
                                    {...props}
                                    style={{
                                        ...props.style,
                                        whiteSpace: 'nowrap',
                                        background: isDark ? 'var(--bg-card)' : undefined,
                                    }}
                                />
                            ),
                        },
                    }}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        showTotal: (total) => `Total ${total} cities`,
                        style: { padding: '12px 16px' },
                    }}
                    onChange={(p) => load(p.current, p.pageSize)}
                    onRow={(record) => ({
                        onClick: () => handleView(record),
                        style: { cursor: 'pointer' },
                    })}
                />
            </div>

            {/* Detail Drawer */}
            <Drawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                title={
                    <div>
                        <div
                            className="font-bold text-base"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {selectedRecord?.name}
                        </div>
                        <div
                            className="text-xs"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            City
                        </div>
                    </div>
                }
                width={typeof window !== 'undefined' && window.innerWidth < 640 ? '100vw' : 480}
                styles={{
                    body:   { padding: '16px 20px', background: 'var(--bg-card)' },
                    header: { background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' },
                    mask:   { backdropFilter: 'blur(2px)' },
                }}
                destroyOnClose
            >
                {selectedRecord && (
                    <div>
                        <p
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.07em',
                                color: 'var(--text-muted)',
                                marginBottom: 4,
                            }}
                        >
                            Basic Information
                        </p>
                        <InfoRow label="City Name" value={selectedRecord.name} />
                        <InfoRow
                            label="State"
                            value={
                                selectedRecord.stateId && typeof selectedRecord.stateId === 'object'
                                    ? `${selectedRecord.stateId.name}${selectedRecord.stateId.isoCode ? ` (${selectedRecord.stateId.isoCode})` : ''}`
                                    : null
                            }
                        />
                        <InfoRow
                            label="Country"
                            value={
                                selectedRecord.countryId && typeof selectedRecord.countryId === 'object'
                                    ? `${selectedRecord.countryId.flag ?? ''} ${selectedRecord.countryId.name}`.trim()
                                    : null
                            }
                        />
                        <InfoRow
                            label="Status"
                            value={
                                <ActiveStatusTag
                                    isActive={selectedRecord.isActive}
                                    isDelete={selectedRecord.isDelete}
                                />
                            }
                        />

                        <Divider style={{ borderColor: 'var(--border-color)', margin: '16px 0 8px' }} />
                        <p
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.07em',
                                color: 'var(--text-muted)',
                                marginBottom: 4,
                            }}
                        >
                            Coordinates
                        </p>
                        <InfoRow label="Latitude"  value={selectedRecord.latitude} />
                        <InfoRow label="Longitude" value={selectedRecord.longitude} />

                        <Divider style={{ borderColor: 'var(--border-color)', margin: '16px 0 8px' }} />
                        <InfoRow
                            label="Created"
                            value={selectedRecord.createdAt ? new Date(selectedRecord.createdAt).toLocaleString() : null}
                        />
                        <InfoRow
                            label="Updated"
                            value={selectedRecord.updatedAt ? new Date(selectedRecord.updatedAt).toLocaleString() : null}
                        />
                    </div>
                )}
            </Drawer>

            {/* Create / Edit Modal */}
            <CityFormModal
                open={formOpen}
                record={formRecord}
                onCancel={() => setFormOpen(false)}
                onSubmit={handleSave}
                loading={formLoading}
            />
        </div>
    );
};

export default CitiesTable;
