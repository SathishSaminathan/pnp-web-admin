import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Drawer, Avatar, Tag, Button, Spin, Divider } from 'antd';
import {
    WalletOutlined,
    UserOutlined,
    BankOutlined,
    GlobalOutlined,
    LoadingOutlined,
    LinkOutlined,
    DollarOutlined,
} from '@ant-design/icons';
import {
    fetchNoahCustodyWalletDetail,
    clearDetail,
    selectNoahWalletDetail,
    selectNoahWalletDetailLoading,
} from '../../../store/slices/noahCustodyWalletsSlice';
import { formatDateTime } from '../../../utils/formatters';
import { formatAmount } from '../../../utils/number.utils';
import NoahWalletStateTag from './NoahWalletStateTag';

/* ── Helper components ──────────────────────────────────────────────────── */
const Section = ({ title, icon, children, isDark }) => (
    <div
        className="rounded-xl overflow-hidden mb-3"
        style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
            boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
        }}
    >
        <div
            className="flex items-center gap-2 px-4 py-2.5"
            style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
            }}
        >
            {icon && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{icon}</span>}
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                {title}
            </span>
        </div>
        <div className="px-4 py-3 space-y-2">{children}</div>
    </div>
);

const Row = ({ label, value, mono }) => (
    <div className="flex justify-between items-start gap-3 text-sm">
        <span className="shrink-0 text-xs" style={{ color: 'var(--text-muted)', minWidth: 140 }}>
            {label}
        </span>
        <span
            className={`text-right break-all ${mono ? 'font-mono text-xs' : ''}`}
            style={{ color: 'var(--text-primary)', fontWeight: 500 }}
        >
            {value ?? '—'}
        </span>
    </div>
);

