import React from 'react';
import { useLocation } from 'react-router-dom';
import PageHeader from './PageHeader';
import FilterBar from './FilterBar';

export const SkeletonBone = ({
  width = '100%',
  height = 14,
  radius = 8,
  circle = false,
  className = '',
  style,
}) => (
  <span
    className={`pnp-skeleton ${className}`.trim()}
    style={{
      width,
      height,
      borderRadius: circle ? '50%' : radius,
      ...style,
    }}
  />
);

export const PageHeaderSkeleton = ({ titleWidth = 140, descWidth = 420, action = false }) => (
  <div className="mb-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <SkeletonBone width={titleWidth} height={28} radius={6} />
        <div className="mt-2">
          <SkeletonBone width={descWidth} height={16} radius={4} style={{ maxWidth: '100%' }} />
        </div>
      </div>
      {action ? <SkeletonBone width={128} height={32} radius={8} /> : null}
    </div>
  </div>
);

export const FilterBarSkeleton = ({ search = true, selects = 3, dateRange = false }) => (
  <div
    className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center"
    style={{ marginBottom: 16 }}
  >
    {search ? (
      <SkeletonBone
        height={32}
        radius={8}
        style={{ width: '100%', maxWidth: 320, minWidth: 220 }}
      />
    ) : null}
    {Array.from({ length: selects }).map((_, index) => (
      <SkeletonBone key={index} width={160} height={32} radius={8} />
    ))}
    {dateRange ? <SkeletonBone width={260} height={32} radius={8} /> : null}
  </div>
);

export const StatCardsSkeleton = ({
  items,
  count = 4,
  className = 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
}) => {
  const cards = items?.length
    ? items
    : Array.from({ length: count }, (_, index) => ({ label: '', color: '#2563eb', key: index }));

  return (
    <div className={`grid ${className} gap-4 mb-6`}>
      {cards.map((item, index) => (
        <div
          key={item.label || index}
          className="pnp-stat-card"
          style={{
            '--stat-color': item.color || '#2563eb',
            background: `linear-gradient(145deg, ${item.color || '#2563eb'}14 0%, var(--bg-card) 52%)`,
            borderColor: `${item.color || '#2563eb'}33`,
          }}
        >
          <div className="pnp-stat-card__row">
            <div
              className="pnp-stat-card__icon"
              style={{ background: `${item.color || '#2563eb'}1f` }}
            >
              <SkeletonBone width={18} height={18} radius={4} />
            </div>
            {item.hint ? <span className="pnp-stat-card__hint">{item.hint}</span> : null}
          </div>
          <div className="pnp-stat-card__value">
            <SkeletonBone width={88} height={26} radius={8} />
          </div>
          <div className="pnp-stat-card__label">{item.label || <SkeletonBone width={72} height={12} />}</div>
        </div>
      ))}
    </div>
  );
};

const COL_TRACK = {
  avatar: 'minmax(180px, 1.5fr)',
  photos: '168px',
  title: 'minmax(140px, 1.3fr)',
  muted: 'minmax(90px, 1fr)',
  amount: '100px',
  pill: '110px',
  number: '80px',
  button: '110px',
  buttons: '210px',
};

const SkeletonCell = ({ type }) => {
  if (type === 'avatar') {
    return (
      <div className="flex items-center gap-2 min-w-0">
        <SkeletonBone width={32} height={32} circle />
        <div className="flex-1 min-w-0">
          <SkeletonBone width="72%" height={13} />
          <div className="mt-1.5">
            <SkeletonBone width="46%" height={10} />
          </div>
        </div>
      </div>
    );
  }
  if (type === 'photos') {
    return (
      <div className="flex gap-1.5">
        <SkeletonBone width={48} height={48} radius={10} />
        <SkeletonBone width={48} height={48} radius={10} />
        <SkeletonBone width={48} height={48} radius={10} />
      </div>
    );
  }
  if (type === 'title') return <SkeletonBone width="78%" height={13} />;
  if (type === 'amount') {
    return (
      <div className="flex justify-end">
        <SkeletonBone width={64} height={13} />
      </div>
    );
  }
  if (type === 'pill') return <SkeletonBone width={72} height={22} radius={999} />;
  if (type === 'number') return <SkeletonBone width={28} height={13} />;
  if (type === 'button') return <SkeletonBone width={72} height={24} radius={6} />;
  if (type === 'buttons') {
    return (
      <div className="flex gap-2">
        <SkeletonBone width={96} height={24} radius={6} />
        <SkeletonBone width={64} height={24} radius={6} />
      </div>
    );
  }
  return <SkeletonBone width="62%" height={12} />;
};

