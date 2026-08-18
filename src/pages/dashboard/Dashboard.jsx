import React, { useEffect, useState } from 'react';
import { UserOutlined, ShopOutlined, DollarCircleOutlined, FileTextOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusPill from '../../components/common/StatusPill';

const inr = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;

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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <StatCard
          icon={<UserOutlined />}
          color="#3b82f6"
          label="Users"
          value={data?.users ?? '—'}
        />
        <StatCard
          icon={<ShopOutlined />}
          color="#8b5cf6"
          label="Owners"
          value={data?.owners ?? '—'}
        />
        <div role="button" style={{ cursor: 'pointer' }} onClick={() => navigate('/listings?verified=pending')}>
          <StatCard
            icon={<SafetyCertificateOutlined />}
            color="#f97316"
            label="Pending verification"
            value={data?.pendingListings ?? '—'}
          />
        </div>
        <StatCard
          icon={<FileTextOutlined />}
          color="#f59e0b"
          label="Bookings"
          value={data?.bookings ?? '—'}
        />
        <StatCard
          icon={<DollarCircleOutlined />}
          color="#10b981"
          label="Net earnings"
          value={data ? inr(data.earnings?.net) : '—'}
        />
      </div>

      <div className="pnp-table-card p-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-semibold m-0" style={{ color: 'var(--text-primary)' }}>Recent history</h3>
          <button className="text-sm font-semibold text-blue-600" onClick={() => navigate('/history')}>View all</button>
        </div>
        <DataTable
          wrapped={false}
          rowKey="id"
          loading={loading}
          pagination={false}
          dataSource={data?.recentBookings || []}
          columns={[
            {
              title: 'Visit',
              dataIndex: 'toiletName',
              render: value => <span className="pnp-cell-strong">{value || '—'}</span>,
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
              title: 'Status',
              dataIndex: 'bookingStatus',
              render: status => <StatusPill value={status} />,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Dashboard;
