import React, { useCallback, useMemo } from 'react';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import FilterBar from '../../components/common/FilterBar';
import ListingPhotoStrip from '../../components/common/ListingPhotoStrip';
import { UserNameCell } from '../../components/common/UserAvatar';
import { useServerTable } from '../../hooks/useServerTable';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { serverTablePagination } from '../../utils/serverTable';

const formatDate = value => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const ReviewsList = () => {
  const apiFn = useCallback((params, signal) => adminApi.reviews(params, { signal }), []);
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
    minRating: '',
  });

  const { searchInput, onSearchChange, resetSearch } = useDebouncedSearch(updateFilters);
  const hasActiveFilters = Boolean(query.search || query.minRating);

  const filters = useMemo(() => [
    {
      key: 'minRating',
      placeholder: 'Rating',
      value: query.minRating,
      onChange: value => updateFilters({ minRating: value }),
      options: [
        { value: '5', label: '5 stars' },
        { value: '4', label: '4 and up' },
        { value: '3', label: '3 and up' },
        { value: '2', label: '2 and up' },
        { value: '1', label: '1 and up' },
      ],
    },
  ], [query.minRating, updateFilters]);

  return (
    <div>
      <PageHeader title="Reviews" description="Guest ratings and photos submitted after a paid visit." />
      <FilterBar
        search={searchInput}
        searchPlaceholder="Search reviewer, toilet, or comment"
        onSearchChange={onSearchChange}
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          resetSearch();
          updateFilters({ search: '', minRating: '' });
        }}
      />
      <DataTable
        rowKey="id"
        loading={loading}
        dataSource={data}
        scroll={{ x: 1100 }}
        pagination={serverTablePagination(query, serverPagination, updatePage)}
        columns={[
          {
            title: 'Photos',
            dataIndex: 'photos',
            width: 148,
            render: photos => <ListingPhotoStrip photos={photos} size={48} max={3} />,
          },
          {
            title: 'Guest',
            dataIndex: 'userName',
            render: (value, row) => (
              <UserNameCell user={row.user} name={value || row.user?.name} />
            ),
          },
          {
            title: 'Toilet',
            dataIndex: 'toiletName',
            render: value => <span className="pnp-cell-muted">{value || '—'}</span>,
          },
          {
            title: 'Rating',
            dataIndex: 'rating',
            render: value => Number(value || 0).toFixed(1),
          },
          {
            title: 'Comment',
            dataIndex: 'comment',
            render: value => <span className="pnp-cell-muted">{value || '—'}</span>,
          },
          {
            title: 'Date',
            dataIndex: 'createdAt',
            render: value => <span className="pnp-cell-muted">{formatDate(value)}</span>,
          },
        ]}
      />
    </div>
  );
};

export default ReviewsList;