export const TABLE_LAYOUTS = {
  dashboard: [
    { type: 'title', title: 'Visit' },
    { type: 'muted', title: 'Date' },
    { type: 'muted', title: 'Time' },
    { type: 'amount', title: 'Amount' },
    { type: 'pill', title: 'Status' },
  ],
  users: [
    { type: 'avatar', title: 'User' },
    { type: 'muted', title: 'Phone' },
    { type: 'muted', title: 'City' },
    { type: 'pill', title: 'Role' },
    { type: 'number', title: 'Visits' },
    { type: 'number', title: 'Listings' },
    { type: 'pill', title: 'Access' },
    { type: 'button', title: '' },
  ],
  owners: [
    { type: 'avatar', title: 'Owner' },
    { type: 'muted', title: 'Phone' },
    { type: 'muted', title: 'City' },
    { type: 'number', title: 'Toilets' },
    { type: 'number', title: 'Host bookings' },
    { type: 'amount', title: 'Settled' },
    { type: 'pill', title: 'Access' },
    { type: 'buttons', title: 'Actions' },
  ],
  listings: [
    { type: 'photos', title: 'Photos' },
    { type: 'title', title: 'Toilet' },
    { type: 'avatar', title: 'Owner' },
    { type: 'muted', title: 'Location' },
    { type: 'amount', title: 'Price' },
    { type: 'number', title: 'Rating' },
    { type: 'number', title: 'Bookings' },
    { type: 'pill', title: 'Availability' },
    { type: 'pill', title: 'Verification' },
    { type: 'pill', title: 'Owner access' },
    { type: 'button', title: 'Actions' },
  ],
  history: [
    { type: 'title', title: 'Toilet' },
    { type: 'avatar', title: 'Customer' },
    { type: 'muted', title: 'Phone' },
    { type: 'muted', title: 'Date' },
    { type: 'muted', title: 'Time' },
    { type: 'amount', title: 'Amount' },
    { type: 'pill', title: 'Payment' },
    { type: 'pill', title: 'Status' },
  ],
  reviews: [
    { type: 'photos', title: 'Photos' },
    { type: 'avatar', title: 'Guest' },
    { type: 'muted', title: 'Toilet' },
    { type: 'number', title: 'Rating' },
    { type: 'muted', title: 'Comment' },
    { type: 'muted', title: 'Date' },
  ],
  earnings: [
    { type: 'muted', title: 'Transaction' },
    { type: 'title', title: 'Toilet' },
    { type: 'avatar', title: 'Owner' },
    { type: 'amount', title: 'Gross' },
    { type: 'muted', title: 'Fee' },
    { type: 'amount', title: 'Net' },
    { type: 'pill', title: 'Payment' },
    { type: 'pill', title: 'Status' },
  ],
  master: [
    { type: 'title', title: 'Label' },
    { type: 'muted', title: 'Value' },
    { type: 'number', title: 'Order' },
    { type: 'pill', title: 'Status' },
    { type: 'buttons', title: '' },
  ],
};

const layoutCells = layout => {
  const cols = TABLE_LAYOUTS[layout] || TABLE_LAYOUTS.users;
  return cols.map(col => (typeof col === 'string' ? { type: col, title: '' } : col));
};

