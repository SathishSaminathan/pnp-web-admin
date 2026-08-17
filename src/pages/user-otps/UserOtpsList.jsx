import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Select, Avatar, Dropdown, DatePicker, Tag } from 'antd';
import {
    ReloadOutlined,
    EyeOutlined,
    MoreOutlined,
    KeyOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined,
} from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';
import {
    fetchUserOtps,
    selectUserOtpsList,
    selectUserOtpsMeta,
    selectUserOtpsLoading,
} from '../../store/slices/userOtpsSlice';
import { OtpStatusTag, OtpDetailDrawer } from './components';
import { extractMetaCounts } from '../../utils/extractMetaCounts';
import { mapCardsFromMeta } from '../../utils/mapCardsFromMeta';
import { merchantsApi } from '../../api/modules/merchants';

const { Option } = Select;
const { RangePicker } = DatePicker;
const DEFAULT_PAGE_SIZE = 20;

const CARD_CONFIG = [
    { label: 'Pending', key: 'pending', color: '#f59e0b', icon: <SyncOutlined /> },
    { label: 'Used',    key: 'used',    color: '#10b981', icon: <CheckCircleOutlined /> },
    { label: 'Expired', key: 'expired', color: '#ef4444', icon: <CloseCircleOutlined /> },
];

const TYPE_LABELS = {
    email: 'Email',
    phone: 'Phone',
    sms:   'SMS',
};

const TYPE_OPTIONS = Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }));

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

