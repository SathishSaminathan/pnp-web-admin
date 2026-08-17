import React, { useEffect, useMemo, useState } from 'react';
import { Input } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusPill from '../../components/common/StatusPill';

const inr = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const ListingsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const ownerId = searchParams.get('ownerId') || '';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listings({
        ownerId: ownerId || undefined,
        search: search || undefined,
      });
      setItems(res.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [ownerId]);

  const ownerName = useMemo(() => items[0]?.owner?.name, [items]);

  return (
    <div>
      <PageHeader
        title="Toilets"
        description={
          ownerId
            ? `Listings published by ${ownerName || 'this owner'}.`
            : 'All restrooms created by owners in the app.'
        }
        secondaryAction={
          ownerId
            ? {
                label: 'All toilets',
                onClick: () => setSearchParams({}),
              }
            : undefined
        }
      />
      <div style={{ marginBottom: 16 }} className="max-w-md">
        <Input.Search
          placeholder="Search toilet, owner, or city"
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
        scroll={{ x: 1100 }}
        columns={[
          {
            title: 'Toilet',
            dataIndex: 'name',
            render: value => <span className="pnp-cell-strong">{value || '—'}</span>,
          },
          {
            title: 'Owner',
            render: row => (
              <div>
                <div className="pnp-cell-strong">{row.owner?.name || '—'}</div>
                <div className="pnp-cell-muted">{row.owner?.phone || ''}</div>
              </div>
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
            title: 'Owner access',
            render: row => <StatusPill value={row.ownerBlocked || row.owner?.blocked ? 'Blocked' : 'Active'} />,
          },
        ]}
      />
    </div>
  );
};

export default ListingsList;
