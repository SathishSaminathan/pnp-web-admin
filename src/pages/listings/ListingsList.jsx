import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusPill from '../../components/common/StatusPill';

const inr = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const ListingsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.listings()
      .then(res => setItems(res.items || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Listings" description="All restrooms published in the app." />
      <DataTable
        rowKey="id"
        loading={loading}
        dataSource={items}
        scroll={{ x: 920 }}
        columns={[
          {
            title: 'Name',
            dataIndex: 'name',
            render: value => <span className="pnp-cell-strong">{value || '—'}</span>,
          },
          { title: 'Owner', render: row => row.owner?.name || '—' },
          {
            title: 'City',
            render: row => <span className="pnp-cell-muted">{row.address?.city || '—'}</span>,
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
            title: 'Verified',
            dataIndex: 'verified',
            render: value => (
              <StatusPill value={value ? 'Yes' : 'No'} tone={value ? 'info' : 'muted'} />
            ),
          },
        ]}
      />
    </div>
  );
};

export default ListingsList;
