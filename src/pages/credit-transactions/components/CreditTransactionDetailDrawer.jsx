import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Drawer, Avatar, Tag, Button, Spin, Divider, Descriptions, Badge,
} from 'antd';
import {
    CreditCardOutlined,
    UserOutlined,
    BankOutlined,
    WalletOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    LoadingOutlined,
    DollarOutlined,
    CalendarOutlined,
    FileTextOutlined,
    TagsOutlined,
} from '@ant-design/icons';
import {
    fetchCreditTransactionDetail,
    clearDetail,
    selectCreditTransactionDetail,
    selectCreditTransactionDetailLoading,
} from '../../../store/slices/creditTransactionsSlice';
import { formatDateTime } from '../../../utils/formatters';
import { formatAmount, safeDivide } from '../../../utils/number.utils';
import CreditTxStatusTag from './CreditTxStatusTag';

/* ── Helper components ─────────────────────────────────────────────────────── */
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

const Row = ({ label, value, mono, badge }) => (
    <div className="flex justify-between items-start gap-3 text-sm">
        <span className="shrink-0 text-xs" style={{ color: 'var(--text-muted)', minWidth: 130 }}>{label}</span>
        <span
            className={`text-right break-all ${mono ? 'font-mono text-xs' : ''}`}
            style={{ color: 'var(--text-primary)', fontWeight: 500 }}
        >
            {badge ?? value ?? '—'}
        </span>
    </div>
);

