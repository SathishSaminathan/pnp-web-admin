import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Table, Button, Input, Select, Tooltip, Dropdown, Tag, Drawer, Divider, Modal, message,
} from 'antd';
import {
    EyeOutlined,
    ReloadOutlined,
    MoreOutlined,
    GlobalOutlined,
    PhoneOutlined,
    DollarOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    UndoOutlined,
} from '@ant-design/icons';
import { useTheme } from '../../../context/ThemeContext';
import {
    fetchCountries,
    selectCountriesList,
    selectCountriesMeta,
    selectCountriesLoading,
} from '../../../store/slices/countriesSlice';
import { countriesApi } from '../../../api/modules/countries';
import ActiveStatusTag from './ActiveStatusTag';
import CountryFormModal from './CountryFormModal';

const { Option } = Select;
const DEFAULT_PAGE_SIZE = 20;

/* ── Tiny info row for the detail drawer ── */
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
const CountriesTable = () => {
    const dispatch   = useDispatch();
    const { isDark } = useTheme();

    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const list    = useSelector(selectCountriesList);
    const meta    = useSelector(selectCountriesMeta);
    const loading = useSelector(selectCountriesLoading);

    const [pagination,    setPagination]    = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });
    const [search,        setSearch]        = useState('');
    const [filterActive,  setFilterActive]  = useState('');
    const [drawerOpen,    setDrawerOpen]    = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    /* ── CRUD state ── */
    const [formOpen,      setFormOpen]      = useState(false);
    const [formRecord,    setFormRecord]    = useState(null); // null = create, obj = edit
    const [formLoading,   setFormLoading]   = useState(false);
    const [actionLoading, setActionLoading] = useState(null); // _id of record being actioned

    /* ── Params builder ── */
    const buildParams = useCallback((page, limit, overrides = {}) => {
        const active = { search, filterActive, ...overrides };
        const params = { page, limit, sort: 'name:1' };
        if (active.search?.trim())  params.search   = active.search.trim();
        if (active.filterActive)    params.isActive = active.filterActive;
        return params;
    }, [search, filterActive]);

    const load = useCallback((page = 1, limit = DEFAULT_PAGE_SIZE, overrides = {}) => {
        dispatch(fetchCountries(buildParams(page, limit, overrides)));
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
                await countriesApi.update(formRecord._id, values);
                message.success('Country updated successfully');
            } else {
                await countriesApi.create(values);
                message.success('Country created successfully');
            }
            setFormOpen(false);
            load(formRecord ? pagination.current : 1, pagination.pageSize);
        } catch { /* interceptor handles toast */ }
        finally { setFormLoading(false); }
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete Country',
            content: `Delete "${record.name}"? This will cascade to related states and cities.`,
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                setActionLoading(record._id);
                try {
                    await countriesApi.softDelete(record._id);
                    message.success('Country deleted');
                    if (drawerOpen && selectedRecord?._id === record._id) setDrawerOpen(false);
                    load(pagination.current, pagination.pageSize);
                } catch { /* interceptor */ }
                finally { setActionLoading(null); }
            },
        });
    };

    const handleRestore = (record) => {
        Modal.confirm({
            title: 'Restore Country',
            content: `Restore "${record.name}"?`,
            okText: 'Restore',
            onOk: async () => {
                setActionLoading(record._id);
                try {
                    await countriesApi.restore(record._id);
                    message.success('Country restored');
                    load(pagination.current, pagination.pageSize);
                } catch { /* interceptor */ }
                finally { setActionLoading(null); }
            },
        });
    };

    /* ── Columns ── */
    const columns = [
        {
            title: 'Country',
            key: 'country',
            fixed: isMobile ? undefined : 'left',
            width: isMobile ? 180 : 240,
            render: (_, r) => (
                <div className="flex items-center gap-2.5">
                    <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>
                        {r.flag || '🌐'}
                    </span>
                    <div className="flex flex-col min-w-0">
                        <span
                            className="font-semibold text-sm truncate"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {r.name}
                        </span>
                        <span
                            className="text-xs font-mono"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            {r.isoCode}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            title: 'ISO Code',
            dataIndex: 'isoCode',
            key: 'isoCode',
            width: 100,
            render: (v) => (
                <Tag
                    style={{
                        borderRadius: 6,
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                    }}
                >
                    {v}
                </Tag>
            ),
        },
        {
            title: 'Phone Code',
            dataIndex: 'phonecode',
            key: 'phonecode',
            width: 120,
            render: (v) => (
                <span
                    className="font-mono text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    {v ? `+${v}` : '—'}
                </span>
            ),
        },
        {
            title: 'Currency',
            dataIndex: 'currency',
            key: 'currency',
            width: 100,
            render: (v) =>
                v ? (
                    <Tag
                        color="blue"
                        style={{ borderRadius: 6, fontWeight: 600 }}
                    >
                        {v}
                    </Tag>
                ) : (
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                ),
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
                    placeholder="Search by name or ISO code…"
                    allowClear
                    className="w-full sm:w-auto"
                    style={{ maxWidth: isMobile ? undefined : 280 }}
                    onSearch={(v) => {
                        const trimmed = v.trim();
                        setSearch(trimmed);
                        load(1, pagination.pageSize, { search: trimmed });
                    }}
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
                        {!isMobile && 'Add Country'}
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
                        showTotal: (total) => `Total ${total} countries`,
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
                    <div className="flex items-center gap-2">
                        <span style={{ fontSize: 20 }}>
                            {selectedRecord?.flag || '🌐'}
                        </span>
                        <div>
                            <div
                                className="font-bold text-base"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                {selectedRecord?.name}
                            </div>
                            <div
                                className="text-xs font-mono"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                {selectedRecord?.isoCode}
                            </div>
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
                        <InfoRow label="Name"       value={selectedRecord.name} />
                        <InfoRow label="ISO Code"   value={selectedRecord.isoCode} />
                        <InfoRow label="Flag"       value={selectedRecord.flag} />
                        <InfoRow label="Phone Code" value={selectedRecord.phonecode ? `+${selectedRecord.phonecode}` : null} />
                        <InfoRow label="Currency"   value={selectedRecord.currency} />
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
                            Timestamps
                        </p>
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
            <CountryFormModal
                open={formOpen}
                record={formRecord}
                onCancel={() => setFormOpen(false)}
                onSubmit={handleSave}
                loading={formLoading}
            />
        </div>
    );
};

export default CountriesTable;
