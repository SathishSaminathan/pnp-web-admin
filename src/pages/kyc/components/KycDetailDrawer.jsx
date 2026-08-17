import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Drawer, Avatar, Tag, Button, Spin, Divider } from 'antd';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    SafetyCertificateOutlined,
    EditOutlined,
    GlobalOutlined,
    LoadingOutlined,
} from '@ant-design/icons';
import {
    InfoRow,
    SectionHeader,
    GridInfo,
    DocumentCard,
} from './KycShared';
import { sectionOverallStatus, getPhysicalAddressStatus } from './kycUtils';
import { merchantsApi } from '../../../api/modules/merchants';
import { formatAmount } from '../../../utils/number.utils';

const noop = () => {};

/* Derive read-only status entries from full merchant detail */
const buildStatusMap = (d) => {
    if (!d) return {};
    const ks = d.kycStatus ?? {};
    const accountType = d.basicProfile?.accountType?.name ?? 'Individual';
    const isFreelance = accountType === 'Freelance';
    const isBusiness = accountType === 'Business';
    return {
        identityProofs: { status: d.identityProofs?.status ?? 'Pending', reason: d.identityProofs?.reason ?? '' },
        addressProofs: {
            status: d.addressProofs?.status ?? ks.addressProofs?.status ?? 'Pending',
            reason: d.addressProofs?.reason ?? ks.addressProofs?.reason ?? '',
        },
        utilityBills: { status: d.utilityBills?.status ?? 'Pending', reason: d.utilityBills?.reason ?? '' },
        ssn: { verification: { status: d.ssn?.verification?.status ?? 'Pending', reason: d.ssn?.verification?.reason ?? '' } },
        passport: { verification: { status: d.passport?.verification?.status ?? 'Pending', reason: d.passport?.verification?.reason ?? '' } },
        ...(isFreelance && {
            freelanceInfo: { status: ks.freelanceInfo?.status ?? 'Pending', reason: ks.freelanceInfo?.reason ?? '' },
        }),
        ...(isBusiness && {
            businessInfo: {
                registrationDocuments: { status: d.businessInfo?.registrationDocuments?.status ?? 'Pending', reason: '' },
                logo: { status: d.businessInfo?.logo?.status ?? 'Pending', reason: '' },
            },
        }),
        ...((isFreelance || isBusiness) && {
            physicalAddress: {
                status: d.addresses?.physical?.hasPhysicalAddress
                    ? (ks.physicalAddress?.status ?? d.addresses?.physical?.verificationStatus ?? 'Pending')
                    : 'Not Submitted',
                reason: ks.physicalAddress?.reason ?? '',
            },
            intendedUse: isFreelance
                ? { status: ks.intendedUse?.status ?? 'Pending', reason: ks.intendedUse?.reason ?? '' }
                : { supportingDocuments: { status: ks.intendedUse?.supportingDocuments?.status ?? ks.intendedUse?.status ?? 'Pending', reason: '' } },
            complianceDetails: isFreelance
                ? { status: ks.complianceDetails?.status ?? 'Pending', reason: ks.complianceDetails?.reason ?? '' }
                : {
                    programDocumentForAML: {
                        status: d.complianceDetails?.programDocumentForAML?.docs?.length > 0
                            ? (d.complianceDetails.programDocumentForAML.status ?? '')
                            : '',
                        reason: '',
                    },
                    complianceOfficer: {
                        status: (d.complianceDetails?.complianceOfficer?.Proof?.length > 0 || d.complianceDetails?.hasComplianceOfficer)
                            ? (d.complianceDetails?.complianceOfficer?.status ?? '')
                            : '',
                        reason: '',
                    },
                },
        }),
    };
};

const SubLabel = ({ text }) => (
    <p style={{
        fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.07em', color: 'var(--text-muted)',
        marginBottom: 10, marginTop: 16,
    }}>
        {text}
    </p>
);