export const TableSkeleton = ({
  rows = 10,
  layout = 'users',
  columns,
  withAvatar = false,
  showFooter = true,
  minWidth,
}) => {
  const cells = (columns || layoutCells(layout)).map(col => (
    typeof col === 'string' ? { type: col, title: '' } : col
  ));
  const template = cells.map(col => COL_TRACK[col.type] || COL_TRACK.muted).join(' ');
  const tableMinWidth = minWidth || Math.max(720, cells.length * 120);

  return (
    <div className="pnp-skeleton-table">
      <div className="pnp-skeleton-table__head" style={{ gridTemplateColumns: template, minWidth: tableMinWidth }}>
        {cells.map((col, index) => (
          <span
            key={`${col.type}-${index}`}
            className="pnp-skeleton-table__heading"
          >
            {col.title || ''}
          </span>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="pnp-skeleton-table__row"
          style={{ gridTemplateColumns: template, minWidth: tableMinWidth }}
        >
          {cells.map((col, colIndex) => (
            <div key={`${rowIndex}-${colIndex}`} className="pnp-skeleton-table__cell">
              <SkeletonCell type={col.type} />
            </div>
          ))}
        </div>
      ))}
      {showFooter ? (
        <div className="pnp-skeleton-table__foot">
          <span className="pnp-table-total">records</span>
          <div className="flex items-center gap-2">
            <SkeletonBone width={32} height={32} radius={8} />
            <SkeletonBone width={32} height={32} radius={8} />
            <SkeletonBone width={32} height={32} radius={8} />
            <SkeletonBone width={32} height={32} radius={8} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const ListingCardsSkeleton = ({ count = 3 }) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="rounded-2xl p-4"
        style={{ border: '1px solid var(--border-color)', background: 'var(--input-bg)' }}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <SkeletonBone width="60%" height={14} />
            <div className="mt-2">
              <SkeletonBone width="40%" height={10} />
            </div>
          </div>
          <SkeletonBone width={72} height={22} radius={999} />
        </div>
        <div className="flex gap-2 mb-3">
          <SkeletonBone width={64} height={64} radius={12} />
          <SkeletonBone width={64} height={64} radius={12} />
          <SkeletonBone width={64} height={64} radius={12} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SkeletonBone width={56} height={14} />
          <SkeletonBone width={72} height={12} />
          <SkeletonBone width={72} height={22} radius={999} />
          <SkeletonBone width={72} height={24} radius={6} />
        </div>
      </div>
    ))}
  </div>
);

const TableCard = ({ children, padded = false, minWidth }) => (
  <div className={`pnp-table-card${padded ? ' p-4' : ''}`} style={minWidth ? { overflowX: 'auto' } : undefined}>
    {children}
  </div>
);

export const DashboardSkeleton = () => (
  <div>
    <PageHeader title="Dashboard" description="PNP platform snapshot for users, owners, visits, and earnings." />
    <StatCardsSkeleton
      className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-5"
      items={[
        { label: 'Users', color: '#3b82f6' },
        { label: 'Owners', color: '#8b5cf6' },
        { label: 'Pending verification', color: '#f97316' },
        { label: 'Bookings', color: '#f59e0b' },
        { label: 'Net earnings', color: '#10b981' },
      ]}
    />
    <TableCard padded>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-semibold m-0" style={{ color: 'var(--text-primary)' }}>Recent history</h3>
        <span className="text-sm font-semibold text-blue-600">View all</span>
      </div>
      <TableSkeleton layout="dashboard" rows={8} showFooter={false} minWidth={720} />
    </TableCard>
  </div>
);

export const UsersPageSkeleton = () => (
  <div>
    <PageHeader title="Users" description="Everyone who has signed in with OTP, including hosts. Blocked users cannot log in." />
    <FilterBar
      search=""
      searchPlaceholder="Search name, phone, or city"
      onSearchChange={() => {}}
      filters={[
        { key: 'role', placeholder: 'Role', value: '', onChange: () => {}, options: [] },
        { key: 'blocked', placeholder: 'Access', value: '', onChange: () => {}, options: [] },
        { key: 'city', placeholder: 'City', value: '', onChange: () => {}, options: [] },
      ]}
    />
    <TableCard>
      <TableSkeleton layout="users" minWidth={980} />
    </TableCard>
  </div>
);

export const OwnersPageSkeleton = () => (
  <div>
    <PageHeader title="Owners" description="Use View toilets to see restrooms published by each host." />
    <FilterBar
      search=""
      searchPlaceholder="Search owner name, phone, or city"
      onSearchChange={() => {}}
      filters={[
        { key: 'blocked', placeholder: 'Access', value: '', onChange: () => {}, options: [] },
        { key: 'city', placeholder: 'City', value: '', onChange: () => {}, options: [] },
      ]}
    />
    <TableCard>
      <TableSkeleton layout="owners" minWidth={1080} />
    </TableCard>
  </div>
);

