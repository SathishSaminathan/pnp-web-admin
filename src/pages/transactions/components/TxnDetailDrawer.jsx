import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Drawer, Avatar, Tag, Button, Spin, Divider, Descriptions } from 'antd';
import {
    UserOutlined,
    BankOutlined,
    DollarOutlined,
    ArrowRightOutlined,
    LoadingOutlined,
    SwapOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import {
    fetchTransactionDetail,
    clearDetail,
    selectTransactionDetail,
    selectTransactionDetailLoading,
} from '../../../store/slices/transactionsSlice';
import { formatDateTime } from '../../../utils/formatters';
import { formatAmount } from '../../../utils/number.utils';
import TransactionStatusTag from './TransactionStatusTag';

/* ── Small helpers ──────────────────────────────────────────────────────────── */
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
        <span className="shrink-0 text-xs" style={{ color: 'var(--text-muted)', minWidth: 160 }}>
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

/* ── Main Drawer ───────────────────────────────────────────────────────────── */
const TxnDetailDrawer = ({ open, transactionId, onClose, isDark }) => {
    const dispatch = useDispatch();
    const detail   = useSelector(selectTransactionDetail);
    const loading  = useSelector(selectTransactionDetailLoading);

    useEffect(() => {
        if (open && transactionId) {
            dispatch(fetchTransactionDetail(transactionId));
        }
        return () => {
            if (!open) dispatch(clearDetail());
        };
    }, [open, transactionId, dispatch]);

    const user       = detail?.user ?? {};
    const toUser     = detail?.toUser ?? null;
    const beneficiary = detail?.beneficiary ?? null;
    const source      = detail?.source ?? {};
    const destination = detail?.destination ?? {};
    const fundTransfer = detail?.fundTransfer ?? {};
    const feeTransfer  = detail?.feeTransfer ?? {};
    const currencyTransfer = detail?.currencyTransfer ?? {};
    const tsm          = detail?.timestamps ?? {};

    const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '—';
    const initials = name.split(' ').slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase() || '?';

    return (
        <Drawer
            title={
                <div className="flex items-center gap-3">
                    <Avatar
                        size={36}
                        style={{ background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', fontWeight: 700 }}
                    >
                        {initials}
                    </Avatar>
                    <div>
                        <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {detail?.transactionId ?? 'Transaction Detail'}
                        </div>
                        {detail?.status && (
                            <TransactionStatusTag status={detail.status} />
                        )}
                    </div>
                </div>
            }
            open={open}
            onClose={onClose}
            width={520}
            styles={{
                body: { background: isDark ? 'var(--bg-app)' : '#f9fafb', padding: '16px' },
                header: {
                    background: isDark ? 'var(--bg-card)' : '#fff',
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
                },
            }}
        >
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 28 }} spin />} />
                </div>
            ) : !detail ? null : (
                <>
                    {/* Transaction */}
                    <Section title="Transaction" icon={<SwapOutlined />} isDark={isDark}>
                        <Row label="TXN ID"          value={detail.transactionId} mono />
                        <Row label="Type"            value={detail.transactionType} />
                        <Row label="Payment Method"  value={detail.paymentMethod} />
                        <Row label="Amount"          value={`${detail.amount != null ? formatAmount(detail.amount) : '—'} ${source.currency ?? ''}`} />
                        <Row label="Total Fee"       value={`${detail.totalFee != null ? formatAmount(detail.totalFee) : '—'} ${detail.feeCurrency ?? ''}`} />
                        <Row label="Total Amount"    value={`${detail.totalAmount != null ? formatAmount(detail.totalAmount) : '—'} ${source.currency ?? ''}`} />
                        <Row label="Exchange Rate"   value={detail.exchangeRate != null ? String(detail.exchangeRate) : '—'} />
                        <Row label="Internal"        value={detail.isInternal ? 'Yes' : 'No'} />
                        <Row label="Reference ID"    value={detail.referenceId} mono />
                        <Row label="Description"     value={detail.description} />
                        {detail.settlementDate && (
                            <Row label="Settlement Date" value={formatDateTime(detail.settlementDate)} />
                        )}
                    </Section>

                    {/* Merchant */}
                    <Section title="Merchant" icon={<UserOutlined />} isDark={isDark}>
                        <Row label="Name"       value={name} />
                        <Row label="Email"      value={user.emailId} />
                        <Row label="Mobile"     value={user.mobileNumber} />
                        <Row label="Business"   value={user.businessInfo?.businessName} />
                        <Row label="Verified"   value={user.isVerified ? 'Yes' : 'No'} />
                        <Row label="Active"     value={user.isActive ? 'Yes' : 'No'} />
                    </Section>

                    {/* Source Account */}
                    <Section title="Source Account" icon={<BankOutlined />} isDark={isDark}>
                        <Row label="Type"      value={source.accountType} />
                        <Row label="Currency"  value={source.currency} />
                        <Row label="Balance"   value={source.accountBalance != null ? formatAmount(source.accountBalance) : undefined} />
                        <Row label="Available" value={source.availableBalance != null ? formatAmount(source.availableBalance) : undefined} />
                        {(source.accountInfo ?? []).map((info) => (
                            <Row key={info.name} label={info.name} value={info.value} mono />
                        ))}
                    </Section>

                    {/* Destination Account */}
                    <Section title="Destination Account" icon={<ArrowRightOutlined />} isDark={isDark}>
                        <Row label="Type"     value={destination.accountType} />
                        <Row label="Currency" value={destination.currency} />
                        {(destination.accountInfo ?? []).map((info) => (
                            <Row key={info.name} label={info.name} value={info.value} mono />
                        ))}
                    </Section>

                    {/* Beneficiary */}
                    {beneficiary && (
                        <Section title="Beneficiary" icon={<UserOutlined />} isDark={isDark}>
                            <Row label="Name"           value={beneficiary.name} />
                            <Row label="Bank"           value={beneficiary.bankName} />
                            <Row label="Account Number" value={beneficiary.accountNumber} mono />
                            <Row label="Routing Number" value={beneficiary.routingNumber} mono />
                            <Row label="Account Type"   value={beneficiary.accountType} />
                            <Row label="Currency"       value={beneficiary.currency} />
                        </Section>
                    )}

                    {/* Recipient (internal) */}
                    {toUser && (
                        <Section title="Recipient" icon={<UserOutlined />} isDark={isDark}>
                            <Row label="Name"   value={`${toUser.firstName ?? ''} ${toUser.lastName ?? ''}`.trim()} />
                            <Row label="Email"  value={toUser.emailId} />
                            <Row label="Mobile" value={toUser.mobileNumber} />
                        </Section>
                    )}

                    {/* Fees */}
                    {(detail.fee ?? []).length > 0 && (
                        <Section title="Fee Breakdown" icon={<DollarOutlined />} isDark={isDark}>
                            {detail.fee.map((f, i) => (
                                <Row key={i} label={`${f.name} (${f.type})`} value={`${f.amount}  ${f.description ?? ''}`} />
                            ))}
                        </Section>
                    )}

                    {/* Transfer Status */}
                    <Section title="Transfer Status" icon={<SwapOutlined />} isDark={isDark}>
                        <Row label="Fund Transfer Type"   value={fundTransfer.type} />
                        <Row label="Fund Transfer Status" value={fundTransfer.status} />
                        <Row label="Fee Transfer Type"    value={feeTransfer.type} />
                        <Row label="Fee Transfer Status"  value={feeTransfer.status} />
                        {currencyTransfer.type && (
                            <Row label="Currency Transfer Status" value={currencyTransfer.status} />
                        )}
                    </Section>

                    {/* Source of Funds */}
                    {detail.sourceOfFunds?.fundSource && (
                        <Section title="Source of Funds" icon={<DollarOutlined />} isDark={isDark}>
                            <Row label="Fund Source"   value={detail.sourceOfFunds.fundSource} />
                            {detail.sourceOfFunds.fundSourceDetails && (
                                <Row label="Details"   value={detail.sourceOfFunds.fundSourceDetails} />
                            )}
                            {detail.sourceOfFunds.reason && (
                                <Row label="Reason"    value={detail.sourceOfFunds.reason} />
                            )}
                        </Section>
                    )}

                    {/* Timestamps */}
                    <Section title="Timestamps" icon={<CalendarOutlined />} isDark={isDark}>
                        {tsm.initiatedAt  && <Row label="Initiated"   value={formatDateTime(tsm.initiatedAt)} />}
                        {tsm.approvedAt   && <Row label="Approved"    value={formatDateTime(tsm.approvedAt)} />}
                        {tsm.inProgressAt && <Row label="In Progress" value={formatDateTime(tsm.inProgressAt)} />}
                        {tsm.completedAt  && <Row label="Completed"   value={formatDateTime(tsm.completedAt)} />}
                        <Row label="Created"  value={formatDateTime(detail.createdAt)} />
                        <Row label="Updated"  value={formatDateTime(detail.updatedAt)} />
                    </Section>
                </>
            )}
        </Drawer>
    );
};

export default TxnDetailDrawer;
