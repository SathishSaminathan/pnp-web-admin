import React, { useEffect, useState } from 'react';
import { Avatar, Select } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusPill from '../../components/common/StatusPill';

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
      <div style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="Filter status"
          className="w-52"
          value={status}
          onChange={value => {
            setStatus(value);
            load(value);
          }}
          options={['COMPLETED', 'CANCELLED'].map(value => ({ label: value === 'COMPLETED' ? 'Paid visit' : 'Cancelled', value }))}
        />
      </div>
      <DataTable
        rowKey="id"
        loading={loading}
        dataSource={items}
        scroll={{ x: 960 }}
        columns={[
          {
            title: 'Toilet',
            dataIndex: 'toiletName',
            render: value => <span className="pnp-cell-strong">{value || '—'}</span>,
          },
          {
            title: 'Customer',
            render: row => (
              <div className="flex items-center gap-2">
                <Avatar src={row.user?.photoUrl || undefined} size={28} icon={<UserOutlined />} />
                <span>{row.user?.name || row.userId || '—'}</span>
              </div>
            ),
          },
          {
            title: 'Phone',
            render: row => <span className="pnp-cell-muted">{row.user?.phone || '—'}</span>,
          },
          {
            title: 'Date',
            dataIndex: 'date',
            render: value => <span className="pnp-cell-muted">{value || '—'}</span>,
          },
          {
            title: 'Time',
            dataIndex: 'time',
            render: value => <span className="pnp-cell-muted">{value || '—'}</span>,
          },
          {
            title: 'Amount',
            dataIndex: 'amount',
            align: 'right',
            render: value => <span className="pnp-cell-amount">{inr(value)}</span>,
          },
          {
            title: 'Payment',
            dataIndex: 'paymentStatus',
            render: value => <StatusPill value={value} />,
          },
          {
            title: 'Visit',
            dataIndex: 'bookingStatus',
            render: value => <StatusPill value={value} />,
          },
        ]}
      />
    </div>
  );
};

export default HistoryList;
