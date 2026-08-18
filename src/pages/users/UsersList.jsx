import React, { useCallback, useMemo } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import FilterBar from '../../components/common/FilterBar';
import StatusPill from '../../components/common/StatusPill';
import BlockUserButton from '../../components/common/BlockUserButton';
import { UserNameCell } from '../../components/common/UserAvatar';
import { useServerTable } from '../../hooks/useServerTable';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { cityOptions, serverTablePagination } from '../../utils/serverTable';

const UsersList = () => {
  const navigate = useNavigate();

  const apiFn = useCallback((params, signal) => adminApi.users(params, { signal }), []);
  const {
    query,
    data,
    serverPagination,
    responseMeta,
    loading,
    updateFilters,
    updatePage,
    refresh,
  } = useServerTable(apiFn, {
    page: 1,
    limit: 10,
    search: '',
    role: '',
    blocked: '',
    city: '',
  });

  const { searchInput, onSearchChange, resetSearch } = useDebouncedSearch(updateFilters);

  const hasActiveFilters = Boolean(query.search || query.role || query.blocked || query.city);

  const handleBlock = async (user, blocked, reason = '') => {
    await adminApi.setUserBlocked(user.id, { blocked, reason: blocked ? reason || 'Blocked by admin' : '' });
    message.success(blocked ? 'User blocked. A push was sent to their device.' : 'User unblocked. A push was sent to their device.');
    refresh();
  };

  const filters = useMemo(() => [
    {
      key: 'role',
      placeholder: 'Role',
      value: query.role,
      onChange: value => updateFilters({ role: value }),
      options: [
        { value: 'customer', label: 'Customer' },
        { value: 'owner', label: 'Owner' },
      ],
    },
    {
      key: 'blocked',
      placeholder: 'Access',
      value: query.blocked,
      onChange: value => updateFilters({ blocked: value }),
      options: [
        { value: 'false', label: 'Active' },
        { value: 'true', label: 'Blocked' },
      ],
    },
    {
      key: 'city',
      placeholder: 'City',
      value: query.city,
      onChange: value => updateFilters({ city: value }),
      options: cityOptions(responseMeta?.cities),
    },
  ], [query.role, query.blocked, query.city, responseMeta?.cities, updateFilters]);

  return (
    <div>
      <PageHeader title="Users" description="Everyone who has signed in with OTP, including hosts. Blocked users cannot log in." />
      <FilterBar
        search={searchInput}
        searchPlaceholder="Search name, phone, or city"
        onSearchChange={onSearchChange}
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          resetSearch();
          updateFilters({ search: '', role: '', blocked: '', city: '' });
        }}
      />
      <DataTable
        rowKey="id"
        loading={loading}
        dataSource={data}
        scroll={{ x: 980 }}
        pagination={serverTablePagination(query, serverPagination, updatePage)}
        columns={[
          {
            title: 'User',
            dataIndex: 'name',
            render: (value, row) => <UserNameCell user={row} name={value} />,
          },
          {
            title: 'Phone',
            dataIndex: 'phone',
            render: value => <span className="pnp-cell-muted">{value || '—'}</span>,
          },
          {
            title: 'City',
            dataIndex: 'city',
            render: value => <span className="pnp-cell-muted">{value || '—'}</span>,
          },
          {
            title: 'Role',
            dataIndex: 'role',
            render: role => (
              <StatusPill value={role} tone={role === 'owner' ? 'purple' : 'info'} />
            ),
          },
          { title: 'Visits', dataIndex: 'bookingCount' },
          {
            title: 'Listings',
            dataIndex: 'listingCount',
            render: (count, row) =>
              count ? (
                <button className="text-blue-600" onClick={() => navigate(`/listings?ownerId=${row.id}`)}>
                  {count}
                </button>
              ) : 0,
          },
          {
            title: 'Access',
            dataIndex: 'blocked',
            render: blocked => (
              <StatusPill value={blocked ? 'Blocked' : 'Active'} />
            ),
          },
          {
            title: '',
            width: 110,
            render: row => <BlockUserButton user={row} onToggle={handleBlock} />,
          },
        ]}
      />
    </div>
  );
};

export default UsersList;