/* ══════════════════════════════════════════════════════════════════════════ */
const UserOtpsList = () => {
    const dispatch   = useDispatch();
    useTheme();

    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const otps        = useSelector(selectUserOtpsList);
    const meta        = useSelector(selectUserOtpsMeta);
    const listLoading = useSelector(selectUserOtpsLoading);

    const [pagination,    setPagination]    = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });
    const [filterPurpose, setFilterPurpose] = useState('');
    const [filterUsed,    setFilterUsed]    = useState('');
    const [filterExpired, setFilterExpired] = useState('');
    const [filterUserId,  setFilterUserId]  = useState('');
    const [dateRange,     setDateRange]     = useState([null, null]);
    const [drawerOpen,    setDrawerOpen]    = useState(false);
    const [selectedRecord,setSelectedRecord] = useState(null);
    const [merchantOptions, setMerchantOptions] = useState([]);
    const [merchantLoading, setMerchantLoading] = useState(false);
    const merchantDebounce = useRef(null);

    const buildParams = useCallback((page, limit, overrides = {}) => {
        const active = { filterPurpose, filterUsed, filterExpired, filterUserId, dateRange, ...overrides };
        const params = { page, limit, sort: 'createdAt:-1' };
        if (active.filterPurpose)        params.type       = active.filterPurpose;
        if (active.filterUsed !== '')    params.isUsed     = active.filterUsed;
        if (active.filterExpired !== '') params.isExpired  = active.filterExpired;
        if (active.filterUserId?.trim()) params.userId     = active.filterUserId.trim();
        if (active.dateRange?.[0])       params.dateFrom   = active.dateRange[0].toISOString();
        if (active.dateRange?.[1])       params.dateTo     = active.dateRange[1].toISOString();
        Object.keys(params).forEach((k) => params[k] === '' && delete params[k]);
        return params;
    }, [filterPurpose, filterUsed, filterExpired, filterUserId, dateRange]);

    const fetchOtps = useCallback((page = 1, limit = DEFAULT_PAGE_SIZE, overrides = {}) => {
        dispatch(fetchUserOtps(buildParams(page, limit, overrides)));
    }, [dispatch, buildParams]);

    useEffect(() => {
        const p = meta?.pagination;
        if (p) setPagination({ current: p.currentPage, pageSize: p.limit, total: p.totalRecords });
    }, [meta]);

    useEffect(() => { fetchOtps(); }, []); // eslint-disable-line

    const handleTableChange = (p) => fetchOtps(p.current, p.pageSize);
    const handleRefresh     = () => fetchOtps(pagination.current, pagination.pageSize);

    const handleDateRange = (v) => {
        const range = v ?? [null, null];
        setDateRange(range);
        fetchOtps(1, pagination.pageSize, { dateRange: range });
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

    /* ── Columns ── */
    const columns = [
        {
            title: 'User',
            key: 'user',
            fixed: 'left',
            width: 200,
            render: (_, r) => {
                const contact = r.contactInfo ?? '';
                const initials = contact.charAt(0).toUpperCase();
                return (
                    <div className="flex items-center gap-2">
                        <Avatar size={32} style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                            {initials || '?'}
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{contact || '—'}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Purpose',
            dataIndex: 'verificationFor',
            key: 'verificationFor',
            width: 150,
            render: (v) => (
                <Tag color="blue" style={{ borderRadius: 20, fontWeight: 600 }}>
                    {v ?? '—'}
                </Tag>
            ),
        },
        {
            title: 'Channel',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: (v) => (
                <span className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>{TYPE_LABELS[v] ?? v ?? '—'}</span>
            ),
        },
        {
            title: 'Code',
            key: 'code',
            width: 100,
            render: () => (
                <span className="font-mono text-sm" style={{ color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
                    ● ● ● ●
                </span>
            ),
        },
        {
            title: 'Attempts',
            key: 'attempts',
            width: 110,
            render: (_, r) => (
                <span className="text-sm tabular-nums font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {r.incorrectOtpAttempts != null ? r.incorrectOtpAttempts : '—'}
                </span>
            ),
            responsive: ['md'],
        },
        {
            title: 'Status',
            key: 'status',
            width: 120,
            render: (_, r) => {
                const isExpired = r.verification?.isExpired ?? false;
                const isUsed    = r.verification?.hasCode === false;
                return <OtpStatusTag isUsed={isUsed} isExpired={isExpired} isVerified={false} />;
            },
        },
        {
            title: 'Expires At',
            key: 'expiresAt',
            width: 150,
            render: (_, r) => {
                const d = r.verification?.expiresAt;
                if (!d) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
                const isExpired = r.verification?.isExpired || new Date(d) < new Date();
                return (
                    <span className="text-xs" style={{ color: isExpired ? '#ef4444' : 'var(--text-muted)' }}>
                        {new Date(d).toLocaleString()}
                    </span>
                );
            },
            responsive: ['lg'],
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 130,
            render: (d) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{d ? new Date(d).toLocaleString() : '—'}</span>,
            responsive: ['md'],
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
                    menu={{
                        onClick: ({ domEvent }) => domEvent.stopPropagation(),
                        items: [
                            {
                                key: 'view',
                                icon: <EyeOutlined />,
                                label: 'View Details',
                                onClick: () => { setSelectedRecord(record); setDrawerOpen(true); },
                            },
                        ],
                    }}
                >
                    <Button
                        type="text"
                        size="small"
                        icon={<MoreOutlined />}
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
                        User OTPs
                    </h2>
                    <p className="text-sm m-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Browse OTP verification records — codes are never shown (read-only)
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
            <div className="grid grid-cols-3 gap-3">
                {mapCardsFromMeta(CARD_CONFIG, extractMetaCounts(meta)).map((card) => (
                    <StatCard key={card.key} {...card} />
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                <Select
                    allowClear
                    placeholder="Channel"
                    style={{ minWidth: 140 }}
                    onChange={(v) => {
                        setFilterPurpose(v ?? '');
                        fetchOtps(1, pagination.pageSize, { filterPurpose: v ?? '' });
                    }}
                    value={filterPurpose || undefined}
                    options={TYPE_OPTIONS}
                />
                <Select
                    allowClear
                    placeholder="Status"
                    style={{ minWidth: 130 }}
                    onChange={(v) => {
                        if (v === 'used')    { setFilterUsed('true'); setFilterExpired(''); fetchOtps(1, pagination.pageSize, { filterUsed: 'true', filterExpired: '' }); }
                        else if (v === 'expired') { setFilterExpired('true'); setFilterUsed(''); fetchOtps(1, pagination.pageSize, { filterExpired: 'true', filterUsed: '' }); }
                        else if (v === 'pending') { setFilterUsed('false'); setFilterExpired('false'); fetchOtps(1, pagination.pageSize, { filterUsed: 'false', filterExpired: 'false' }); }
                        else { setFilterUsed(''); setFilterExpired(''); fetchOtps(1, pagination.pageSize, { filterUsed: '', filterExpired: '' }); }
                    }}
                    value={filterUsed === 'true' ? 'used' : filterExpired === 'true' ? 'expired' : filterUsed === 'false' && filterExpired === 'false' ? 'pending' : undefined}
                >
                    <Option value="pending">Pending</Option>
                    <Option value="used">Used</Option>
                    <Option value="expired">Expired</Option>
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
                        fetchOtps(1, pagination.pageSize, { filterUserId: v ?? '' });
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
            </div>

            {/* Table */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}
            >
                <Table
                    className="custom-minimal-table"
                    rowKey="_id"
                    dataSource={otps}
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
                        showTotal: (total) => `Total ${total} OTP records`,
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
            <OtpDetailDrawer
                open={drawerOpen}
                otp={selectedRecord}
                onClose={() => setDrawerOpen(false)}
            />
        </div>
    );
};

export default UserOtpsList;
