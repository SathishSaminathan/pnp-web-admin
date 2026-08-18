import React, { useEffect, useState } from 'react';
import { Button, Empty, Input, Space, message } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusPill from '../../components/common/StatusPill';
import BlockUserButton from '../../components/common/BlockUserButton';
import { DetailInfoDrawer } from '../../components/common/DetailInfoDrawer';
import ListingPhotoStrip from '../../components/common/ListingPhotoStrip';
import VerifyListingButton from '../../components/common/VerifyListingButton';
import UserAvatar from '../../components/common/UserAvatar';

const inr = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const OwnersList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [toilets, setToilets] = useState([]);
  const [toiletsLoading, setToiletsLoading] = useState(false);
  const [savingId, setSavingId] = useState('');

  const load = async value => {
    setLoading(true);
    try {
      const res = await adminApi.owners({ search: value || undefined });
      setItems(res.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleBlock = async (user, blocked, reason = '') => {
    await adminApi.setUserBlocked(user.id, { blocked, reason: blocked ? reason || 'Blocked by admin' : '' });
    message.success(blocked ? 'Owner blocked. A push was sent to their device.' : 'Owner unblocked. A push was sent to their device.');
    load(search);
    if (selectedOwner?.id === user.id) {
      setSelectedOwner({ ...selectedOwner, blocked });
    }
  };

  const openToilets = async owner => {
    setSelectedOwner(owner);
    setToilets(owner.listings || []);
    setToiletsLoading(true);
    try {
      const res = await adminApi.listings({ ownerId: owner.id });
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
      load(search);
    } catch (error) {
      message.error(error?.response?.data?.message || error?.message || 'Could not update verification');
    } finally {
      setSavingId('');
    }
  };

  return (
    <div>
      <PageHeader title="Owners" description="Use View toilets to see restrooms published by each host." />
      <div style={{ marginBottom: 16 }} className="max-w-md">
        <Input.Search
          placeholder="Search owner"
          allowClear
          value={search}
          onChange={e => setSearch(e.target.value)}
          onSearch={load}
        />
      </div>
      <DataTable
        rowKey="id"
        loading={loading}
        dataSource={items}
        scroll={{ x: 1080 }}
        sticky
        columns={[
          {
            title: 'Owner',
            dataIndex: 'name',
            render: (value, row) => (
              <div className="flex items-center gap-3">
                <UserAvatar src={row.photoUrl} name={value} size={36} />
                <span className="pnp-cell-strong">{value || '—'}</span>
              </div>
            ),
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
          { title: 'Toilets', dataIndex: 'listingCount', render: value => value || 0 },
          { title: 'Host bookings', dataIndex: 'hostBookingCount' },
          {
            title: 'Settled',
            dataIndex: 'settledAmount',
            align: 'right',
            render: value => <span className="pnp-cell-amount">{inr(value)}</span>,
          },
          {
            title: 'Access',
            dataIndex: 'blocked',
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
        icon={<ShopOutlined style={{ color: '#fff' }} />}
        title={selectedOwner?.name || 'Owner toilets'}
        subtitle={`${selectedOwner?.phone || ''} · ${toilets.length} toilet${toilets.length === 1 ? '' : 's'}`}
      >
        {toiletsLoading && !toilets.length ? (
          <div className="pnp-cell-muted">Loading toilets…</div>
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
