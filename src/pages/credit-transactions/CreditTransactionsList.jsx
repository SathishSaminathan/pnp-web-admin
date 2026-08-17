import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Form, notification } from 'antd';
import {
    ReloadOutlined,
    CreditCardOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DollarOutlined,
} from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';
import {
    fetchCreditTransactions,
    approveCreditTransaction,
    rejectCreditTransaction,
    patchListItem,
    selectCreditTransactionsList,
    selectCreditTransactionsMeta,
    selectCreditTransactionsCounts,
    selectCreditTransactionsLoading,
    selectCreditTransactionActionLoading,
} from '../../store/slices/creditTransactionsSlice';
import { useMetaCounts } from '../../hooks/useMetaCounts';
import { CAN_APPROVE, CAN_REJECT } from './constants';
import StatCard from './components/StatCard';
import CreditTxFilters from './components/CreditTxFilters';
import ActionModal from './components/ActionModal';
import useColumns from './components/useColumns';
import CreditTransactionDetailDrawer from './components/CreditTransactionDetailDrawer';

/* ─── Stable default for credit transaction counts (defined outside component) ─── */
const CREDIT_COUNT_DEFAULTS = { initiated: 0, approved: 0, completed: 0, rejected: 0 };

/* ─── MAIN PAGE ─────────────────────────────────────────────────────────────── */
const CreditTransactionsList = () => {
    const dispatch  = useDispatch();
    const { isDark } = useTheme();

    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    /* ── Redux state ── */
    const transactions   = useSelector(selectCreditTransactionsList);
    const meta           = useSelector(selectCreditTransactionsMeta);
    const rawCounts      = useSelector(selectCreditTransactionsCounts);
    const listLoading    = useSelector(selectCreditTransactionsLoading);
    const actionLoading  = useSelector(selectCreditTransactionActionLoading);

    /* ── Summary counts from API meta — never derived from table rows ── */
    const creditCounts = useMetaCounts(rawCounts, CREDIT_COUNT_DEFAULTS);

    /* ── Pagination ── */
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

    /* ── Filters ── */
    const [search, setSearch]             = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterMethod, setFilterMethod] = useState('');
    const [dateRange, setDateRange]       = useState(null); // [dayjs, dayjs] | null

    /* ── Drawer ── */
    const [drawerOpen, setDrawerOpen]       = useState(false);
    const [selectedId, setSelectedId]       = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);

    /* ── Copy-to-clipboard flash state ── */
    const [copiedId, setCopiedId] = useState(null);

    /* ── Action modal ── */
    const [actionModal, setActionModal]   = useState(null); // 'approve' | 'reject' | null
    const [actionTarget, setActionTarget] = useState(null);
    const [modalError, setModalError]     = useState(null);
    const [form]                          = Form.useForm();

    /* ── Fetch ──────────────────────────────────────────────────────────────── */
    // buildParams accepts optional overrides so callers can pass a freshly-set
    // value before React has re-rendered (avoids stale-closure bugs).
    const buildParams = useCallback(
        (page = 1, pageSize = 20, overrides = {}) => {
            const s  = (overrides.search  !== undefined ? overrides.search  : search).trim();
            const st =  overrides.status  !== undefined ? overrides.status  : filterStatus;
            const m  =  overrides.method  !== undefined ? overrides.method  : filterMethod;
            const dr =  overrides.dateRange !== undefined ? overrides.dateRange : dateRange;
            const p = { page, limit: pageSize, sort: 'createdAt:-1' };
            if (s)       p.merchantEmail = s;
            if (st)      p.status        = st;
            if (m)       p.paymentMethod = m;
            if (dr?.[0]) p.dateFrom      = dr[0].startOf('day').toISOString();
            if (dr?.[1]) p.dateTo        = dr[1].endOf('day').toISOString();
            return p;
        },
        [search, filterStatus, filterMethod, dateRange],
    );

    const load = useCallback(
        (page = 1, pageSize = 20, overrides = {}) => {
            dispatch(fetchCreditTransactions(buildParams(page, pageSize, overrides)));
        },
        [dispatch, buildParams],
    );

    // Initial load on mount.
    useEffect(() => {
        load(1, pagination.pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Re-fetch whenever a dropdown / picker filter changes.
    // useEffect fires AFTER the render where state updated, so buildParams
    // reads the fresh value — no stale-closure issue.
    const filtersInitialized = useRef(false);
    useEffect(() => {
        if (!filtersInitialized.current) {
            filtersInitialized.current = true;
            return; // skip — initial load handled by the [] effect above
        }
        setPagination((prev) => ({ ...prev, current: 1 }));
        load(1, pagination.pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterStatus, filterMethod, dateRange]);

    /* Sync pagination total from meta */
    useEffect(() => {
        const p = meta?.pagination;
        if (p) {
            setPagination((prev) => ({
                ...prev,
                current: p.currentPage,
                pageSize: p.limit,
                total: p.totalRecords,
            }));
        }
    }, [meta]);

    /* ── Handlers ──────────────────────────────────────────────────────────── */
    const handleTableChange = (p) => {
        setPagination((prev) => ({ ...prev, current: p.current, pageSize: p.pageSize }));
        load(p.current, p.pageSize);
    };

    // Pass fresh value as an override so buildParams doesn't read stale search state.
    const handleSearch = (v) => {
        const trimmed = v.trim();
        setSearch(trimmed);
        setPagination((prev) => ({ ...prev, current: 1 }));
        load(1, pagination.pageSize, { search: trimmed });
    };

    const handleRefresh = () => load(pagination.current, pagination.pageSize);

    const openDrawer = (record) => {
        setSelectedId(record._id);
        setSelectedRecord(record);
        setDrawerOpen(true);
    };

    const openAction = (type, record) => {
        setActionTarget(record);
        setActionModal(type);
        form.resetFields();
    };

    const closeAction = () => {
        setActionModal(null);
        setActionTarget(null);
        setModalError(null);
        form.resetFields();
    };

    const handleActionSubmit = async () => {
        let values;
        try {
            values = await form.validateFields();
        } catch {
            return;
        }
        setModalError(null);

        const id = actionTarget._id;
        const result = actionModal === 'approve'
            ? await dispatch(approveCreditTransaction({ id, notes: values.notes ?? '' }))
            : await dispatch(rejectCreditTransaction({ id, reason: values.reason ?? '' }));

        if (result.meta.requestStatus === 'fulfilled') {
            notification.success({
                message: actionModal === 'approve'
                    ? 'Credit transaction approved successfully'
                    : 'Credit transaction rejected',
            });
            dispatch(patchListItem({
                id,
                changes: { status: actionModal === 'approve' ? 'Approved' : 'Rejected' },
            }));
            closeAction();
            if (drawerOpen && selectedId === id) {
                setSelectedId(id);
            }
        } else {
            // Show the backend error message inline inside the modal
            setModalError(result.payload ?? 'An unexpected error occurred. Please try again.');
        }
    };

    /* ── Table columns ─────────────────────────────────────────────────────── */
    const columns = useColumns({ isMobile, copiedId, setCopiedId, openDrawer, openAction });

    /* ── Render ────────────────────────────────────────────────────────────── */
    return (
        <div style={{ background: 'var(--bg-app)', minHeight: '100vh', padding: isMobile ? 12 : 24 }}>
            {/* Page header */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg"
                        style={{ background: 'linear-gradient(135deg,#4f46e5,#06b6d4)' }}
                    >
                        <CreditCardOutlined />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>
                            Credit Transactions
                        </h1>
                        <p className="text-xs m-0" style={{ color: 'var(--text-muted)' }}>
                            Manage and review merchant credit transactions
                        </p>
                    </div>
                </div>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={handleRefresh}
                    loading={listLoading}
                    style={{
                        background: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                        color: 'var(--text-primary)',
                    }}
                >
                    {!isMobile && 'Refresh'}
                </Button>
            </div>

            {/* Summary stats */}
            <div className="flex gap-3 mb-5 flex-wrap">
                <StatCard label="Initiated"  value={creditCounts.initiated} color="#3b82f6" icon={<CreditCardOutlined />} isDark={isDark} />
                <StatCard label="Approved"   value={creditCounts.approved}  color="#10b981" icon={<CheckCircleOutlined />} isDark={isDark} />
                <StatCard label="Completed"  value={creditCounts.completed} color="#8b5cf6" icon={<DollarOutlined />}     isDark={isDark} />
                <StatCard label="Rejected"   value={creditCounts.rejected}  color="#ef4444" icon={<CloseCircleOutlined />} isDark={isDark} />
            </div>

            {/* Filters */}
            <CreditTxFilters
                search={search}
                setSearch={setSearch}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterMethod={filterMethod}
                setFilterMethod={setFilterMethod}
                dateRange={dateRange}
                setDateRange={setDateRange}
                handleSearch={handleSearch}
                isMobile={isMobile}
                isDark={isDark}
            />

            {/* Table */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{
                    background: isDark ? 'var(--bg-card)' : '#fff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
                    boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.05)',
                }}
            >
                <Table
                    dataSource={transactions}
                    columns={columns}
                    rowKey="_id"
                    loading={listLoading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        showQuickJumper: !isMobile,
                        pageSizeOptions: ['10', '20', '50'],
                        showTotal: (total, range) =>
                            isMobile ? `${total} records` : `${range[0]}–${range[1]} of ${total} records`,
                        style: { padding: '12px 16px' },
                    }}
                    className="custom-minimal-table"
                    onChange={handleTableChange}
                    scroll={{ x: isMobile ? 500 : 900 }}
                    onRow={(r) => ({
                        style: { cursor: 'pointer' },
                        onClick: () => openDrawer(r),
                    })}
                    size="middle"
                    style={{
                        '--table-header-bg': isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                    }}
                    // Ant Design token override via className hook removed — handled via index.css
                />
            </div>

            {/* Detail Drawer */}
            <CreditTransactionDetailDrawer
                open={drawerOpen}
                transactionId={selectedId}
                onClose={() => { setDrawerOpen(false); setSelectedId(null); setSelectedRecord(null); }}
                isDark={isDark}
                canApprove={selectedRecord && CAN_APPROVE.includes(selectedRecord.status)}
                canReject={selectedRecord && CAN_REJECT.includes(selectedRecord.status)}
                actionLoading={actionLoading}
                onApprove={(d) => { setDrawerOpen(false); openAction('approve', d); }}
                onReject={(d) => { setDrawerOpen(false); openAction('reject', d); }}
            />

            {/* Approve / Reject Modal */}
            <ActionModal
                actionModal={actionModal}
                actionTarget={actionTarget}
                actionLoading={actionLoading}
                modalError={modalError}
                isDark={isDark}
                form={form}
                handleActionSubmit={handleActionSubmit}
                closeAction={closeAction}
            />
        </div>
    );
};

export default CreditTransactionsList;
