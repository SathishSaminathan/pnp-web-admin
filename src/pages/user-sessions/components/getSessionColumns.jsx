import React from 'react';
import { Button, Tooltip, Avatar, Dropdown, message } from 'antd';
import {
    EyeOutlined,
    MoreOutlined,
    MonitorOutlined,
    PoweroffOutlined,
    MobileOutlined,
    DesktopOutlined,
    GlobalOutlined,
    EnvironmentOutlined,
    CopyOutlined,
    CheckOutlined,
} from '@ant-design/icons';
import { SessionStatusTag } from './index';
import { parseUA, countryFlag, countryName } from './sessionHelpers';

/* ── helpers ── */
const deviceIcon = (type) => {
    if (!type) return <MonitorOutlined />;
    const t = type.toLowerCase();
    if (t.includes('mobile') || t.includes('phone')) return <MobileOutlined />;
    if (t.includes('tablet')) return <GlobalOutlined />;
    return <DesktopOutlined />;
};

const getSessionColumns = ({ isMobile, onView, onTerminate, onOpenMap, copiedId, setCopiedId }) => [
    {
        title: 'User',
        key: 'user',
        fixed: isMobile ? undefined : 'left',
        width: isMobile ? 160 : 200,
        render: (_, r) => {
            const u = r.user ?? {};
            const name  = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
            const email = u.emailId ?? '';
            const display  = name || email || (typeof r.userId === 'string' ? r.userId.slice(-8) : '?');
            const initials = display.charAt(0).toUpperCase();
            const copiedName  = copiedId === `name-${r._id}`;
            const copiedEmail = copiedId === `email-${r._id}`;
            const copy = (key, text) => {
                navigator.clipboard.writeText(text);
                setCopiedId(key);
                setTimeout(() => setCopiedId(null), 1500);
                message.success('Copied!');
            };
            return (
                <div className="flex items-center gap-2">
                    <Avatar
                        size={32}
                        style={{ background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', fontSize: 13, fontWeight: 700, flexShrink: 0 }}
                    >
                        {initials || '?'}
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                        {name ? (
                            <Tooltip title={copiedName ? 'Copied!' : 'Click to copy name'}>
                                <span
                                    className="font-semibold text-sm truncate flex items-center gap-1 cursor-pointer group w-fit max-w-full"
                                    style={{ color: 'var(--text-primary)' }}
                                    onClick={(e) => { e.stopPropagation(); copy(`name-${r._id}`, name); }}
                                >
                                    <span className="truncate">{name}</span>
                                    {copiedName
                                        ? <CheckOutlined style={{ fontSize: 10, color: '#10b981', flexShrink: 0 }} />
                                        : <CopyOutlined className="opacity-0 group-hover:opacity-50 transition-opacity" style={{ fontSize: 10, flexShrink: 0 }} />
                                    }
                                </span>
                            </Tooltip>
                        ) : (
                            <span className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                {typeof r.userId === 'string' ? `…${r.userId.slice(-8)}` : '—'}
                            </span>
                        )}
                        {email && (
                            <Tooltip title={copiedEmail ? 'Copied!' : 'Click to copy email'}>
                                <span
                                    className="text-xs truncate flex items-center gap-1 cursor-pointer group w-fit max-w-full"
                                    style={{ color: 'var(--text-muted)' }}
                                    onClick={(e) => { e.stopPropagation(); copy(`email-${r._id}`, email); }}
                                >
                                    <span className="truncate">{email}</span>
                                    {copiedEmail
                                        ? <CheckOutlined style={{ fontSize: 10, color: '#10b981', flexShrink: 0 }} />
                                        : <CopyOutlined className="opacity-0 group-hover:opacity-50 transition-opacity" style={{ fontSize: 10, flexShrink: 0 }} />
                                    }
                                </span>
                            </Tooltip>
                        )}
                    </div>
                </div>
            );
        },
    },
    {
        title: 'Device',
        key: 'device',
        width: 160,
        render: (_, r) => {
            const ua = parseUA(r.browser);
            const browserLabel = ua.browser ?? r.deviceName ?? '—';
            const osLabel = ua.os ?? r.OS ?? '';
            return (
                <div className="flex items-center gap-1.5">
                    <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{deviceIcon(r.deviceName)}</span>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{browserLabel}</span>
                        <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{osLabel}</span>
                    </div>
                </div>
            );
        },
    },
    {
        title: 'IP / Country',
        key: 'ipAddress',
        width: 160,
        render: (_, r) => {
            const ip   = Array.isArray(r.IP) ? r.IP[0] : r.IP;
            const flag = countryFlag(r.cfIpCountry);
            const name = countryName(r.cfIpCountry);
            const copied = copiedId === `ip-${r._id}`;
            return (
                <div className="flex flex-col gap-0.5">
                    <Tooltip title={copied ? 'Copied!' : 'Click to copy IP'}>
                        <span
                            className="font-mono text-xs flex items-center gap-1 cursor-pointer group w-fit"
                            style={{ color: 'var(--text-secondary)' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(ip ?? '');
                                setCopiedId(`ip-${r._id}`);
                                setTimeout(() => setCopiedId(null), 1500);
                                message.success('Copied!');
                            }}
                        >
                            <span>{ip ?? '—'}</span>
                            {copied
                                ? <CheckOutlined style={{ fontSize: 10, color: '#10b981' }} />
                                : <CopyOutlined className="opacity-0 group-hover:opacity-50 transition-opacity" style={{ fontSize: 10 }} />
                            }
                        </span>
                    </Tooltip>
                    {r.cfIpCountry && (
                        <Tooltip title={name}>
                            <span className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                                <span style={{ fontSize: 14, lineHeight: 1 }}>{flag}</span>
                                {name ?? r.cfIpCountry}
                            </span>
                        </Tooltip>
                    )}
                </div>
            );
        },
    },
    {
        title: 'Location',
        key: 'location',
        width: 140,
        render: (_, r) => (
            <div className="flex items-center gap-1.5">
                <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{r.location || '—'}</span>
                {r.latitude != null && r.longitude != null && (
                    <Tooltip title="View on map">
                        <Button
                            type="text"
                            size="small"
                            icon={<EnvironmentOutlined style={{ color: '#10b981', fontSize: 14 }} />}
                            style={{ padding: 0, height: 'auto', lineHeight: 1, flexShrink: 0 }}
                            onClick={(e) => { e.stopPropagation(); onOpenMap(r); }}
                        />
                    </Tooltip>
                )}
            </div>
        ),
    },
    {
        title: 'Status',
        key: 'status',
        width: isMobile ? 90 : 120,
        render: (_, r) => <SessionStatusTag isActive={r.isActive} isDelete={r.isDelete} />,
    },
    {
        title: 'Created',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 130,
        render: (d) => (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {d ? new Date(d).toLocaleString() : '—'}
            </span>
        ),
    },
    {
        title: 'Last Active',
        dataIndex: 'lastRequestTime',
        key: 'lastRequestTime',
        width: 130,
        render: (d) => (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {d ? new Date(d).toLocaleString() : '—'}
            </span>
        ),
    },
    {
        title: 'Actions',
        key: 'actions',
        width: isMobile ? 60 : 90,
        fixed: isMobile ? undefined : 'right',
        align: 'center',
        render: (_, record) => (
            <Dropdown
                trigger={['click']}
                menu={{
                    onClick: ({ domEvent }) => domEvent.stopPropagation(),
                    items: [
                        {
                            key: 'view',
                            icon: <EyeOutlined />,
                            label: 'View Details',
                            onClick: () => onView(record),
                        },
                        {
                            key: 'copyId',
                            icon: copiedId === `sid-${record._id}` ? <CheckOutlined style={{ color: '#10b981' }} /> : <CopyOutlined />,
                            label: copiedId === `sid-${record._id}` ? 'Copied!' : 'Copy Session ID',
                            onClick: () => {
                                navigator.clipboard.writeText(record._id ?? '');
                                setCopiedId(`sid-${record._id}`);
                                setTimeout(() => setCopiedId(null), 1500);
                                message.success('Copied!');
                            },
                        },
                        ...(!record.isDelete && record.isActive ? [{
                            key: 'terminate',
                            icon: <PoweroffOutlined style={{ color: '#ef4444' }} />,
                            label: <span style={{ color: '#ef4444' }}>Terminate</span>,
                            onClick: () => onTerminate(record),
                        }] : []),
                    ],
                }}
            >
                <Button
                    type="text"
                    size="small"
                    icon={<MoreOutlined />}
                    style={{ color: 'var(--text-secondary)' }}
                    onClick={(e) => e.stopPropagation()}
                />
            </Dropdown>
        ),
    },
];

export default getSessionColumns;
