import React from 'react';
import { Empty } from 'antd';
import { IdcardOutlined, FileTextOutlined } from '@ant-design/icons';
import { SectionHeader, InfoCard, Field, Grid2 } from '../components/UserDetailUI';
import { fmt, fmtTime, str, kycTag } from '../utils/userDetailHelpers.jsx';
import { DocImage } from '../../kyc/components/KycShared';

const IdentitySection = ({ ssn, passport, utilityBills }) => {
    const bills = utilityBills
        ? Array.isArray(utilityBills)
            ? utilityBills
            : [utilityBills]
        : [];

    return (
        <div className="flex flex-col gap-6">
            {/* SSN */}
            {ssn && (
                <InfoCard>
                    <SectionHeader icon={<IdcardOutlined />} title="SSN" />
                    <Grid2>
                        <Field label="SSN" value={ssn.ssn} />
                        <Field label="Verification Status" value={kycTag(ssn.verification?.status)} />
                        <Field label="Verification Source" value={ssn.verification?.source} />
                        <Field label="Verified At" value={fmtTime(ssn.verification?.verifiedAt)} />
                    </Grid2>
                </InfoCard>
            )}

            {/* Passport */}
            {passport && (
                <InfoCard>
                    <SectionHeader icon={<FileTextOutlined />} title="Passport" />
                    <Grid2>
                        <Field label="Passport Number" value={passport.passportNumber} />
                        <Field label="Issuing Country" value={str(passport.issuingCountry)} />
                        <Field label="Expiry Date" value={fmt(passport.expiryDate)} />
                        <Field label="Verification Status" value={kycTag(passport.verification?.status)} />
                        <Field label="Verified At" value={fmtTime(passport.verification?.verifiedAt)} />
                    </Grid2>
                    {passport.images?.front && (
                        <div className="mt-4">
                            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                                Front Image
                            </span>
                            <div className="mt-2 flex flex-wrap gap-3">
                                <DocImage filePath={passport.images.front} alt="Passport Front" />
                            </div>
                        </div>
                    )}
                    {passport.images?.back && (
                        <div className="mt-4">
                            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                                Back Image
                            </span>
                            <div className="mt-2 flex flex-wrap gap-3">
                                <DocImage filePath={passport.images.back} alt="Passport Back" />
                            </div>
                        </div>
                    )}
                </InfoCard>
            )}

            {/* Utility Bills */}
            {bills.length > 0 && (
                <InfoCard>
                    <SectionHeader icon={<FileTextOutlined />} title="Utility Bills" />
                    {bills.map((bill, i) => (
                        <div
                            key={bill.id || i}
                            className={i < bills.length - 1 ? 'mb-4 pb-4' : ''}
                            style={
                                i < bills.length - 1
                                    ? { borderBottom: '1px solid var(--border-color)' }
                                    : {}
                            }
                        >
                            <Grid2>
                                <Field label="Document Name" value={bill.name} />
                                <Field label="Status" value={kycTag(bill.status)} />
                                {bill.reason && <Field label="Reason" value={bill.reason} />}
                            </Grid2>
                            {bill.filePath && (
                                <div className="mt-3 flex flex-wrap gap-3">
                                    <DocImage filePath={bill.filePath} alt={bill.name || `Utility Bill ${i + 1}`} />
                                </div>
                            )}
                            {Array.isArray(bill.filePaths) && bill.filePaths.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-3">
                                    {bill.filePaths.map((fp, j) => (
                                        <DocImage key={j} filePath={fp} alt={`${bill.name || 'Utility Bill'} ${j + 1}`} />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </InfoCard>
            )}

            {!ssn && !passport && bills.length === 0 && (
                <Empty description="No identity documents found" />
            )}
        </div>
    );
};

export default IdentitySection;
