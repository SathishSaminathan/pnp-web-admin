import React, { useEffect, useState } from 'react';
import { Table, Tag } from 'antd';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';

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
      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        pagination={{ pageSize: 10 }}
        columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: 'Owner', render: row => row.owner?.name || '—' },
          { title: 'City', render: row => row.address?.city || '—' },
          { title: 'Price', dataIndex: 'basePrice', render: inr },
          { title: 'Rating', dataIndex: 'rating' },
          { title: 'Bookings', dataIndex: 'bookingCount' },
          {
            title: 'Availability',
            dataIndex: 'availability',
            render: value => <Tag color={value === 'AVAILABLE' ? 'green' : 'orange'}>{value}</Tag>,
          },
          {
            title: 'Verified',
            dataIndex: 'verified',
            render: value => <Tag color={value ? 'blue' : 'default'}>{value ? 'Yes' : 'No'}</Tag>,
          },
        ]}
      />
    </div>
  );
};

export default ListingsList;