/* ── Main Drawer ────────────────────────────────────────────────────────────── */
const CreditTransactionDetailDrawer = ({
    open,
    transactionId,
    onClose,
    isDark,
    onApprove,
    onReject,
    canApprove,
    canReject,
    actionLoading,
}) => {
    const dispatch = useDispatch();
    const detail = useSelector(selectCreditTransactionDetail);
    const loading = useSelector(selectCreditTransactionDetailLoading);

    useEffect(() => {
        if (open && transactionId) {
            dispatch(fetchCreditTransactionDetail(transactionId));
        }
        return () => {
            if (!open) dispatch(clearDetail());
        };
    }, [open, transactionId, dispatch]);

    const d = detail;
    const user = d?.user;
    const displayName = user
        ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.emailId
        : '—';
    const initials = displayName
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0] ?? '')
        .join('')
        .toUpperCase() || '?';

    const drawerWidth = typeof window !== 'undefined'
        ? Math.min(540, window.innerWidth)
        : 540;

    return (
        <Drawer
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: 'linear-gradient(135deg,#4f46e5,#06b6d4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <CreditCardOutlined style={{ color: '#fff', fontSize: 14 }} />
                    </div>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                            Transaction Detail
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {d?.transactionId ?? '—'}
                        </div>
                    </div>
                </div>
            }
            placement="right"
            onClose={onClose}
            open={open}
            width={drawerWidth}
            styles={{
                body: {
                    background: isDark ? 'var(--bg-card)' : '#f8fafc',
                    padding: '16px',
                },
                header: {
                    background: isDark ? 'var(--bg-card)' : '#fff',
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                },
            }}
            extra={
                <div className="flex items-center gap-2">
                    {canReject && (
                        <Button
                            size="small"
                            danger
                            icon={<CloseCircleOutlined />}
                            loading={actionLoading}
                            onClick={() => onReject(d)}
                        >
                            Reject
                        </Button>
                    )}
                    {canApprove && (
                        <Button
                            size="small"
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            loading={actionLoading}
                            style={{ background: '#10b981', borderColor: '#10b981' }}
                            onClick={() => onApprove(d)}
                        >
                            Approve
                        </Button>
                    )}
                </div>
            }
        >
            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 28, color: '#4f46e5' }} spin />} />
                </div>
            ) : !d ? (
                <div className="flex justify-center items-center h-48 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Transaction not found.
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Merchant header card */}
                    <div
                        className="rounded-xl p-4 flex items-center gap-4"
                        style={{
                            background: isDark
                                ? 'linear-gradient(135deg,rgba(79,70,229,0.15),rgba(6,182,212,0.1))'
                                : 'linear-gradient(135deg,rgba(79,70,229,0.07),rgba(6,182,212,0.05))',
                            border: `1px solid ${isDark ? 'rgba(79,70,229,0.2)' : 'rgba(79,70,229,0.12)'}`,
                        }}
                    >
                        <Avatar
                            size={48}
                            style={{
                                background: 'linear-gradient(135deg,#4f46e5,#06b6d4)',
                                fontSize: 18, fontWeight: 700, flexShrink: 0,
                            }}
                        >
                            {initials}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                {displayName}
                            </div>
                            <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                                {user?.emailId ?? '—'}
                            </div>
                            {user?.businessInfo?.businessName && (
                                <div className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                    {user.businessInfo.businessName}
                                </div>
                            )}
                        </div>
                        <CreditTxStatusTag status={d.status} />
                    </div>

                    {/* Transaction Overview */}
                    <Section title="Transaction Info" icon={<CreditCardOutlined />} isDark={isDark}>
                        <Row label="Transaction ID" value={d.transactionId} mono />
                        <Row label="Payment Method" value={d.paymentMethod} />
                        <Row label="Transaction Type" value={d.transactionType} />
                        <Row label="Amount" value={`${formatAmount(d.amount)} ${d.feeCurrency ?? 'USD'}`} />
                        <Row label="Total Fee" value={`${formatAmount(d.totalFee)} ${d.feeCurrency ?? 'USD'}`} />
                        <Row
                            label="Total Amount (Net)"
                            value={`${formatAmount(d.totalAmount)} ${d.feeCurrency ?? 'USD'}`}
                        />
                        {d.exchangeRate !== undefined && d.exchangeRate !== 1.0 && (
                            <Row label="Exchange Rate" value={d.exchangeRate} />
                        )}
                        <Row label="Status" badge={<CreditTxStatusTag status={d.status} />} />
                        {d.referenceId && <Row label="Reference ID" value={d.referenceId} mono />}
                        {d.settlementDate && (
                            <Row label="Settlement Date" value={formatDateTime(d.settlementDate)} />
                        )}
                    </Section>

                    {/* Fees */}
                    {Array.isArray(d.fee) && d.fee.length > 0 && (
                        <Section title="Fee Breakdown" icon={<DollarOutlined />} isDark={isDark}>
                            {d.fee.map((f, i) => (
                                <div
                                    key={i}
                                    className="rounded-lg p-2.5 flex justify-between items-center text-sm"
                                    style={{
                                        background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                                    }}
                                >
                                    <div>
                                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{f.name}</span>
                                        {f.description && (
                                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.description}</div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                            {f.amount} {d.feeCurrency ?? 'USD'}
                                        </div>
                                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.type}</div>
                                    </div>
                                </div>
                            ))}
                        </Section>
                    )}

                    {/* Source */}
                    <Section title="Source Account" icon={<BankOutlined />} isDark={isDark}>
                        <Row label="Account Type" value={d.source?.accountType} />
                        <Row label="Currency" value={d.source?.currency} />
                        {Array.isArray(d.source?.accountInfo) && d.source.accountInfo.map((info, i) => (
                            <Row key={i} label={info.name} value={info.value} />
                        ))}
                    </Section>

                    {/* Destination */}
                    <Section title="Destination Account" icon={<WalletOutlined />} isDark={isDark}>
                        <Row label="Account Type" value={d.destination?.accountType} />
                        <Row label="Currency" value={d.destination?.currency} />
                        {Array.isArray(d.destination?.accountInfo) && d.destination.accountInfo.map((info, i) => (
                            <Row key={i} label={info.name} value={info.value} />
                        ))}
                        {d.destination?.accountBalance !== undefined && (
                            <Row
                                label="Account Balance"
                                value={`${formatAmount(d.destination?.accountBalance)} ${d.destination?.currency ?? ''}`}
                            />
                        )}
                    </Section>

                    {/* Source of Funds */}
                    {d.sourceOfFunds && (
                        <Section title="Source of Funds" icon={<FileTextOutlined />} isDark={isDark}>
                            <Row label="Fund Source" value={d.sourceOfFunds.fundSource} />
                            {d.sourceOfFunds.fundSourceDetails && (
                                <Row label="Details" value={d.sourceOfFunds.fundSourceDetails} />
                            )}
                            {d.sourceOfFunds.reason && (
                                <Row label="Reason" value={d.sourceOfFunds.reason} />
                            )}
                        </Section>
                    )}

                    {/* Description */}
                    {d.description && (
                        <Section title="Description" icon={<TagsOutlined />} isDark={isDark}>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)', margin: 0 }}>{d.description}</p>
                        </Section>
                    )}

                    {/* Timestamps */}
                    <Section title="Timestamps" icon={<CalendarOutlined />} isDark={isDark}>
                        {d.timestamps?.initiatedAt && (
                            <Row label="Initiated" value={formatDateTime(d.timestamps.initiatedAt)} />
                        )}
                        {d.timestamps?.approvedAt && (
                            <Row label="Approved" value={formatDateTime(d.timestamps.approvedAt)} />
                        )}
                        {d.timestamps?.rejectedAt && (
                            <Row label="Rejected" value={formatDateTime(d.timestamps.rejectedAt)} />
                        )}
                        {d.createdAt && <Row label="Created" value={formatDateTime(d.createdAt)} />}
                        {d.updatedAt && <Row label="Updated" value={formatDateTime(d.updatedAt)} />}
                    </Section>

                    {/* Merchant details */}
                    {user && (
                        <Section title="Merchant" icon={<UserOutlined />} isDark={isDark}>
                            <Row label="Name" value={displayName} />
                            <Row label="Email" value={user.emailId} />
                            {user.mobileNumber && <Row label="Phone" value={user.mobileNumber} />}
                            {user.isVerified !== undefined && (
                                <Row
                                    label="Verified"
                                    badge={
                                        <Tag color={user.isVerified ? 'green' : 'orange'} style={{ borderRadius: 20 }}>
                                            {user.isVerified ? 'Yes' : 'No'}
                                        </Tag>
                                    }
                                />
                            )}
                            {user.isActive !== undefined && (
                                <Row
                                    label="Active"
                                    badge={
                                        <Tag color={user.isActive ? 'green' : 'red'} style={{ borderRadius: 20 }}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </Tag>
                                    }
                                />
                            )}
                        </Section>
                    )}
                </div>
            )}
        </Drawer>
    );
};

export default CreditTransactionDetailDrawer;
