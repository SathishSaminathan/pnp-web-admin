import React from 'react';
import { Tag, Empty } from 'antd';
import {
    FileTextOutlined,
    TeamOutlined,
    SafetyCertificateOutlined,
    LockOutlined,
} from '@ant-design/icons';
import { SectionHeader, InfoCard, Field, Grid2, BoolTag } from '../components/UserDetailUI';
import { fmt, fmtTime, str, kycTag } from '../utils/userDetailHelpers.jsx';
import { formatAmount } from '../../../utils/number.utils';

const ComplianceSection = ({ complianceDetails, intendedUse }) => (
    <div className="flex flex-col gap-6">
        {/* Intended Use */}
        {intendedUse && (
            <InfoCard>
                <SectionHeader icon={<FileTextOutlined />} title="Intended Use" />
                <Grid2>
                    {intendedUse.services?.length > 0 && (
                        <Field
                            label="Services"
                            full
                            value={
                                <div className="flex gap-1 flex-wrap">
                                    {intendedUse.services.map((s) => (
                                        <Tag
                                            key={s.id || s._id}
                                            color="blue"
                                            style={{ borderRadius: 20 }}
                                        >
                                            {str(s)}
                                        </Tag>
                                    ))}
                                </div>
                            }
                        />
                    )}
                    <Field
                        label="Monthly Income (USD)"
                        value={
                            intendedUse.monthlyIncomeUSD
                                ? `$${formatAmount(intendedUse.monthlyIncomeUSD, { decimals: 0, maxDecimals: 0 })}`
                                : null
                        }
                    />
                    <Field
                        label="Monthly Income (Crypto)"
                        value={
                            intendedUse.monthlyIncomeCrypto
                                ? `$${formatAmount(intendedUse.monthlyIncomeCrypto, { decimals: 0, maxDecimals: 0 })}`
                                : null
                        }
                    />
                    <Field label="Preferred Settlement" value={intendedUse.preferredSettlement} />
                    <Field label="Source of Funds" value={str(intendedUse.sourceOfFunds)} />
                    <Field
                        label="Third-Party Payments"
                        value={<BoolTag val={intendedUse.thirdPartyPayments} />}
                    />
                    <Field label="Has Website" value={<BoolTag val={intendedUse.hasWebsite} />} />
                    {intendedUse.websiteURL && (
                        <Field label="Website URL" value={intendedUse.websiteURL} />
                    )}
                </Grid2>
            </InfoCard>
        )}

        {/* Beneficial Owners */}
        {complianceDetails?.beneficialOwnersList?.length > 0 && (
            <InfoCard>
                <SectionHeader icon={<TeamOutlined />} title="Beneficial Owners" />
                <div className="flex flex-col gap-4">
                    {complianceDetails.beneficialOwnersList.map((owner, i) => (
                        <div
                            key={owner._id || i}
                            className="p-4 rounded-xl"
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                            }}
                        >
                            <Grid2>
                                <Field label="Name" value={owner.ownerName} />
                                <Field label="Email" value={owner.ownerEmail} />
                                <Field
                                    label="Ownership %"
                                    value={
                                        owner.ownershipPercentage != null
                                            ? `${owner.ownershipPercentage}%`
                                            : null
                                    }
                                />
                                <Field label="Date of Birth" value={fmt(owner.ownerDOB)} />
                                <Field label="Citizenship Code" value={owner.citizenshipCode} />
                                <Field label="Status" value={kycTag(owner.status)} />
                                {owner.ownerAddress && (
                                    <>
                                        <Field
                                            label="Street Address"
                                            value={owner.ownerAddress.streetAddress}
                                        />
                                        <Field label="City" value={owner.ownerAddress.cityName} />
                                        <Field label="State" value={owner.ownerAddress.stateName} />
                                        <Field label="Country" value={owner.ownerAddress.countryName} />
                                        <Field label="Postal Code" value={owner.ownerAddress.postalCode} />
                                    </>
                                )}
                                {owner.ssn && (
                                    <Field
                                        label="SSN (last 4)"
                                        value={
                                            <span className="flex items-center gap-2">
                                                xxx-xx-{owner.ssn.last4}
                                                {kycTag(owner.ssn.verification?.status)}
                                            </span>
                                        }
                                    />
                                )}
                            </Grid2>
                        </div>
                    ))}
                </div>
            </InfoCard>
        )}

        {/* Compliance Officer */}
        {complianceDetails?.complianceOfficer && (
            <InfoCard>
                <SectionHeader icon={<SafetyCertificateOutlined />} title="Compliance Officer" />
                <Grid2>
                    <Field label="Name" value={complianceDetails.complianceOfficer.Name} />
                    <Field
                        label="Date of Birth"
                        value={fmt(complianceDetails.complianceOfficer.DOB)}
                    />
                    <Field
                        label="Citizenship"
                        value={str(complianceDetails.complianceOfficer.Citizenship)}
                    />
                    <Field
                        label="Status"
                        value={kycTag(complianceDetails.complianceOfficer.status)}
                    />
                    {complianceDetails.complianceOfficer.Address && (
                        <>
                            <Field
                                label="Street Address"
                                value={complianceDetails.complianceOfficer.Address.streetAddress}
                            />
                            <Field
                                label="City"
                                value={complianceDetails.complianceOfficer.Address.cityName}
                            />
                            <Field
                                label="State"
                                value={complianceDetails.complianceOfficer.Address.stateName}
                            />
                            <Field
                                label="Country"
                                value={complianceDetails.complianceOfficer.Address.countryName}
                            />
                        </>
                    )}
                </Grid2>
            </InfoCard>
        )}

        {/* AML & Licensing */}
        {complianceDetails && (
            <InfoCard>
                <SectionHeader icon={<LockOutlined />} title="AML & Licensing" />
                <Grid2>
                    <Field
                        label="AML Compliance Program"
                        value={<BoolTag val={complianceDetails.hasAMLCompliance} />}
                    />
                    <Field
                        label="Has Compliance Officer"
                        value={<BoolTag val={complianceDetails.hasComplianceOfficer} />}
                    />
                    <Field
                        label="Rep as Compliance Officer"
                        value={<BoolTag val={complianceDetails.isRepresentativeAsComplianceOfficer} />}
                    />
                    <Field
                        label="Customers from US Sanctions List"
                        value={<BoolTag val={complianceDetails.hasCustomersFromUSSanctionedList} />}
                    />
                    <Field
                        label="Requires Financial License"
                        value={<BoolTag val={complianceDetails.requiresFinancialLicense} />}
                    />
                    {complianceDetails.licenseIssuingCountry && (
                        <Field
                            label="License Issuing Country"
                            value={str(complianceDetails.licenseIssuingCountry)}
                        />
                    )}
                    {complianceDetails.programDocumentForAML && (
                        <Field
                            label="AML Program Document"
                            value={kycTag(complianceDetails.programDocumentForAML.status)}
                        />
                    )}
                </Grid2>
            </InfoCard>
        )}

        {!intendedUse && !complianceDetails && (
            <Empty description="No compliance data available" />
        )}
    </div>
);

export default ComplianceSection;
