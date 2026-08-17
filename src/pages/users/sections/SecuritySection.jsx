import React from 'react';
import { Tag } from 'antd';
import { SafetyCertificateOutlined, LockOutlined } from '@ant-design/icons';
import { SectionHeader, InfoCard, Field, Grid2, BoolTag } from '../components/UserDetailUI';
import { fmtTime } from '../utils/userDetailHelpers.jsx';

const SecuritySection = ({ security, accountStatus }) => (
    <div className="flex flex-col gap-6">
        <InfoCard>
            <SectionHeader icon={<SafetyCertificateOutlined />} title="Security Settings" />
            <Grid2>
                <Field
                    label="Account Verified"
                    value={<BoolTag val={security?.isVerified} trueLabel="Verified" falseLabel="Not Verified" />}
                />
                <Field
                    label="Account Active"
                    value={<BoolTag val={security?.isActive} trueLabel="Active" falseLabel="Inactive" />}
                />
                <Field
                    label="2FA Enabled"
                    value={<BoolTag val={security?.is2faEnabled} trueLabel="Enabled" falseLabel="Disabled" />}
                />
                <Field
                    label="SOS Enabled"
                    value={<BoolTag val={security?.isSOSEnabled} trueLabel="Enabled" falseLabel="Disabled" />}
                />
                <Field
                    label="Account Locked"
                    value={
                        <Tag color={security?.accountLocked ? 'error' : 'success'} style={{ borderRadius: 20 }}>
                            {security?.accountLocked ? 'Locked' : 'Unlocked'}
                        </Tag>
                    }
                />
                <Field
                    label="Incorrect Login Attempts"
                    value={
                        <Tag
                            color={
                                (security?.incorrectLoginAttempts ?? 0) > 3
                                    ? 'red'
                                    : (security?.incorrectLoginAttempts ?? 0) > 0
                                    ? 'orange'
                                    : 'green'
                            }
                            style={{ borderRadius: 20 }}
                        >
                            {security?.incorrectLoginAttempts ?? 0}
                        </Tag>
                    }
                />
                <Field
                    label="Incorrect OTP Attempts"
                    value={
                        <Tag
                            color={(security?.incorrectOtpAttempts ?? 0) > 0 ? 'orange' : 'green'}
                            style={{ borderRadius: 20 }}
                        >
                            {security?.incorrectOtpAttempts ?? 0}
                        </Tag>
                    }
                />
                <Field
                    label="Verification Code Expires"
                    value={
                        security?.verificationCodeExpiresAt
                            ? fmtTime(security.verificationCodeExpiresAt)
                            : '—'
                    }
                />
            </Grid2>
        </InfoCard>

        <InfoCard>
            <SectionHeader icon={<LockOutlined />} title="Account Status" />
            <Grid2>
                <Field
                    label="Is Active"
                    value={<BoolTag val={accountStatus?.isActive} trueLabel="Active" falseLabel="Inactive" />}
                />
                <Field
                    label="Is Verified"
                    value={
                        <BoolTag val={accountStatus?.isVerified} trueLabel="Verified" falseLabel="Not Verified" />
                    }
                />
                <Field
                    label="Authorized Representative"
                    value={<BoolTag val={accountStatus?.authorizedRepresentative} />}
                />
                <Field
                    label="Deleted"
                    value={<BoolTag val={accountStatus?.isDelete} trueLabel="Deleted" falseLabel="Active" />}
                />
                <Field label="Tax ID" value={accountStatus?.taxId} />
            </Grid2>
        </InfoCard>
    </div>
);

export default SecuritySection;
