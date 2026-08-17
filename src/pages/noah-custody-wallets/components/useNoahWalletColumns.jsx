import React from 'react';
import { Avatar, Tag, Tooltip, Button, Dropdown } from 'antd';
import { EyeOutlined, MoreOutlined, SyncOutlined } from '@ant-design/icons';
import { formatDate } from '../../../utils/formatters';
import { formatAmount } from '../../../utils/number.utils';
import NoahWalletStateTag from './NoahWalletStateTag';

const useNoahWalletColumns = ({ isMobile, onView, onSync, syncingId, copiedId, setCopiedId }) => [
    {
        title: 'Merchant',
        key: 'merchant',
        fixed: 'left',
        width: isMobile ? 160 : 220,
        render: (_, r) => {
            const user = r.userId ?? {};
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
                        <span
                            className="font-semibold text-sm truncate"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {name}
                        </span>
                        <span
                            className="text-xs truncate"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            {user.emailId ?? '—'}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        title: 'Wallet ID',
        dataIndex: 'walletId',
        key: 'walletId',
        width: 200,
        render: (v, r) => (
            <Tooltip title={copiedId === r._id ? 'Copied!' : (v ?? '—')}>
                <span
                    className="font-mono text-xs truncate flex items-center gap-1 cursor-pointer group w-fit max-w-full"
                    style={{ color: 'var(--text-primary)', maxWidth: 180 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(v ?? '');
                        setCopiedId(r._id);
                        setTimeout(() => setCopiedId(null), 1500);
                    }}
                >
                    <span className="truncate">{v ?? '—'}</span>
                    {copiedId === r._id ? (
                        <svg className="shrink-0 transition-all" style={{ color: '#10b981' }}
                            width="11" height="11" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    ) : (
                        <svg className="opacity-0 group-hover:opacity-50 transition-opacity shrink-0"
                            width="11" height="11" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                    )}
                </span>
            </Tooltip>
        ),
    },
    {
        title: 'Blockchain',
        dataIndex: 'blockchain',
        key: 'blockchain',
        width: 140,
        render: (v, r) => (
            <div className="flex flex-col min-w-0">
                <Tag color="geekblue" style={{ borderRadius: 20, fontSize: 11, width: 'fit-content' }}>
                    {v ?? '—'}
                </Tag>
                {r.network && (
                    <span className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {r.network}
                    </span>
                )}
            </div>
        ),
    },
    {
        title: 'State',
        dataIndex: 'state',
        key: 'state',
        width: 110,
        render: (v) => <NoahWalletStateTag state={v} />,
    },
    {
        title: 'Custody Type',
        dataIndex: 'custodyType',
        key: 'custodyType',
        width: 130,
        responsive: ['sm'],
        render: (v) => (
            <Tag color={v === 'DEVELOPER' ? 'purple' : 'cyan'} style={{ borderRadius: 20, fontSize: 11 }}>
                {v ?? '—'}
            </Tag>
        ),
    },
    {
        title: 'Balance',
        key: 'balance',
        width: 140,
        align: 'right',
        render: (_, r) => (
            <div>
                <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {formatAmount(r.accountBalance)}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {r.cryptoCurrency ?? 'USDC'}
                </div>
            </div>
        ),
    },
    {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
        width: 160,
        responsive: ['lg'],
        render: (v) =>
            v ? (
                <Tooltip title={v}>
                    <span
                        className="font-mono text-xs truncate block"
                        style={{ color: 'var(--text-muted)', maxWidth: 140 }}
                    >
                        {`${v.slice(0, 8)}…${v.slice(-6)}`}
                    </span>
                </Tooltip>
            ) : (
                <span style={{ color: 'var(--text-muted)' }}>—</span>
            ),
    },
    {
        title: 'Created',
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
        width: 110,
        fixed: 'right',
        render: (_, record) =>
            isMobile ? (
                <Dropdown
                    trigger={['click']}
                    menu={{
                        items: [
                            {
                                key: 'view',
                                label: 'View Details',
                                icon: <EyeOutlined />,
                            },
                            {
                                key: 'sync',
                                label: <span style={{ color: '#6366f1' }}>Sync Balance</span>,
                                icon: <SyncOutlined style={{ color: '#6366f1' }} />,
                                disabled: syncingId === record._id,
                            },
                        ],
                        onClick: ({ key, domEvent }) => {
                            domEvent.stopPropagation();
                            if (key === 'view') onView(record);
                            if (key === 'sync') onSync?.(record);
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
                <div className="flex items-center gap-1">
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
                    <Tooltip title="Sync Balance">
                        <Button
                            type="text"
                            icon={<SyncOutlined spin={syncingId === record._id} />}
                            loading={syncingId === record._id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSync?.(record);
                            }}
                            style={{ color: '#6366f1' }}
                        />
                    </Tooltip>
                </div>
            ),
    },
];

export default useNoahWalletColumns;
