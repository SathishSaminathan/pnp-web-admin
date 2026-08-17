import React, { useEffect, useState } from 'react';
import { Input, Table, Tag } from 'antd';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';

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
      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender: owner => (
            <div className="text-sm">
              {(owner.listings || []).map(item => (
                <Tag key={item.id} className="mb-1">{item.name}</Tag>
              ))}
            </div>
          ),
        }}
        columns={[
          { title: 'Owner', dataIndex: 'name' },
          { title: 'Phone', dataIndex: 'phone' },
          { title: 'City', dataIndex: 'city' },
          { title: 'Listings', dataIndex: 'listingCount' },
          { title: 'Host bookings', dataIndex: 'hostBookingCount' },
          { title: 'Settled', dataIndex: 'settledAmount', render: inr },
          { title: 'Pending', dataIndex: 'pendingAmount', render: inr },
        ]}
      />
    </div>
  );
};

export default OwnersList;
