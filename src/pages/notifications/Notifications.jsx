import React, { useState, useEffect, useCallback } from 'react';
import {
    Badge, Button, Tabs, Input, Checkbox, Tag, Tooltip,
    Popconfirm, Empty, Skeleton, message,
} from 'antd';
import {
    BellOutlined,
    CheckOutlined,
    DeleteOutlined,
    ReloadOutlined,
    SearchOutlined,
    CheckCircleOutlined,
    SafetyCertificateOutlined,
    LockOutlined,
    SettingOutlined,
    DollarCircleOutlined,
    InfoCircleOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';

/* ─────────────── Mock API ─────────────── */
const MOCK = [
    {
        id: 1, category: 'transaction', read: false, important: true,
        icon: '💸', tag: 'Transaction', tagColor: 'green',
        title: 'Payment Received',
        body: 'You received $1,250.00 from Acme Corp via Virtual Account (VA-001).',
        time: '2 min ago', ts: Date.now() - 2 * 60e3,
    },
    {
        id: 2, category: 'kyc', read: false, important: true,
        icon: '🪪', tag: 'KYC', tagColor: 'orange',
        title: 'KYC Verification Approved',
        body: 'Merchant "TechVentures Ltd" identity verification was successful.',
        time: '35 min ago', ts: Date.now() - 35 * 60e3,
    },
    {
        id: 3, category: 'security', read: false, important: false,
        icon: '🔐', tag: 'Security', tagColor: 'red',
        title: 'New Admin Login Detected',
        body: 'Sign-in from Chrome on macOS (Bangalore, IN). Not you? Secure your account.',
        time: '1 hr ago', ts: Date.now() - 60 * 60e3,
    },
    {
        id: 4, category: 'transaction', read: true, important: false,
        icon: '💳', tag: 'Card', tagColor: 'cyan',
        title: 'Virtual Card Issued',
        body: 'New virtual card ending in 4782 issued for merchant "GlobalTrade Inc".',
        time: '3 hr ago', ts: Date.now() - 3 * 60 * 60e3,
    },
    {
        id: 5, category: 'system', read: true, important: false,
        icon: '⚙️', tag: 'System', tagColor: 'purple',
        title: 'API Key Expiring Soon',
        body: 'Production API key will expire in 7 days. Please rotate it to avoid interruptions.',
        time: 'Yesterday', ts: Date.now() - 24 * 60 * 60e3,
    },
    {
        id: 6, category: 'transaction', read: true, important: false,
        icon: '💰', tag: 'Wallet', tagColor: 'blue',
        title: 'USDC Wallet Top-Up',
        body: '5,000 USDC credited to wallet from external address 0x3f…9a12.',
        time: 'Yesterday', ts: Date.now() - 26 * 60 * 60e3,
    },
    {
        id: 7, category: 'security', read: true, important: false,
        icon: '🛡️', tag: 'Security', tagColor: 'red',
        title: 'Admin Password Changed',
        body: 'Account password changed successfully for admin@meralot.com.',
        time: '2 days ago', ts: Date.now() - 48 * 60 * 60e3,
    },
    {
        id: 8, category: 'system', read: true, important: false,
        icon: '🚀', tag: 'Update', tagColor: 'geekblue',
        title: 'New Feature: OnRamp v2',
        body: 'OnRamp v2 launched with faster fiat-to-crypto conversions and lower fees.',
        time: '3 days ago', ts: Date.now() - 72 * 60 * 60e3,
    },
    {
        id: 9, category: 'transaction', read: true, important: false,
        icon: '📤', tag: 'Transaction', tagColor: 'green',
        title: 'Withdrawal Processed',
        body: 'Withdrawal of $3,200.00 to IBAN DE89****4321 processed (1–2 business days).',
        time: '4 days ago', ts: Date.now() - 96 * 60 * 60e3,
    },
    {
        id: 10, category: 'kyc', read: true, important: false,
        icon: '📋', tag: 'KYC', tagColor: 'orange',
        title: 'KYC Document Review Pending',
        body: 'Documents submitted by "Horizon Payments" are under review (24–48 hrs).',
        time: '5 days ago', ts: Date.now() - 120 * 60 * 60e3,
    },
    {
        id: 11, category: 'system', read: true, important: false,
        icon: '🔔', tag: 'System', tagColor: 'purple',
        title: 'Scheduled Maintenance',
        body: 'System maintenance scheduled on Mar 10, 02:00–04:00 UTC. Expect brief downtime.',
        time: '6 days ago', ts: Date.now() - 144 * 60 * 60e3,
    },
    {
        id: 12, category: 'transaction', read: true, important: false,
        icon: '📥', tag: 'Transaction', tagColor: 'green',
        title: 'Refund Initiated',
        body: 'Refund of $450.00 initiated for order #ORD-88231. Processing in 3–5 business days.',
        time: '1 week ago', ts: Date.now() - 168 * 60 * 60e3,
    },
];

const mockFetch = () => new Promise(r => setTimeout(() => r([...MOCK]), 900));

/* ─────────────── Tab config ─────────────── */
const TABS = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'transaction', label: 'Transactions' },
    { key: 'kyc', label: 'KYC' },
    { key: 'security', label: 'Security' },
    { key: 'system', label: 'System' },
];

