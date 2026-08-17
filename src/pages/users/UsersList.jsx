import React, { useEffect, useState } from 'react';
import { Input } from 'antd';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusPill from '../../components/common/StatusPill';

const UsersList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async value => {
    setLoading(true);
    try {
      const res = await adminApi.users({ search: value || undefined });
      setItems(res.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <PageHeader title="Users" description="Everyone who has signed in with OTP, including hosts." />
      <div style={{ marginBottom: 16 }} className="max-w-md">
        <Input.Search
          placeholder="Search name, phone, or city"
          allowClear
          value={search}
          onChange={e => setSearch(e.target.value)}
          onSearch={load}
        />
      </div>
      <DataTable
        rowKey="id"
        loading={loading}
        dataSource={items}
        scroll={{ x: 860 }}
        columns={[
          {
            title: 'Name',
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
          {
            title: 'Role',
            dataIndex: 'role',
            render: role => (
              <StatusPill value={role} tone={role === 'owner' ? 'purple' : 'info'} />
            ),
          },
          { title: 'Visits', dataIndex: 'bookingCount' },
          { title: 'Listings', dataIndex: 'listingCount' },
          {
            title: 'Profile',
            dataIndex: 'profileCompleted',
            render: done => (
              <StatusPill value={done ? 'Complete' : 'Pending'} />
            ),
          },
        ]}
      />
    </div>
  );
};

export default UsersList;
