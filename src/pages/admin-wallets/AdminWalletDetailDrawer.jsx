import React, { useState, useEffect } from 'react';
import { Drawer, Tag, Divider, Button, Spin, message } from 'antd';
import { WalletOutlined, CloseOutlined, SyncOutlined, CopyOutlined } from '@ant-design/icons';
import { adminWalletsApi } from '../../api/modules/adminWallets';
import { formatAmount } from '../../utils/number.utils';

const str = (v) => {
    if (v == null) return '—';
    if (typeof v === 'object') return v._id ?? v.id ?? JSON.stringify(v);
    return String(v) || '—';
};

const Copyable = ({ text, mono, children }) => {
    if (!text || text === '—') return <span>{children ?? text}</span>;
    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => message.success('Copied'));
    };
    return (
        <span className={`inline-flex items-center gap-1.5 ${mono ? 'font-mono text-xs' : ''}`} style={{ wordBreak: 'break-all' }}>
            {children ?? text}
            <CopyOutlined
                onClick={handleCopy}
                style={{ color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, flexShrink: 0 }}
            />
        </span>
    );
};

const LABEL_WIDTH = 120;

const InfoRow = ({ label, children }) => (
    <div className="flex py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="shrink-0" style={{ width: LABEL_WIDTH, color: 'var(--text-muted)', fontSize: 12, fontWeight: 500, paddingTop: 2 }}>
            {label}
        </div>
        <div className="flex-1 min-w-0" style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 13, wordBreak: 'break-all' }}>
            {children}
        </div>
    </div>
);

const SectionHeading = ({ children }) => (
    <h4 className="text-sm font-bold mt-1 mb-2" style={{ color: 'var(--text-primary)' }}>
        {children}
    </h4>
);

