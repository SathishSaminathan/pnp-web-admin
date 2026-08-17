import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, message, Button, Tabs, Tooltip, Empty } from 'antd';
import {
    ArrowLeftOutlined,
    UserOutlined,
    BankOutlined,
    IdcardOutlined,
    SafetyCertificateOutlined,
    CheckCircleOutlined,
    WalletOutlined,
    CreditCardOutlined,
    TeamOutlined,
    HomeOutlined,
    MonitorOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { merchantsApi } from '../../api/modules/merchants';
import { fmtTime } from './utils/userDetailHelpers.jsx';
import BasicProfileSection from './sections/BasicProfileSection';
import SecuritySection from './sections/SecuritySection';
import IdentitySection from './sections/IdentitySection';
import BusinessSection from './sections/BusinessSection';
import AddressSection from './sections/AddressSection';
import KycStatusSection from './sections/KycStatusSection';
import ComplianceSection from './sections/ComplianceSection';
import AccountsSection from './sections/AccountsSection';
import WalletsSection from './sections/WalletsSection';
import SessionsSection from './sections/SessionsSection';

const wrap = (children) => <div className="p-6">{children}</div>;

const tabLabel = (icon, text) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {icon}
        {text}
    </span>
);

const UserDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDetail = useCallback(async () => {
        setLoading(true);
        try {
            const res = await merchantsApi.getMerchantById(id);
            if (res.success) {
                setData(res.data);
            } else {
                message.error(res.message || 'Failed to load user details');
            }
        } catch (err) {
            if (!err?.handled) message.error('Error loading user details');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    const bp = data?.basicProfile;
    const accountType = bp?.accountType?.name;
    const isOnline = data?.presence?.isOnline ?? false;
    const lastSeenAt = data?.presence?.lastSeenAt;

    const tabs = [
        {
            key: 'profile',
            label: tabLabel(<UserOutlined />, 'Profile'),
            children: wrap(
                <BasicProfileSection
                    bp={bp}
                    security={data?.security}
                    accountStatus={data?.accountStatus}
                />
            ),
        },
        {
            key: 'security',
            label: tabLabel(<SafetyCertificateOutlined />, 'Security'),
            children: wrap(
                <SecuritySection security={data?.security} accountStatus={data?.accountStatus} />
            ),
        },
        {
            key: 'identity',
            label: tabLabel(<IdcardOutlined />, 'Identity'),
            children: wrap(
                <IdentitySection
                    ssn={data?.ssn}
                    passport={data?.passport}
                    utilityBills={data?.utilityBills}
                />
            ),
        },
        {
            key: 'business',
            label: tabLabel(<BankOutlined />, accountType === 'Freelance' ? 'Freelance' : 'Business'),
            children: wrap(
                <BusinessSection
                    businessInfo={data?.businessInfo}
                    freelanceInfo={data?.freelanceInfo}
                    accountType={accountType}
                />
            ),
        },
        {
            key: 'address',
            label: tabLabel(<HomeOutlined />, 'Address'),
            children: wrap(<AddressSection addresses={data?.addresses} />),
        },
        {
            key: 'kyc',
            label: tabLabel(<CheckCircleOutlined />, 'KYC Status'),
            children: wrap(<KycStatusSection kycStatus={data?.kycStatus} />),
        },
        {
            key: 'compliance',
            label: tabLabel(<TeamOutlined />, 'Compliance'),
            children: wrap(
                <ComplianceSection
                    complianceDetails={data?.complianceDetails}
                    intendedUse={data?.intendedUse}
                />
            ),
        },
        {
            key: 'accounts',
            label: tabLabel(<CreditCardOutlined />, 'Bank Accounts'),
            children: wrap(<AccountsSection accounts={data?.accounts} />),
        },
        {
            key: 'wallets',
            label: tabLabel(<WalletOutlined />, 'Wallets'),
            children: wrap(<WalletsSection wallets={data?.wallets} />),
        },
        {
            key: 'sessions',
            label: tabLabel(<MonitorOutlined />, 'Sessions'),
            children: wrap(
                <SessionsSection
                    recentSessions={data?.recentSessions}
                    lastLogin={data?.recentSessions?.[0]?.lastLogin}
                />
            ),
        },
    ];

    return (
        <div className="space-y-4 overflow-x-hidden">
            {/* Header */}
            <div
                className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
                style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-card)',
                }}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/users')}
                        style={{
                            borderRadius: 10,
                            background: 'var(--input-bg)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-primary)',
                            flexShrink: 0,
                        }}
                    >
                        Back
                    </Button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2
                                className="text-base sm:text-xl font-bold truncate"
                                style={{ color: 'var(--text-primary)', lineHeight: 1.3, margin: 0 }}
                            >
                                {loading ? 'Loading\u2026' : bp ? `${bp.firstName} ${bp.lastName}` : 'User Profile'}
                            </h2>
                            {!loading && data && (
                                <Tooltip
                                    title={
                                        !isOnline && lastSeenAt
                                            ? `Last seen ${fmtTime(lastSeenAt)}`
                                            : undefined
                                    }
                                >
                                    <span
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                                        style={{
                                            background: isOnline
                                                ? 'rgba(16,185,129,0.12)'
                                                : 'rgba(100,116,139,0.12)',
                                            color: isOnline ? '#10b981' : '#64748b',
                                            border: `1px solid ${
                                                isOnline
                                                    ? 'rgba(16,185,129,0.3)'
                                                    : 'rgba(100,116,139,0.3)'
                                            }`,
                                            flexShrink: 0,
                                            cursor: !isOnline && lastSeenAt ? 'default' : undefined,
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: '50%',
                                                background: isOnline ? '#10b981' : '#64748b',
                                                flexShrink: 0,
                                                boxShadow: isOnline
                                                    ? '0 0 0 2px rgba(16,185,129,0.3)'
                                                    : 'none',
                                                animation: isOnline ? 'pulse 2s infinite' : 'none',
                                            }}
                                        />
                                        {isOnline ? 'Online' : 'Offline'}
                                    </span>
                                </Tooltip>
                            )}
                        </div>
                        <p className="text-xs m-0 mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                            Full merchant profile &amp; account details
                        </p>
                    </div>
                </div>
                <Tooltip title="Refresh">
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchDetail}
                        loading={loading}
                        style={{
                            borderRadius: 10,
                            background: 'var(--input-bg)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-primary)',
                            flexShrink: 0,
                        }}
                    />
                </Tooltip>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Spin size="large" />
                </div>
            ) : !data ? (
                <Empty description="User not found" />
            ) : (
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-card)',
                    }}
                >
                    <Tabs
                        className="user-detail-tabs"
                        defaultActiveKey="profile"
                        items={tabs}
                        tabBarStyle={{
                            padding: '0 16px',
                            marginBottom: 0,
                            borderBottom: '1px solid var(--border-color)',
                        }}
                        tabBarGutter={16}
                    />
                </div>
            )}
        </div>
    );
};

export default UserDetailPage;
