import React, { useEffect, useState } from 'react';
import { Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusPill from '../../components/common/StatusPill';
import BlockUserButton from '../../components/common/BlockUserButton';
import { UserNameCell } from '../../components/common/UserAvatar';

const UsersList = () => {
  const navigate = useNavigate();
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

  const handleBlock = async (user, blocked, reason = '') => {
    await adminApi.setUserBlocked(user.id, { blocked, reason: blocked ? reason || 'Blocked by admin' : '' });
    message.success(blocked ? 'User blocked. A push was sent to their device.' : 'User unblocked. A push was sent to their device.');
    load(search);
  };

  return (
    <div>
      <PageHeader title="Users" description="Everyone who has signed in with OTP, including hosts. Blocked users cannot log in." />
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
        scroll={{ x: 980 }}
        columns={[
          {
            title: 'User',
            dataIndex: 'name',
            render: (value, row) => <UserNameCell user={row} name={value} />,
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
          {
            title: 'Listings',
            dataIndex: 'listingCount',
            render: (count, row) =>
              count ? (
                <button className="text-blue-600" onClick={() => navigate(`/listings?ownerId=${row.id}`)}>
                  {count}
                </button>
              ) : 0,
          },
          {
            title: 'Access',
            dataIndex: 'blocked',
            render: blocked => (
              <StatusPill value={blocked ? 'Blocked' : 'Active'} />
            ),
          },
          {
            title: '',
            width: 110,
            render: row => <BlockUserButton user={row} onToggle={handleBlock} />,
          },
        ]}
      />
    </div>
  );
};

export default UsersList;