export const ListingsPageSkeleton = () => (
  <div>
    <PageHeader title="Toilets" description="Review owner restrooms and approve listings that should show as verified." />
    <FilterBar
      search=""
      searchPlaceholder="Search toilet, owner, or city"
      onSearchChange={() => {}}
      filters={[
        { key: 'verified', placeholder: 'Verification', value: '', onChange: () => {}, options: [] },
        { key: 'availability', placeholder: 'Availability', value: '', onChange: () => {}, options: [] },
        { key: 'category', placeholder: 'Category', value: '', onChange: () => {}, options: [] },
        { key: 'city', placeholder: 'City', value: '', onChange: () => {}, options: [] },
        { key: 'enabled', placeholder: 'Listing status', value: '', onChange: () => {}, options: [] },
        { key: 'ownerBlocked', placeholder: 'Owner access', value: '', onChange: () => {}, options: [] },
      ]}
    />
    <TableCard>
      <TableSkeleton layout="listings" minWidth={1280} />
    </TableCard>
  </div>
);

export const HistoryPageSkeleton = () => (
  <div>
    <PageHeader title="History" description="All paid visits across customers and hosts." />
    <FilterBar
      search=""
      searchPlaceholder="Search toilet, customer, phone, or booking ID"
      onSearchChange={() => {}}
      dateRange={null}
      onDateRangeChange={() => {}}
      filters={[
        { key: 'status', placeholder: 'Visit status', value: '', onChange: () => {}, options: [] },
        { key: 'paymentStatus', placeholder: 'Payment', value: '', onChange: () => {}, options: [] },
      ]}
    />
    <TableCard>
      <TableSkeleton layout="history" minWidth={960} />
    </TableCard>
  </div>
);

export const ReviewsPageSkeleton = () => (
  <div>
    <PageHeader title="Reviews" description="Guest ratings and photos submitted after a paid visit." />
    <FilterBar
      search=""
      searchPlaceholder="Search reviewer, toilet, or comment"
      onSearchChange={() => {}}
      filters={[{ key: 'minRating', placeholder: 'Rating', value: '', onChange: () => {}, options: [] }]}
    />
    <TableCard>
      <TableSkeleton layout="reviews" minWidth={1100} />
    </TableCard>
  </div>
);

export const EarningsPageSkeleton = () => (
  <div>
    <PageHeader title="Earnings" description="Paid visit revenue and host payouts. Access is granted only after payment, so every transaction here is paid." />
    <StatCardsSkeleton
      className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
      items={[
        { label: 'Today', hint: 'Net', color: '#3b82f6' },
        { label: 'This week', hint: 'Net', color: '#6366f1' },
        { label: 'This month', hint: 'Net', color: '#8b5cf6' },
        { label: 'Lifetime net', hint: 'Host payout', color: '#0ea5e9' },
        { label: 'Gross', hint: 'Paid by users', color: '#10b981' },
        { label: 'Platform fees', hint: 'Commission', color: '#f59e0b' },
        { label: 'Visits', hint: 'Paid', color: '#2563eb' },
        { label: 'Listings', hint: 'Toilets', color: '#16a34a' },
      ]}
    />
    <FilterBar
      search=""
      searchPlaceholder="Search transaction, toilet, or owner"
      onSearchChange={() => {}}
      dateRange={null}
      onDateRangeChange={() => {}}
      filters={[
        { key: 'settlementStatus', placeholder: 'Settlement', value: '', onChange: () => {}, options: [] },
        { key: 'paymentStatus', placeholder: 'Payment', value: '', onChange: () => {}, options: [] },
      ]}
    />
    <TableCard>
      <TableSkeleton layout="earnings" minWidth={920} />
    </TableCard>
  </div>
);

export const MasterPageSkeleton = () => (
  <div>
    <PageHeader
      title="Master data"
      description="Categories, availability, and facilities used by the mobile listing form and discovery filters."
      primaryAction={{ label: 'Add option', onClick: () => {}, props: { disabled: true } }}
    />
    <div className="flex gap-6 mb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
      {['Categories', 'Availability', 'Facilities'].map((label, index) => (
        <div
          key={label}
          className="pb-3 text-sm"
          style={{
            color: index === 0 ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: index === 0 ? 600 : 500,
            borderBottom: index === 0 ? '2px solid #2563eb' : '2px solid transparent',
          }}
        >
          {label}
        </div>
      ))}
    </div>
    <FilterBar
      search=""
      searchPlaceholder="Search label or value"
      onSearchChange={() => {}}
      filters={[{ key: 'active', placeholder: 'Status', value: '', onChange: () => {}, options: [] }]}
    />
    <TableCard>
      <TableSkeleton layout="master" minWidth={720} />
    </TableCard>
  </div>
);

