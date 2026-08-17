import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Select, Avatar, Dropdown, Tooltip, Popconfirm, message, DatePicker } from 'antd';
import {
    ReloadOutlined,
    EyeOutlined,
    MoreOutlined,
    MobileOutlined,
    DesktopOutlined,
    TabletOutlined,
    CheckOutlined,
    PoweroffOutlined,
    SafetyCertificateOutlined,
    CloseOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    MinusCircleOutlined,
} from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';
import {
    fetchUserDevices,
    activateUserDevice,
    deactivateUserDevice,
    verifyUserDevice,
    unverifyUserDevice,
    softDeleteUserDevice,
    selectUserDevicesList,
    selectUserDevicesMeta,
    selectUserDevicesLoading,
    selectUserDevicesActionLoading,
} from '../../store/slices/userDevicesSlice';
import { DeviceStatusTag, DeviceDetailDrawer } from './components';
import { extractMetaCounts } from '../../utils/extractMetaCounts';
import { mapCardsFromMeta } from '../../utils/mapCardsFromMeta';
import { merchantsApi } from '../../api/modules/merchants';

const { Option } = Select;
const { RangePicker } = DatePicker;
const DEFAULT_PAGE_SIZE = 20;

const CARD_CONFIG = [
    { label: 'Active',   key: 'active',   color: '#10b981', icon: <CheckCircleOutlined /> },
    { label: 'Trusted',  key: 'trusted',  color: '#6366f1', icon: <SafetyCertificateOutlined /> },
    { label: 'Inactive', key: 'inactive', color: '#f59e0b', icon: <MinusCircleOutlined /> },
    { label: 'Deleted',  key: 'deleted',  color: '#ef4444', icon: <CloseCircleOutlined /> },
];

