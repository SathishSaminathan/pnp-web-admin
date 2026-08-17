import React from 'react';
import { Avatar, Tooltip, Button, Dropdown, Tag } from 'antd';
import { EyeOutlined, MoreOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { formatDate } from '../../../utils/formatters';
import { formatAmount } from '../../../utils/number.utils';
import TransactionStatusTag from './TransactionStatusTag';

const useTxnColumns = ({ isMobile, onView, copiedId, setCopiedId }) => [
    {
        title: 'Merchant',
        key: 'merchant',
        fixed: 'left',
        width: isMobile ? 160 : 220,
        render: (_, r) => {
            const user = r.user ?? {};
            const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '—';
            const initials = name
                .split(' ')
                .slice(0, 2)
                .map((w) => w[0] ?? '')
                .join('')
                .toUpperCase() || '?';
            return (
                <div className="flex items-center gap-3">
                    <Avatar
                        size={34}
                        style={{
                            background: 'linear-gradient(135deg,#4f46e5,#06b6d4)',
                            fontSize: 13,
                            fontWeight: 700,
                            flexShrink: 0,
                        }}
                    >
                        {initials}
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                            {name}
                        </span>
                        <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                            {user.emailId ?? '—'}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        title: 'TXN ID',
        dataIndex: 'transactionId',
        key: 'transactionId',
        width: 200,
        render: (v, r) => (
            <Tooltip title={copiedId === r._id ? 'Copied!' : 'Click to copy'}>
                <span
                    className="font-mono text-xs flex items-center gap-1 cursor-pointer group w-fit max-w-full"
                    style={{ color: 'var(--text-primary)', fontWeight: 600 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(v ?? '');
                        setCopiedId(r._id);
                        setTimeout(() => setCopiedId(null), 1500);
                    }}
                >
                    <span className="truncate" style={{ maxWidth: 160 }}>{v ?? '—'}</span>
                    {copiedId === r._id ? (
                        <svg
                            className="shrink-0 transition-all"
                            style={{ color: '#10b981' }}
                            width="11" height="11" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    ) : (
                        <svg
                            className="opacity-0 group-hover:opacity-50 transition-opacity shrink-0"
                            width="11" height="11" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <rect x="9" y="9" width="13" height="13" rx="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                    )}
                </span>
            </Tooltip>
        ),
    },
    {
        title: 'Type',
        dataIndex: 'transactionType',
        key: 'transactionType',
        width: 95,
        render: (v) => (
            <div className="flex items-center gap-1.5">
                {v === 'credit' ? (
                    <ArrowDownOutlined style={{ color: '#10b981', fontSize: 12 }} />
                ) : (
                    <ArrowUpOutlined style={{ color: '#ef4444', fontSize: 12 }} />
                )}
                <span
                    className="text-xs font-semibold capitalize"
                    style={{ color: v === 'credit' ? '#10b981' : '#ef4444' }}
                >
                    {v ?? '—'}
                </span>
            </div>
        ),
    },
    {
        title: 'Amount',
        key: 'amount',
        width: 140,
        align: 'right',
        render: (_, r) => (
            <div>
                <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {formatAmount(r.amount)}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {r.source?.currency ?? '—'}
                </div>
            </div>
        ),
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (v) => <TransactionStatusTag status={v} />,
    },
    {
        title: 'Method',
        dataIndex: 'paymentMethod',
        key: 'paymentMethod',
        width: 110,
        responsive: ['sm'],
        render: (v) => (
            <Tag color="geekblue" style={{ borderRadius: 20, fontSize: 11 }}>
                {v ?? '—'}
            </Tag>
        ),
    },
    {
        title: 'Source',
        key: 'source',
        width: 140,
        responsive: ['md'],
        render: (_, r) => (
            <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {r.source?.accountType ?? '—'}
                </span>
            </div>
        ),
    },
    {
        title: 'Destination',
        key: 'destination',
        width: 140,
        responsive: ['lg'],
        render: (_, r) => (
            <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {r.destination?.accountType ?? '—'}
                </span>
            </div>
        ),
    },
    {
        title: 'Date',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 110,
        responsive: ['md'],
        render: (d) => (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {formatDate(d)}
            </span>
        ),
    },
    {
        title: 'Actions',
        key: 'actions',
        width: 80,
        fixed: 'right',
        render: (_, record) =>
            isMobile ? (
                <Dropdown
                    trigger={['click']}
                    menu={{
                        items: [
                            { key: 'view', label: 'View Details', icon: <EyeOutlined /> },
                        ],
                        onClick: ({ key, domEvent }) => {
                            domEvent.stopPropagation();
                            if (key === 'view') onView(record);
                        },
                    }}
                >
                    <Button
                        size="small"
                        icon={<MoreOutlined />}
                        onClick={(e) => e.stopPropagation()}
                    />
                </Dropdown>
            ) : (
                <Tooltip title="View Details">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            onView(record);
                        }}
                        style={{ color: 'var(--text-secondary)' }}
                    />
                </Tooltip>
            ),
    },
];

export default useTxnColumns;