export const PushPageSkeleton = ({ includeHeader = false }) => (
  <div>
    {includeHeader ? (
      <PageHeader
        title="Push notifications"
        description="Create a campaign from a template, or send the account blocked / restored message that also fires automatically from Users and Owners."
      />
    ) : null}
    <div className="flex gap-6 mb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
      {['Send campaign', 'Block / restore'].map((label, index) => (
        <div
          key={label}
          className="pb-3 text-sm"
          style={{
            color: index === 0 ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: index === 0 ? 600 : 500,
            borderBottom: index === 0 ? '2px solid #2563eb' : '2px solid transparent',
          }}
        >
          {label}
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-4">
      <div className="pnp-table-card p-6">
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Choose a template, then edit the copy before sending.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <SkeletonBone height={88} radius={12} />
          <SkeletonBone height={88} radius={12} />
        </div>
        <SkeletonBone width={72} height={12} />
        <div className="mt-3">
          <SkeletonBone height={32} radius={8} />
        </div>
        <div className="mt-5">
          <SkeletonBone width={48} height={12} />
        </div>
        <div className="mt-3">
          <SkeletonBone height={32} radius={8} />
        </div>
        <div className="mt-5">
          <SkeletonBone width={72} height={12} />
        </div>
        <div className="mt-3">
          <SkeletonBone height={96} radius={8} />
        </div>
        <div className="mt-5">
          <SkeletonBone width={168} height={32} radius={8} />
        </div>
      </div>
      <div className="pnp-table-card p-6">
        <div className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Preview</div>
        <div className="rounded-2xl p-4" style={{ background: '#111827' }}>
          <div className="text-xs opacity-70 text-white mb-2">PNP</div>
          <SkeletonBone width="60%" height={16} />
          <div className="mt-3">
            <SkeletonBone width="88%" height={12} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const SettingsPageSkeleton = () => (
  <div className="pb-12 font-sans">
    <div className="mb-6">
      <h1 className="text-xl sm:text-2xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>Settings</h1>
      <p className="text-sm mt-1 m-0" style={{ color: 'var(--text-secondary)' }}>
        Manage your account, security and application preferences.
      </p>
    </div>
    <div
      className="flex gap-2 mb-6 p-1 rounded-2xl"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
    >
      {['Profile', 'Security', 'Notifications', 'Appearance'].map((label, index) => (
        <div
          key={label}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{
            background: index === 0 ? '#2563eb' : 'transparent',
            color: index === 0 ? '#fff' : 'var(--text-secondary)',
          }}
        >
          {label}
        </div>
      ))}
    </div>
    <div className="max-w-4xl pnp-table-card p-6">
      <div className="flex items-center gap-4 mb-6">
        <SkeletonBone width={64} height={64} circle />
        <div className="flex-1">
          <SkeletonBone width={180} height={16} />
          <div className="mt-2">
            <SkeletonBone width={220} height={12} />
          </div>
        </div>
      </div>
      <SkeletonBone height={40} radius={8} />
      <div className="mt-4">
        <SkeletonBone height={40} radius={8} />
      </div>
      <div className="mt-4">
        <SkeletonBone height={40} radius={8} />
      </div>
    </div>
  </div>
);

export const ListPageSkeleton = UsersPageSkeleton;

export const RoutePageSkeleton = () => {
  const { pathname } = useLocation();
  if (pathname === '/') return <DashboardSkeleton />;
  if (pathname.startsWith('/users')) return <UsersPageSkeleton />;
  if (pathname.startsWith('/owners')) return <OwnersPageSkeleton />;
  if (pathname.startsWith('/listings')) return <ListingsPageSkeleton />;
  if (pathname.startsWith('/history')) return <HistoryPageSkeleton />;
  if (pathname.startsWith('/reviews')) return <ReviewsPageSkeleton />;
  if (pathname.startsWith('/earnings')) return <EarningsPageSkeleton />;
  if (pathname.startsWith('/master-data')) return <MasterPageSkeleton />;
  if (pathname.startsWith('/push-notifications') || pathname.startsWith('/notifications')) {
    return <PushPageSkeleton includeHeader />;
  }
  if (pathname.startsWith('/settings')) return <SettingsPageSkeleton />;
  return <UsersPageSkeleton />;
};
