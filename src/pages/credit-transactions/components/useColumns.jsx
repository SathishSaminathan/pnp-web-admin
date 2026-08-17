import React from 'react';
import { Tag, Avatar, Tooltip, Button, Dropdown } from 'antd';
import {
    EyeOutlined,
    CheckOutlined,
    CloseOutlined,
    MoreOutlined,
} from '@ant-design/icons';
import { formatDate } from '../../../utils/formatters';
import { formatAmount } from '../../../utils/number.utils';
import CreditTxStatusTag from './CreditTxStatusTag';
import { CAN_APPROVE, CAN_REJECT } from '../constants';

const useColumns = ({ isMobile, copiedId, setCopiedId, openDrawer, openAction }) => [
    {
        title: 'Transaction',
        key: 'txn',
        fixed: 'left',
        width: isMobile ? 160 : 220,
        render: (_, r) => {
            const user = r.user ?? {};
            const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.emailId || '—';
            const initials = name.split(' ').slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase() || '?';
            return (
                <div className="flex items-center gap-3">
                    <Avatar
                        size={34}
                        style={{
                            background: 'linear-gradient(135deg,#4f46e5,#06b6d4)',
                            fontSize: 13, fontWeight: 700, flexShrink: 0,
                        }}
                    >
                        {initials}
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                        <Tooltip title={copiedId === r._id ? 'Copied!' : 'Click to copy'}>
                            <span
                                className="font-mono text-xs flex items-center gap-1 cursor-pointer group w-fit max-w-full"
                                style={{ color: 'var(--text-primary)', fontWeight: 600 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(r.transactionId ?? '');
                                    setCopiedId(r._id);
                                    setTimeout(() => setCopiedId(null), 1500);
                                }}
                            >
                                <span className="truncate">{r.transactionId}</span>
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
                        <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                            {name}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        title: 'Merchant',
        key: 'merchant',
        width: 180,
        responsive: ['md'],
        render: (_, r) => {
            const user = r.user ?? {};
            return (
                <div className="flex flex-col min-w-0">
                    <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {user.emailId ?? '—'}
                    </span>
                    {user.mobileNumber && (
                        <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                            {user.mobileNumber}
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        title: 'Method',
        dataIndex: 'paymentMethod',
        key: 'method',
        width: 140,
        responsive: ['sm'],
        render: (v) => (
            <Tag style={{ borderRadius: 20 }}>{v || '—'}</Tag>
        ),
    },
    {
        title: 'Amount',
        key: 'amount',
        width: 150,
        render: (_, r) => (
            <div className="text-right">
                <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {formatAmount(r.amount)} {r.feeCurrency ?? 'USD'}
                </div>
                {r.totalFee > 0 && (
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Fee: {r.totalFee} {r.feeCurrency ?? 'USD'}
                    </div>
                )}
                <div className="font-mono text-xs font-semibold" style={{ color: '#10b981' }}>
                    Net: {formatAmount(r.totalAmount)} {r.feeCurrency ?? 'USD'}
                </div>
            </div>
        ),
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 130,
        render: (s) => <CreditTxStatusTag status={s} />,
    },
    {
        title: 'Date',
        key: 'date',
        width: 130,
        responsive: ['md'],
        render: (_, r) => (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {formatDate(r.createdAt)}
            </span>
        ),
    },
    {
        title: '',
        key: 'actions',
        width: 60,
        fixed: 'right',
        render: (_, r) => {
            const canApprove = CAN_APPROVE.includes(r.status);
            const canReject  = CAN_REJECT.includes(r.status);
            const items = [
                {
                    key: 'view',
                    label: 'View Details',
                    icon: <EyeOutlined />,
                    onClick: () => openDrawer(r),
                },
                ...(canApprove ? [{
                    key: 'approve',
                    label: 'Approve',
                    icon: <CheckOutlined style={{ color: '#10b981' }} />,
                    onClick: () => openAction('approve', r),
                }] : []),
                ...(canReject ? [{
                    key: 'reject',
                    label: 'Reject',
                    icon: <CloseOutlined style={{ color: '#ef4444' }} />,
                    danger: true,
                    onClick: () => openAction('reject', r),
                }] : []),
            ];
            return (
                <div onClick={(e) => e.stopPropagation()}>
                    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
                        <Button
                            type="text"
                            icon={<MoreOutlined />}
                            size="small"
                            style={{ color: 'var(--text-muted)' }}
                        />
                    </Dropdown>
                </div>
            );
        },
    },
];

export default useColumns;
