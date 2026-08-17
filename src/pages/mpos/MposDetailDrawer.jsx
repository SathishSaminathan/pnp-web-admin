import React from 'react';
import { Drawer, Descriptions, Tag, Button, Divider } from 'antd';
import {
    UserOutlined,
    WalletOutlined,
    CalendarOutlined,
    MobileOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import MposStatusTag from './MposStatusTag';

const labelStyle = { color: 'var(--text-muted)', fontSize: 12, fontWeight: 500 };
const contentStyle = { color: 'var(--text-primary)', fontWeight: 500 };

const MposDetailDrawer = ({ open, record, onClose, onAction }) => {
    const item = record ?? {};
    const merchant = item?.userId ?? {};
    const biz = merchant?.businessInfo ?? {};

    return (
        <Drawer
            placement="right"
            width={520}
            open={open}
            onClose={onClose}
            closeIcon={<CloseOutlined style={{ color: 'var(--text-secondary)' }} />}
            title={
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.12)' }}>
                        <MobileOutlined style={{ color: '#3b82f6', fontSize: 16 }} />
                    </div>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>MPOS Request Details</span>
                </div>
            }
            styles={{
                header: { background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', padding: '16px 24px' },
                body:   { background: 'var(--bg-card)', padding: 24 },
            }}
        >
            <div className="space-y-6">
                    {/* Status badge */}
                    <div className="flex items-center justify-between">
                        <MposStatusTag status={item.approvalStatus} />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            ID: <code style={{ color: 'var(--text-secondary)' }}>{item._id}</code>
                        </span>
                    </div>

                    {/* Merchant info */}
                    <div className="rounded-xl p-4 space-y-1" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <UserOutlined style={{ color: '#3b82f6' }} />
                            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Merchant</span>
                        </div>
                        <Descriptions column={1} size="small" labelStyle={labelStyle} contentStyle={contentStyle} colon={false}>
                            <Descriptions.Item label="Business Name">{biz.businessName ?? '—'}</Descriptions.Item>
                            <Descriptions.Item label="Email">{merchant.email ?? '—'}</Descriptions.Item>
                            <Descriptions.Item label="Mobile">
                                {merchant.countryCode ? `+${merchant.countryCode} ` : ''}{merchant.mobile ?? '—'}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>

                    {/* Account details */}
                    <div className="rounded-xl p-4" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <WalletOutlined style={{ color: '#10b981' }} />
                            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Account Details</span>
                        </div>
                        <Descriptions column={1} size="small" labelStyle={labelStyle} contentStyle={contentStyle} colon={false}>
                            <Descriptions.Item label="Wallet Type">
                                <Tag style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 600 }}>
                                    {item.walletType ?? '—'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Settlement Frequency">{item.settlementFrequency ?? '—'}</Descriptions.Item>
                            <Descriptions.Item label="Settlement Mode">{item.settlementMode ?? '—'}</Descriptions.Item>
                            <Descriptions.Item label="Settlement Account Type">{item.settlementAccountType ?? '—'}</Descriptions.Item>
                        </Descriptions>
                    </div>

                    {/* Timestamps */}
                    <div className="rounded-xl p-4" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <CalendarOutlined style={{ color: '#8b5cf6' }} />
                            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Timeline</span>
                        </div>
                        <Descriptions column={1} size="small" labelStyle={labelStyle} contentStyle={contentStyle} colon={false}>
                            <Descriptions.Item label="Submitted At">
                                {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : '—'}
                            </Descriptions.Item>
                            {item.reviewedAt && (
                                <Descriptions.Item label="Reviewed At">
                                    {new Date(item.reviewedAt).toLocaleString()}
                                </Descriptions.Item>
                            )}
                            {item.approvedAt && (
                                <Descriptions.Item label="Approved At">
                                    {new Date(item.approvedAt).toLocaleString()}
                                </Descriptions.Item>
                            )}
                            {item.rejectedAt && (
                                <Descriptions.Item label="Rejected At">
                                    {new Date(item.rejectedAt).toLocaleString()}
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </div>

                    {/* Rejection reason */}
                    {item.rejectionReason && (
                        <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <p className="text-xs font-semibold mb-1" style={{ color: '#ef4444' }}>Rejection Reason</p>
                            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.rejectionReason}</p>
                        </div>
                    )}

                    {/* Admin note */}
                    {item.adminNote && (
                        <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.2)' }}>
                            <p className="text-xs font-semibold mb-1" style={{ color: '#f59e0b' }}>Admin Note (internal)</p>
                            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.adminNote}</p>
                        </div>
                    )}

                    {/* Quick actions */}
                    {onAction && (
                        <>
                            <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />
                            <div className="flex flex-wrap gap-2">
                                {item.approvalStatus === 'Pending' && (
                                    <Button size="small" onClick={() => onAction('review', item)} style={{ borderColor: '#3b82f6', color: '#3b82f6' }}>
                                        Mark Under Review
                                    </Button>
                                )}
                                {(item.approvalStatus === 'Pending' || item.approvalStatus === 'Under Review') && (
                                    <Button size="small" onClick={() => onAction('approve', item)} style={{ background: '#10b981', borderColor: '#10b981', color: '#fff' }}>
                                        Approve
                                    </Button>
                                )}
                                {(item.approvalStatus === 'Pending' || item.approvalStatus === 'Under Review') && (
                                    <Button size="small" danger onClick={() => onAction('reject', item)}>
                                        Reject
                                    </Button>
                                )}
                                {item.approvalStatus === 'Approved' && (
                                    <Button size="small" onClick={() => onAction('retry', item)} style={{ borderColor: '#8b5cf6', color: '#8b5cf6' }}>
                                        Retry Wallet
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
            </div>
        </Drawer>
    );
};

export default MposDetailDrawer;
