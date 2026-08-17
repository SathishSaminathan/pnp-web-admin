import React from 'react';
import { Avatar, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { SectionHeader, InfoCard, Field, Grid2, BoolTag } from '../components/UserDetailUI';
import { fmt, str, kycTag } from '../utils/userDetailHelpers.jsx';

const BasicProfileSection = ({ bp, security, accountStatus }) => {
    const initials =
        [bp?.firstName, bp?.lastName]
            .filter(Boolean)
            .map((w) => w[0])
            .join('')
            .toUpperCase() || '?';

    return (
        <div className="flex flex-col gap-6">
            {/* Hero card */}
            <InfoCard>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <Avatar
                        src={bp?.profilePicture || undefined}
                        size={96}
                        style={{
                            background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                            fontSize: 32,
                            fontWeight: 700,
                            flexShrink: 0,
                            color: '#fff',
                            boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
                        }}
                    >
                        {initials}
                    </Avatar>
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                        <h3 className="text-xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>
                            {bp?.firstName} {bp?.lastName}
                        </h3>
                        <p className="text-sm m-0 mt-1" style={{ color: 'var(--text-muted)' }}>
                            {bp?.emailId}
                        </p>
                        {bp?.jobTitle && (
                            <p className="text-sm m-0 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                {bp.jobTitle}
                            </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap mt-3 justify-center sm:justify-start">
                            <Tag
                                color={accountStatus?.isActive ? 'success' : 'error'}
                                style={{ borderRadius: 20 }}
                            >
                                {accountStatus?.isActive ? '● Active' : '● Inactive'}
                            </Tag>
                            {bp?.accountType?.name && (
                                <Tag color="blue" style={{ borderRadius: 20 }}>
                                    {bp.accountType.name}
                                </Tag>
                            )}
                            {accountStatus?.isVerified && (
                                <Tag color="cyan" style={{ borderRadius: 20 }}>
                                    ✓ Verified
                                </Tag>
                            )}
                            {security?.is2faEnabled && (
                                <Tag color="purple" style={{ borderRadius: 20 }}>
                                    2FA On
                                </Tag>
                            )}
                        </div>
                    </div>
                </div>
            </InfoCard>

            {/* Profile fields */}
            <InfoCard>
                <SectionHeader icon={<UserOutlined />} title="Personal Information" />
                <Grid2>
                    <Field label="First Name" value={bp?.firstName} />
                    <Field label="Last Name" value={bp?.lastName} />
                    <Field label="Email Address" value={bp?.emailId} />
                    <Field
                        label="Email Verified"
                        value={<BoolTag val={bp?.isEmailVerified} trueLabel="Verified" falseLabel="Not Verified" />}
                    />
                    <Field
                        label="Mobile Number"
                        value={bp?.mobileNumber ? `+${bp.countryCode} ${bp.mobileNumber}` : null}
                    />
                    <Field label="Date of Birth" value={fmt(bp?.dob)} />
                    <Field label="Citizenship Code" value={bp?.citizenshipCode} />
                    <Field label="Job Title" value={bp?.jobTitle} />
                    <Field label="Tag ID" value={bp?.tagId ? `@${bp.tagId}` : null} />
                    <Field label="Referral Code" value={bp?.referralCode} />
                    <Field label="Referred By" value={str(bp?.referredBy)} />
                    <Field label="Account Type" value={str(bp?.accountType)} />
                    <Field label="Terms Accepted" value={<BoolTag val={bp?.acceptTermsAndConditions} />} />
                    <Field
                        label="Onboarding"
                        value={
                            <Tag
                                color={bp?.isOnBoardCompleted ? 'success' : 'warning'}
                                style={{ borderRadius: 20 }}
                            >
                                {bp?.isOnBoardCompleted ? '✓ Completed' : '⏳ In Progress'}
                            </Tag>
                        }
                    />
                    <Field
                        label="Steps Completed"
                        value={
                            Array.isArray(bp?.stepsCompleted) ? (
                                <div className="flex gap-1 flex-wrap">
                                    {bp.stepsCompleted.map((s) => (
                                        <Tag
                                            key={String(s)}
                                            color="geekblue"
                                            style={{ borderRadius: 20, textTransform: 'capitalize' }}
                                        >
                                            {str(s) ?? s}
                                        </Tag>
                                    ))}
                                </div>
                            ) : bp?.stepsCompleted != null ? (
                                <Tag color="geekblue" style={{ borderRadius: 20 }}>
                                    {bp.stepsCompleted}
                                </Tag>
                            ) : null
                        }
                    />
                    <Field label="Member Since" value={fmt(bp?.createdAt)} />
                    <Field label="Last Updated" value={fmt(bp?.updatedAt)} />
                </Grid2>
            </InfoCard>
        </div>
    );
};

export default BasicProfileSection;
