import React from 'react';
import { Drawer, Descriptions, Tag, Divider, Button } from 'antd';
import { LinkOutlined, CloseOutlined, CheckOutlined, StopOutlined } from '@ant-design/icons';

const labelStyle  = { color: 'var(--text-muted)', fontSize: 12, fontWeight: 500 };
const contentStyle = { color: 'var(--text-primary)', fontWeight: 500 };

const STATUS_CONFIG = {
    'Under Verification': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)' },
    'Approved':           { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)' },
    'Rejected':           { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)' },
};

const LinkedWalletDetailDrawer = ({ open, record, onClose, onToggle, toggling }) => {
    const item     = record ?? {};
    const isActive = item.isActive ?? true;
    const status   = item.status ?? 'Under Verification';
    const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['Under Verification'];

    return (
        <Drawer
            placement="right"
            width={520}
            open={open}
            onClose={onClose}
            closeIcon={<CloseOutlined style={{ color: 'var(--text-secondary)' }} />}
            title={
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
                        <LinkOutlined style={{ color: '#6366f1', fontSize: 16 }} />
                    </div>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Linked Wallet Details</span>
                </div>
            }
            styles={{
                header: { background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', padding: '16px 24px' },
                body:   { background: 'var(--bg-card)', padding: 24 },
            }}
        >
            {record && (
                <div className="space-y-6">
                    {/* Status badges */}
                    <div className="flex flex-wrap gap-2">
                        <Tag style={{ background: statusCfg.bg, border: `1px solid ${statusCfg.border}`, color: statusCfg.color, fontWeight: 600, fontSize: 13 }}>
                            {status}
                        </Tag>
                        <Tag style={{
                            background: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
                            border: `1px solid ${isActive ? 'rgba(16,185,129,0.3)' : 'rgba(107,114,128,0.2)'}`,
                            color: isActive ? '#10b981' : '#6b7280',
                            fontWeight: 600,
                        }}>
                            {isActive ? 'Active' : 'Disabled'}
                        </Tag>
                        {(item.blockchainId?.name ?? item.blockchainName) && (
                            <Tag style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b', fontWeight: 600 }}>
                                {item.blockchainId?.name ?? item.blockchainName}
                            </Tag>
                        )}
                    </div>

                    {/* Wallet Info */}
                    <Descriptions column={1} size="small" labelStyle={labelStyle} contentStyle={contentStyle} colon={false}>
                        <Descriptions.Item label="ID">{item._id ?? '—'}</Descriptions.Item>
                        <Descriptions.Item label="Wallet Address">
                            <span className="font-mono text-xs" style={{ wordBreak: 'break-all' }}>{item.walletAddress ?? '—'}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Blockchain">{item.blockchainId?.name ?? item.blockchainName ?? '—'}</Descriptions.Item>
                        <Descriptions.Item label="Symbol">{item.blockchainId?.symbol ?? '—'}</Descriptions.Item>
                        <Descriptions.Item label="Network ID">{item.blockchainId?.networkId ?? '—'}</Descriptions.Item>
                    </Descriptions>

                    <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />

                    {/* Merchant Info */}
                    <Descriptions
                        title={<span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 700 }}>Merchant</span>}
                        column={1} size="small" labelStyle={labelStyle} contentStyle={contentStyle} colon={false}
                    >
                        <Descriptions.Item label="Name">
                            {item.userId ? [item.userId.firstName, item.userId.lastName].filter(Boolean).join(' ') : '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">{item.userId?.emailId ?? '—'}</Descriptions.Item>
                        <Descriptions.Item label="Mobile">{item.userId?.mobileNumber ?? '—'}</Descriptions.Item>
                        <Descriptions.Item label="Account Type">{item.userId?.accountType?.name ?? '—'}</Descriptions.Item>
                        {item.userId?.businessInfo?.businessName && (
                            <Descriptions.Item label="Business">{item.userId.businessInfo.businessName}</Descriptions.Item>
                        )}
                        <Descriptions.Item label="User ID">{item.userId?._id ?? '—'}</Descriptions.Item>
                    </Descriptions>

                    <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />

                    {/* Timestamps */}
                    <Descriptions column={1} size="small" labelStyle={labelStyle} contentStyle={contentStyle} colon={false}>
                        <Descriptions.Item label="Created">
                            {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Updated">
                            {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '—'}
                        </Descriptions.Item>
                    </Descriptions>

                    {/* Toggle Action */}
                    <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />
                    <Button
                        icon={isActive ? <StopOutlined /> : <CheckOutlined />}
                        loading={toggling}
                        onClick={() => onToggle(item, !isActive)}
                        style={isActive
                            ? { borderColor: '#ef4444', color: '#ef4444' }
                            : { borderColor: '#10b981', color: '#10b981' }}
                    >
                        {isActive ? 'Disable Wallet' : 'Enable Wallet'}
                    </Button>
                </div>
            )}
        </Drawer>
    );
};

export default LinkedWalletDetailDrawer;
