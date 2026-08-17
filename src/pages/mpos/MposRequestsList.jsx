import React, { useEffect, useState, useCallback } from 'react';
import {
    Table, Button, Select, Space, Tooltip, Dropdown, Popconfirm, message,
} from 'antd';
import {
    EyeOutlined,
    ReloadOutlined,
    MoreOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeFilled,
    SyncOutlined,
    MobileOutlined,
    ClockCircleOutlined,
    CheckSquareOutlined,
    StopOutlined,
} from '@ant-design/icons';
import { mposApi } from '../../api/modules/mpos';
import { useTheme } from '../../context/ThemeContext';
import { DEFAULT_PAGE_SIZE, STATUS_FILTER_OPTIONS, MPOS_STATUS_CONFIG } from '../../constants/mpos';
import { resolveMetaCounts } from '../../utils/resolveMetaCounts';
import MposStatusTag from './MposStatusTag';
import MposDetailDrawer from './MposDetailDrawer';
import ReviewModal from './ReviewModal';
import ApproveModal from './ApproveModal';
import RejectModal from './RejectModal';

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

/* ─── Stable default for MPOS status counts ─── */
const MPOS_COUNT_DEFAULTS = { pending: 0, underReview: 0, approved: 0, rejected: 0 };

/* ─── MAIN PAGE ──────────────────────────────────────────────────────────── */
const MposRequestsList = () => {
    useTheme();

    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    /* ── Data state ── */
    const [requests, setRequests]     = useState([]);
    const [loading, setLoading]       = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });
    const [mposCounts, setMposCounts] = useState(MPOS_COUNT_DEFAULTS);

    /* ── Filters ── */
    const [filterStatus, setFilterStatus] = useState('Pending');

    /* ── Drawer ── */
    const [drawerOpen, setDrawerOpen]   = useState(false);
    const [drawerRecord, setDrawerRecord] = useState(null);

    /* ── Modal state ── */
    const [reviewOpen, setReviewOpen]   = useState(false);
    const [reviewTarget, setReviewTarget] = useState(null);
    const [reviewLoading, setReviewLoading] = useState(false);

    const [approveOpen, setApproveOpen] = useState(false);
    const [approveTarget, setApproveTarget] = useState(null);
    const [approveLoading, setApproveLoading] = useState(false);

    const [rejectOpen, setRejectOpen]   = useState(false);
    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectLoading, setRejectLoading] = useState(false);

    const [retryingId, setRetryingId]   = useState(null);

    /* ── Fetch ── */
    const fetchRequests = useCallback(async (page = 1, limit = DEFAULT_PAGE_SIZE, status = filterStatus) => {
        setLoading(true);
        try {
            const params = { page, limit };
            if (status) params.status = status;
            const res = await mposApi.getAll(params);
            const data = res?.data ?? res ?? [];
            setRequests(Array.isArray(data) ? data : []);
            setMposCounts(resolveMetaCounts(res?.statusCounts, MPOS_COUNT_DEFAULTS));
            if (res?.meta?.pagination) {
                const p = res.meta.pagination;
                setPagination({ current: p.currentPage, pageSize: p.limit, total: p.totalRecords });
            }
        } catch {
            // axios interceptor handles error toast
        } finally {
            setLoading(false);
        }
    }, [filterStatus]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchRequests(); }, []);

    const handleRefresh = () => fetchRequests(pagination.current, pagination.pageSize, filterStatus);

    /* ── Drawer action handler (from inside the drawer) ── */
    const handleDrawerAction = (action, record) => {
        setDrawerOpen(false);
        if (action === 'review')  { setReviewTarget(record);  setReviewOpen(true);  }
        if (action === 'approve') { setApproveTarget(record); setApproveOpen(true); }
        if (action === 'reject')  { setRejectTarget(record);  setRejectOpen(true);  }
        if (action === 'retry')   handleRetry(record);
    };

    /* ── Review ── */
    const handleReviewSubmit = async (payload) => {
        setReviewLoading(true);
        try {
            await mposApi.markUnderReview(reviewTarget._id, payload);
            message.success('Moved to Under Review');
            setReviewOpen(false);
            fetchRequests(1, pagination.pageSize, filterStatus);
        } catch {
            // handled by interceptor
        } finally {
            setReviewLoading(false);
        }
    };

    /* ── Approve ── */
    const handleApproveSubmit = async (payload) => {
        setApproveLoading(true);
        try {
            await mposApi.approve(approveTarget._id, payload);
            message.success('MPOS account approved and wallets provisioned');
            setApproveOpen(false);
            fetchRequests(1, pagination.pageSize, filterStatus);
        } catch {
            // handled by interceptor
        } finally {
            setApproveLoading(false);
        }
    };

    /* ── Reject ── */
    const handleRejectSubmit = async (payload) => {
        setRejectLoading(true);
        try {
            await mposApi.reject(rejectTarget._id, payload);
            message.success('MPOS account rejected');
            setRejectOpen(false);
            fetchRequests(1, pagination.pageSize, filterStatus);
        } catch {
            // handled by interceptor
        } finally {
            setRejectLoading(false);
        }
    };

    /* ── Retry wallet ── */
    const handleRetry = async (record) => {
        setRetryingId(record._id);
        try {
            await mposApi.retryWallet(record._id);
            message.success('Wallets provisioned successfully');
            fetchRequests(pagination.current, pagination.pageSize, filterStatus);
        } catch {
            // handled by interceptor
        } finally {
            setRetryingId(null);
        }
    };

    /* ── Row action menu ── */
    const getRowMenu = (record) => {
        const items = [
            {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'View Details',
                onClick: () => { setDrawerRecord(record); setDrawerOpen(true); },
            },
        ];
        if (record.approvalStatus === 'Pending') {
            items.push({
                key: 'review',
                icon: <EyeFilled style={{ color: '#3b82f6' }} />,
                label: <span style={{ color: '#3b82f6' }}>Mark Under Review</span>,
                onClick: () => { setReviewTarget(record); setReviewOpen(true); },
            });
        }
        if (record.approvalStatus === 'Pending' || record.approvalStatus === 'Under Review') {
            items.push(
                {
                    key: 'approve',
                    icon: <CheckCircleOutlined style={{ color: '#10b981' }} />,
                    label: <span style={{ color: '#10b981' }}>Approve</span>,
                    onClick: () => { setApproveTarget(record); setApproveOpen(true); },
                },
                {
                    key: 'reject',
                    icon: <CloseCircleOutlined style={{ color: '#ef4444' }} />,
                    label: <span style={{ color: '#ef4444' }}>Reject</span>,
                    onClick: () => { setRejectTarget(record); setRejectOpen(true); },
                }
            );
        }
        if (record.approvalStatus === 'Approved') {
            items.push({
                key: 'retry',
                icon: <SyncOutlined style={{ color: '#8b5cf6' }} />,
                label: <span style={{ color: '#8b5cf6' }}>Retry Wallet Provisioning</span>,
                onClick: () => handleRetry(record),
            });
        }
        return { onClick: ({ domEvent }) => domEvent.stopPropagation(), items };
    };

    /* ── Columns ── */
    const columns = [
        {
            title: 'Business',
            key: 'business',
            render: (_, r) => {
                const biz = r?.userId?.businessInfo ?? {};
                const email = r?.userId?.email ?? '';
                return (
                    <div>
                        <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {biz.businessName ?? '—'}
                        </div>
                        <div className="text-xs mt-0.5 truncate max-w-50" style={{ color: 'var(--text-muted)' }}>
                            {email}
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Wallet',
            dataIndex: 'walletType',
            key: 'walletType',
            render: (v) => (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                    {v ?? '—'}
                </span>
            ),
            responsive: ['md'],
        },
        {
            title: 'Settlement',
            key: 'settlement',
            render: (_, r) => (
                <div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{r.settlementFrequency ?? '—'}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.settlementMode ?? '—'}</div>
                </div>
            ),
            responsive: ['lg'],
        },
        {
            title: 'Status',
            dataIndex: 'approvalStatus',
            key: 'approvalStatus',
            render: (v) => <MposStatusTag status={v} />,
        },
        {
            title: 'Submitted',
            dataIndex: 'submittedAt',
            key: 'submittedAt',
            render: (v) => (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {v ? new Date(v).toLocaleDateString() : '—'}
                </span>
            ),
            responsive: ['md'],
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
                        loading={retryingId === r._id}
                        className="flex items-center justify-center"
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
                        MPOS Account Approval
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Review, approve, or reject merchant MPOS account requests
                    </p>
                </div>
                <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading} style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                    Refresh
                </Button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Pending"      value={mposCounts.pending}     color={MPOS_STATUS_CONFIG['Pending'].color}        icon={<ClockCircleOutlined />} />
                <StatCard label="Under Review" value={mposCounts.underReview} color={MPOS_STATUS_CONFIG['Under Review'].color}   icon={<EyeFilled />} />
                <StatCard label="Approved"     value={mposCounts.approved}    color={MPOS_STATUS_CONFIG['Approved'].color}       icon={<CheckSquareOutlined />} />
                <StatCard label="Rejected"     value={mposCounts.rejected}    color={MPOS_STATUS_CONFIG['Rejected'].color}       icon={<StopOutlined />} />
            </div>

            {/* Filters */}
            <div className="rounded-xl p-4 flex flex-wrap gap-3 items-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
                <Select
                    value={filterStatus}
                    onChange={(v) => { setFilterStatus(v); fetchRequests(1, pagination.pageSize, v); }}
                    options={STATUS_FILTER_OPTIONS}
                    style={{ width: 160 }}
                    styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
                />
            </div>

            {/* Table */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
                <Table
                    dataSource={requests}
                    columns={columns}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showTotal: (t) => `${t} requests`,
                        size: isMobile ? 'small' : 'default',
                    }}
                    onChange={(p) => fetchRequests(p.current, p.pageSize, filterStatus)}
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
            <MposDetailDrawer
                open={drawerOpen}
                record={drawerRecord}
                onClose={() => setDrawerOpen(false)}
                onAction={handleDrawerAction}
            />

            {/* Modals */}
            <ReviewModal
                open={reviewOpen}
                record={reviewTarget}
                onCancel={() => setReviewOpen(false)}
                onSubmit={handleReviewSubmit}
                loading={reviewLoading}
            />
            <ApproveModal
                open={approveOpen}
                record={approveTarget}
                onCancel={() => setApproveOpen(false)}
                onSubmit={handleApproveSubmit}
                loading={approveLoading}
            />
            <RejectModal
                open={rejectOpen}
                record={rejectTarget}
                onCancel={() => setRejectOpen(false)}
                onSubmit={handleRejectSubmit}
                loading={rejectLoading}
            />
        </div>
    );
};

export default MposRequestsList;