/* ─────────────── Category icon map ─────────────── */
const CATEGORY_ICONS = {
    transaction: <DollarCircleOutlined />,
    kyc: <SafetyCertificateOutlined />,
    security: <LockOutlined />,
    system: <SettingOutlined />,
};

/* ═══════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════ */
const Notifications = () => {
    const { isDark } = useTheme();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(new Set());

    /* load */
    const load = useCallback(() => {
        mockFetch().then(data => { setItems(data); setLoading(false); });
    }, []);

    useEffect(() => { load(); }, [load]);

    /* derived */
    const filtered = items.filter(n => {
        const matchTab =
            activeTab === 'all' ? true :
            activeTab === 'unread' ? !n.read :
            n.category === activeTab;
        const q = search.toLowerCase();
        const matchQ = !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
        return matchTab && matchQ;
    });

    const unreadCount = items.filter(n => !n.read).length;

    const tabItems = TABS.map(t => {
        const cnt =
            t.key === 'all' ? items.length :
            t.key === 'unread' ? items.filter(n => !n.read).length :
            items.filter(n => n.category === t.key).length;
        return {
            key: t.key,
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {t.label}
                    {cnt > 0 && (
                        <Badge
                            count={cnt}
                            style={{
                                backgroundColor: t.key === 'unread' ? '#2563eb' : 'var(--border-color)',
                                color: t.key === 'unread' ? '#fff' : 'var(--text-secondary)',
                                boxShadow: 'none',
                                fontWeight: 600,
                                fontSize: 11,
                            }}
                            overflowCount={99}
                        />
                    )}
                </span>
            ),
        };
    });

    /* actions */
    const markRead = (ids) => {
        setItems(p => p.map(n => ids.includes(n.id) ? { ...n, read: true } : n));
        setSelected(new Set());
        message.success(`Marked ${ids.length} notification${ids.length > 1 ? 's' : ''} as read`);
    };

    const markAllRead = () => {
        setItems(p => p.map(n => ({ ...n, read: true })));
        setSelected(new Set());
        message.success('All notifications marked as read');
    };

    const deleteItems = (ids) => {
        setItems(p => p.filter(n => !ids.includes(n.id)));
        setSelected(new Set());
        message.success(`Deleted ${ids.length} notification${ids.length > 1 ? 's' : ''}`);
    };

    const toggleSelect = id => {
        setSelected(p => {
            const n = new Set(p);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    };

    const allFilteredSelected = filtered.length > 0 && filtered.every(n => selected.has(n.id));
    const someSelected = filtered.some(n => selected.has(n.id)) && !allFilteredSelected;

    const toggleSelectAll = () => {
        if (allFilteredSelected) {
            setSelected(p => { const n = new Set(p); filtered.forEach(n2 => n.delete(n2.id)); return n; });
        } else {
            setSelected(p => { const n = new Set(p); filtered.forEach(n2 => n.add(n2.id)); return n; });
        }
    };

    const selectedArr = [...selected];
    const hasUnreadSelected = selectedArr.some(id => !items.find(n => n.id === id)?.read);

    return (
        <div>
            {/* ── Page Header ── */}
            <div
                className="rounded-2xl mb-5 p-5 sm:p-6"
                style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-card)',
                }}
            >
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0"
                            style={{ background: isDark ? 'rgba(37,99,235,0.2)' : '#eff6ff', color: '#3b82f6' }}
                        >
                            <BellOutlined />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>
                                Notifications
                                {unreadCount > 0 && (
                                    <span
                                        className="ml-2 text-xs font-semibold rounded-full px-2 py-0.5"
                                        style={{ background: '#2563eb', color: '#fff', verticalAlign: 'middle' }}
                                    >
                                        {unreadCount} new
                                    </span>
                                )}
                            </h1>
                            <p className="text-sm m-0 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                Stay on top of account activity, alerts and updates.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {unreadCount > 0 && (
                            <Button
                                type="default"
                                size="small"
                                icon={<CheckCircleOutlined />}
                                onClick={markAllRead}
                                style={{
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--text-secondary)',
                                    background: 'var(--input-bg)',
                                    fontSize: 13,
                                }}
                            >
                                Mark all read
                            </Button>
                        )}
                        <Tooltip title="Refresh">
                            <Button
                                type="default"
                                size="small"
                                icon={<ReloadOutlined spin={loading} />}
                                onClick={() => { setLoading(true); load(); }}
                                style={{
                                    borderColor: 'var(--border-color)',
                                    color: 'var(--text-secondary)',
                                    background: 'var(--input-bg)',
                                }}
                            />
                        </Tooltip>
                    </div>
                </div>

                {/* Search */}
                <div className="mt-4">
                    <Input
                        allowClear
                        prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
                        placeholder="Search notifications..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            background: 'var(--input-bg)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-primary)',
                            borderRadius: 10,
                            maxWidth: 420,
                        }}
                    />
                </div>

                {/* Tabs */}
                <div className="mt-4 -mb-5">
                    <Tabs
                        activeKey={activeTab}
                        onChange={k => { setActiveTab(k); setSelected(new Set()); }}
                        items={tabItems}
                        size="small"
                        style={{ color: 'var(--text-secondary)' }}
                    />
                </div>
            </div>

            {/* ── Bulk action bar ── */}
            {selected.size > 0 && (
                <div
                    className="rounded-xl px-4 py-3 mb-3 flex flex-wrap items-center justify-between gap-3"
                    style={{
                        background: isDark ? 'rgba(37,99,235,0.14)' : '#eff6ff',
                        border: '1px solid rgba(37,99,235,0.25)',
                    }}
                >
                    <span className="text-sm font-semibold" style={{ color: '#3b82f6' }}>
                        {selected.size} selected
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {hasUnreadSelected && (
                            <Button
                                size="small"
                                type="primary"
                                ghost
                                icon={<CheckOutlined />}
                                onClick={() => markRead(selectedArr)}
                                style={{ fontSize: 13 }}
                            >
                                Mark read
                            </Button>
                        )}
                        <Popconfirm
                            title={`Delete ${selected.size} notification${selected.size > 1 ? 's' : ''}?`}
                            onConfirm={() => deleteItems(selectedArr)}
                            okText="Delete"
                            okButtonProps={{ danger: true }}
                            cancelText="Cancel"
                        >
                            <Button
                                size="small"
                                danger
                                ghost
                                icon={<DeleteOutlined />}
                                style={{ fontSize: 13 }}
                            >
                                Delete
                            </Button>
                        </Popconfirm>
                        <Button
                            size="small"
                            type="text"
                            icon={<CloseOutlined />}
                            onClick={() => setSelected(new Set())}
                            style={{ color: 'var(--text-muted)', fontSize: 13 }}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            )}

            {/* ── List container ── */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-card)',
                }}
            >
                {/* Select-all row */}
                {!loading && filtered.length > 0 && (
                    <div
                        className="flex items-center justify-between px-5 py-3"
                        style={{ borderBottom: '1px solid var(--border-color)' }}
                    >
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <Checkbox
                                checked={allFilteredSelected}
                                indeterminate={someSelected}
                                onChange={toggleSelectAll}
                            />
                            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                                Select all
                            </span>
                        </label>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                )}

                {/* Skeleton */}
                {loading && (
                    <div className="p-4 space-y-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex gap-3 p-4 rounded-xl"
                                style={{ background: 'var(--input-bg)' }}
                            >
                                <Skeleton.Avatar active size={44} shape="square" style={{ borderRadius: 10 }} />
                                <div className="flex-1">
                                    <Skeleton active title={{ width: '40%' }} paragraph={{ rows: 2, width: ['90%', '60%'] }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && filtered.length === 0 && (
                    <div className="py-16">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div>
                                    <p className="text-sm font-medium m-0" style={{ color: 'var(--text-primary)' }}>
                                        {search ? 'No results found' : "You're all caught up!"}
                                    </p>
                                    <p className="text-xs mt-1 m-0" style={{ color: 'var(--text-muted)' }}>
                                        {search ? 'Try a different search or filter.' : 'No notifications in this category.'}
                                    </p>
                                    {search && (
                                        <Button
                                            type="link"
                                            size="small"
                                            className="mt-2"
                                            onClick={() => { setSearch(''); setActiveTab('all'); }}
                                        >
                                            Clear search
                                        </Button>
                                    )}
                                </div>
                            }
                        />
                    </div>
                )}

                {/* Notification rows */}
                {!loading && filtered.map((n, idx) => (
                    <NotifRow
                        key={n.id}
                        n={n}
                        isDark={isDark}
                        selected={selected.has(n.id)}
                        onSelect={() => toggleSelect(n.id)}
                        onMarkRead={() => markRead([n.id])}
                        onDelete={() => deleteItems([n.id])}
                        isLast={idx === filtered.length - 1}
                    />
                ))}
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════
   Notification Row
═══════════════════════════════════════════════════ */
const AVATAR_COLORS = {
    transaction: { light: '#f0fdf4', dark: 'rgba(34,197,94,0.12)', color: '#22c55e' },
    kyc:         { light: '#fff7ed', dark: 'rgba(249,115,22,0.12)', color: '#f97316' },
    security:    { light: '#fff1f2', dark: 'rgba(239,68,68,0.12)',  color: '#ef4444' },
    system:      { light: '#f5f3ff', dark: 'rgba(139,92,246,0.12)', color: '#8b5cf6' },
};

function NotifRow({ n, isDark, selected, onSelect, onMarkRead, onDelete, isLast }) {
    const [hovered, setHovered] = useState(false);
    const ac = AVATAR_COLORS[n.category] || AVATAR_COLORS.system;
    const avatarBg = isDark ? ac.dark : ac.light;

    const rowBg = selected
        ? (isDark ? 'rgba(37,99,235,0.12)' : '#eff6ff')
        : !n.read
        ? (isDark ? 'rgba(37,99,235,0.06)' : 'rgba(37,99,235,0.03)')
        : hovered
        ? (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)')
        : 'transparent';

    return (
        <div
            className="flex gap-3 px-4 sm:px-5 py-4 transition-all relative"
            style={{
                background: rowBg,
                borderBottom: isLast ? 'none' : '1px solid var(--border-color)',
                transition: 'background 0.18s',
                borderLeft: !n.read
                    ? `3px solid ${isDark ? '#3b82f6' : '#2563eb'}`
                    : '3px solid transparent',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Checkbox */}
            <div
                className="shrink-0 pt-1"
                style={{
                    opacity: hovered || selected ? 1 : 0,
                    transition: 'opacity 0.15s',
                    width: 16,
                }}
                onClick={e => { e.stopPropagation(); onSelect(); }}
            >
                <Checkbox
                    checked={selected}
                    onChange={onSelect}
                    onClick={e => e.stopPropagation()}
                />
            </div>

            {/* Avatar */}
            <div
                className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                style={{ background: avatarBg }}
                onClick={() => !n.read && onMarkRead()}
            >
                {n.icon}
            </div>

            {/* Body */}
            <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => !n.read && onMarkRead()}
            >
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                        className="text-sm leading-snug"
                        style={{
                            color: 'var(--text-primary)',
                            fontWeight: n.read ? 500 : 700,
                        }}
                    >
                        {n.title}
                    </span>
                    {!n.read && (
                        <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: '#2563eb', display: 'inline-block' }}
                        />
                    )}
                    <Tag
                        color={n.tagColor}
                        style={{ fontSize: 11, lineHeight: '18px', padding: '0 7px', margin: 0, borderRadius: 20 }}
                    >
                        {n.tag}
                    </Tag>
                </div>

                <p
                    className="text-xs leading-relaxed m-0"
                    style={{
                        color: 'var(--text-secondary)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}
                >
                    {n.body}
                </p>

                <span className="text-xs mt-1 block" style={{ color: 'var(--text-muted)', opacity: 0.75 }}>
                    {n.time}
                </span>
            </div>

            {/* Action buttons – visible on hover */}
            <div
                className="flex flex-col gap-1.5 shrink-0 ml-1"
                style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}
            >
                {!n.read && (
                    <Tooltip title="Mark as read">
                        <button
                            onClick={e => { e.stopPropagation(); onMarkRead(); }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs cursor-pointer transition-all"
                            style={{
                                background: isDark ? 'rgba(37,99,235,0.15)' : '#eff6ff',
                                border: '1px solid rgba(37,99,235,0.25)',
                                color: '#3b82f6',
                            }}
                        >
                            <CheckOutlined />
                        </button>
                    </Tooltip>
                )}
                <Tooltip title="Delete">
                    <Popconfirm
                        title="Delete this notification?"
                        onConfirm={() => onDelete()}
                        okText="Delete"
                        okButtonProps={{ danger: true, size: 'small' }}
                        cancelText="Cancel"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs cursor-pointer transition-all"
                            style={{
                                background: isDark ? 'rgba(239,68,68,0.1)' : '#fff1f2',
                                border: '1px solid rgba(239,68,68,0.2)',
                                color: '#ef4444',
                            }}
                        >
                            <DeleteOutlined />
                        </button>
                    </Popconfirm>
                </Tooltip>
            </div>
        </div>
    );
}

export default Notifications;
