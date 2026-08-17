import React, { useState, useEffect } from 'react';
import { Drawer, Descriptions, Tag, Divider, Button, Popconfirm, Spin } from 'antd';
import {
    BankOutlined,
    CloseOutlined,
    LockOutlined,
    UnlockOutlined,
    StopOutlined,
    PlusCircleOutlined,
} from '@ant-design/icons';
import { virtualAccountsApi } from '../../api/modules/virtualAccounts';
import { sanitizeNumber, formatAmount, formatInteger } from '../../utils/number.utils';

const IS_DEV = import.meta.env.VITE_APP_ENV === 'development';

const labelStyle   = { color: 'var(--text-muted)', fontSize: 12, fontWeight: 500 };
const contentStyle = { color: 'var(--text-primary)', fontWeight: 500 };

const STATUS_CONFIG = {
    active:  { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  label: 'Active' },
    frozen:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  label: 'Frozen' },
    closed:  { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.2)', label: 'Closed' },
};

const VirtualAccountDetailDrawer = ({ open, record, onClose, onFreeze, onUnfreeze, onCloseAccount, actionLoading, onAddFunds }) => {
    const [detail, setDetail]       = useState(null);
    const [fetching, setFetching]   = useState(false);
    const [fetchError, setFetchError] = useState(false);

    useEffect(() => {
        if (open && record?._id) {
            setFetching(true);
            setDetail(null);
            setFetchError(false);
            virtualAccountsApi.getById(record._id)
                .then((res) => {
                    try {
                        const data = res?.data ?? res;
                        if (data && typeof data === 'object' && !Array.isArray(data) && data._id) {
                            setDetail(data);
                        }
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
    const status = item.status?.toLowerCase() ?? 'active';
    const cfg    = STATUS_CONFIG[status] ?? STATUS_CONFIG.active;

    const availBal  = sanitizeNumber(item.availableBalance);
    const acctBal   = sanitizeNumber(item.accountBalance);
    const totalBal  = availBal + acctBal;
    const hasBalance = item.availableBalance != null || item.accountBalance != null;
    const cur        = item.currency ?? '';

    const merchantName = item.userId
        ? [item.userId.firstName, item.userId.lastName].filter(Boolean).join(' ') || '—'
        : '—';

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
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Virtual Account Details</span>
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
                    {/* Status / tag badges */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Tag style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, fontWeight: 600, fontSize: 13 }}>
                            {cfg.label}
                        </Tag>
                        {cur && (
                            <Tag style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#6366f1', fontWeight: 600 }}>
                                {cur}
                            </Tag>
                        )}
                        {item.accountType && (
                            <Tag style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b', fontWeight: 600 }}>
                                {item.accountType}
                            </Tag>
                        )}
                        {item.isDefault && (
                            <Tag style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 600 }}>
                                Default
                            </Tag>
                        )}
                    </div>

                    {/* Balance highlight cards */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl p-3 text-center"
                            style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Available</p>
                            <p className="font-extrabold tabular-nums" style={{ fontSize: '1.1rem', color: '#10b981' }}>
                                {hasBalance ? formatAmount(availBal) : '—'}
                            </p>
                        </div>
                        <div className="rounded-xl p-3 text-center"
                            style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Account</p>
                            <p className="font-extrabold tabular-nums" style={{ fontSize: '1.1rem', color: '#6366f1' }}>
                                {hasBalance ? formatAmount(acctBal) : '—'}
                            </p>
                        </div>
                        <div className="rounded-xl p-3 text-center"
                            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Total</p>
                            <p className="font-extrabold tabular-nums" style={{ fontSize: '1.1rem', color: '#f59e0b' }}>
                                {hasBalance ? formatAmount(totalBal) : '—'}
                            </p>
                        </div>
                    </div>

                    {/* Account Info */}
                    <Descriptions column={1} size="small" labelStyle={labelStyle} contentStyle={contentStyle} colon={false}>
                        <Descriptions.Item label="Account ID">{item._id ?? '—'}</Descriptions.Item>
                        <Descriptions.Item label="Account Name">{item.accountName ?? '—'}</Descriptions.Item>
                        {cur.toUpperCase() === 'EUR' ? (
                            <>
                                <Descriptions.Item label="IBAN">{item.iban ?? '—'}</Descriptions.Item>
                                <Descriptions.Item label="BIC">{item.bic ?? '—'}</Descriptions.Item>
                            </>
                        ) : (
                            <>
                                <Descriptions.Item label="Account Number">{item.accountNumber ?? '—'}</Descriptions.Item>
                                <Descriptions.Item label="Routing Number">{item.routingNumber ?? '—'}</Descriptions.Item>
                            </>
                        )}
                        <Descriptions.Item label="Account Type">{item.accountType ?? '—'}</Descriptions.Item>
                        <Descriptions.Item label="Currency">{item.currency ?? '—'}</Descriptions.Item>
                        <Descriptions.Item label="Provider">{item.serviceProvider?.providerName ?? '—'}</Descriptions.Item>
                        <Descriptions.Item label="Provider Code">{item.serviceProvider?.providerCode ?? '—'}</Descriptions.Item>
                        <Descriptions.Item label="Environment">{item.serviceProvider?.environment ?? '—'}</Descriptions.Item>
                    </Descriptions>

                    <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />

                    {/* Merchant Info */}
                    <Descriptions
                        title={<span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 700 }}>Merchant</span>}
                        column={1} size="small" labelStyle={labelStyle} contentStyle={contentStyle} colon={false}
                    >
                        <Descriptions.Item label="Name">{merchantName}</Descriptions.Item>
                        <Descriptions.Item label="Email">{item.userId?.emailId ?? '—'}</Descriptions.Item>
                        <Descriptions.Item label="Mobile">{item.userId?.mobileNumber ?? '—'}</Descriptions.Item>
                        <Descriptions.Item label="Business">{item.userId?.businessInfo?.businessName ?? '—'}</Descriptions.Item>
                        <Descriptions.Item label="Merchant ID">{item.userId?._id ?? '—'}</Descriptions.Item>
                    </Descriptions>

                    {/* Account Features */}
                    {item.accountFeatures && (
                        <>
                            <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />
                            <Descriptions
                                title={<span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 700 }}>Account Features</span>}
                                column={2} size="small" labelStyle={labelStyle} contentStyle={contentStyle} colon={false}
                            >
                                {[['Send ACH','canSendACH'],['Receive ACH','canReceiveACH'],['Send Wire','canSendWire'],['Receive Wire','canReceiveWire'],['Send RTP','canSendRTP'],['Receive RTP','canReceiveRTP']].map(([label, key]) => (
                                    <Descriptions.Item key={key} label={label}>
                                        <span style={{ color: item.accountFeatures[key] ? '#10b981' : '#6b7280', fontWeight: 600 }}>
                                            {item.accountFeatures[key] ? 'Yes' : 'No'}
                                        </span>
                                    </Descriptions.Item>
                                ))}
                            </Descriptions>
                        </>
                    )}

                    {/* Transaction Limits */}
                    {item.transactionLimits && (
                        <>
                            <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />
                            <Descriptions
                                title={<span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 700 }}>Transaction Limits</span>}
                                column={1} size="small" labelStyle={labelStyle} contentStyle={contentStyle} colon={false}
                            >
                                <Descriptions.Item label="Daily Limit">{item.transactionLimits.dailyLimit != null ? `${cur} ${formatInteger(item.transactionLimits.dailyLimit)}` : '—'}</Descriptions.Item>
                                <Descriptions.Item label="Monthly Limit">{item.transactionLimits.monthlyLimit != null ? `${cur} ${formatInteger(item.transactionLimits.monthlyLimit)}` : '—'}</Descriptions.Item>
                                <Descriptions.Item label="Per Transaction">{item.transactionLimits.perTransactionLimit != null ? `${cur} ${formatInteger(item.transactionLimits.perTransactionLimit)}` : '—'}</Descriptions.Item>
                            </Descriptions>
                        </>
                    )}

                    <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />

                    {/* Timestamps */}
                    <Descriptions column={1} size="small" labelStyle={labelStyle} contentStyle={contentStyle} colon={false}>
                        <Descriptions.Item label="Activated">{item.activatedAt ? new Date(item.activatedAt).toLocaleString() : '—'}</Descriptions.Item>
                        <Descriptions.Item label="Created">{item.createdAt  ? new Date(item.createdAt).toLocaleString()  : '—'}</Descriptions.Item>
                        <Descriptions.Item label="Updated">{item.updatedAt  ? new Date(item.updatedAt).toLocaleString()  : '—'}</Descriptions.Item>
                    </Descriptions>

                    {/* Actions */}
                    {status !== 'closed' && (
                        <>
                            <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />
                            <div className="flex flex-wrap gap-2">
                                {status === 'active' && (
                                    <Button icon={<LockOutlined />} loading={actionLoading === 'freeze'}
                                        onClick={() => onFreeze(item)}
                                        style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>
                                        Freeze Account
                                    </Button>
                                )}
                                {status === 'frozen' && (
                                    <Button icon={<UnlockOutlined />} loading={actionLoading === 'unfreeze'}
                                        onClick={() => onUnfreeze(item)}
                                        style={{ borderColor: '#10b981', color: '#10b981' }}>
                                        Unfreeze Account
                                    </Button>
                                )}
                                <Popconfirm
                                    title="Close this account?"
                                    description="This action is irreversible. The account will be permanently closed."
                                    onConfirm={() => onCloseAccount(item)}
                                    okText="Yes, Close" cancelText="Cancel"
                                    okButtonProps={{ danger: true }}
                                >
                                    <Button danger icon={<StopOutlined />} loading={actionLoading === 'close'}>
                                        Close Account
                                    </Button>
                                </Popconfirm>
                                {IS_DEV && onAddFunds && (
                                    <Button
                                        icon={<PlusCircleOutlined />}
                                        onClick={() => onAddFunds(item)}
                                        style={{ borderColor: '#6366f1', color: '#6366f1' }}
                                    >
                                        Add Funds
                                        <span style={{ fontSize: 10, opacity: 0.7, marginLeft: 4 }}>(dev)</span>
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </Drawer>
    );
};

export default VirtualAccountDetailDrawer;