const KycDetailDrawer = ({ open, merchant, onClose, isDark }) => {
    const navigate = useNavigate();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchDetail = useCallback(async () => {
        if (!open || !merchant?._id) {
            setDetail(null);
            return;
        }
        setLoading(true);
        try {
            const res = await merchantsApi.getMerchantById(merchant._id);
            setDetail(res?.data ?? res);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, [open, merchant?._id]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    const sm = buildStatusMap(detail);
    const bp = detail?.basicProfile ?? {};
    const accountType = bp.accountType?.name ?? merchant?.accountType ?? 'Individual';
    const isUS = bp.citizenshipCode === 'US';
    const isFreelance = accountType === 'Freelance';
    const isBusiness = accountType === 'Business';
    const owners = detail?.complianceDetails?.beneficialOwnersList ?? [];
    const displayName = bp.firstName
        ? `${bp.firstName} ${bp.lastName ?? ''}`.trim()
        : merchant?.fullName ?? 'Merchant';
    const initials = displayName.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
    const email = detail?.emailId ?? merchant?.emailId;
    const phone = detail?.mobileNumber ? `+${detail.countryCode ?? ''} ${detail.mobileNumber}` : null;
    const hasPhysical = isFreelance || isBusiness || !!detail?.addresses?.physical?.hasPhysicalAddress;
    const hasIntended = isFreelance || !!(detail?.intendedUse?.sourceOfFunds?.id || detail?.intendedUse?.supportingDocument?.length > 0);
    const hasCompliance = isBusiness || isFreelance || owners.length > 0;
    const overallKycStatus = merchant?.kycPersonalStatus ?? 'Pending';
    const overallColor = overallKycStatus === 'Verified' ? 'success' : overallKycStatus === 'Rejected' ? 'error' : 'warning';

    return (
        <Drawer
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: 'linear-gradient(135deg,#4f46e5,#06b6d4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <SafetyCertificateOutlined style={{ color: '#fff', fontSize: 14 }} />
                    </div>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>KYC Details</div>
                        <div style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>Full KYC verification status</div>
                    </div>
                </div>
            }
            placement="right"
            onClose={onClose}
            open={open}
            width={Math.min(520, typeof window !== 'undefined' ? window.innerWidth : 520)}
            extra={
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => navigate(`/kyc/${merchant?._id}`)}
                    style={{ borderRadius: 8 }}
                >
                    Review KYC
                </Button>
            }
            styles={{
                wrapper: { boxShadow: '-8px 0 40px rgba(0,0,0,0.3)' },
                header: { background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', padding: '16px 24px' },
                body: { background: 'var(--bg-card)', padding: '24px' },
                mask: { backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.4)' },
            }}
        >
            {/* ── Hero ── */}
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                gap: 10, padding: '24px 16px', borderRadius: 16, marginBottom: 24,
                background: isDark ? 'rgba(37,99,235,0.07)' : '#f0f5ff',
                border: `1px solid ${isDark ? 'rgba(37,99,235,0.2)' : '#dbeafe'}`,
            }}>
                <Avatar size={72} style={{
                    background: 'linear-gradient(135deg,#4f46e5,#06b6d4)',
                    fontSize: 24, fontWeight: 700,
                    boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
                }}>
                    {initials}
                </Avatar>
                <div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{displayName}</p>
                    {email && <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{email}</p>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Tag color={merchant?.isActive ? 'success' : 'error'} style={{ borderRadius: 20, fontWeight: 600 }}>
                        {merchant?.isActive ? '● Active' : '● Inactive'}
                    </Tag>
                    <Tag color="blue" style={{ borderRadius: 20 }}>{accountType}</Tag>
                    <Tag
                        color={overallColor}
                        icon={overallColor === 'success' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                        style={{ borderRadius: 20 }}
                    >
                        {overallKycStatus}
                    </Tag>
                    <Tag color={isUS ? 'geekblue' : 'purple'} icon={<GlobalOutlined />} style={{ borderRadius: 20 }}>
                        {isUS ? 'US Citizen' : 'Non-US'}
                    </Tag>
                </div>
            </div>

            {/* ── Loading ── */}
            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 32, color: '#60a5fa' }} spin />} />
                </div>
            ) : detail && (
                <div>
                    {/* Contact & Account */}
                    <SectionHeader title="Contact & Account" />
                    <GridInfo isDark={isDark} fields={[
                        { label: 'Email', value: email },
                        ...(phone ? [{ label: 'Phone', value: phone }] : []),
                        { label: 'Member Since', value: detail.createdAt ? new Date(detail.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null },
                        { label: 'Account Type', value: accountType },
                        { label: 'Citizenship', value: isUS ? 'US Citizen' : bp.citizenshipCode ?? null },
                    ].filter((f) => f.value)} />

                    <Divider style={{ margin: '16px 0', borderColor: 'var(--border-color)' }} />

                    {/* Personal Info */}
                    {/* <SectionHeader
                        title="Personal Identification"
                        status={sectionOverallStatus([
                            sm.identityProofs?.status,
                            sm.addressProofs?.status,
                            sm.utilityBills?.status,
                            isUS ? sm.ssn?.verification?.status : sm.passport?.verification?.status,
                            ...(isFreelance ? [sm.freelanceInfo?.status] : []),
                        ])}
                        subtitle="Identity verification and supporting documents"
                    />

                    <SubLabel text="Identity Verification" />
                    <DocumentCard title="Persona – Identity Verification" filePaths={[]} statusEntry={sm.identityProofs} onSetStatus={noop} isDark={isDark} readOnly>
                        {detail.identityProofs?.docs?.[0] && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                                <InfoRow label="Inquiry ID" value={detail.identityProofs.docs[0]} />
                                {detail.identityProofs.name && <InfoRow label="Document Name" value={detail.identityProofs.name} />}
                            </div>
                        )}
                    </DocumentCard>

                    <SubLabel text="Address Proofs" />
                    <DocumentCard
                        title={detail.addressProofs?.name ? `Address Proof — ${detail.addressProofs.name}` : 'Address Proofs'}
                        filePaths={detail.addressProofs?.docs ?? []}
                        statusEntry={sm.addressProofs}
                        onSetStatus={noop}
                        isDark={isDark}
                        readOnly
                    /> */}

                    <SubLabel text="Utility Bills" />
                    <DocumentCard
                        title={detail.utilityBills?.name ? `Utility Bill — ${detail.utilityBills.name}` : 'Utility Bills'}
                        filePaths={detail.utilityBills?.docs ?? []}
                        statusEntry={sm.utilityBills}
                        onSetStatus={noop}
                        isDark={isDark}
                        readOnly
                    />

                    {isUS && (
                        <>
                            <SubLabel text="SSN Verification" />
                            <DocumentCard title="Social Security Number" filePaths={[]} statusEntry={sm.ssn?.verification} onSetStatus={noop} isDark={isDark} readOnly>
                                <div style={{ display: 'flex', gap: 24 }}>
                                    {detail.ssn?.ssn && <InfoRow label="SSN (masked)" value={detail.ssn.ssn} />}
                                    {detail.ssn?.verification?.verifiedAt && (
                                        <InfoRow label="Verified At" value={new Date(detail.ssn.verification.verifiedAt).toLocaleDateString('en-GB')} />
                                    )}
                                </div>
                            </DocumentCard>
                        </>
                    )}

                    {!isUS && detail.passport && (
                        <>
                            <SubLabel text="Passport Verification" />
                            <DocumentCard
                                title="Passport"
                                filePaths={[detail.passport?.images?.front, detail.passport?.images?.back].filter(Boolean)}
                                statusEntry={sm.passport?.verification}
                                onSetStatus={noop}
                                isDark={isDark}
                                readOnly
                            >
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                                    {detail.passport.passportNumber && <InfoRow label="Passport Number" value={detail.passport.passportNumber} />}
                                    {detail.passport.expiryDate && <InfoRow label="Expiry Date" value={new Date(detail.passport.expiryDate).toLocaleDateString('en-GB')} />}
                                </div>
                            </DocumentCard>
                        </>
                    )}

                    {isFreelance && (
                        <>
                            <SubLabel text="Freelance Information" />
                            <DocumentCard title="Freelance Profile" filePaths={detail.freelanceInfo?.docs ?? []} statusEntry={sm.freelanceInfo} onSetStatus={noop} isDark={isDark} readOnly>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                                    {detail.freelanceInfo?.service?.name && <InfoRow label="Service" value={detail.freelanceInfo.service.name} />}
                                    {detail.freelanceInfo?.yearsOfExperience && <InfoRow label="Experience (yrs)" value={detail.freelanceInfo.yearsOfExperience} />}
                                    {detail.freelanceInfo?.linkedinProfileLink && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>LinkedIn</span>
                                            <a href={detail.freelanceInfo.linkedinProfileLink} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 500, color: '#60a5fa', wordBreak: 'break-all' }}>
                                                {detail.freelanceInfo.linkedinProfileLink}
                                            </a>
                                        </div>
                                    )}
                                    {detail.freelanceInfo?.profileUrl && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Profile URL</span>
                                            <a href={detail.freelanceInfo.profileUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 500, color: '#60a5fa', wordBreak: 'break-all' }}>
                                                {detail.freelanceInfo.profileUrl}
                                            </a>
                                        </div>
                                    )}
                                    {detail.freelanceInfo?.links?.length > 0 && detail.freelanceInfo.links.map((link, i) => (
                                        <a key={i} href={link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#60a5fa', wordBreak: 'break-all' }}>{link}</a>
                                    ))}
                                </div>
                            </DocumentCard>
                        </>
                    )}

                    {/* Business Info */}
                    {isBusiness && (() => {
                        const bi = detail.businessInfo ?? {};
                        return (
                            <>
                                <Divider style={{ margin: '16px 0', borderColor: 'var(--border-color)' }} />
                                <SectionHeader
                                    title="Business Information"
                                    status={sectionOverallStatus([sm.businessInfo?.registrationDocuments?.status, sm.businessInfo?.logo?.status])}
                                    subtitle="Registration details and verification documents"
                                />
                                <GridInfo isDark={isDark} fields={[
                                    { label: 'Legal Business Name', value: bi.businessName },
                                    { label: 'Entity Type', value: bi.entityType?.name },
                                    { label: 'Business Type', value: bi.businessType?.name },
                                    { label: 'State', value: bi.stateName },
                                    { label: 'Country', value: bi.countryName },
                                    { label: 'Date of Incorporation', value: bi.dateOfIncorporation ? new Date(bi.dateOfIncorporation).toLocaleDateString('en-GB') : null },
                                    { label: 'Tax ID (EIN)', value: detail.accountStatus?.taxId },
                                ].filter((f) => f.value)} />
                                <SubLabel text="Registration Document" />
                                <DocumentCard
                                    title={bi.registrationDocuments?.name ?? 'Registration Document'}
                                    filePaths={bi.registrationDocuments?.docs ?? []}
                                    statusEntry={sm.businessInfo?.registrationDocuments}
                                    onSetStatus={noop}
                                    isDark={isDark}
                                    readOnly
                                />
                                {(bi.logo?.doc || bi.logo?.docs?.length > 0) && (
                                    <DocumentCard
                                        title="Business Logo"
                                        filePaths={bi.logo?.doc ? [bi.logo.doc] : (bi.logo?.docs ?? [])}
                                        statusEntry={sm.businessInfo?.logo}
                                        onSetStatus={noop}
                                        isDark={isDark}
                                        readOnly
                                    />
                                )}
                            </>
                        );
                    })()}

                    {/* Physical Address */}
                    {hasPhysical && (() => {
                        const phys = detail.addresses?.physical ?? {};
                        const res = detail.addresses?.residential ?? {};
                        return (
                            <>
                                <Divider style={{ margin: '16px 0', borderColor: 'var(--border-color)' }} />
                                <SectionHeader
                                    title="Physical Address"
                                    status={sectionOverallStatus([sm.physicalAddress?.status])}
                                    subtitle="Registered address and proof of address"
                                />
                                {(() => {
                                    const physFields = [
                                        { label: 'Street Address', value: phys.streetAddress },
                                        { label: 'City', value: phys.cityName },
                                        { label: 'State', value: phys.stateName },
                                        { label: 'Country', value: phys.countryName },
                                        { label: 'Postal Code', value: phys.postalCode },
                                    ].filter((f) => f.value);
                                    return physFields.length > 0
                                        ? <GridInfo isDark={isDark} fields={physFields} />
                                        : null;
                                })()}
                                <DocumentCard title="Proof of Address" filePaths={phys.addressProof ?? []} statusEntry={sm.physicalAddress} onSetStatus={noop} isDark={isDark} readOnly />
                                {res.line1 && (
                                    <GridInfo isDark={isDark} fields={[
                                        { label: 'Residential Address', value: `${res.line1}${res.line2 ? ', ' + res.line2 : ''}` },
                                        { label: 'City', value: res.cityName },
                                        { label: 'Country', value: res.countryName },
                                    ].filter((f) => f.value)} />
                                )}
                            </>
                        );
                    })()}

                    {/* Intended Use */}
                    {hasIntended && (() => {
                        const iu = detail.intendedUse ?? {};
                        return (
                            <>
                                <Divider style={{ margin: '16px 0', borderColor: 'var(--border-color)' }} />
                                <SectionHeader
                                    title="Intended Use"
                                    status={sectionOverallStatus([isFreelance ? sm.intendedUse?.status : sm.intendedUse?.supportingDocuments?.status])}
                                    subtitle="Business activities and purpose"
                                />
                                <GridInfo isDark={isDark} fields={[
                                    { label: 'Source of Funds', value: iu.sourceOfFunds?.name },
                                    { label: 'Monthly Income (USD)', value: iu.monthlyIncomeUSD ? `$${formatAmount(iu.monthlyIncomeUSD, { decimals: 0, maxDecimals: 0 })}` : null },
                                    { label: 'Preferred Settlement', value: iu.preferredSettlement },
                                    { label: 'Third-Party Payments', value: iu.thirdPartyPayments != null ? (iu.thirdPartyPayments ? 'Yes' : 'No') : null },
                                    { label: 'Has Website', value: iu.hasWebsite != null ? (iu.hasWebsite ? 'Yes' : 'No') : null },
                                    ...(iu.websiteURL ? [{ label: 'Website URL', value: iu.websiteURL }] : []),
                                ].filter((f) => f.value != null)} />
                                {isFreelance ? (
                                    <DocumentCard title="Intended Use Documents" filePaths={iu.supportingDocument ?? []} statusEntry={sm.intendedUse} onSetStatus={noop} isDark={isDark} readOnly />
                                ) : (
                                    iu.supportingDocument?.length > 0 && (
                                        <DocumentCard title="Supporting Documents" filePaths={iu.supportingDocument} statusEntry={sm.intendedUse?.supportingDocuments} onSetStatus={noop} isDark={isDark} readOnly />
                                    )
                                )}
                            </>
                        );
                    })()}

                    {/* Compliance Details */}
                    {hasCompliance && (() => {
                        const cd = detail.complianceDetails ?? {};
                        return (
                            <>
                                <Divider style={{ margin: '16px 0', borderColor: 'var(--border-color)' }} />
                                <SectionHeader
                                    title="Compliance Details"
                                    status={sectionOverallStatus(
                                        isFreelance
                                            ? [sm.complianceDetails?.status]
                                            : [
                                                ...(cd.programDocumentForAML?.docs?.length > 0
                                                    ? [sm.complianceDetails?.programDocumentForAML?.status]
                                                    : []),
                                                ...((cd.complianceOfficer?.Proof?.length > 0 || cd.hasComplianceOfficer)
                                                    ? [sm.complianceDetails?.complianceOfficer?.status]
                                                    : []),
                                                ...owners.map((owner) => {
                                                    const ownerIsUS = owner?.citizenshipCode === 'US';
                                                    return ownerIsUS
                                                        ? owner?.ssn?.verification?.status
                                                        : owner?.passport?.verification?.status;
                                                }),
                                            ]
                                    )}
                                    subtitle="AML program, compliance officer and beneficial owners"
                                />
                                {isFreelance ? (
                                    <DocumentCard title="Compliance Documentation" filePaths={cd.docs ?? []} statusEntry={sm.complianceDetails} onSetStatus={noop} isDark={isDark} readOnly>
                                        {(cd.hasAMLCompliance != null || cd.hasComplianceOfficer != null) && (
                                            <div style={{ display: 'flex', gap: 16 }}>
                                                {cd.hasAMLCompliance != null && <InfoRow label="AML Compliance" value={cd.hasAMLCompliance ? 'Yes' : 'No'} />}
                                                {cd.hasComplianceOfficer != null && <InfoRow label="Compliance Officer" value={cd.hasComplianceOfficer ? 'Yes' : 'No'} />}
                                            </div>
                                        )}
                                    </DocumentCard>
                                ) : (
                                    <>
                                        {(cd.hasAMLCompliance != null || cd.requiresFinancialLicense != null) && (
                                            <GridInfo isDark={isDark} fields={[
                                                { label: 'AML Compliance Program', value: cd.hasAMLCompliance != null ? (cd.hasAMLCompliance ? 'Yes' : 'No') : null },
                                                { label: 'Has Compliance Officer', value: cd.hasComplianceOfficer != null ? (cd.hasComplianceOfficer ? 'Yes' : 'No') : null },
                                                { label: 'US Sanctioned List Customers', value: cd.hasCustomersFromUSSanctionedList != null ? (cd.hasCustomersFromUSSanctionedList ? 'Yes' : 'No') : null },
                                                { label: 'Requires Financial License', value: cd.requiresFinancialLicense != null ? (cd.requiresFinancialLicense ? 'Yes' : 'No') : null },
                                            ].filter((f) => f.value != null)} />
                                        )}
                                        {cd.programDocumentForAML?.docs?.length > 0 && (
                                            <DocumentCard title="AML Program Document" filePaths={cd.programDocumentForAML.docs} statusEntry={sm.complianceDetails?.programDocumentForAML} onSetStatus={noop} isDark={isDark} readOnly />
                                        )}
                                        {(cd.complianceOfficer?.Proof?.length > 0 || cd.hasComplianceOfficer) && (
                                            <DocumentCard title="Compliance Officer Documentation" filePaths={cd.complianceOfficer?.Proof ?? []} statusEntry={sm.complianceDetails?.complianceOfficer} onSetStatus={noop} isDark={isDark} readOnly>
                                                {cd.complianceOfficer?.Name && <InfoRow label="Officer Name" value={cd.complianceOfficer.Name} />}
                                            </DocumentCard>
                                        )}
                                        {owners.length > 0 && (
                                            <>
                                                <SubLabel text="Beneficial Owners" />
                                                {owners.map((owner, idx) => {
                                                    const ownerIsUS = owner?.citizenshipCode === 'US';
                                                    return (
                                                        <div key={idx} style={{
                                                            borderRadius: 14, border: '1px solid var(--border-color)',
                                                            background: isDark ? 'rgba(99,102,241,0.06)' : '#f5f3ff',
                                                            padding: '14px 18px', marginBottom: 12,
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                                                <Avatar size={32} style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', fontWeight: 700, fontSize: 13 }}>
                                                                    {(owner.ownerName || '?').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                                                                </Avatar>
                                                                <div>
                                                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{owner.ownerName || `Owner ${idx + 1}`}</p>
                                                                    {owner.ownerEmail && <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>{owner.ownerEmail}</p>}
                                                                </div>
                                                                {owner.ownershipPercentage != null && (
                                                                    <Tag color="purple" style={{ borderRadius: 20, marginLeft: 'auto' }}>{owner.ownershipPercentage}% ownership</Tag>
                                                                )}
                                                            </div>
                                                            <GridInfo isDark={isDark} fields={[
                                                                { label: 'Citizenship', value: owner.citizenshipCode },
                                                                {
                                                                    label: ownerIsUS ? 'SSN Status' : 'Passport Status',
                                                                    value: ownerIsUS ? owner?.ssn?.verification?.status : owner?.passport?.verification?.status,
                                                                },
                                                            ].filter((f) => f.value)} />
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        );
                    })()}
                </div>
            )}
        </Drawer>
    );
};

export default KycDetailDrawer;

