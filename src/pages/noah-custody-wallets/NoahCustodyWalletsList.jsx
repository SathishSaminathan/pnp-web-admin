import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, message } from 'antd';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    StopOutlined,
} from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';
import {
    fetchNoahCustodyWallets,
    selectNoahWalletsList,
    selectNoahWalletsMeta,
    selectNoahWalletsLoading,
} from '../../store/slices/noahCustodyWalletsSlice';
import { noahCustodyWalletsApi } from '../../api/modules/noahCustodyWallets';
import { extractMetaCounts } from '../../utils/extractMetaCounts';
import { mapCardsFromMeta } from '../../utils/mapCardsFromMeta';
import {
    NoahWalletStatCard,
    NoahWalletFilters,
    useNoahWalletColumns,
    NoahWalletDetailDrawer,
} from './components';

const DEFAULT_PAGE_SIZE = 20;

const CARD_CONFIG = [
    { label: 'Live',             key: 'live',     color: '#10b981', icon: <CheckCircleOutlined /> },
    { label: 'Pending',          key: 'pending',  color: '#f59e0b', icon: <ClockCircleOutlined /> },
    { label: 'Inactive / Other', key: 'inactiveOrOthers', color: '#6b7280', icon: <StopOutlined /> },
];

const NoahCustodyWalletsList = () => {
    const dispatch   = useDispatch();
    const { isDark } = useTheme();

    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const wallets     = useSelector(selectNoahWalletsList);
    const meta        = useSelector(selectNoahWalletsMeta);
    const listLoading = useSelector(selectNoahWalletsLoading);

    const [pagination, setPagination] = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });

    const [userId,           setUserId]           = useState('');
    const [filterBlockchain, setFilterBlockchain] = useState('');
    const [filterNetwork,    setFilterNetwork]    = useState('');
    const [filterState,      setFilterState]      = useState('');
    const [filterIsActive,   setFilterIsActive]   = useState('');
    const [dateRange,        setDateRange]        = useState([null, null]);
    const [includeDeleted,   setIncludeDeleted]   = useState(false);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [syncingId,  setSyncingId]  = useState(null);
    const [copiedId,   setCopiedId]   = useState(null);

    const fetchWallets = useCallback(
        (page = 1, limit = DEFAULT_PAGE_SIZE, overrides = {}) => {
            const active = {
                userId, filterBlockchain, filterNetwork,
                filterState, filterIsActive, dateRange, includeDeleted,
                ...overrides,
            };
            const params = { page, limit, sort: 'createdAt:-1' };
            if (active.userId?.trim())         params.userId         = active.userId.trim();
            if (active.filterBlockchain)       params.blockchain     = active.filterBlockchain;
            if (active.filterNetwork)          params.network        = active.filterNetwork;
            if (active.filterState)            params.state          = active.filterState;
            if (active.filterIsActive !== '')  params.isActive       = active.filterIsActive;
            if (active.includeDeleted)         params.includeDeleted = 'true';
            if (active.dateRange?.[0])         params.dateFrom       = active.dateRange[0].toISOString();
            if (active.dateRange?.[1])         params.dateTo         = active.dateRange[1].toISOString();
            dispatch(fetchNoahCustodyWallets(params));
        },
        [dispatch, userId, filterBlockchain, filterNetwork, filterState, filterIsActive, dateRange, includeDeleted],
    );

    useEffect(() => {
        const p = meta?.pagination;
        if (p) setPagination({ current: p.currentPage, pageSize: p.limit, total: p.totalRecords });
    }, [meta]);

    useEffect(() => {
        fetchWallets(1, DEFAULT_PAGE_SIZE);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTableChange = (p) => fetchWallets(p.current, p.pageSize);
    const handleRefresh     = () => fetchWallets(pagination.current, pagination.pageSize);

    const makeFilterHandler = (setter, key) => (v) => {
        setter(v);
        fetchWallets(1, pagination.pageSize, { [key]: v });
    };

    const handleUserId = makeFilterHandler(setUserId, 'userId');

    const handleFilterBlockchain = makeFilterHandler(setFilterBlockchain, 'filterBlockchain');
    const handleFilterNetwork    = makeFilterHandler(setFilterNetwork,    'filterNetwork');
    const handleFilterState      = makeFilterHandler(setFilterState,      'filterState');
    const handleFilterIsActive   = makeFilterHandler(setFilterIsActive,   'filterIsActive');

    const handleIncludeDeleted = (checked) => {
        setIncludeDeleted(checked);
        fetchWallets(1, pagination.pageSize, { includeDeleted: checked });
    };

    const handleDateRange = (v) => {
        const range = v ?? [null, null];
        setDateRange(range);
        fetchWallets(1, pagination.pageSize, { dateRange: range });
    };

    const handleView = (record) => {
        setSelectedId(record._id);
        setDrawerOpen(true);
    };

    const handleSync = async (record) => {
        if (syncingId) return;
        setSyncingId(record._id);
        try {
            const res = await noahCustodyWalletsApi.syncBalance(record._id);
            if (res?.success || res?.data?.synced) {
                message.success(res?.message ?? 'Balance synced successfully');
                fetchWallets(pagination.current, pagination.pageSize);
            } else {
                message.error(res?.message ?? 'Sync failed');
            }
        } catch (err) {
            if (!err?.handled) {
                const msg = err?.response?.data?.message ?? err?.message ?? 'Sync failed';
                message.error(msg);
            }
        } finally {
            setSyncingId(null);
        }
    };

    const metaCounts = extractMetaCounts(meta);
    const columns = useNoahWalletColumns({ isMobile, onView: handleView, onSync: handleSync, syncingId, copiedId, setCopiedId });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>
                        Noah Custody Wallets
                    </h2>
                    <p className="text-sm m-0 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Circle developer-controlled wallets for Noah bank integration
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {mapCardsFromMeta(CARD_CONFIG, metaCounts).map((card) => (
                    <NoahWalletStatCard key={card.key} {...card} />
                ))}
            </div>

            <NoahWalletFilters
                userId={userId}
                onUserId={handleUserId}
                filterBlockchain={filterBlockchain}
                onFilterBlockchain={handleFilterBlockchain}
                filterNetwork={filterNetwork}
                onFilterNetwork={handleFilterNetwork}
                filterState={filterState}
                onFilterState={handleFilterState}
                filterIsActive={filterIsActive}
                onFilterIsActive={handleFilterIsActive}
                dateRange={dateRange}
                onDateRange={handleDateRange}
                includeDeleted={includeDeleted}
                onIncludeDeleted={handleIncludeDeleted}
                loading={listLoading}
                onRefresh={handleRefresh}
                isMobile={isMobile}
                isDark={isDark}
            />

            <div
                className="rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card)' }}
            >
                <Table
                    columns={columns}
                    dataSource={wallets}
                    rowKey="_id"
                    loading={listLoading}
                    onChange={handleTableChange}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                    }}
                    className="custom-minimal-table"
                    scroll={{ x: isMobile ? 900 : 1300 }}
                    sticky
                    onRow={(record) => ({ onClick: () => handleView(record), style: { cursor: 'pointer' } })}
                />
            </div>

            <NoahWalletDetailDrawer
                open={drawerOpen}
                walletId={selectedId}
                onClose={() => { setDrawerOpen(false); setSelectedId(null); }}
                isDark={isDark}
            />
        </div>
    );
};

export default NoahCustodyWalletsList;
