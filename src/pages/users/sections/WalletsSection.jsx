import React from 'react';
import { Tag, Empty } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import { InfoCard, Field, Grid2 } from '../components/UserDetailUI';
import { fmt, fmtMoney } from '../utils/userDetailHelpers.jsx';

const WalletsSection = ({ wallets }) => {
    if (!wallets?.length) return <Empty description="No crypto wallets found" />;

    return (
        <div className="flex flex-col gap-4">
            {wallets.map((w) => (
                <InfoCard key={w._id}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <WalletOutlined style={{ color: '#60a5fa' }} />
                            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                {w.blockchainName || w.blockchain}
                            </span>
                        </div>
                        <div className="flex gap-1">
                            <Tag
                                color={w.state === 'LIVE' ? 'success' : 'default'}
                                style={{ borderRadius: 20 }}
                            >
                                {w.state}
                            </Tag>
                            {w.isDefault && <Tag color="gold" style={{ borderRadius: 20 }}>Default</Tag>}
                            {w.isActive && <Tag color="cyan" style={{ borderRadius: 20 }}>Active</Tag>}
                        </div>
                    </div>
                    <Grid2>
                        <Field label="Wallet ID" value={w.walletId} />
                        <Field label="Blockchain" value={w.blockchain} />
                        <Field label="Account Type" value={w.accountType} />
                        <Field label="Custody Type" value={w.custodyType} />
                        <Field label="Account Balance" value={fmtMoney(w.accountBalance, 'USDC')} />
                        <Field label="Available Balance" value={fmtMoney(w.availableBalance, 'USDC')} />
                        <Field label="Created At" value={fmt(w.createdAt)} />
                    </Grid2>
                    <div className="mt-3">
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                            Wallet Address
                        </span>
                        <p
                            className="mt-1 font-mono text-xs break-all p-2 rounded-lg"
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                            }}
                        >
                            {w.address}
                        </p>
                    </div>
                </InfoCard>
            ))}
        </div>
    );
};

export default WalletsSection;
