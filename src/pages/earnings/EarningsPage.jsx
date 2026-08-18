import React, { useEffect, useState } from 'react';
import {
  CalendarOutlined,
  DollarCircleOutlined,
  FundOutlined,
  PercentageOutlined,
  RiseOutlined,
  TrophyOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusPill from '../../components/common/StatusPill';

const inr = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const EarningsPage = () => {
  const [earnings, setEarnings] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.earnings(), adminApi.transactions()])
      .then(([nextEarnings, txns]) => {
        setEarnings(nextEarnings);
        setItems(txns.items || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Today', value: earnings?.today, color: '#3b82f6', icon: <CalendarOutlined />, hint: '24h' },
    { label: 'This week', value: earnings?.week, color: '#6366f1', icon: <RiseOutlined />, hint: '7 days' },
    { label: 'This month', value: earnings?.month, color: '#8b5cf6', icon: <FundOutlined />, hint: '30 days' },
    { label: 'Lifetime', value: earnings?.total, color: '#0ea5e9', icon: <TrophyOutlined />, hint: 'All time' },
    { label: 'Gross', value: earnings?.gross, color: '#10b981', icon: <DollarCircleOutlined />, hint: 'Paid visits' },
    { label: 'Platform fees', value: earnings?.fees, color: '#f59e0b', icon: <PercentageOutlined />, hint: 'Commission' },
    { label: 'Net to hosts', value: earnings?.net, color: '#14b8a6', icon: <WalletOutlined />, hint: 'Paid' },
    { label: 'Settled', value: earnings?.settled ?? earnings?.net, color: '#16a34a', icon: <WalletOutlined />, hint: 'Paid' },
  ];

  return (
    <div>
      <PageHeader title="Earnings" description="Paid visit revenue and host payouts. Access is granted only after payment, so every transaction here is paid." />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {cards.map(card => (
          <StatCard
            key={card.label}
            icon={card.icon}
            color={card.color}
            label={card.label}
            hint={card.hint}
            value={earnings ? inr(card.value) : '—'}
          />
        ))}
      </div>
      <DataTable
        rowKey="id"
        loading={loading}
        dataSource={items}
        scroll={{ x: 920 }}
        columns={[
          {
            title: 'Transaction',
            dataIndex: 'id',
            render: value => <span className="pnp-cell-muted">{value}</span>,
          },
          {
            title: 'Toilet',
            dataIndex: 'toiletName',
            render: value => <span className="pnp-cell-strong">{value || '—'}</span>,
          },
          { title: 'Owner', render: row => row.owner?.name || row.ownerId },
          {
            title: 'Gross',
            dataIndex: 'grossAmount',
            align: 'right',
            render: value => <span className="pnp-cell-amount">{inr(value)}</span>,
          },
          {
            title: 'Fee',
            dataIndex: 'platformFee',
            align: 'right',
            render: value => <span className="pnp-cell-muted">{inr(value)}</span>,
          },
          {
            title: 'Net',
            dataIndex: 'netAmount',
            align: 'right',
            render: value => <span className="pnp-cell-amount">{inr(value)}</span>,
          },
          {
            title: 'Status',
            dataIndex: 'settlementStatus',
            render: value => <StatusPill value={value} />,
          },
        ]}
      />
    </div>
  );
};

export default EarningsPage;
