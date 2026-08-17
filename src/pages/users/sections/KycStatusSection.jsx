import React from 'react';
import { Tag, Empty } from 'antd';
import {
    UserOutlined,
    IdcardOutlined,
    HomeOutlined,
    BankOutlined,
    FileTextOutlined,
    TeamOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import { InfoCard } from '../components/UserDetailUI';
import { fmtTime, KYC_STATUS_PROPS } from '../utils/userDetailHelpers.jsx';

const KycStatusSection = ({ kycStatus }) => {
    if (!kycStatus) return <Empty description="No KYC status available" />;

    const sections = [
        { key: 'personalInfo', label: 'Personal Info', icon: <UserOutlined /> },
        { key: 'identity', label: 'Identity', icon: <IdcardOutlined /> },
        { key: 'address', label: 'Address', icon: <HomeOutlined /> },
        { key: 'businessInfo', label: 'Business Info', icon: <BankOutlined /> },
        { key: 'intendedUse', label: 'Intended Use', icon: <FileTextOutlined /> },
        { key: 'complianceDetails', label: 'Compliance', icon: <TeamOutlined /> },
    ];

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sections.map(({ key, label, icon }) => {
                    const section = kycStatus[key];
                    if (!section) return null;
                    const p = KYC_STATUS_PROPS[section.status] ?? {
                        color: 'default',
                        icon: <ClockCircleOutlined />,
                    };
                    return (
                        <InfoCard key={key}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span style={{ color: '#60a5fa' }}>{icon}</span>
                                    <span
                                        className="text-sm font-semibold"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        {label}
                                    </span>
                                </div>
                                <Tag icon={p.icon} color={p.color} style={{ borderRadius: 20 }}>
                                    {section.status || 'Unknown'}
                                </Tag>
                            </div>
                            {section.reason && (
                                <p className="text-xs mt-2 m-0" style={{ color: 'var(--text-muted)' }}>
                                    {section.reason}
                                </p>
                            )}
                            {section.verifiedAt && (
                                <p className="text-xs mt-1 m-0" style={{ color: 'var(--text-muted)' }}>
                                    Verified: {fmtTime(section.verifiedAt)}
                                </p>
                            )}
                        </InfoCard>
                    );
                })}
            </div>
        </div>
    );
};

export default KycStatusSection;
