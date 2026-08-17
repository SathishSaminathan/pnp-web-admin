import React, { useState, useEffect } from 'react';
import { Drawer, Descriptions, Tag, Divider, Button, Spin } from 'antd';
import { BankOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
import { linkedBankAccountsApi } from '../../api/modules/linkedBankAccounts';
import { sanitizeNumber, formatAmount } from '../../utils/number.utils';

const labelStyle  = { color: 'var(--text-muted)', fontSize: 12, fontWeight: 500 };
const contentStyle = { color: 'var(--text-primary)', fontWeight: 500 };

const STATUS_CONFIG = {
    'Under Verification': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)' },
    'Approved':           { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)' },
    'Rejected':           { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)' },
};

const LinkedBankDetailDrawer = ({ open, record, onClose, onApprove, approving }) => {
    const [detail,     setDetail]     = useState(null);
    const [fetching,   setFetching]   = useState(false);
    const [fetchError, setFetchError] = useState(false);

    useEffect(() => {
        if (open && record?._id) {
            setFetching(true);
            setDetail(null);
            setFetchError(false);
            linkedBankAccountsApi.getById(record._id)
                .then((res) => {
                    try {
                        const data = res?.data ?? res;
                        if (data && typeof data === 'object' && !Array.isArray(data) && data._id)
                            setDetail(data);
                    } catch { setFetchError(true); }
                })
                .catch(() => setFetchError(true))
                .finally(() => setFetching(false));
        } else {
            setDetail(null);
            setFetchError(false);
        }
    }, [open, record?._id]);

    /* Prefer fetched detail; fall back to list row */
    const item   = detail ?? record ?? {};
    const status = item.status ?? 'Under Verification';
    const cfg    = STATUS_CONFIG[status] ?? STATUS_CONFIG['Under Verification'];

    const acctBal    = sanitizeNumber(item.accountBalance);
    const hasBalance = item.accountBalance != null;
    const cur        = item.currency ?? '';

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
                        <BankOutlined style={{ color: '#6366f1', fontSize: 16 }} />
                    </div>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Linked Bank Account</span>
                </div>
            }
            styles={{
                header: { background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', padding: '16px 24px' },
                body:   { background: 'var(--bg-card)', padding: 24 },
            }}
        >
            {!record ? null : fetching ? (
                <div className="flex justify-center py-16">
                    <Spin size="large" />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Status badges */}
                    <div className="flex flex-wrap gap-2">
                        <Tag style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, fontWeight: 600, fontSize: 13 }}>
                            {status}
                        </Tag>
                        {cur && (
                            <Tag style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#6366f1', fontWeight: 600 }}>
                                {cur}
                            </Tag>
                        )}
                        {item.country && (
                            <Tag style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b', fontWeight: 600 }}>
                                {item.country}
                            </Tag>
                        )}
                    </div>

                    {/* Account Balance card */}
                    <div className="rounded-xl p-4 text-center"
                        style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Account Balance</p>
                        <p className="font-extrabold tabular-nums" style={{ fontSize: '1.4rem', color: '#6366f1' }}>
                            {hasBalance ? `${cur ? cur + ' ' : ''}${formatAmount(acctBal)}` : '—'}
                        </p>
                    </div>

                    {/* Bank Account Info */}
                    <Descriptions column={1} size="small" labelStyle={labelStyle} contentStyle={contentStyle} colon={false}>
                        <Descriptions.Item label="ID">{item._id ?? '—'}</Descriptions.Item>
                        <Descriptions.Item label="Reference ID">{item.referenceId ?? '—'}</Descriptions.Item>
                        <Descriptions.Item label="Currency">{cur || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Country">{item.country ?? '—'}</Descriptions.Item>
                        <Descriptions.Item label="Country Code">{item.countryCode ?? '—'}</Descriptions.Item>
                    </Descriptions>

                    {/* Dynamic Bank Fields (from detail API) */}
                    {Array.isArray(item.bankFields) && item.bankFields.length > 0 && (
                        <>
                            <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />
                            <Descriptions
                                title={<span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 700 }}>Bank Details</span>}
                                column={1} size="small" labelStyle={labelStyle} contentStyle={contentStyle} colon={false}
                            >
                                {item.bankFields.map((f) => (
                                    <Descriptions.Item key={f.name} label={f.name}>
                                        <span className="font-mono">{f.value ?? '—'}</span>
                                    </Descriptions.Item>
                                ))}
                            </Descriptions>
                        </>
                    )}

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
                        {item.flinksAccountId && (
                            <Descriptions.Item label="Flinks Account ID">{item.flinksAccountId}</Descriptions.Item>
                        )}
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

                    {/* Approve Action */}
                    {status === 'Under Verification' && (
                        <>
                            <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />
                            <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                loading={approving}
                                onClick={() => onApprove(item)}
                                style={{ background: '#10b981', borderColor: '#10b981' }}
                            >
                                Approve Account
                            </Button>
                        </>
                    )}
                </div>
            )}
        </Drawer>
    );
};

export default LinkedBankDetailDrawer;