const TYPE_COLORS = {
    admin: { bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.3)', color: '#6366f1' },
    fee:   { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b' },
    USD:   { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', color: '#10b981' },
};

const AdminWalletDetailDrawer = ({ open, record, onClose, onSyncBalance, syncing }) => {
    const [detail, setDetail]         = useState(null);
    const [fetching, setFetching]     = useState(false);
    const [fetchError, setFetchError] = useState(false);

    useEffect(() => {
        if (open && record?._id) {
            setFetching(true);
            setDetail(null);
            setFetchError(false);
            adminWalletsApi.getById(record._id)
                .then((res) => {
                    const data = res?.data ?? res;
                    if (data && typeof data === 'object' && !Array.isArray(data) && (data._id || data.walletId)) {
                        setDetail(data);
                    }
                })
                .catch(() => setFetchError(true))
                .finally(() => setFetching(false));
        } else {
            setDetail(null);
            setFetchError(false);
        }
    }, [open, record?._id]);

    const item = detail ?? record ?? {};

    const blockchainDisplay = str(item.blockchainName ?? item.blockchain);
    const walletSetName = typeof item.walletSetId === 'object' ? item.walletSetId?.name : null;
    const walletSetIdDisplay = typeof item.walletSetId === 'object'
        ? item.walletSetId?.walletSetId ?? item.walletSetId?._id
        : item.walletSetId;
    const userName = item.userId
        ? [item.userId.firstName, item.userId.lastName].filter(Boolean).join(' ') || '—'
        : '—';

    const typeColor = TYPE_COLORS[item.type] || TYPE_COLORS.admin;

    return (
        <Drawer
            placement="right"
            width={540}
            open={open}
            onClose={onClose}
            closeIcon={<CloseOutlined style={{ color: 'var(--text-secondary)' }} />}
            title={
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: typeColor.bg }}>
                        <WalletOutlined style={{ color: typeColor.color, fontSize: 16 }} />
                    </div>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Admin Wallet Details</span>
                </div>
            }
            styles={{
                header: { background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', padding: '16px 24px' },
                body:   { background: 'var(--bg-card)', padding: 24 },
            }}
        >
            {!record ? null : fetching ? (
                <div className="flex justify-center py-16"><Spin size="large" /></div>
            ) : (
                <div className="space-y-5">
                    {/* Status badges */}
                    <div className="flex flex-wrap gap-2">
                        {item.type && (
                            <Tag style={{ background: typeColor.bg, border: `1px solid ${typeColor.border}`, color: typeColor.color, fontWeight: 600, textTransform: 'uppercase' }}>
                                {item.type}
                            </Tag>
                        )}
                        {blockchainDisplay !== '—' && (
                            <Tag style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 600 }}>
                                {blockchainDisplay}
                            </Tag>
                        )}
                        {item.state && (
                            <Tag style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#3b82f6', fontWeight: 600 }}>
                                {item.state}
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
                    <div className="grid grid-cols-2 gap-3">
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
                    </div>

                    {/* Wallet Info */}
                    <div>
                        <InfoRow label="Wallet ID">
                            <Copyable text={str(item._id)} mono />
                        </InfoRow>
                        <InfoRow label="Circle Wallet ID">
                            <Copyable text={str(item.walletId)} mono />
                        </InfoRow>
                        <InfoRow label="Address">
                            <Copyable text={str(item.address)} mono />
                        </InfoRow>
                        <InfoRow label="Blockchain">{blockchainDisplay}</InfoRow>
                        <InfoRow label="State">{str(item.state)}</InfoRow>
                        <InfoRow label="Custody Type">{str(item.custodyType)}</InfoRow>
                        <InfoRow label="Account Type">{str(item.accountType)}</InfoRow>
                        <InfoRow label="Type">
                            <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{str(item.type)}</span>
                        </InfoRow>
                    </div>

                    {/* Wallet Set */}
                    {typeof item.walletSetId === 'object' && item.walletSetId && (
                        <div>
                            <Divider style={{ borderColor: 'var(--border-color)', margin: '4px 0 12px' }} />
                            <SectionHeading>Wallet Set</SectionHeading>
                            <InfoRow label="Set ID">
                                <Copyable text={str(walletSetIdDisplay)} mono />
                            </InfoRow>
                            <InfoRow label="Name">{str(walletSetName)}</InfoRow>
                            <InfoRow label="Type">{str(item.walletSetId.type)}</InfoRow>
                            <InfoRow label="Custody Type">{str(item.walletSetId.custodyType)}</InfoRow>
                        </div>
                    )}

                    {/* Token Balances */}
                    {Array.isArray(item.balances) && item.balances.length > 0 && (
                        <div>
                            <Divider style={{ borderColor: 'var(--border-color)', margin: '4px 0 12px' }} />
                            <SectionHeading>Token Balances</SectionHeading>
                            <div className="space-y-2">
                                {item.balances.map((bal, i) => (
                                    <div key={bal._id || i} className="rounded-lg p-3 flex justify-between items-center"
                                        style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid var(--border-color)' }}>
                                        <div>
                                            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                                {str(bal.tokenSymbol)}
                                            </p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                {str(bal.tokenName) !== '—' ? str(bal.tokenName) : ''}
                                                {bal.blockchainName ? ` · ${bal.blockchainName}` : bal.blockchain ? ` · ${bal.blockchain}` : ''}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold tabular-nums text-sm" style={{ color: '#10b981' }}>
                                                {bal.availableBalance != null
                                                    ? formatAmount(bal.availableBalance)
                                                    : '—'}
                                            </p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>available</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Owner */}
                    <div>
                        <Divider style={{ borderColor: 'var(--border-color)', margin: '4px 0 12px' }} />
                        <SectionHeading>Owner</SectionHeading>
                        <InfoRow label="Name">{userName}</InfoRow>
                        <InfoRow label="Email">
                            <Copyable text={str(item.userId?.emailId)} />
                        </InfoRow>
                        <InfoRow label="User ID">
                            <Copyable text={str(item.userId?._id)} mono />
                        </InfoRow>
                    </div>

                    {/* Timestamps */}
                    <div>
                        <Divider style={{ borderColor: 'var(--border-color)', margin: '4px 0 12px' }} />
                        <SectionHeading>Timestamps</SectionHeading>
                        <InfoRow label="Created">
                            {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}
                        </InfoRow>
                        <InfoRow label="Updated">
                            {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '—'}
                        </InfoRow>
                    </div>

                    {/* Actions */}
                    <Divider style={{ borderColor: 'var(--border-color)', margin: '4px 0 12px' }} />
                    <Button
                        icon={<SyncOutlined spin={!!syncing} />}
                        loading={!!syncing}
                        onClick={() => onSyncBalance(item)}
                        style={{ borderColor: '#6366f1', color: '#6366f1' }}
                    >
                        Sync Balance from Circle
                    </Button>
                </div>
            )}
        </Drawer>
    );
};

export default AdminWalletDetailDrawer;
