import React, { useEffect, useState } from 'react';
import { DollarCircleOutlined } from '@ant-design/icons';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';
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
    { label: 'Today', value: earnings?.today },
    { label: 'This week', value: earnings?.week },
    { label: 'This month', value: earnings?.month },
    { label: 'Lifetime', value: earnings?.total },
    { label: 'Gross', value: earnings?.gross },
    { label: 'Platform fees', value: earnings?.fees },
    { label: 'Net', value: earnings?.net },
    { label: 'Pending settlement', value: earnings?.pending },
  ];

  return (
    <div>
      <PageHeader title="Earnings" description="Platform revenue and host settlement transactions." />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {cards.map(card => (
          <div key={card.label} className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <DollarCircleOutlined className="mb-2 text-emerald-500" />
            <div className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{earnings ? inr(card.value) : '—'}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{card.label}</div>
          </div>
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
            title: 'Settlement',
            dataIndex: 'settlementStatus',
            render: value => <StatusPill value={value} />,
          },
        ]}
      />
    </div>
  );
};

export default EarningsPage;
