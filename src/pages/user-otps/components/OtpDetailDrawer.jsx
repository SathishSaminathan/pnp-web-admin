import React from 'react';
import { Drawer, Spin, Divider, Tag } from 'antd';
import { KeyOutlined, LoadingOutlined } from '@ant-design/icons';
import OtpStatusTag from './OtpStatusTag';

const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-start gap-4 py-2.5" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <span className="text-xs font-semibold uppercase tracking-wide shrink-0" style={{ color: 'var(--text-muted)', minWidth: 120 }}>
            {label}
        </span>
        <span className="text-sm text-right font-medium break-all" style={{ color: 'var(--text-primary)' }}>
            {value ?? '—'}
        </span>
    </div>
);

const SectionTitle = ({ children }) => (
    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 8, marginTop: 16 }}>
        {children}
    </p>
);

const OtpDetailDrawer = ({ open, otp, onClose }) => {
    const record = otp;

    return (
        <Drawer
            open={open}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <KeyOutlined style={{ color: '#f59e0b' }} />
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>OTP Detail</span>
                </div>
            }
            width={420}
            styles={{ body: { background: 'var(--bg-card)', padding: '16px 20px' }, header: { background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' } }}
        >
            {!record ? (
                <div className="flex items-center justify-center h-32">
                    <Spin indicator={<LoadingOutlined spin />} />
                </div>
            ) : (
                <div>
                    {/* Status */}
                    <div className="flex items-center gap-2 mb-4">
                        <OtpStatusTag isUsed={record.verification?.hasCode === false} isExpired={record.verification?.isExpired ?? false} isVerified={false} />
                        {record.verificationFor && (
                            <Tag color="blue" style={{ borderRadius: 20 }}>
                                {record.verificationFor}
                            </Tag>
                        )}
                    </div>
                    <Divider style={{ borderColor: 'var(--border-color)', margin: '0 0 4px' }} />

                    {/* User */}
                    <SectionTitle>User</SectionTitle>
                    <InfoRow label="Contact"  value={record.contactInfo} />
                    <InfoRow label="User ID"  value={typeof record.userId === 'string' ? record.userId : (record.userId?._id ?? null)} />

                    {/* OTP */}
                    <SectionTitle>OTP Info</SectionTitle>
                    <InfoRow label="OTP ID"    value={record._id} />
                    <InfoRow label="Purpose"   value={record.verificationFor} />
                    <InfoRow label="Channel"   value={record.type} />
                    <InfoRow label="Attempts"  value={record.incorrectOtpAttempts != null ? `${record.incorrectOtpAttempts}` : null} />
                    <InfoRow label="Code Length" value={record.verification?.length != null ? `${record.verification.length} digits` : null} />
                    {/* Verification code is intentionally hidden per policy */}
                    <InfoRow label="Code"      value="**** (masked)" />

                    {/* Timestamps */}
                    <SectionTitle>Timestamps</SectionTitle>
                    <InfoRow label="Created"   value={record.createdAt ? new Date(record.createdAt).toLocaleString() : null} />
                    <InfoRow label="Expires At" value={record.verification?.expiresAt ? new Date(record.verification.expiresAt).toLocaleString() : null} />
                </div>
            )}
        </Drawer>
    );
};

export default OtpDetailDrawer;
