import React, { useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import FilterBar from '../../components/common/FilterBar';
import StatusPill from '../../components/common/StatusPill';
import { UserNameCell } from '../../components/common/UserAvatar';
import { useServerTable } from '../../hooks/useServerTable';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { serverTablePagination } from '../../utils/serverTable';

const inr = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const HistoryList = () => {
  const apiFn = useCallback((params, signal) => adminApi.bookings(params, { signal }), []);
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
    status: '',
    paymentStatus: '',
    fromDate: '',
    toDate: '',
  });

  const { searchInput, onSearchChange, resetSearch } = useDebouncedSearch(updateFilters);
  const hasActiveFilters = Boolean(query.search || query.status || query.paymentStatus || query.fromDate || query.toDate);
  const dateRange = query.fromDate && query.toDate ? [dayjs(query.fromDate), dayjs(query.toDate)] : null;

  const filters = useMemo(() => [
    {
      key: 'status',
      placeholder: 'Visit status',
      value: query.status,
      onChange: value => updateFilters({ status: value }),
      options: [
        { value: 'COMPLETED', label: 'Paid visit' },
        { value: 'CANCELLED', label: 'Cancelled' },
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
  ], [query.status, query.paymentStatus, updateFilters]);

  return (
    <div>
      <PageHeader title="History" description="All paid visits across customers and hosts." />
      <FilterBar
        search={searchInput}
        searchPlaceholder="Search toilet, customer, phone, or booking ID"
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
          updateFilters({ search: '', status: '', paymentStatus: '', fromDate: '', toDate: '' });
        }}
      />
      <DataTable
        rowKey="id"
        loading={loading}
        dataSource={data}
        scroll={{ x: 960 }}
        pagination={serverTablePagination(query, serverPagination, updatePage)}
        columns={[
          {
            title: 'Toilet',
            dataIndex: 'toiletName',
            render: value => <span className="pnp-cell-strong">{value || '—'}</span>,
          },
          {
            title: 'Customer',
            render: row => (
              <UserNameCell
                user={row.user}
                name={row.user?.name || row.userId}
                size={28}
              />
            ),
          },
          {
            title: 'Phone',
            render: row => <span className="pnp-cell-muted">{row.user?.phone || '—'}</span>,
          },
          {
            title: 'Date',
            dataIndex: 'date',
            render: value => <span className="pnp-cell-muted">{value || '—'}</span>,
          },
          {
            title: 'Time',
            dataIndex: 'time',
            render: value => <span className="pnp-cell-muted">{value || '—'}</span>,
          },
          {
            title: 'Amount',
            dataIndex: 'amount',
            align: 'right',
            render: value => <span className="pnp-cell-amount">{inr(value)}</span>,
          },
          {
            title: 'Payment',
            dataIndex: 'paymentStatus',
            render: value => <StatusPill value={value} />,
          },
          {
            title: 'Status',
            dataIndex: 'bookingStatus',
            render: value => <StatusPill value={value} />,
          },
        ]}
      />
    </div>
  );
};

export default HistoryList;
