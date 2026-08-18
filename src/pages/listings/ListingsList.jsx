import React, { useEffect, useMemo, useState } from 'react';
import { Input, Select, Space, message } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusPill from '../../components/common/StatusPill';
import ListingPhotoStrip from '../../components/common/ListingPhotoStrip';
import VerifyListingButton from '../../components/common/VerifyListingButton';
import { UserNameCell } from '../../components/common/UserAvatar';

const inr = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const ListingsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const ownerId = searchParams.get('ownerId') || '';
  const verifiedParam = searchParams.get('verified') || '';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listings({
        ownerId: ownerId || undefined,
        search: search || undefined,
        verified: verifiedParam || undefined,
      });
      setItems(res.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [ownerId, verifiedParam]);

  const ownerName = useMemo(() => items[0]?.owner?.name, [items]);

  const handleVerified = async (listing, verified) => {
    setSavingId(listing.id);
    try {
      await adminApi.setListingVerified(listing.id, { verified });
      message.success(verified ? 'Listing approved as verified. Owner was notified.' : 'Verification removed. Owner was notified.');
      await load();
    } catch (error) {
      message.error(error?.response?.data?.message || error?.message || 'Could not update verification');
    } finally {
      setSavingId('');
    }
  };

  const setVerifiedFilter = value => {
    const next = {};
    if (ownerId) next.ownerId = ownerId;
    if (value) next.verified = value;
    setSearchParams(next);
  };

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
                onClick: () => setSearchParams(verifiedParam ? { verified: verifiedParam } : {}),
              }
            : undefined
        }
      />
      <div style={{ marginBottom: 16 }} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
        <Input.Search
          placeholder="Search toilet, owner, or city"
          allowClear
          value={search}
          onChange={e => setSearch(e.target.value)}
          onSearch={load}
        />
        <Select
          value={verifiedParam || 'all'}
          onChange={value => setVerifiedFilter(value === 'all' ? '' : value)}
          style={{ width: 200 }}
          options={[
            { value: 'all', label: 'All verification' },
            { value: 'pending', label: 'Pending approval' },
            { value: 'verified', label: 'Verified' },
          ]}
        />
      </div>
      <DataTable
        rowKey="id"
        loading={loading}
        dataSource={items}
        scroll={{ x: 1280 }}
        columns={[
          {
            title: 'Photos',
            dataIndex: 'photos',
            width: 168,
            render: photos => <ListingPhotoStrip photos={photos} size={48} />,
          },
          {
            title: 'Toilet',
            dataIndex: 'name',
            render: value => <span className="pnp-cell-strong">{value || '—'}</span>,
          },
          {
            title: 'Owner',
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
            render: row => (
              <span className="pnp-cell-muted">
                {[row.address?.area, row.address?.city].filter(Boolean).join(', ') || '—'}
              </span>
            ),
          },
          {
            title: 'Price',
            dataIndex: 'basePrice',
            align: 'right',
            render: value => <span className="pnp-cell-amount">{inr(value)}</span>,
          },
          { title: 'Rating', dataIndex: 'rating', render: value => value ?? '—' },
          { title: 'Bookings', dataIndex: 'bookingCount', render: value => value ?? 0 },
          {
            title: 'Availability',
            dataIndex: 'availability',
            render: value => <StatusPill value={value} />,
          },
          {
            title: 'Verification',
            dataIndex: 'verified',
            render: (_, row) => (
              <StatusPill value={row.verified ? 'Verified' : 'Unverified'} />
            ),
          },
          {
            title: 'Owner access',
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
