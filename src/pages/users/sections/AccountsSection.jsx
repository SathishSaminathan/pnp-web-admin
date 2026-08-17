import React from 'react';
import { Tag, Empty } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';
import { SectionHeader, InfoCard, Field, Grid2 } from '../components/UserDetailUI';
import { fmt, fmtMoney } from '../utils/userDetailHelpers.jsx';

const AccountCard = ({ acc }) => (
    <div
        key={acc._id}
        className="p-4 rounded-xl mb-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
    >
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
                <Tag
                    color={acc.currency === 'USD' ? 'green' : 'blue'}
                    style={{ borderRadius: 20, fontWeight: 700 }}
                >
                    {acc.currency}
                </Tag>
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {acc.accountName}
                </span>
            </div>
            <div className="flex gap-1">
                {acc.isDefault && <Tag color="gold" style={{ borderRadius: 20 }}>Default</Tag>}
                {acc.isActive && <Tag color="success" style={{ borderRadius: 20 }}>Active</Tag>}
                {acc.isVerified && <Tag color="cyan" style={{ borderRadius: 20 }}>Verified</Tag>}
            </div>
        </div>
        <Grid2>
            {acc.accountNumber && <Field label="Account Number" value={acc.accountNumber} />}
            {acc.iban && <Field label="IBAN" value={acc.iban} />}
            {acc.routingNumber && <Field label="Routing Number" value={acc.routingNumber} />}
            {acc.bic && <Field label="BIC" value={acc.bic} />}
            <Field label="Account Holder" value={acc.accountHolderName} />
            <Field label="Bank Name" value={acc.bankName} />
            <Field label="Account Type" value={acc.accountType} />
            <Field label="Service Provider" value={acc.serviceProvider?.providerName} />
            <Field label="Account Balance" value={fmtMoney(acc.accountBalance, acc.currency)} />
            <Field label="Available Balance" value={fmtMoney(acc.availableBalance, acc.currency)} />
            <Field label="Reserved Balance" value={fmtMoney(acc.reservedBalance, acc.currency)} />
            <Field label="Created At" value={fmt(acc.createdAt)} />
        </Grid2>
    </div>
);

const AccountsSection = ({ accounts }) => {
    const usdAccounts = accounts?.usd ?? [];
    const eurAccounts = accounts?.eur ?? [];

    if (!usdAccounts.length && !eurAccounts.length) {
        return <Empty description="No bank accounts found" />;
    }

    return (
        <div className="flex flex-col gap-6">
            {usdAccounts.length > 0 && (
                <InfoCard>
                    <SectionHeader icon={<CreditCardOutlined />} title="USD Accounts" />
                    {usdAccounts.map((acc) => (
                        <AccountCard key={acc._id} acc={acc} />
                    ))}
                </InfoCard>
            )}
            {eurAccounts.length > 0 && (
                <InfoCard>
                    <SectionHeader icon={<CreditCardOutlined />} title="EUR Accounts" />
                    {eurAccounts.map((acc) => (
                        <AccountCard key={acc._id} acc={acc} />
                    ))}
                </InfoCard>
            )}
        </div>
    );
};

export default AccountsSection;
