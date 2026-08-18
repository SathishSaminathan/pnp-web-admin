import React, { useEffect, useMemo, useState } from 'react';
import { Input } from 'antd';
import { adminApi } from '../../api/modules/admin';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import ListingPhotoStrip from '../../components/common/ListingPhotoStrip';
import { UserNameCell } from '../../components/common/UserAvatar';

const formatDate = value => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const ReviewsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.reviews();
      setItems(res.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter(item =>
      [item.userName, item.toiletName, item.comment]
        .some(value => String(value || '').toLowerCase().includes(query)),
    );
  }, [items, search]);

  return (
    <div>
      <PageHeader title="Reviews" description="Guest ratings and photos submitted after a paid visit." />
      <div style={{ marginBottom: 16 }} className="max-w-md">
        <Input.Search
          placeholder="Search reviewer, toilet, or comment"
          allowClear
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <DataTable
        rowKey="id"
        loading={loading}
        dataSource={filtered}
        scroll={{ x: 1100 }}
        columns={[
          {
            title: 'Photos',
            dataIndex: 'photos',
            width: 148,
            render: photos => <ListingPhotoStrip photos={photos} size={48} max={3} />,
          },
          {
            title: 'Guest',
            dataIndex: 'userName',
            render: (value, row) => (
              <UserNameCell user={row.user} name={value || row.user?.name} />
            ),
          },
          {
            title: 'Toilet',
            dataIndex: 'toiletName',
            render: value => <span className="pnp-cell-muted">{value || '—'}</span>,
          },
          {
            title: 'Rating',
            dataIndex: 'rating',
            render: value => Number(value || 0).toFixed(1),
          },
          {
            title: 'Comment',
            dataIndex: 'comment',
            render: value => <span className="pnp-cell-muted">{value || '—'}</span>,
          },
          {
            title: 'Date',
            dataIndex: 'createdAt',
            render: value => <span className="pnp-cell-muted">{formatDate(value)}</span>,
          },
        ]}
      />
    </div>
  );
};

export default ReviewsList;
