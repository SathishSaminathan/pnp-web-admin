import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarOutlined,
  DollarCircleOutlined,
  FundOutlined,
  PercentageOutlined,
  RiseOutlined,
  TrophyOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import FilterBar from '../../components/common/FilterBar';
import StatusPill from '../../components/common/StatusPill';
import { UserNameCell } from '../../components/common/UserAvatar';
import { useServerTable } from '../../hooks/useServerTable';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { serverTablePagination } from '../../utils/serverTable';

const inr = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const EarningsPage = () => {
  const [earnings, setEarnings] = useState(null);

  const apiFn = useCallback((params, signal) => adminApi.transactions(params, { signal }), []);
  const {
    query,
    data,
    serverPagination,
    loading,
    updateFilters,
    updatePage,
  } = useServerTable(apiFn, {
    page: 1,
    limit: 10,
    search: '',
    settlementStatus: '',
    paymentStatus: '',
    fromDate: '',
    toDate: '',
  });

  const { searchInput, onSearchChange, resetSearch } = useDebouncedSearch(updateFilters);
  const hasActiveFilters = Boolean(
    query.search || query.settlementStatus || query.paymentStatus || query.fromDate || query.toDate,
  );
  const dateRange = query.fromDate && query.toDate ? [dayjs(query.fromDate), dayjs(query.toDate)] : null;

  useEffect(() => {
    adminApi.earnings().then(setEarnings).catch(() => {});
  }, []);

  const cards = [
    { label: 'Today', value: earnings?.today, color: '#3b82f6', icon: <CalendarOutlined />, hint: 'Net' },
    { label: 'This week', value: earnings?.week, color: '#6366f1', icon: <RiseOutlined />, hint: 'Net' },
    { label: 'This month', value: earnings?.month, color: '#8b5cf6', icon: <FundOutlined />, hint: 'Net' },
    { label: 'Lifetime net', value: earnings?.net ?? earnings?.total, color: '#0ea5e9', icon: <TrophyOutlined />, hint: 'Host payout' },
    { label: 'Gross', value: earnings?.gross, color: '#10b981', icon: <DollarCircleOutlined />, hint: 'Paid by users' },
    { label: 'Platform fees', value: earnings?.fees, color: '#f59e0b', icon: <PercentageOutlined />, hint: 'Commission' },
    { label: 'Visits', value: earnings?.visitCount, color: '#2563eb', icon: <WalletOutlined />, hint: 'Paid', count: true },
    { label: 'Listings', value: earnings?.listingCount, color: '#16a34a', icon: <WalletOutlined />, hint: 'Toilets', count: true },
  ];

  const filters = useMemo(() => [
    {
      key: 'settlementStatus',
      placeholder: 'Settlement',
      value: query.settlementStatus,
      onChange: value => updateFilters({ settlementStatus: value }),
      options: [
        { value: 'SETTLED', label: 'Settled' },
        { value: 'FAILED', label: 'Failed' },
      ],
    },
    {
      key: 'paymentStatus',
      placeholder: 'Payment',
      value: query.paymentStatus,
      onChange: value => updateFilters({ paymentStatus: value }),
      options: [
        { value: 'PAID', label: 'Paid' },
        { value: 'FAILED', label: 'Failed' },
      ],
    },
  ], [query.settlementStatus, query.paymentStatus, updateFilters]);

  return (
    <div>
      <PageHeader title="Earnings" description="Paid visit revenue and host payouts. Access is granted only after payment, so every transaction here is paid." />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {cards.map(card => (
          <StatCard
            key={card.label}
            icon={card.icon}
            color={card.color}
            label={card.label}
            hint={card.hint}
            loading={!earnings}
            value={
              card.count
                ? String(Number(card.value || 0))
                : inr(card.value)
            }
          />
        ))}
      </div>
      <FilterBar
        search={searchInput}
        searchPlaceholder="Search transaction, toilet, or owner"
        onSearchChange={onSearchChange}
        filters={filters}
        dateRange={dateRange}
        onDateRangeChange={dates => {
          updateFilters({
            fromDate: dates?.[0] ? dates[0].format('YYYY-MM-DD') : '',
            toDate: dates?.[1] ? dates[1].format('YYYY-MM-DD') : '',
          });
        }}
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          resetSearch();
          updateFilters({ search: '', settlementStatus: '', paymentStatus: '', fromDate: '', toDate: '' });
        }}
      />
      <DataTable
        rowKey="id"
        loading={loading}
        dataSource={data}
        skeletonLayout="earnings"
        skeletonMinWidth={1120}
        scroll={{ x: 1120 }}
        pagination={serverTablePagination(query, serverPagination, updatePage)}
        columns={[
          {
            title: 'Transaction',
            dataIndex: 'id',
            width: 150,
            fixed: 'left',
            ellipsis: true,
            render: value => <span className="pnp-cell-muted">{value}</span>,
          },
          {
            title: 'Toilet',
            dataIndex: 'toiletName',
            width: 200,
            ellipsis: true,
            render: value => <span className="pnp-cell-strong">{value || '—'}</span>,
          },
          {
            title: 'Owner',
            width: 180,
            ellipsis: true,
            render: row => (
              <UserNameCell user={row.owner} name={row.owner?.name || row.ownerId} size={28} />
            ),
          },
          {
            title: 'Gross',
            dataIndex: 'grossAmount',
            width: 110,
            align: 'right',
            render: value => <span className="pnp-cell-amount">{inr(value)}</span>,
          },
          {
            title: 'Fee',
            dataIndex: 'platformFee',
            width: 100,
            align: 'right',
            render: value => <span className="pnp-cell-muted">{inr(value)}</span>,
          },
          {
            title: 'Net',
            dataIndex: 'netAmount',
            width: 110,
            align: 'right',
            render: value => <span className="pnp-cell-amount">{inr(value)}</span>,
          },
          {
            title: 'Payment',
            dataIndex: 'paymentStatus',
            width: 120,
            render: value => <StatusPill value={value} />,
          },
          {
            title: 'Status',
            dataIndex: 'settlementStatus',
            width: 130,
            render: value => <StatusPill value={value} />,
          },
        ]}
      />
    </div>
  );
};

export default EarningsPage;
