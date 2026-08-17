import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Modal, message } from 'antd';
import {
    ReloadOutlined,
    PoweroffOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
} from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';
import {
    fetchUserSessions,
    terminateUserSession,
    terminateAllUserSessions,
    selectUserSessionsList,
    selectUserSessionsMeta,
    selectUserSessionsLoading,
    selectUserSessionsActionLoading,
} from '../../store/slices/userSessionsSlice';
import {
    SessionDetailDrawer,
    MapEmbed,
    StatCard,
    SessionFilters,
    TerminateAllModal,
    getSessionColumns,
} from './components';
import { extractMetaCounts } from '../../utils/extractMetaCounts';
import { mapCardsFromMeta } from '../../utils/mapCardsFromMeta';
import { merchantsApi } from '../../api/modules/merchants';

const DEFAULT_PAGE_SIZE = 20;

const CARD_CONFIG = [
    { label: 'Active',     key: 'active',     color: '#10b981', icon: <CheckCircleOutlined /> },
    { label: 'Terminated', key: 'terminated', color: '#ef4444', icon: <CloseCircleOutlined /> },
    { label: 'Expired',    key: 'expired',    color: '#64748b', icon: <ClockCircleOutlined /> },
];

/* ══════════════════════════════════════════════════════════════════════════ */
const UserSessionsList = () => {
    const dispatch       = useDispatch();
    const { isDark }     = useTheme();

    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const sessions      = useSelector(selectUserSessionsList);
    const meta          = useSelector(selectUserSessionsMeta);
    const listLoading   = useSelector(selectUserSessionsLoading);
    const actionLoading = useSelector(selectUserSessionsActionLoading);

    const [pagination,       setPagination]       = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });
    const [filterStatus,     setFilterStatus]     = useState('');
    const [filterUserId,     setFilterUserId]     = useState('');
    const [dateRange,        setDateRange]        = useState([null, null]);
    const [includeDeleted,   setIncludeDeleted]   = useState(false);
    const [drawerOpen,       setDrawerOpen]       = useState(false);
    const [selectedRecord,   setSelectedRecord]   = useState(null);
    const [terminateAllOpen, setTerminateAllOpen] = useState(false);
    const [merchantOptions,  setMerchantOptions]  = useState([]);
    const [merchantLoading,  setMerchantLoading]  = useState(false);
    const merchantDebounce = useRef(null);
    const [mapModalRecord,   setMapModalRecord]   = useState(null);
    const [copiedId,         setCopiedId]         = useState(null);

    /* ── Params builder ── */
    const buildParams = useCallback((page, limit, overrides = {}) => {
        const active = { filterStatus, filterUserId, dateRange, includeDeleted, ...overrides };
        const params = { page, limit, sort: 'createdAt:-1' };
        if (active.filterStatus)         params.isActive      = active.filterStatus === 'active' ? 'true' : active.filterStatus === 'terminated' ? 'false' : undefined;
        if (active.filterUserId?.trim()) params.userId        = active.filterUserId.trim();
        if (active.includeDeleted)       params.includeDeleted = 'true';
        if (active.dateRange?.[0])       params.dateFrom      = active.dateRange[0].toISOString();
        if (active.dateRange?.[1])       params.dateTo        = active.dateRange[1].toISOString();
        Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);
        return params;
    }, [filterStatus, filterUserId, dateRange, includeDeleted]);

    const fetchSessions = useCallback((page = 1, limit = DEFAULT_PAGE_SIZE, overrides = {}) => {
        dispatch(fetchUserSessions(buildParams(page, limit, overrides)));
    }, [dispatch, buildParams]);

    useEffect(() => {
        const p = meta?.pagination;
        if (p) setPagination({ current: p.currentPage, pageSize: p.limit, total: p.totalRecords });
    }, [meta]);

    useEffect(() => { fetchSessions(); }, []); // eslint-disable-line

    /* ── Handlers ── */
    const handleTableChange = (p) => fetchSessions(p.current, p.pageSize);
    const handleRefresh     = () => fetchSessions(pagination.current, pagination.pageSize);

    const handleTerminate = async (record) => {
        try {
            await dispatch(terminateUserSession(record._id)).unwrap();
            message.success('Session terminated');
            if (drawerOpen && selectedRecord?._id === record._id) {
                setSelectedRecord((prev) => prev ? { ...prev, isActive: false, isDelete: true } : prev);
            }
        } catch (err) { message.error(err || 'Failed to terminate session'); }
    };

    const handleTerminateAll = async (values) => {
        try {
            await dispatch(terminateAllUserSessions({ userId: values.userId, reason: values.reason })).unwrap();
            message.success('All sessions terminated');
            setTerminateAllOpen(false);
            fetchSessions(1, pagination.pageSize);
        } catch (err) { message.error(err || 'Failed to terminate sessions'); }
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

    const handleMerchantSearch = (v) => {
        clearTimeout(merchantDebounce.current);
        merchantDebounce.current = setTimeout(() => searchMerchants(v), 350);
    };

    /* ── Columns ── */
    const columns = getSessionColumns({
        isMobile,
        onView:      (record) => { setSelectedRecord(record); setDrawerOpen(true); },
        onTerminate: handleTerminate,
        onOpenMap:   setMapModalRecord,
        copiedId,
        setCopiedId,
    });

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>
                        User Sessions
                    </h2>
                    <p className="text-sm m-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Browse and manage all merchant user login sessions
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        danger
                        icon={<PoweroffOutlined />}
                        onClick={() => setTerminateAllOpen(true)}
                        style={{ borderRadius: 10 }}
                    >
                        {!isMobile && 'Terminate All'}
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        loading={listLoading}
                        style={{ borderRadius: 10, borderColor: 'var(--border-color)', color: 'var(--text-secondary)', background: 'var(--input-bg)' }}
                    >
                        {!isMobile && 'Refresh'}
                    </Button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-3">
                {mapCardsFromMeta(CARD_CONFIG, extractMetaCounts(meta)).map((card) => (
                    <StatCard key={card.key} {...card} />
                ))}
            </div>

            {/* Filters */}
            <SessionFilters
                filterStatus={filterStatus}
                includeDeleted={includeDeleted}
                merchantOptions={merchantOptions}
                merchantLoading={merchantLoading}
                onStatusChange={(v) => {
                    setFilterStatus(v ?? '');
                    fetchSessions(1, pagination.pageSize, { filterStatus: v ?? '' });
                }}
                onMerchantSearch={handleMerchantSearch}
                onMerchantChange={(v) => {
                    setFilterUserId(v ?? '');
                    fetchSessions(1, pagination.pageSize, { filterUserId: v ?? '' });
                }}
                onDateRangeChange={(v) => {
                    const range = v ?? [null, null];
                    setDateRange(range);
                    fetchSessions(1, pagination.pageSize, { dateRange: range });
                }}
                onIncludeDeletedChange={(v) => {
                    const val = v === 'true';
                    setIncludeDeleted(val);
                    fetchSessions(1, pagination.pageSize, { includeDeleted: val });
                }}
            />

            {/* Table */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}
            >
                <Table
                    className="custom-minimal-table"
                    rowKey="_id"
                    dataSource={sessions}
                    columns={columns}
                    loading={listLoading}
                    scroll={{ x: 'max-content' }}
                    sticky
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
                        showTotal: (total) => `Total ${total} sessions`,
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
            <SessionDetailDrawer
                open={drawerOpen}
                session={selectedRecord}
                onClose={() => setDrawerOpen(false)}
                onTerminated={() => {
                    setSelectedRecord((prev) => prev ? { ...prev, isActive: false, isDelete: true } : prev);
                    fetchSessions(pagination.current, pagination.pageSize);
                }}
            />

            {/* Map Modal */}
            <Modal
                open={!!mapModalRecord}
                onCancel={() => setMapModalRecord(null)}
                footer={null}
                title={
                    <div className="flex items-center gap-2">
                        <EnvironmentOutlined style={{ color: '#10b981' }} />
                        <span style={{ color: 'var(--text-primary)' }}>Session Location</span>
                        {mapModalRecord?.location && (
                            <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>— {mapModalRecord.location}</span>
                        )}
                    </div>
                }
                width={isMobile ? 'calc(100vw - 24px)' : 560}
                centered
                styles={{
                    content: { background: 'var(--bg-card)', padding: 0 },
                    header: { background: 'var(--bg-card)', padding: '14px 20px', borderBottom: '1px solid var(--border-color)' },
                }}
                destroyOnHidden
            >
                {mapModalRecord && (
                    <MapEmbed
                        key={mapModalRecord._id}
                        lat={mapModalRecord.latitude}
                        lng={mapModalRecord.longitude}
                        isDark={isDark}
                        height={isMobile ? 220 : 340}
                    />
                )}
            </Modal>

            {/* Terminate All Modal */}
            <TerminateAllModal
                open={terminateAllOpen}
                loading={actionLoading}
                merchantOptions={merchantOptions}
                merchantLoading={merchantLoading}
                onMerchantSearch={handleMerchantSearch}
                onClose={() => setTerminateAllOpen(false)}
                onFinish={handleTerminateAll}
            />
        </div>
    );
};

export default UserSessionsList;
