import React, { useState, useEffect } from 'react';
import { Drawer, Descriptions, Tag, Divider, Button, Spin } from 'antd';
import { WalletOutlined, CloseOutlined, SyncOutlined } from '@ant-design/icons';
import { walletsApi } from '../../api/modules/wallets';
import { formatAmount, safeAdd } from '../../utils/number.utils';

const labelStyle   = { color: 'var(--text-muted)',   fontSize: 12, fontWeight: 500 };
const contentStyle = { color: 'var(--text-primary)', fontWeight: 500 };

/* Safely convert any value (including populated objects) to a displayable string */
const str = (v) => {
    if (v == null) return '—';
    if (typeof v === 'object') return v._id ?? v.id ?? JSON.stringify(v);
    return String(v) || '—';
};

const WalletDetailDrawer = ({ open, record, onClose, onSyncBalance, syncing }) => {
    const [detail, setDetail]     = useState(null);
    const [fetching, setFetching] = useState(false);
    const [fetchError, setFetchError] = useState(false);

    useEffect(() => {
        if (open && record?._id) {
            setFetching(true);
            setDetail(null);
            setFetchError(false);
            walletsApi.getById(record._id)
                .then((res) => {
                    try {
                        const data = res?.data ?? res;
                        if (data && typeof data === 'object' && !Array.isArray(data) && (data._id || data.walletId)) {
                            setDetail(data);
                        }
                    } catch {
                        setFetchError(true);
                    }
                })
                .catch(() => setFetchError(true))
                .finally(() => setFetching(false));
        } else {
            setDetail(null);
            setFetchError(false);
        }
    }, [open, record?._id]);

    /* Prefer the fetched detail; fall back to the list-row record */
    const item = detail ?? record ?? {};

    /* ── Safe field accessors ── */
    const blockchainDisplay = str(item.blockchainName ?? item.blockchain);
    const walletSetIdDisplay = item.walletSet?.walletSetId
        ?? (typeof item.walletSetId === 'object' ? item.walletSetId?._id : item.walletSetId)
        ?? '—';
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
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(16,185,129,0.12)' }}>
                        <WalletOutlined style={{ color: '#10b981', fontSize: 16 }} />
                    </div>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Wallet Details</span>
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
                        {blockchainDisplay && blockchainDisplay !== '—' && (
                            <Tag style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 600, fontSize: 13 }}>
                                {blockchainDisplay}
                            </Tag>
                        )}
                        {item.accountType && (
                            <Tag style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#6366f1', fontWeight: 600 }}>
                                {String(item.accountType)}
                            </Tag>
                        )}
                        {item.isDefault && (
                            <Tag style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b', fontWeight: 600 }}>
                                Default
                            </Tag>
                        )}
                        <Tag style={{
                            background: item.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
                            border: `1px solid ${item.isActive ? 'rgba(16,185,129,0.3)' : 'rgba(107,114,128,0.2)'}`,
                            color: item.isActive ? '#10b981' : '#6b7280',
                            fontWeight: 600,
                        }}>
                            {item.isActive ? 'Active' : 'Inactive'}
                        </Tag>
                    </div>

                    {/* Balance highlight */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl p-3 text-center"
                            style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                                Account Balance
                            </p>
                            <p className="font-extrabold tabular-nums" style={{ fontSize: '1.1rem', color: '#10b981' }}>
                                {item.accountBalance != null
                                    ? formatAmount(item.accountBalance)
                                    : '—'}
                            </p>
                        </div>
                        <div className="rounded-xl p-3 text-center"
                            style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                                Available Balance
                            </p>
                            <p className="font-extrabold tabular-nums" style={{ fontSize: '1.1rem', color: '#6366f1' }}>
                                {item.availableBalance != null
                                    ? formatAmount(item.availableBalance)
                                    : '—'}
                            </p>
                        </div>
                        <div className="rounded-xl p-3 text-center"
                            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                                Total
                            </p>
                            <p className="font-extrabold tabular-nums" style={{ fontSize: '1.1rem', color: '#f59e0b' }}>
                                {(item.accountBalance != null || item.availableBalance != null)
                                    ? formatAmount(safeAdd(item.accountBalance, item.availableBalance))
                                    : '—'}
                            </p>
                        </div>
                    </div>

                    {/* Wallet Info */}
                    <Descriptions column={1} size="small" labelStyle={labelStyle} contentStyle={contentStyle} colon={false}>
                        <Descriptions.Item label="Wallet ID">{str(item._id)}</Descriptions.Item>
                        <Descriptions.Item label="Circle Wallet ID">{str(item.walletId)}</Descriptions.Item>
                        <Descriptions.Item label="Wallet Set ID">{walletSetIdDisplay}</Descriptions.Item>
                        <Descriptions.Item label="Address">
                            <span className="font-mono text-xs break-all">{str(item.address)}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Blockchain">{blockchainDisplay}</Descriptions.Item>
                        <Descriptions.Item label="Account Type">{str(item.accountType)}</Descriptions.Item>
                    </Descriptions>

                    {/* Wallet Set */}
                    {item.walletSet && typeof item.walletSet === 'object' && (
                        <>
                            <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />
                            <Descriptions
                                title={<span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 700 }}>Wallet Set</span>}
                                column={1} size="small" labelStyle={labelStyle} contentStyle={contentStyle} colon={false}
                            >
                                <Descriptions.Item label="Set ID">{str(item.walletSet.walletSetId)}</Descriptions.Item>
                                <Descriptions.Item label="Name">{str(item.walletSet.name)}</Descriptions.Item>
                                <Descriptions.Item label="Custody Type">{str(item.walletSet.custodyType)}</Descriptions.Item>
                            </Descriptions>
                        </>
                    )}

                    {/* Token Balances */}
                    {Array.isArray(item.balanceRecords) && item.balanceRecords.length > 0 && (
                        <>
                            <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />
                            <div>
                                <p className="text-xs font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Token Balances</p>
                                <div className="space-y-2">
                                    {item.balanceRecords.map((bal, i) => (
                                        <div key={i} className="rounded-lg p-3 flex justify-between items-center"
                                            style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid var(--border-color)' }}>
                                            <div>
                                                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                                    {str(bal.tokenSymbol)}
                                                </p>
                                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    {str(bal.tokenName) !== '—' ? str(bal.tokenName) : ''}
                                                    {bal.blockchain ? ` · ${str(bal.blockchain)}` : ''}
                                                </p>
                                            </div>
                                            <p className="font-bold tabular-nums text-sm" style={{ color: '#10b981' }}>
                                                {bal.availableBalance != null
                                                    ? formatAmount(bal.availableBalance)
                                                    : '—'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />

                    {/* Merchant */}
                    <Descriptions
                        title={<span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 700 }}>Merchant</span>}
                        column={1} size="small" labelStyle={labelStyle} contentStyle={contentStyle} colon={false}
                    >
                        <Descriptions.Item label="Name">{merchantName}</Descriptions.Item>
                        <Descriptions.Item label="Email">{str(item.userId?.emailId ?? item.userId?.email)}</Descriptions.Item>
                        <Descriptions.Item label="Business">
                            {str(item.userId?.businessInfo?.businessName)}
                        </Descriptions.Item>
                        {/* <Descriptions.Item label="Country">{str(item.userId?.countryCode)}</Descriptions.Item> */}
                        <Descriptions.Item label="User ID">{str(item.userId?._id)}</Descriptions.Item>
                    </Descriptions>

                    <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />

                    {/* Timestamps */}
                    <Descriptions column={1} size="small" labelStyle={labelStyle} contentStyle={contentStyle} colon={false}>
                        <Descriptions.Item label="Created">
                            {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Last Synced">
                            {item.lastSyncedAt ? new Date(item.lastSyncedAt).toLocaleString() : '—'}
                        </Descriptions.Item>
                    </Descriptions>

                    {/* Actions */}
                    <Divider style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />
                    <Button
                        icon={<SyncOutlined spin={!!syncing} />}
                        loading={!!syncing}
                        onClick={() => onSyncBalance(item)}
                        style={{ borderColor: '#6366f1', color: '#6366f1' }}
                    >
                        Sync Balance
                    </Button>
                </div>
            )}
        </Drawer>
    );
};

export default WalletDetailDrawer;
