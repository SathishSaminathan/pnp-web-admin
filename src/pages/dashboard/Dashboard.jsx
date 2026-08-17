import React, { useEffect, useState } from 'react';
import { Table, Tag } from 'antd';
import { UserOutlined, ShopOutlined, DollarCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';

const inr = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const StatCard = ({ icon, color, label, value }) => (
  <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}18`, color }}>
      {icon}
    </div>
    <div className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{value}</div>
    <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.overview()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Dashboard" description="PNP platform snapshot for users, owners, visits, and earnings." />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<UserOutlined />} color="#3b82f6" label="Users" value={data?.users ?? '—'} />
        <StatCard icon={<ShopOutlined />} color="#8b5cf6" label="Owners" value={data?.owners ?? '—'} />
        <StatCard icon={<FileTextOutlined />} color="#f59e0b" label="Bookings" value={data?.bookings ?? '—'} />
        <StatCard icon={<DollarCircleOutlined />} color="#10b981" label="Net earnings" value={data ? inr(data.earnings?.net) : '—'} />
      </div>

      <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Recent history</h3>
          <button className="text-sm text-blue-600" onClick={() => navigate('/history')}>View all</button>
        </div>
        <Table
          rowKey="id"
          loading={loading}
          pagination={false}
          dataSource={data?.recentBookings || []}
          columns={[
            { title: 'Visit', dataIndex: 'toiletName' },
            { title: 'Date', dataIndex: 'date' },
            { title: 'Time', dataIndex: 'time' },
            { title: 'Amount', dataIndex: 'amount', render: value => inr(value) },
            {
              title: 'Status',
              dataIndex: 'bookingStatus',
              render: status => <Tag color={status === 'COMPLETED' ? 'green' : status === 'CANCELLED' ? 'red' : 'blue'}>{status}</Tag>,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Dashboard;
