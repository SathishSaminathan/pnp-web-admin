import React, { useEffect, useState } from 'react';
import { Input, Tag } from 'antd';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';

const inr = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const OwnersList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  return (
    <div>
      <PageHeader title="Owners" description="Hosts who have published at least one restroom listing." />
      <Input.Search
        placeholder="Search owner"
        allowClear
        className="mb-4 max-w-md"
        value={search}
        onChange={e => setSearch(e.target.value)}
        onSearch={load}
      />
      <DataTable
        rowKey="id"
        loading={loading}
        dataSource={items}
        scroll={{ x: 880 }}
        expandable={{
          expandedRowRender: owner => (
            <div className="text-sm">
              {(owner.listings || []).length
                ? (owner.listings || []).map(item => (
                    <Tag key={item.id} className="mb-1">{item.name}</Tag>
                  ))
                : <span className="pnp-cell-muted">No listings</span>}
            </div>
          ),
        }}
        columns={[
          {
            title: 'Owner',
            dataIndex: 'name',
            render: value => <span className="pnp-cell-strong">{value || '—'}</span>,
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
          { title: 'Listings', dataIndex: 'listingCount' },
          { title: 'Host bookings', dataIndex: 'hostBookingCount' },
          {
            title: 'Settled',
            dataIndex: 'settledAmount',
            align: 'right',
            render: value => <span className="pnp-cell-amount">{inr(value)}</span>,
          },
          {
            title: 'Pending',
            dataIndex: 'pendingAmount',
            align: 'right',
            render: value => <span className="pnp-cell-amount">{inr(value)}</span>,
          },
        ]}
      />
    </div>
  );
};

export default OwnersList;
