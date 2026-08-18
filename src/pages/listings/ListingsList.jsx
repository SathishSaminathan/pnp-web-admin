import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Space, message } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import FilterBar from '../../components/common/FilterBar';
import StatusPill from '../../components/common/StatusPill';
import ListingPhotoStrip from '../../components/common/ListingPhotoStrip';
import VerifyListingButton from '../../components/common/VerifyListingButton';
import { UserNameCell } from '../../components/common/UserAvatar';
import { useServerTable } from '../../hooks/useServerTable';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { cityOptions, serverTablePagination } from '../../utils/serverTable';

const inr = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const ListingsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const ownerId = searchParams.get('ownerId') || '';
  const verifiedParam = searchParams.get('verified') || '';
  const [savingId, setSavingId] = useState('');
  const skipUrlSync = useRef(true);

  const apiFn = useCallback((params, signal) => adminApi.listings(params, { signal }), []);
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
    ownerId,
    verified: verifiedParam,
    availability: '',
    category: '',
    city: '',
    enabled: '',
    ownerBlocked: '',
  });

  const { searchInput, onSearchChange, resetSearch } = useDebouncedSearch(updateFilters);

  useEffect(() => {
    if (skipUrlSync.current) {
      skipUrlSync.current = false;
      return;
    }
    updateFilters({ ownerId, verified: verifiedParam });
  }, [ownerId, verifiedParam, updateFilters]);

  const ownerName = useMemo(() => data[0]?.owner?.name, [data]);

  const handleVerified = async (listing, verified) => {
    setSavingId(listing.id);
    try {
      await adminApi.setListingVerified(listing.id, { verified });
      message.success(verified ? 'Listing approved as verified. Owner was notified.' : 'Verification removed. Owner was notified.');
      refresh();
    } catch (error) {
      message.error(error?.response?.data?.message || error?.message || 'Could not update verification');
    } finally {
      setSavingId('');
    }
  };

  const setUrlFilters = next => {
    const params = {};
    if (next.ownerId) params.ownerId = next.ownerId;
    if (next.verified) params.verified = next.verified;
    setSearchParams(params);
  };

  const hasActiveFilters = Boolean(
    query.search || query.verified || query.availability || query.category || query.city || query.enabled || query.ownerBlocked,
  );

  const filters = useMemo(() => [
    {
      key: 'verified',
      placeholder: 'Verification',
      value: query.verified,
      onChange: value => setUrlFilters({ ownerId: query.ownerId, verified: value }),
      options: [
        { value: 'pending', label: 'Pending approval' },
        { value: 'verified', label: 'Verified' },
      ],
    },
    {
      key: 'availability',
      placeholder: 'Availability',
      value: query.availability,
      onChange: value => updateFilters({ availability: value }),
      options: (responseMeta?.availability || []).map(value => ({ value, label: String(value).replace(/_/g, ' ') })),
    },
    {
      key: 'category',
      placeholder: 'Category',
      value: query.category,
      onChange: value => updateFilters({ category: value }),
      options: (responseMeta?.categories || []).map(value => ({ value, label: value })),
    },
    {
      key: 'city',
      placeholder: 'City',
      value: query.city,
      onChange: value => updateFilters({ city: value }),
      options: cityOptions(responseMeta?.cities),
    },
    {
      key: 'enabled',
      placeholder: 'Listing status',
      value: query.enabled,
      onChange: value => updateFilters({ enabled: value }),
      options: [
        { value: 'true', label: 'Enabled' },
        { value: 'false', label: 'Disabled' },
      ],
    },
    {
      key: 'ownerBlocked',
      placeholder: 'Owner access',
      value: query.ownerBlocked,
      onChange: value => updateFilters({ ownerBlocked: value }),
      options: [
        { value: 'false', label: 'Owner active' },
        { value: 'true', label: 'Owner blocked' },
      ],
    },
  ], [query.verified, query.ownerId, query.availability, query.category, query.city, query.enabled, query.ownerBlocked, responseMeta, updateFilters]);

  return (
    <div>
      <PageHeader
        title="Toilets"
        description={
          ownerId
            ? `Listings published by ${ownerName || 'this owner'}. Approve a listing to show the Verified badge in the app.`
            : 'Review owner restrooms and approve listings that should show as verified.'
        }
        secondaryAction={
          ownerId
            ? {
                label: 'All toilets',
                onClick: () => setUrlFilters({ verified: query.verified }),
              }
            : undefined
        }
      />
      <FilterBar
        search={searchInput}
        searchPlaceholder="Search toilet, owner, or city"
        onSearchChange={onSearchChange}
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onClear={() => {
          resetSearch();
          updateFilters({
            search: '',
            verified: '',
            availability: '',
            category: '',
            city: '',
            enabled: '',
            ownerBlocked: '',
          });
          setUrlFilters({ ownerId: query.ownerId });
        }}
      />
      <DataTable
        rowKey="id"
        loading={loading}
        dataSource={data}
        skeletonLayout="listings"
        skeletonMinWidth={1480}
        scroll={{ x: 1480 }}
        pagination={serverTablePagination(query, serverPagination, updatePage)}
        columns={[
          {
            title: 'Photos',
            dataIndex: 'photos',
            width: 168,
            fixed: 'left',
            render: photos => <ListingPhotoStrip photos={photos} size={48} />,
          },
          {
            title: 'Toilet',
            dataIndex: 'name',
            width: 200,
            fixed: 'left',
            ellipsis: true,
            render: value => <span className="pnp-cell-strong">{value || '—'}</span>,
          },
          {
            title: 'Owner',
            width: 200,
            ellipsis: true,
            render: row => (
              <UserNameCell
                user={row.owner}
                name={row.owner?.name}
                subtitle={row.owner?.phone}
              />
            ),
          },
          {
            title: 'Location',
            width: 180,
            ellipsis: true,
            render: row => (
              <span className="pnp-cell-muted">
                {[row.address?.area, row.address?.city].filter(Boolean).join(', ') || '—'}
              </span>
            ),
          },
          {
            title: 'Price',
            dataIndex: 'basePrice',
            width: 100,
            align: 'right',
            render: value => <span className="pnp-cell-amount">{inr(value)}</span>,
          },
          { title: 'Rating', dataIndex: 'rating', width: 90, align: 'right', render: value => value ?? '—' },
          { title: 'Bookings', dataIndex: 'bookingCount', width: 100, align: 'right', render: value => value ?? 0 },
          {
            title: 'Availability',
            dataIndex: 'availability',
            width: 140,
            render: value => <StatusPill value={value} />,
          },
          {
            title: 'Verification',
            dataIndex: 'verified',
            width: 130,
            render: (_, row) => (
              <StatusPill value={row.verified ? 'Verified' : 'Unverified'} />
            ),
          },
          {
            title: 'Owner access',
            width: 130,
            render: row => <StatusPill value={row.ownerBlocked || row.owner?.blocked ? 'Blocked' : 'Active'} />,
          },
          {
            title: 'Actions',
            key: 'actions',
            width: 120,
            fixed: 'right',
            render: row => (
              <Space size={8} onClick={event => event.stopPropagation()}>
                <VerifyListingButton
                  listing={row}
                  loading={savingId === row.id}
                  onToggle={handleVerified}
                />
              </Space>
            ),
          },
        ]}
      />
    </div>
  );
};

export default ListingsList;
