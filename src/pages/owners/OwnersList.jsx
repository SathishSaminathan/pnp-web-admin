import React, { useCallback, useMemo, useState } from 'react';
import { Button, Empty, Space, message } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import FilterBar from '../../components/common/FilterBar';
import StatusPill from '../../components/common/StatusPill';
import BlockUserButton from '../../components/common/BlockUserButton';
import { DetailInfoDrawer } from '../../components/common/DetailInfoDrawer';
import ListingPhotoStrip from '../../components/common/ListingPhotoStrip';
import VerifyListingButton from '../../components/common/VerifyListingButton';
import UserAvatar, { UserNameCell } from '../../components/common/UserAvatar';
import { useServerTable } from '../../hooks/useServerTable';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { cityOptions, serverTablePagination } from '../../utils/serverTable';
import { ListingCardsSkeleton } from '../../components/common/skeletons';

const inr = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const OwnersList = () => {
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [toilets, setToilets] = useState([]);
  const [toiletsLoading, setToiletsLoading] = useState(false);
  const [savingId, setSavingId] = useState('');

  const apiFn = useCallback((params, signal) => adminApi.owners(params, { signal }), []);
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
    blocked: '',
    city: '',
  });

  const { searchInput, onSearchChange, resetSearch } = useDebouncedSearch(updateFilters);
  const hasActiveFilters = Boolean(query.search || query.blocked || query.city);

  const handleBlock = async (user, blocked, reason = '') => {
    await adminApi.setUserBlocked(user.id, { blocked, reason: blocked ? reason || 'Blocked by admin' : '' });
    message.success(blocked ? 'Owner blocked. A push was sent to their device.' : 'Owner unblocked. A push was sent to their device.');
    refresh();
    if (selectedOwner?.id === user.id) {
      setSelectedOwner({ ...selectedOwner, blocked });
    }
  };

  const openToilets = async owner => {
    setSelectedOwner(owner);
    setToilets(owner.listings || []);
    setToiletsLoading(true);
    try {
      const res = await adminApi.listings({ ownerId: owner.id, limit: 100 });
      setToilets(res.items || owner.listings || []);
    } finally {
      setToiletsLoading(false);
    }
  };

  const handleVerified = async (listing, verified) => {
    setSavingId(listing.id);
    try {
      const updated = await adminApi.setListingVerified(listing.id, { verified });
      message.success(verified ? 'Listing approved as verified. Owner was notified.' : 'Verification removed. Owner was notified.');
      setToilets(current => current.map(item => (item.id === listing.id ? { ...item, ...updated } : item)));
      refresh();
    } catch (error) {
      message.error(error?.response?.data?.message || error?.message || 'Could not update verification');
    } finally {
      setSavingId('');
    }
  };

  const filters = useMemo(() => [
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
  ], [query.blocked, query.city, responseMeta?.cities, updateFilters]);

  return (
    <div>
      <PageHeader title="Owners" description="Use View toilets to see restrooms published by each host." />
      <FilterBar
        search={searchInput}
        searchPlaceholder="Search owner name, phone, or city"
        onSearchChange={onSearchChange}
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          resetSearch();
          updateFilters({ search: '', blocked: '', city: '' });
        }}
      />
      <DataTable
        rowKey="id"
        loading={loading}
        dataSource={data}
        skeletonLayout="owners"
        skeletonMinWidth={1160}
        scroll={{ x: 1160 }}
        pagination={serverTablePagination(query, serverPagination, updatePage)}
        columns={[
          {
            title: 'Owner',
            dataIndex: 'name',
            width: 220,
            fixed: 'left',
            ellipsis: true,
            render: (value, row) => <UserNameCell user={row} name={value} />,
          },
          {
            title: 'Phone',
            dataIndex: 'phone',
            width: 140,
            ellipsis: true,
            render: value => <span className="pnp-cell-muted">{value || '—'}</span>,
          },
          {
            title: 'City',
            dataIndex: 'city',
            width: 140,
            ellipsis: true,
            render: value => <span className="pnp-cell-muted">{value || '—'}</span>,
          },
          { title: 'Toilets', dataIndex: 'listingCount', width: 90, align: 'right', render: value => value || 0 },
          { title: 'Host bookings', dataIndex: 'hostBookingCount', width: 130, align: 'right' },
          {
            title: 'Settled',
            dataIndex: 'settledAmount',
            width: 120,
            align: 'right',
            render: value => <span className="pnp-cell-amount">{inr(value)}</span>,
          },
          {
            title: 'Access',
            dataIndex: 'blocked',
            width: 110,
            render: blocked => <StatusPill value={blocked ? 'Blocked' : 'Active'} />,
          },
          {
            title: 'Actions',
            key: 'actions',
            width: 210,
            fixed: 'right',
            render: row => (
              <Space size={8} onClick={event => event.stopPropagation()}>
                <Button
                  size="small"
                  type="primary"
                  icon={<ShopOutlined />}
                  onClick={() => openToilets(row)}
                >
                  View toilets
                </Button>
                <BlockUserButton user={row} onToggle={handleBlock} />
              </Space>
            ),
          },
        ]}
      />

      <DetailInfoDrawer
        open={Boolean(selectedOwner)}
        onClose={() => setSelectedOwner(null)}
        width={560}
        avatar={<UserAvatar user={selectedOwner} size={36} />}
        title={selectedOwner?.name || 'Owner toilets'}
        subtitle={`${selectedOwner?.phone || ''} · ${toilets.length} toilet${toilets.length === 1 ? '' : 's'}`}
      >
        {toiletsLoading && !toilets.length ? (
          <ListingCardsSkeleton count={3} />
        ) : toilets.length ? (
          <div className="flex flex-col gap-3">
            {toilets.map(item => (
              <div
                key={item.id}
                className="rounded-2xl p-4"
                style={{ border: '1px solid var(--border-color)', background: 'var(--input-bg)' }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="pnp-cell-strong">{item.name}</div>
                    <div className="pnp-cell-muted text-xs mt-1">
                      {[item.area || item.address?.area, item.city || item.address?.city].filter(Boolean).join(', ') || '—'}
                    </div>
                  </div>
                  <StatusPill value={item.availability} />
                </div>
                <div className="mb-3">
                  <ListingPhotoStrip photos={item.photos} size={64} />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="pnp-cell-amount">{inr(item.basePrice)}</span>
                  <span className="pnp-cell-muted">Rating {item.rating ?? '—'}</span>
                  <StatusPill value={item.verified ? 'Verified' : 'Unverified'} />
                  <VerifyListingButton
                    listing={item}
                    loading={savingId === item.id}
                    onToggle={handleVerified}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty description="No toilets published yet" />
        )}
      </DetailInfoDrawer>
    </div>
  );
};

export default OwnersList;