/* ── Main Drawer ──────────────────────────────────────────────────────────── */
const NoahWalletDetailDrawer = ({ open, walletId, onClose, isDark }) => {
    const dispatch = useDispatch();
    const detail   = useSelector(selectNoahWalletDetail);
    const loading  = useSelector(selectNoahWalletDetailLoading);

    useEffect(() => {
        if (open && walletId) {
            dispatch(fetchNoahCustodyWalletDetail(walletId));
        }
        return () => {
            if (!open) dispatch(clearDetail());
        };
    }, [open, walletId, dispatch]);

    const user     = detail?.userId ?? {};
    const walletSet = detail?.walletSetId ?? {};
    const bankReq  = detail?.bankAccountRequestId ?? {};
    const name     = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '—';
    const initials = name.split(' ').slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase() || '?';

    return (
        <Drawer
            open={open}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <WalletOutlined style={{ color: '#6366f1' }} />
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        Noah Custody Wallet Detail
                    </span>
                </div>
            }
            width={480}
            styles={{
                header: {
                    background: 'var(--bg-card)',
                    borderBottom: '1px solid var(--border-color)',
                },
                body: {
                    background: isDark ? 'var(--bg-app)' : '#f8fafc',
                    padding: '16px',
                },
                mask: { backdropFilter: 'blur(2px)' },
            }}
        >
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 28 }} spin />} />
                </div>
            ) : detail ? (
                <>
                    {/* Merchant Avatar */}
                    <div className="flex flex-col items-center mb-5 pt-2">
                        <Avatar
                            size={64}
                            style={{
                                background: 'linear-gradient(135deg,#4f46e5,#06b6d4)',
                                fontSize: 24,
                                fontWeight: 700,
                            }}
                        >
                            {initials}
                        </Avatar>
                        <div className="mt-2 text-center">
                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {name}
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                {user.emailId ?? '—'}
                            </div>
                        </div>
                        <div className="mt-2">
                            <NoahWalletStateTag state={detail.state} />
                        </div>
                    </div>

                    <Divider style={{ margin: '12px 0', borderColor: 'var(--border-color)' }} />

                    {/* Wallet Info */}
                    <Section title="Wallet" icon={<WalletOutlined />} isDark={isDark}>
                        <Row label="Wallet ID" value={detail.walletId} mono />
                        <Row label="State" value={<NoahWalletStateTag state={detail.state} />} />
                        <Row label="Custody Type" value={
                            <Tag color={detail.custodyType === 'DEVELOPER' ? 'purple' : 'cyan'} style={{ borderRadius: 20, fontSize: 11 }}>
                                {detail.custodyType ?? '—'}
                            </Tag>
                        } />
                        <Row label="Account Type" value={detail.accountType ?? '—'} />
                        <Row label="Active" value={
                            <Tag color={detail.isActive ? 'success' : 'error'} style={{ borderRadius: 20 }}>
                                {detail.isActive ? 'Yes' : 'No'}
                            </Tag>
                        } />
                    </Section>

                    {/* Blockchain Info */}
                    <Section title="Blockchain" icon={<GlobalOutlined />} isDark={isDark}>
                        <Row label="Blockchain" value={detail.blockchain ?? '—'} />
                        <Row label="Blockchain Name" value={detail.blockchainName ?? '—'} />
                        <Row label="Network" value={detail.network ?? '—'} />
                        <Row label="Address" value={detail.address} mono />
                        <Row label="Crypto Currency" value={detail.cryptoCurrency ?? '—'} />
                    </Section>

                    {/* Balances */}
                    <Section title="Balance" icon={<DollarOutlined />} isDark={isDark}>
                        <Row
                            label="Account Balance"
                            value={`${formatAmount(detail.accountBalance)} ${detail.cryptoCurrency ?? ''}`}
                        />
                        <Row
                            label="Available Balance"
                            value={`${formatAmount(detail.availableBalance)} ${detail.cryptoCurrency ?? ''}`}
                        />
                        {(detail.balances ?? []).map((b) => (
                            <div
                                key={b._id}
                                className="rounded-lg px-3 py-2 mt-1"
                                style={{
                                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
                                }}
                            >
                                <div className="flex justify-between text-xs">
                                    <span style={{ color: 'var(--text-muted)' }}>{b.tokenSymbol ?? b.tokenName ?? '—'}</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                                        {formatAmount(b.accountBalance)}
                                    </span>
                                </div>
                                {b.tokenAddress && (
                                    <div className="text-xs font-mono mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                                        {b.tokenAddress}
                                    </div>
                                )}
                            </div>
                        ))}
                    </Section>

                    {/* Wallet Set */}
                    {walletSet._id && (
                        <Section title="Wallet Set" icon={<LinkOutlined />} isDark={isDark}>
                            <Row label="Wallet Set ID" value={walletSet.walletSetId} mono />
                            <Row label="Name" value={walletSet.name ?? '—'} />
                            <Row label="Custody Type" value={walletSet.custodyType ?? '—'} />
                        </Section>
                    )}

                    {/* Bank Account Request */}
                    {bankReq._id && (
                        <Section title="Bank Account Request" icon={<BankOutlined />} isDark={isDark}>
                            <Row label="Account Name" value={bankReq.accountName ?? '—'} />
                            <Row label="Currency" value={bankReq.currency ?? '—'} />
                            <Row label="Account Type" value={bankReq.accountType ?? '—'} />
                            <Row label="Status" value={
                                <Tag
                                    color={bankReq.status === 'completed' ? 'success' : 'warning'}
                                    style={{ borderRadius: 20, fontSize: 11 }}
                                >
                                    {bankReq.status ?? '—'}
                                </Tag>
                            } />
                        </Section>
                    )}

                    {/* Merchant Info */}
                    <Section title="Merchant" icon={<UserOutlined />} isDark={isDark}>
                        <Row label="Name" value={name} />
                        <Row label="Email" value={user.emailId ?? '—'} />
                        <Row label="Mobile" value={user.mobileNumber ?? '—'} />
                        {user.businessInfo?.businessName && (
                            <Row label="Business" value={user.businessInfo.businessName} />
                        )}
                        <Row label="Verified" value={
                            <Tag color={user.isVerified ? 'success' : 'warning'} style={{ borderRadius: 20 }}>
                                {user.isVerified ? 'Yes' : 'No'}
                            </Tag>
                        } />
                    </Section>

                    {/* Timestamps */}
                    <Section title="Timestamps" icon={null} isDark={isDark}>
                        <Row label="Created At" value={formatDateTime(detail.createdAt)} />
                        <Row label="Updated At" value={formatDateTime(detail.updatedAt)} />
                    </Section>
                </>
            ) : (
                <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
                    No details available.
                </div>
            )}
        </Drawer>
    );
};

export default NoahWalletDetailDrawer;
