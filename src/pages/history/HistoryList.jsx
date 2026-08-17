import React, { useEffect, useState } from 'react';
import { Select, Table, Tag } from 'antd';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';

const inr = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const HistoryList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState();

  const load = async nextStatus => {
    setLoading(true);
    try {
      const res = await adminApi.bookings({ status: nextStatus || undefined });
      setItems(res.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <PageHeader title="History" description="All paid visits across customers and hosts." />
      <Select
        allowClear
        placeholder="Filter status"
        className="mb-4 w-52"
        value={status}
        onChange={value => {
          setStatus(value);
          load(value);
        }}
        options={['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(value => ({ label: value, value }))}
      />
      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        pagination={{ pageSize: 10 }}
        columns={[
          { title: 'Toilet', dataIndex: 'toiletName' },
          { title: 'Customer', render: row => row.user?.name || row.userId },
          { title: 'Phone', render: row => row.user?.phone || '—' },
          { title: 'Date', dataIndex: 'date' },
          { title: 'Time', dataIndex: 'time' },
          { title: 'Amount', dataIndex: 'amount', render: inr },
          {
            title: 'Payment',
            dataIndex: 'paymentStatus',
            render: value => <Tag color={value === 'PAID' ? 'green' : 'orange'}>{value}</Tag>,
          },
          {
            title: 'Status',
            dataIndex: 'bookingStatus',
            render: value => <Tag>{value}</Tag>,
          },
        ]}
      />
    </div>
  );
};

export default HistoryList;