/* ── Stat Card ── */
const StatCard = ({ label, value, color, icon }) => (
    <div
        className="rounded-2xl w-full flex flex-col overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color}09 0%, var(--bg-card) 60%)`, border: `1px solid ${color}25`, boxShadow: 'var(--shadow-card)' }}
    >
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

/* ── Device icon ── */
const DeviceTypeIcon = ({ type }) => {
    const style = { fontSize: 14, color: 'var(--text-muted)' };
    if (!type) return <DesktopOutlined style={style} />;
    const t = type.toLowerCase();
    if (t.includes('mobile') || t.includes('phone')) return <MobileOutlined style={style} />;
    if (t.includes('tablet')) return <TabletOutlined style={style} />;
    return <DesktopOutlined style={style} />;
};

/* ══════════════════════════════════════════════════════════════════════════ */
const UserDevicesList = () => {
    const dispatch      = useDispatch();
    const { isDark }    = useTheme();

    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const devices       = useSelector(selectUserDevicesList);
    const meta          = useSelector(selectUserDevicesMeta);
    const listLoading   = useSelector(selectUserDevicesLoading);
    const actionLoading = useSelector(selectUserDevicesActionLoading);

    const [pagination,    setPagination]   = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });
    const [filterActive,  setFilterActive] = useState('');
    const [filterVerified,setFilterVerified] = useState('');
    const [filterUserId,  setFilterUserId] = useState('');
    const [dateRange,     setDateRange]    = useState([null, null]);
    const [includeDeleted,setIncludeDeleted] = useState(false);
    const [drawerOpen,    setDrawerOpen]   = useState(false);
    const [selectedRecord,setSelectedRecord] = useState(null);
    const [merchantOptions, setMerchantOptions] = useState([]);
    const [merchantLoading, setMerchantLoading] = useState(false);
    const merchantDebounce = useRef(null);
    const [actioningId, setActioningId]    = useState(null);

    const buildParams = useCallback((page, limit, overrides = {}) => {
        const active = { filterActive, filterVerified, filterUserId, dateRange, includeDeleted, ...overrides };
        const params = { page, limit, sort: 'createdAt:-1' };
        if (active.filterActive !== '')   params.isActive   = active.filterActive;
        if (active.filterVerified !== '') params.isVerified = active.filterVerified;
        if (active.filterUserId?.trim())  params.userId     = active.filterUserId.trim();
        if (active.includeDeleted)        params.includeDeleted = 'true';
        if (active.dateRange?.[0])        params.dateFrom   = active.dateRange[0].toISOString();
        if (active.dateRange?.[1])        params.dateTo     = active.dateRange[1].toISOString();
        Object.keys(params).forEach((k) => params[k] === '' && delete params[k]);
        return params;
    }, [filterActive, filterVerified, filterUserId, dateRange, includeDeleted]);

    const fetchDevices = useCallback((page = 1, limit = DEFAULT_PAGE_SIZE, overrides = {}) => {
        dispatch(fetchUserDevices(buildParams(page, limit, overrides)));
    }, [dispatch, buildParams]);

    useEffect(() => {
        const p = meta?.pagination;
        if (p) setPagination({ current: p.currentPage, pageSize: p.limit, total: p.totalRecords });
    }, [meta]);

    useEffect(() => { fetchDevices(); }, []); // eslint-disable-line

    const handleTableChange = (p) => fetchDevices(p.current, p.pageSize);
    const handleRefresh     = () => fetchDevices(pagination.current, pagination.pageSize);

    const handleDateRange = (v) => {
        const range = v ?? [null, null];
        setDateRange(range);
        fetchDevices(1, pagination.pageSize, { dateRange: range });
    };

    const runAction = async (thunk, id, successMsg) => {
        setActioningId(id);
        try {
            await dispatch(thunk(id)).unwrap();
            message.success(successMsg);
            if (selectedRecord?._id === id) {
                // refresh the selected record from list
                const updated = devices.find((d) => d._id === id);
                if (updated) setSelectedRecord({ ...updated });
            }
        } catch (err) { message.error(err || 'Action failed'); }
        finally { setActioningId(null); }
    };

    const searchMerchants = useCallback(async (search) => {
        if (!search?.trim()) { setMerchantOptions([]); return; }
        setMerchantLoading(true);
        try {
            const res = await merchantsApi.getAllMerchants({ search: search.trim(), limit: 20 });
            if (res.success) {
                setMerchantOptions((res.data ?? []).map((m) => ({
                    value: m._id,
                    label: `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || m.emailId,
                    email: m.emailId,
                })));
            }
        } catch { /* silent */ } finally { setMerchantLoading(false); }
    }, []);

    /* ── Row menu ── */
    const getRowMenu = (record) => ({
        onClick: ({ domEvent }) => domEvent.stopPropagation(),
        items: [
            {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'View Details',
                onClick: () => { setSelectedRecord(record); setDrawerOpen(true); },
            },
            ...(!record.isDelete ? [
                {
                    key: 'toggle-active',
                    icon: record.isActive ? <PoweroffOutlined style={{ color: '#f59e0b' }} /> : <CheckOutlined style={{ color: '#10b981' }} />,
                    label: <span style={{ color: record.isActive ? '#f59e0b' : '#10b981' }}>{record.isActive ? 'Deactivate' : 'Activate'}</span>,
                    onClick: () => runAction(
                        record.isActive ? deactivateUserDevice : activateUserDevice,
                        record._id,
                        record.isActive ? 'Device deactivated' : 'Device activated',
                    ),
                },
                {
                    key: 'toggle-verify',
                    icon: record.isVerified ? <CloseOutlined style={{ color: '#6366f1' }} /> : <SafetyCertificateOutlined style={{ color: '#6366f1' }} />,
                    label: <span style={{ color: '#6366f1' }}>{record.isVerified ? 'Untrust Device' : 'Trust Device'}</span>,
                    onClick: () => runAction(
                        record.isVerified ? unverifyUserDevice : verifyUserDevice,
                        record._id,
                        record.isVerified ? 'Device untrusted' : 'Device trusted',
                    ),
                },
                { type: 'divider' },
                {
                    key: 'delete',
                    icon: <DeleteOutlined style={{ color: '#ef4444' }} />,
                    label: <span style={{ color: '#ef4444' }}>Delete Device</span>,
                    onClick: () => runAction(softDeleteUserDevice, record._id, 'Device deleted'),
                },
            ] : []),
        ],
    });

    /* ── Columns ── */
    const columns = [
        {
            title: 'User',
            key: 'user',
            fixed: 'left',
            width: 200,
            render: (_, r) => {
                const u = r.userId ?? {};
                const name = typeof u === 'object' ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : '';
                const email = typeof u === 'object' ? (u.emailId ?? '') : '';
                const display = name || email || (typeof r.userId === 'string' ? r.userId.slice(-8) : '?');
                const initials = display.charAt(0).toUpperCase();
                return (
                    <div className="flex items-center gap-2">
                        <Avatar size={32} style={{ background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                            {initials || '?'}
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{name || (typeof r.userId === 'string' ? `…${r.userId.slice(-8)}` : '—')}</span>
                            <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{email}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Device',
            key: 'device',
            width: 180,
            render: (_, r) => (
                <div className="flex items-center gap-1.5">
                    <DeviceTypeIcon type={r.deviceName} />
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm truncate font-medium" style={{ color: 'var(--text-primary)' }}>{r.deviceName ?? '—'}</span>
                        <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{r.IP ?? ''}</span>
                    </div>
                </div>
            ),
        },
        {
            title: 'OS/Browser',
            key: 'osBrowser',
            width: 150,
            render: (_, r) => (
                <div className="flex flex-col">
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{r.OS ?? '—'}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.networkStrength ? `Network: ${r.networkStrength}` : (r.browser ?? '')}</span>
                </div>
            ),
            responsive: ['md'],
        },
        {
            title: 'Status',
            key: 'status',
            width: 120,
            render: (_, r) => <DeviceStatusTag isActive={r.isActive} isVerified={r.isVerified} isDelete={r.isDelete} />,
        },
        {
            title: 'Last Seen',
            dataIndex: 'lastLogin',
            key: 'lastLogin',
            width: 130,
            render: (d) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{d ? new Date(d).toLocaleString() : '—'}</span>,
            responsive: ['lg'],
        },
        {
            title: 'First Seen',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 130,
            render: (d) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{d ? new Date(d).toLocaleString() : '—'}</span>,
            responsive: ['lg'],
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 90,
            fixed: 'right',
            align: 'center',
            render: (_, record) => (
                <Dropdown
                    trigger={['click']}
                    menu={getRowMenu(record)}
                >
                    <Button
                        type="text"
                        size="small"
                        icon={<MoreOutlined />}
                        loading={actioningId === record._id && actionLoading}
                        style={{ color: 'var(--text-secondary)' }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </Dropdown>
            ),
        },
    ];

    /* ── Stats ── */

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>
                        User Devices
                    </h2>
                    <p className="text-sm m-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        View and manage all registered merchant devices
                    </p>
                </div>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    loading={listLoading}
                    style={{ borderRadius: 10, borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'var(--input-bg)' }}
                >
                    {!isMobile && 'Refresh'}
                </Button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {mapCardsFromMeta(CARD_CONFIG, extractMetaCounts(meta)).map((card) => (
                    <StatCard key={card.key} {...card} />
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                <Select
                    allowClear
                    placeholder="Active status"
                    style={{ minWidth: 150 }}
                    onChange={(v) => {
                        setFilterActive(v ?? '');
                        fetchDevices(1, pagination.pageSize, { filterActive: v ?? '' });
                    }}
                    value={filterActive || undefined}
                >
                    <Option value="true">Active</Option>
                    <Option value="false">Inactive</Option>
                </Select>
                <Select
                    allowClear
                    placeholder="Verified status"
                    style={{ minWidth: 150 }}
                    onChange={(v) => {
                        setFilterVerified(v ?? '');
                        fetchDevices(1, pagination.pageSize, { filterVerified: v ?? '' });
                    }}
                    value={filterVerified || undefined}
                >
                    <Option value="true">Trusted</Option>
                    <Option value="false">Untrusted</Option>
                </Select>
                <Select
                    showSearch
                    allowClear
                    placeholder="Search merchant..."
                    style={{ minWidth: 200 }}
                    loading={merchantLoading}
                    filterOption={false}
                    onSearch={(v) => {
                        clearTimeout(merchantDebounce.current);
                        merchantDebounce.current = setTimeout(() => searchMerchants(v), 350);
                    }}
                    onChange={(v) => {
                        setFilterUserId(v ?? '');
                        fetchDevices(1, pagination.pageSize, { filterUserId: v ?? '' });
                    }}
                    options={merchantOptions.map((o) => ({
                        value: o.value,
                        label: (
                            <div>
                                <span className="font-medium">{o.label}</span>
                                <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>{o.email}</span>
                            </div>
                        ),
                    }))}
                    notFoundContent={merchantLoading ? 'Searching…' : 'Type to search'}
                />
                <RangePicker onChange={handleDateRange} style={{ minWidth: 240 }} allowClear />
                <Select
                    allowClear
                    placeholder="Include deleted"
                    style={{ minWidth: 150 }}
                    onChange={(v) => {
                        const val = v === 'true';
                        setIncludeDeleted(val);
                        fetchDevices(1, pagination.pageSize, { includeDeleted: val });
                    }}
                    value={includeDeleted ? 'true' : undefined}
                >
                    <Option value="true">Include Deleted</Option>
                </Select>
            </div>

            {/* Table */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}
            >
                <Table
                    className="custom-minimal-table"
                    rowKey="_id"
                    dataSource={devices}
                    columns={columns}
                    loading={listLoading}
                    scroll={{ x: 1050 }}
                    components={{
                        header: {
                            cell: (props) => <th {...props} style={{ ...props.style, whiteSpace: 'nowrap' }} />,
                        },
                    }}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                        showTotal: (total) => `Total ${total} devices`,
                        style: { padding: '12px 16px' },
                    }}
                    onChange={handleTableChange}
                    onRow={(record) => ({
                        onClick: () => { setSelectedRecord(record); setDrawerOpen(true); },
                        style: { cursor: 'pointer' },
                    })}
                />
            </div>

            {/* Detail Drawer */}
            <DeviceDetailDrawer
                open={drawerOpen}
                device={selectedRecord}
                onClose={() => setDrawerOpen(false)}
                onUpdated={() => {
                    fetchDevices(pagination.current, pagination.pageSize);
                    // Keep drawer in sync by finding the latest record from the store
                    if (selectedRecord?._id) {
                        const updated = devices.find((d) => d._id === selectedRecord._id);
                        if (updated) setSelectedRecord({ ...updated });
                    }
                }}
            />
        </div>
    );
};

export default UserDevicesList;
