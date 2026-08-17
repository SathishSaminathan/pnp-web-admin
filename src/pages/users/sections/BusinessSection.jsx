import React from 'react';
import { Empty } from 'antd';
import { BankOutlined, StarOutlined } from '@ant-design/icons';
import { SectionHeader, InfoCard, Field, Grid2 } from '../components/UserDetailUI';
import { fmt, str, kycTag } from '../utils/userDetailHelpers.jsx';

const BusinessSection = ({ businessInfo, freelanceInfo, accountType }) => (
    <div className="flex flex-col gap-6">
        {businessInfo && (
            <InfoCard>
                <SectionHeader icon={<BankOutlined />} title="Business Information" />
                <Grid2>
                    <Field label="Business Name" value={businessInfo.businessName} />
                    <Field label="Entity Type" value={str(businessInfo.entityType)} />
                    <Field label="Business Type" value={str(businessInfo.businessType)} />
                    <Field label="State" value={businessInfo.stateName ?? str(businessInfo.state)} />
                    <Field label="Country" value={businessInfo.countryName ?? str(businessInfo.country)} />
                    <Field label="Date of Incorporation" value={fmt(businessInfo.dateOfIncorporation)} />
                    {businessInfo.registrationDocuments && (
                        <Field
                            label="Registration Document"
                            value={
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span>
                                        {businessInfo.registrationDocuments.name ??
                                            businessInfo.registrationDocuments.id}
                                    </span>
                                    {kycTag(businessInfo.registrationDocuments.status)}
                                </div>
                            }
                        />
                    )}
                    {businessInfo.logo && (
                        <Field label="Logo Status" value={kycTag(businessInfo.logo.status)} />
                    )}
                </Grid2>
            </InfoCard>
        )}

        {freelanceInfo && (
            <InfoCard>
                <SectionHeader icon={<StarOutlined />} title="Freelance Information" />
                <Grid2>
                    <Field label="Service" value={freelanceInfo.service?.name} />
                    <Field label="Years of Experience" value={freelanceInfo.yearsOfExperience} />
                    {freelanceInfo.linkedinProfileLink && (
                        <Field
                            label="LinkedIn Profile"
                            full
                            value={
                                <a
                                    href={freelanceInfo.linkedinProfileLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: '#60a5fa', wordBreak: 'break-all' }}
                                >
                                    {freelanceInfo.linkedinProfileLink}
                                </a>
                            }
                        />
                    )}
                </Grid2>
            </InfoCard>
        )}

        {!businessInfo && !freelanceInfo && (
            <Empty
                description={`No ${accountType?.toLowerCase() || 'business/freelance'} information available`}
            />
        )}
    </div>
);

export default BusinessSection;
