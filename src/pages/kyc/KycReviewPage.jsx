import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar, Tag, Spin, message, Divider, Button } from "antd";
import {
  ArrowLeftOutlined,
  BankOutlined,
  HomeOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  LoadingOutlined,
  UserOutlined,
  ReloadOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { merchantsApi } from "../../api/modules/merchants";
import { kycApi } from "../../api/modules/kyc";
import { useTheme } from "../../context/ThemeContext";
import { formatAmount } from '../../utils/number.utils';
import {
  StatusDot,
  StatusBadge,
  InfoRow,
  SectionHeader,
  GridInfo,
  DocumentCard,
} from "./components/KycShared";
import { sectionOverallStatus } from "./components/kycUtils";
import PersonaInquiryModal from "./components/PersonaInquiryModal";

/* ─── AnimatedCount ──────────────────────────────────────────────────────── */
const AnimatedCount = ({ value, color }) => (
  <span
    key={value}
    style={{
      display: "inline-block",
      animation: "kycCountPop 0.35s cubic-bezier(0.34,1.56,0.64,1)",
      color,
      fontWeight: 700,
      minWidth: 16,
      textAlign: "center",
    }}
  >
    {value}
  </span>
);

/* ─── stripEmpty ──────────────────────────────────────────────────────────── */
// Recursively removes any object whose `status` key is an empty string.
// This prevents sending placeholder fields (e.g. passport for a US user) to
// the backend, which rejects empty-string status values with a 404/400.
const stripEmpty = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(stripEmpty);
  if ("status" in obj && (obj.status === "" || obj.status === "Pending")) return undefined;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const stripped = stripEmpty(v);
    if (stripped !== undefined) out[k] = stripped;
  }
  return out;
};

/* ─── buildInitialUpdates ─────────────────────────────────────────────────── */
const buildInitialUpdates = (d) => {
  if (!d) return {};
  const ks = d.kycStatus ?? {};
  const accountType = d.basicProfile?.accountType?.name ?? "Individual";
  const isFreelance = accountType === "Freelance";
  const isBusiness = accountType === "Business";
  const isUS = d.basicProfile?.citizenshipCode === "US";
  const owners = d.complianceDetails?.beneficialOwnersList ?? [];

  return {
    // ── All account types ──
    utilityBills: {
      status: d.utilityBills?.status ?? "Pending",
      reason: d.utilityBills?.reason ?? "",
    },
    // Only include the applicable identity doc (ssn XOR passport)
    ...(isUS
      ? { ssn: { verification: { status: d.ssn?.verification?.status ?? "Pending", reason: d.ssn?.verification?.reason ?? "" } } }
      : { passport: { verification: { status: d.passport?.verification?.status ?? "Pending", reason: d.passport?.verification?.reason ?? "" } } }
    ),
    // ── Freelance-specific ──
    ...(isFreelance && {
      freelanceInfo: {
        status: ks.businessInfo?.status ?? "Pending",
        reason: ks.businessInfo?.reason ?? "",
      },
    }),
    // ── Business-specific ──
    ...(isBusiness && {
      businessInfo: {
        registrationDocuments: {
          status: d.businessInfo?.registrationDocuments?.status ?? "Pending",
          reason: d.businessInfo?.registrationDocuments?.reason ?? "",
        },
        logo: {
          status: (d.businessInfo?.logo?.doc || d.businessInfo?.logo?.docs?.length > 0)
            ? (d.businessInfo?.logo?.status ?? "Pending")
            : "",
          reason: d.businessInfo?.logo?.reason ?? "",
        },
      },
    }),
    // ── Freelance + Business ──
    // Only seed physicalAddress if the user actually provided a physical address
    // AND a proof document exists. Otherwise, no review action is needed.
    ...((isFreelance || isBusiness) && d.addresses?.physical?.hasPhysicalAddress && (d.addresses?.physical?.addressProof?.length > 0 || d.addresses?.physical?.documentUrl) && {
      physicalAddress: {
        status: ks.physicalAddress?.status ?? d.addresses?.physical?.verificationStatus ?? "Pending",
        reason: ks.physicalAddress?.reason ?? "",
      },
    }),
    ...((isFreelance || isBusiness) && {
      intendedUse: isFreelance
        ? { status: ks.intendedUse?.status ?? "Pending", reason: ks.intendedUse?.reason ?? "" }
        : { supportingDocuments: { status: ks.intendedUse?.supportingDocuments?.status ?? ks.intendedUse?.status ?? "Pending", reason: ks.intendedUse?.supportingDocuments?.reason ?? "" } },
      complianceDetails: isFreelance
        ? { status: ks.complianceDetails?.status ?? "Pending", reason: ks.complianceDetails?.reason ?? "" }
        : {
            // Seed AML status from the API regardless of whether docs are uploaded,
            // so the admin can approve/set status even when no docs exist.
            // stripEmpty will remove it only if status == "" (not present in API).
            programDocumentForAML: {
              status: d.complianceDetails?.programDocumentForAML?.docs?.length > 0
                ? (d.complianceDetails?.programDocumentForAML?.status ?? "Pending")
                : "",
              reason: d.complianceDetails?.programDocumentForAML?.reason ?? "",
            },
            // Only seed complianceOfficer status when Proof is uploaded (nothing
            // to review if no proof was submitted and no Name is present).
            complianceOfficer: {
              status: d.complianceDetails?.complianceOfficer?.Proof?.length > 0
                ? (d.complianceDetails?.complianceOfficer?.status ?? "Pending")
                : "",
              reason: "",
            },
            beneficialOwnersList: owners.map((o) => {
              const ownerIsUS = o?.citizenshipCode === "US";
              return {
                // Include only the applicable identity doc (ssn XOR passport)
                ...(ownerIsUS
                  ? { ssn: { verification: { status: o?.ssn?.verification?.status ?? "Pending", reason: "" } } }
                  : { passport: { verification: { status: o?.passport?.verification?.status ?? "Pending", reason: "" } } }
                ),
                ...(o?.personaStatus?.inqueryId
                  ? { personaStatus: { status: o?.personaStatus?.status ?? "Pending", reason: o?.personaStatus?.reason ?? "" } }
                  : {}
                ),
              };
            }),
          },
    }),
    // ── Individual account — optional sections (when data exists) ──
    ...(!isFreelance && !isBusiness && !!d.addresses?.physical?.hasPhysicalAddress && (d.addresses?.physical?.addressProof?.length > 0 || !!d.addresses?.physical?.documentUrl) && {
      physicalAddress: {
        status: ks.physicalAddress?.status ?? d.addresses?.physical?.verificationStatus ?? "Pending",
        reason: ks.physicalAddress?.reason ?? "",
      },
    }),
    ...(!isFreelance && !isBusiness && !!(d.intendedUse?.sourceOfFunds?.id || d.intendedUse?.supportingDocument?.length) && {
      intendedUse: {
        supportingDocuments: {
          status: ks.intendedUse?.supportingDocuments?.status ?? ks.intendedUse?.status ?? "Pending",
          reason: ks.intendedUse?.supportingDocuments?.reason ?? "",
        },
      },
    }),
    ...(!isFreelance && !isBusiness && owners.length > 0 && {
      complianceDetails: {
        beneficialOwnersList: owners.map((o) => {
          const ownerIsUS = o?.citizenshipCode === "US";
          return {
            ...(ownerIsUS
              ? { ssn: { verification: { status: o?.ssn?.verification?.status ?? "Pending", reason: "" } } }
              : { passport: { verification: { status: o?.passport?.verification?.status ?? "Pending", reason: "" } } }
            ),
            ...(o?.personaStatus?.inqueryId
              ? { personaStatus: { status: o?.personaStatus?.status ?? "Pending", reason: o?.personaStatus?.reason ?? "" } }
              : {}
            ),
          };
        }),
      },
    }),
  };
};

/* ─── MAIN PAGE ───────────────────────────────────────────────────────────── */
const KycReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActive] = useState("personalInfo");
  const [updates, setUpdates] = useState({});
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [inquiryModal, setInquiryModal] = useState({ open: false, loading: false, data: null });

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ── Fetch detail ── */
  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await merchantsApi.getMerchantById(id);
      const data = res?.data ?? res;
      setDetail(data);
      setUpdates(buildInitialUpdates(data));
    } catch (err) {
      if (!err?.handled) {
        message.error({ content: "Failed to load merchant details", key: "kyc-load" });
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  /* ── Helpers to set nested update state ── */
  const setPath = (path, value) => {
    setUpdates((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (cur[keys[i]] === undefined) cur[keys[i]] = {};
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const setOwner = (idx, path, value) => {
    setUpdates((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const owners = next.complianceDetails?.beneficialOwnersList ?? [];
      if (!owners[idx]) owners[idx] = {};
      const keys = path.split(".");
      let cur = owners[idx];
      for (let i = 0; i < keys.length - 1; i++) {
        if (cur[keys[i]] === undefined) cur[keys[i]] = {};
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      next.complianceDetails.beneficialOwnersList = owners;
      return next;
    });
  };

  /* ── Submit ── */
  const handleSave = async () => {
    // Collect all rejected entries that are missing a reason
    const missing = [];
    const check = (obj, path) => {
      if (typeof obj !== "object" || obj === null) return;
      if (Array.isArray(obj)) { obj.forEach((item, i) => check(item, `${path}[${i}]`)); return; }
      if (obj.status === "Rejected" && !obj.reason?.trim()) { missing.push(path); return; }
      for (const [k, v] of Object.entries(obj)) check(v, path ? `${path}.${k}` : k);
    };
    check(updates, "");
    if (missing.length > 0) {
      message.error({ content: "Please enter a rejection reason for all rejected items before saving.", key: "kyc-save" });
      return;
    }

    setSubmitting(true);
    try {
      const payload = stripEmpty(updates);
      await kycApi.updateKycStatus(id, payload);
      message.success({ content: "KYC status updated successfully", key: "kyc-save" });
      navigate("/kyc");
    } catch (err) {
      if (!err?.handled) {
        message.error({ content: err?.response?.data?.message || "Failed to update KYC status", key: "kyc-save" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenInquiry = async (inquiryId) => {
    if (!inquiryId) return;
    setInquiryModal({ open: true, loading: true, data: null });
    try {
      const res = await kycApi.getInquiryInfo(inquiryId);
      setInquiryModal({ open: true, loading: false, data: res?.data?.result ?? null });
    } catch {
      setInquiryModal({ open: false, loading: false, data: null });
    }
  };

  /* ── Derived values ── */
  const bp = detail?.basicProfile ?? {};
  const accountType = bp.accountType?.name ?? "Individual";
  const isUS = bp.citizenshipCode === "US";
  const isFreelance = accountType === "Freelance";
  const isBusiness = accountType === "Business";
  const owners = detail?.complianceDetails?.beneficialOwnersList ?? [];
  const displayName = bp.firstName
    ? `${bp.firstName} ${bp.lastName ?? ""}`.trim()
    : "Merchant";

  /* ── Count individual document statuses from updates ── */
  const countStatuses = (obj) => {
    let approved = 0, rejected = 0, total = 0;
    const walk = (node) => {
      if (typeof node !== "object" || node === null) return;
      if (Array.isArray(node)) { node.forEach(walk); return; }
      if ("status" in node && typeof node.status === "string" && node.status !== "") {
        total++;
        if (node.status === "Approved" || node.status === "Verified") approved++;
        else if (node.status === "Rejected") rejected++;
        return;
      }
      Object.values(node).forEach(walk);
    };
    walk(obj);
    return { approved, rejected, total };
  };
  const docCounts = countStatuses(updates);

  const hasPhysical = isFreelance || isBusiness || !!detail?.addresses?.physical?.hasPhysicalAddress;
  const hasIntended = isFreelance || !!(
    detail?.intendedUse?.sourceOfFunds?.id ||
    detail?.intendedUse?.supportingDocument?.length > 0
  );
  const hasCompliance = isBusiness || isFreelance || owners.length > 0;

  /* ── Section status colors for sidebar ── */
  const sectionStatuses = {
    personalInfo: sectionOverallStatus([
      updates.utilityBills?.status,
      isUS
        ? updates.ssn?.verification?.status
        : updates.passport?.verification?.status,
    ]),
    freelanceInfo: sectionOverallStatus([updates.freelanceInfo?.status]),
    businessInfo: sectionOverallStatus([
      updates.businessInfo?.registrationDocuments?.status,
      updates.businessInfo?.logo?.status,
    ]),
    physicalAddress: detail?.addresses?.physical?.hasPhysicalAddress
      ? sectionOverallStatus([updates.physicalAddress?.status])
      : "Not Submitted",
    intendedUse: sectionOverallStatus([
      isFreelance
        ? updates.intendedUse?.status
        : updates.intendedUse?.supportingDocuments?.status,
    ]),
    complianceDetails: sectionOverallStatus(
      isFreelance
        ? [updates.complianceDetails?.status]
        : [
            // Only include AML status when docs are actually submitted.
            ...(detail?.complianceDetails?.programDocumentForAML?.docs?.length > 0
              ? [updates.complianceDetails?.programDocumentForAML?.status]
              : []),
            ...(detail?.complianceDetails?.complianceOfficer?.Proof?.length > 0 ||
              detail?.complianceDetails?.hasComplianceOfficer
              ? [updates.complianceDetails?.complianceOfficer?.status]
              : []),
            // Include each beneficial owner's passport/SSN + persona status
            ...owners.flatMap((owner, idx) => {
              const ownerIsUS = owner?.citizenshipCode === "US";
              const ownerUpdates =
                updates.complianceDetails?.beneficialOwnersList?.[idx] ?? {};
              const docStatus = ownerIsUS
                ? ownerUpdates?.ssn?.verification?.status
                : ownerUpdates?.passport?.verification?.status;
              const personaStatus = ownerUpdates?.personaStatus?.status;
              // Only include persona status in rollup if the inquiry exists
              return owner?.personaStatus?.inqueryId
                ? [docStatus, personaStatus]
                : [docStatus];
            }),
          ],
    ),
  };

  /* ── Sections list for sidebar ── */
  const sections = [
    { id: "personalInfo", label: "Personal Info", icon: <UserOutlined /> },
    ...(isFreelance
      ? [{ id: "freelanceInfo", label: "Freelance Info", icon: <SolutionOutlined /> }]
      : []),
    ...(isBusiness
      ? [{ id: "businessInfo", label: "Business Info", icon: <BankOutlined /> }]
      : []),
    ...(hasPhysical
      ? [
          {
            id: "physicalAddress",
            label: "Physical Address",
            icon: <HomeOutlined />,
          },
        ]
      : []),
    ...(hasIntended
      ? [
          {
            id: "intendedUse",
            label: "Intended Use",
            icon: <FileTextOutlined />,
          },
        ]
      : []),
    ...(hasCompliance
      ? [
          {
            id: "complianceDetails",
            label: "Compliance Details",
            icon: <SafetyCertificateOutlined />,
          },
        ]
      : []),
  ];

  /* ── Theme colors ── */
  const sidebarBg = isDark ? "#0f172a" : "#f8fafc";
  const mainBg = isDark ? "#1e293b" : "#f1f5f9";

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
        }}
      >
        <Spin
          indicator={
            <LoadingOutlined style={{ fontSize: 36, color: "#60a5fa" }} spin />
          }
        />
      </div>
    );

  /* ════════════════════════════════════════════════════════════════════════
       SECTION RENDERS
    ═══════════════════════════════════════════════════════════════════════════ */

  /* ── Personal Info ── */
  const renderPersonalInfo = () => (
    <div>
      <SectionHeader
        title="Personal Identification"
        status={sectionStatuses.personalInfo}
        subtitle="Identity verification and supporting documents"
      />

      {/* Utility Bills */}
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          color: "var(--text-muted)",
          marginBottom: 10,
        }}
      >
        UTILITY BILLS
      </p>
      <DocumentCard
        title={
          detail?.utilityBills?.name
            ? `Utility Bill — ${detail.utilityBills.name}`
            : "Utility Bills"
        }
        filePaths={detail?.utilityBills?.docs ?? []}
        statusEntry={updates.utilityBills}
        onSetStatus={(v) =>
          setPath("utilityBills", { ...updates.utilityBills, ...v })
        }
        isDark={isDark}
      />

      {/* SSN (US) */}
      {isUS && (
        <>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "var(--text-muted)",
              marginBottom: 10,
            }}
          >
            SSN VERIFICATION
          </p>
          <DocumentCard
            title="Social Security Number"
            filePaths={[]}
            statusEntry={updates.ssn?.verification}
            onSetStatus={(v) =>
              setPath("ssn.verification", {
                ...(updates.ssn?.verification ?? {}),
                ...v,
              })
            }
            isDark={isDark}
          >
            <div style={{ display: "flex", gap: 24 }}>
              <InfoRow label="SSN (masked)" value={detail?.ssn?.ssn} />
              {detail?.ssn?.verification?.verifiedAt && (
                <InfoRow
                  label="Verified At"
                  value={new Date(
                    detail.ssn.verification.verifiedAt,
                  ).toLocaleDateString("en-GB")}
                />
              )}
            </div>
          </DocumentCard>
        </>
      )}

      {/* Passport (Non-US) */}
      {!isUS && detail?.passport && (
        <>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "var(--text-muted)",
              marginBottom: 10,
            }}
          >
            PASSPORT VERIFICATION
          </p>
          <DocumentCard
            title="Passport"
            filePaths={[
              detail?.passport?.images?.front,
              detail?.passport?.images?.back,
            ].filter(Boolean)}
            statusEntry={updates.passport?.verification}
            onSetStatus={(v) =>
              setPath("passport.verification", {
                ...(updates.passport?.verification ?? {}),
                ...v,
              })
            }
            isDark={isDark}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
              {detail.passport.passportNumber && (
                <InfoRow
                  label="Passport Number"
                  value={detail.passport.passportNumber}
                />
              )}
              {detail.passport.expiryDate && (
                <InfoRow
                  label="Expiry Date"
                  value={new Date(
                    detail.passport.expiryDate,
                  ).toLocaleDateString("en-GB")}
                />
              )}
            </div>
          </DocumentCard>
        </>
      )}

      {/* Freelance Info */}
      {/* {isFreelance && (
        <>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "var(--text-muted)",
              marginBottom: 10,
              marginTop: 16,
            }}
          >
            FREELANCE INFORMATION
          </p>
          <DocumentCard
            title="Freelance Profile"
            filePaths={detail?.freelanceInfo?.docs ?? []}
            statusEntry={updates.freelanceInfo}
            onSetStatus={(v) =>
              setPath("freelanceInfo", { ...updates.freelanceInfo, ...v })
            }
            isDark={isDark}
          >
            {detail?.freelanceInfo?.links?.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {detail.freelanceInfo.links.map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 12, color: "#60a5fa", wordBreak: "break-all" }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            )}
            {detail?.freelanceInfo?.profileUrl && (
              <a
                href={detail.freelanceInfo.profileUrl}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 12, color: "#60a5fa", wordBreak: "break-all" }}
              >
                {detail.freelanceInfo.profileUrl}
              </a>
            )}
          </DocumentCard>
        </>
      )} */}
    </div>
  );

  /* ── Freelance Info ── */
  const renderFreelanceInfo = () => {
    const fi = detail?.freelanceInfo ?? {};
    return (
      <div>
        <SectionHeader
          title="Freelance Information"
          status={sectionStatuses.freelanceInfo}
          subtitle="Service category, experience and professional profile"
        />

        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--text-muted)",
            marginBottom: 10,
          }}
        >
          FREELANCE PROFILE DETAILS
        </p>
        <GridInfo
          isDark={isDark}
          fields={[
            { label: "Service", value: fi.service?.name },
            { label: "Years of Experience", value: fi.yearsOfExperience },
            {
              label: "LinkedIn Profile",
              value: fi.linkedinProfileLink ? (
                <a
                  href={fi.linkedinProfileLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#60a5fa", wordBreak: "break-all", fontSize: 12 }}
                >
                  {fi.linkedinProfileLink}
                </a>
              ) : null,
            },
          ].filter((f) => f.value != null)}
        />

        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--text-muted)",
            marginBottom: 10,
            marginTop: 20,
          }}
        >
          FREELANCE PROFILE VERIFICATION
        </p>
        <DocumentCard
          title="Freelance Profile"
          filePaths={fi.docs ?? []}
          statusEntry={updates.freelanceInfo}
          onSetStatus={(v) =>
            setPath("freelanceInfo", { ...updates.freelanceInfo, ...v })
          }
          isDark={isDark}
        />

      </div>
    );
  };

  /* ── Business Info ── */
  const renderBusinessInfo = () => {
    const bi = detail?.businessInfo ?? {};
    return (
      <div>
        <SectionHeader
          title="Business Information"
          status={sectionStatuses.businessInfo}
          subtitle="Registration details and verification documents"
        />

        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--text-muted)",
            marginBottom: 10,
          }}
        >
          COMPANY REGISTRATION DETAILS
        </p>
        <GridInfo
          isDark={isDark}
          fields={[
            { label: "Legal Business Name", value: bi.businessName },
            { label: "Entity Type", value: bi.entityType?.name },
            { label: "Business Type", value: bi.businessType?.name },
            { label: "State", value: bi.stateName },
            { label: "Country", value: bi.countryName },
            {
              label: "Date of Incorporation",
              value: bi.dateOfIncorporation
                ? new Date(bi.dateOfIncorporation).toLocaleDateString("en-GB")
                : null,
            },
            { label: "Tax ID (EIN)", value: detail?.accountStatus?.taxId },
          ]}
        />

        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--text-muted)",
            marginBottom: 10,
            marginTop: 20,
          }}
        >
          VERIFICATION DOCUMENTS
        </p>
        <DocumentCard
          title={bi.registrationDocuments?.name ?? "Registration Document"}
          filePaths={bi.registrationDocuments?.docs ?? []}
          statusEntry={updates.businessInfo?.registrationDocuments}
          onSetStatus={(v) =>
            setPath("businessInfo.registrationDocuments", {
              ...(updates.businessInfo?.registrationDocuments ?? {}),
              ...v,
            })
          }
          isDark={isDark}
        />
        {(bi.logo?.doc || bi.logo?.docs?.length > 0) && (
          <DocumentCard
            title="Business Logo"
            filePaths={bi.logo?.doc ? [bi.logo.doc] : (bi.logo?.docs ?? [])}
            statusEntry={updates.businessInfo?.logo}
            onSetStatus={(v) =>
              setPath("businessInfo.logo", {
                ...(updates.businessInfo?.logo ?? {}),
                ...v,
              })
            }
            isDark={isDark}
          />
        )}
      </div>
    );
  };

  /* ── Physical Address ── */
  const renderPhysicalAddress = () => {
    const phys = detail?.addresses?.physical ?? {};
    const res = detail?.addresses?.residential ?? {};
    return (
      <div>
        <SectionHeader
          title="Physical Address Verification"
          status={sectionStatuses.physicalAddress}
          subtitle="Registered business address and proof of address"
        />

        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--text-muted)",
            marginBottom: 10,
          }}
        >
          REGISTERED BUSINESS ADDRESS
        </p>
        <GridInfo
          isDark={isDark}
          fields={[
            { label: "Street Address", value: phys.streetAddress },
            { label: "City", value: phys.cityName },
            { label: "State", value: phys.stateName },
            { label: "Country", value: phys.countryName },
            { label: "Postal Code", value: phys.postalCode },
            { label: "Years Operating", value: phys.yearsOfOperating },
          ]}
        />

        {/* Show editable card when physical address was submitted with proof document */}
        {updates.physicalAddress && (phys.addressProof?.length > 0 || phys.documentUrl) ? (
          <DocumentCard
            title="Proof of Address"
            filePaths={phys.addressProof ?? []}
            statusEntry={updates.physicalAddress}
            onSetStatus={(v) =>
              setPath("physicalAddress", { ...updates.physicalAddress, ...v })
            }
            isDark={isDark}
          />
        ) : updates.physicalAddress ? (
          <DocumentCard
            title="Proof of Address"
            filePaths={[]}
            statusEntry={updates.physicalAddress}
            isDark={isDark}
            readOnly
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FileTextOutlined style={{ color: "#94a3b8", fontSize: 15 }} />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                No proof of address document uploaded
              </span>
            </div>
          </DocumentCard>
        ) : (
          <DocumentCard
            title="Proof of Address"
            filePaths={[]}
            statusEntry={{ status: "Not Submitted", reason: "" }}
            isDark={isDark}
            readOnly
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FileTextOutlined style={{ color: "#94a3b8", fontSize: 15 }} />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Physical address was not submitted
              </span>
            </div>
          </DocumentCard>
        )}

        {res.line1 && (
          <>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "var(--text-muted)",
                marginBottom: 10,
                marginTop: 20,
              }}
            >
              RESIDENTIAL ADDRESS
            </p>
            <GridInfo
              isDark={isDark}
              fields={[
                {
                  label: "Address",
                  value: `${res.line1}${res.line2 ? ", " + res.line2 : ""}`,
                },
                { label: "City", value: res.cityName },
                { label: "State", value: res.stateName },
                { label: "Country", value: res.countryName },
                { label: "Postal Code", value: res.pincode },
              ]}
            />
          </>
        )}
      </div>
    );
  };

  /* ── Intended Use ── */
  const renderIntendedUse = () => {
    const iu = detail?.intendedUse ?? {};
    return (
      <div>
        <SectionHeader
          title="Intended Use"
          status={sectionStatuses.intendedUse}
          subtitle="Business activities, purpose and supporting documentation"
        />

        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--text-muted)",
            marginBottom: 10,
          }}
        >
          BUSINESS ACTIVITIES &amp; PURPOSE
        </p>
        <GridInfo
          isDark={isDark}
          fields={[
            { label: "Source of Funds", value: iu.sourceOfFunds?.name },
            {
              label: "Monthly Income (USD)",
              value: iu.monthlyIncomeUSD
                ? `$${formatAmount(iu.monthlyIncomeUSD, { decimals: 0, maxDecimals: 0 })}`
                : null,
            },
            {
              label: "Monthly Income (Crypto)",
              value: iu.monthlyIncomeCrypto
                ? `$${formatAmount(iu.monthlyIncomeCrypto, { decimals: 0, maxDecimals: 0 })}`
                : null,
            },
            { label: "Preferred Settlement", value: iu.preferredSettlement },
            {
              label: "Third-Party Payments",
              value:
                iu.thirdPartyPayments != null
                  ? iu.thirdPartyPayments
                    ? "Yes"
                    : "No"
                  : null,
            },
            {
              label: "Has Website",
              value:
                iu.hasWebsite != null ? (iu.hasWebsite ? "Yes" : "No") : null,
            },
            ...(iu.websiteURL
              ? [{ label: "Website URL", value: iu.websiteURL }]
              : []),
          ].filter((f) => f.value != null)}
        />

        {iu.services?.length > 0 && (
          <div
            style={{
              borderRadius: 14,
              border: "1px solid var(--border-color)",
              background: isDark ? "rgba(255,255,255,0.02)" : "#fff",
              padding: "14px 18px",
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--text-muted)",
                display: "block",
                marginBottom: 8,
              }}
            >
              Services
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {iu.services.map((s, i) => (
                <Tag key={i} style={{ borderRadius: 20 }}>
                  {s.name}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {isFreelance ? (
          /* Freelance: flat intendedUse status (no sub-field) */
          <DocumentCard
            title="Intended Use"
            filePaths={iu.supportingDocument ?? []}
            statusEntry={updates.intendedUse}
            onSetStatus={(v) =>
              setPath("intendedUse", { ...updates.intendedUse, ...v })
            }
            isDark={isDark}
          />
        ) : (
          iu.supportingDocument?.length > 0 && (
            <>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "var(--text-muted)",
                  marginBottom: 10,
                  marginTop: 20,
                }}
              >
                SUPPORTING DOCUMENTATION
              </p>
              <DocumentCard
                title="Supporting Documents"
                filePaths={iu.supportingDocument}
                statusEntry={updates.intendedUse?.supportingDocuments}
                onSetStatus={(v) =>
                  setPath("intendedUse.supportingDocuments", {
                    ...(updates.intendedUse?.supportingDocuments ?? {}),
                    ...v,
                  })
                }
                isDark={isDark}
              />
            </>
          )
        )}
      </div>
    );
  };

  /* ── Compliance Details ── */
  const renderComplianceDetails = () => {
    const cd = detail?.complianceDetails ?? {};

    /* Freelance: single flat status card */
    if (isFreelance) {
      return (
        <div>
          <SectionHeader
            title="Compliance Details"
            status={sectionStatuses.complianceDetails}
            subtitle="Overall compliance and regulatory documentation"
          />
          <DocumentCard
            title="Compliance & Regulatory Documentation"
            filePaths={cd.docs ?? cd.complianceDocs ?? []}
            statusEntry={updates.complianceDetails}
            onSetStatus={(v) =>
              setPath("complianceDetails", { ...updates.complianceDetails, ...v })
            }
            isDark={isDark}
          >
            {(cd.hasAMLCompliance != null || cd.hasComplianceOfficer != null) && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 28px" }}>
                {cd.hasAMLCompliance != null && (
                  <InfoRow label="AML Compliance Program" value={cd.hasAMLCompliance ? "Yes" : "No"} />
                )}
                {cd.hasComplianceOfficer != null && (
                  <InfoRow label="Has Compliance Officer" value={cd.hasComplianceOfficer ? "Yes" : "No"} />
                )}
              </div>
            )}
          </DocumentCard>
        </div>
      );
    }
    return (
      <div>
        <SectionHeader
          title="Compliance Details"
          status={sectionStatuses.complianceDetails}
          subtitle="AML program, compliance officer and beneficial owners"
        />

        {/* Compliance flags */}
        {(cd.hasAMLCompliance != null ||
          cd.hasCustomersFromUSSanctionedList != null) && (
          <div
            style={{
              borderRadius: 14,
              border: "1px solid var(--border-color)",
              background: isDark ? "rgba(255,255,255,0.02)" : "#fff",
              padding: "14px 18px",
              marginBottom: 16,
              display: "flex",
              flexWrap: "wrap",
              gap: "14px 28px",
            }}
          >
            {cd.hasAMLCompliance != null && (
              <InfoRow
                label="AML Compliance Program"
                value={cd.hasAMLCompliance ? "Yes" : "No"}
              />
            )}
            {cd.hasComplianceOfficer != null && (
              <InfoRow
                label="Has Compliance Officer"
                value={cd.hasComplianceOfficer ? "Yes" : "No"}
              />
            )}
            {cd.hasCustomersFromUSSanctionedList != null && (
              <InfoRow
                label="US Sanctioned List Customers"
                value={cd.hasCustomersFromUSSanctionedList ? "Yes" : "No"}
              />
            )}
            {cd.requiresFinancialLicense != null && (
              <InfoRow
                label="Requires Financial License"
                value={cd.requiresFinancialLicense ? "Yes" : "No"}
              />
            )}
          </div>
        )}

        {/* AML Document */}
        {cd.programDocumentForAML && (
          <>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "var(--text-muted)",
                marginBottom: 10,
              }}
            >
              AML PROGRAM DOCUMENT
            </p>
            <DocumentCard
              title="AML Program Document"
              filePaths={cd.programDocumentForAML.docs ?? []}
              statusEntry={updates.complianceDetails?.programDocumentForAML}
              onSetStatus={(v) =>
                setPath("complianceDetails.programDocumentForAML", {
                  ...(updates.complianceDetails?.programDocumentForAML ?? {}),
                  ...v,
                })
              }
              isDark={isDark}
              readOnly={!(cd.programDocumentForAML.docs?.length > 0)}
            />
          </>
        )}

        {/* Compliance Officer */}
        {(cd.complianceOfficer?.Proof?.length > 0 ||
          cd.hasComplianceOfficer) && (
          <>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "var(--text-muted)",
                marginBottom: 10,
                marginTop: 16,
              }}
            >
              COMPLIANCE OFFICER
            </p>
            <DocumentCard
              title="Compliance Officer Documentation"
              filePaths={cd.complianceOfficer?.Proof ?? []}
              statusEntry={updates.complianceDetails?.complianceOfficer}
              onSetStatus={(v) =>
                setPath("complianceDetails.complianceOfficer", {
                  ...(updates.complianceDetails?.complianceOfficer ?? {}),
                  ...v,
                })
              }
              isDark={isDark}
            >
              {cd.complianceOfficer?.Name && (
                <InfoRow
                  label="Officer Name"
                  value={cd.complianceOfficer.Name}
                />
              )}
            </DocumentCard>
          </>
        )}

        {/* Beneficial Owners */}
        {owners.length > 0 && (
          <>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "var(--text-muted)",
                marginBottom: 10,
                marginTop: 16,
              }}
            >
              BENEFICIAL OWNERS
            </p>
            {owners.map((owner, idx) => {
              const ownerIsUS = owner?.citizenshipCode === "US";
              const ownerUpdates =
                updates.complianceDetails?.beneficialOwnersList?.[idx] ?? {};
              const statusEntry = ownerIsUS
                ? ownerUpdates?.ssn?.verification
                : ownerUpdates?.passport?.verification;
              const statusPath = ownerIsUS
                ? "ssn.verification"
                : "passport.verification";
              return (
                <div
                  key={idx}
                  style={{
                    borderRadius: 14,
                    border: "1px solid var(--border-color)",
                    background: isDark ? "rgba(99,102,241,0.06)" : "#f5f3ff",
                    padding: "14px 18px",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 14,
                    }}
                  >
                    <Avatar
                      size={32}
                      style={{
                        background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      {(owner.ownerName || "?")
                        .split(" ")
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()}
                    </Avatar>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {owner.ownerName || `Owner ${idx + 1}`}
                      </p>
                      {owner.ownerEmail && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: 11,
                            color: "var(--text-muted)",
                          }}
                        >
                          {owner.ownerEmail}
                        </p>
                      )}
                    </div>
                    {owner.ownershipPercentage != null && (
                      <Tag
                        color="purple"
                        style={{ borderRadius: 20, marginLeft: "auto" }}
                      >
                        {owner.ownershipPercentage}% ownership
                      </Tag>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "12px 28px",
                      marginBottom: 14,
                    }}
                  >
                    {owner.ownerDOB && (
                      <InfoRow
                        label="Date of Birth"
                        value={new Date(owner.ownerDOB).toLocaleDateString(
                          "en-GB",
                        )}
                      />
                    )}
                    <InfoRow
                      label="Citizenship"
                      value={owner.citizenshipCode || owner.countryName}
                    />
                    {owner.ownerAddress?.streetAddress && (
                      <InfoRow
                        label="Address"
                        value={`${owner.ownerAddress.streetAddress}, ${owner.ownerAddress.cityName || ""}`}
                      />
                    )}
                    {ownerIsUS && owner.ssn?.last4 && (
                      <InfoRow
                        label="SSN (Last 4)"
                        value={`xxx-xx-${owner.ssn.last4}`}
                      />
                    )}
                    {owner.personaStatus?.inqueryId && (
                      <InfoRow
                        label="Persona Inquiry"
                        value={owner.personaStatus.inqueryId}
                      />
                    )}
                  </div>
                  <DocumentCard
                    title={
                      ownerIsUS ? "SSN Verification" : "Passport Verification"
                    }
                    filePaths={
                      ownerIsUS
                        ? []
                        : [
                            owner?.passport?.images?.front,
                            owner?.passport?.images?.back,
                          ].filter(Boolean)
                    }
                    statusEntry={statusEntry}
                    onSetStatus={(v) =>
                      setOwner(idx, statusPath, {
                        ...(statusEntry ?? {}),
                        ...v,
                      })
                    }
                    isDark={isDark}
                  >
                    {!ownerIsUS && owner?.passport && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 24px" }}>
                        {owner.passport.last4 && (
                          <InfoRow label="Passport (Last 4)" value={`xxxx${owner.passport.last4}`} />
                        )}
                        {owner.passport.issuingCountry && (
                          <InfoRow label="Issuing Country" value={owner.passport.issuingCountry} />
                        )}
                        {owner.passport.expiryDate && (
                          <InfoRow
                            label="Expiry Date"
                            value={new Date(owner.passport.expiryDate).toLocaleDateString("en-GB")}
                          />
                        )}
                      </div>
                    )}
                  </DocumentCard>

                  {owner?.personaStatus?.inqueryId && (
                    <DocumentCard
                      title="Persona Identity Verification"
                      filePaths={[]}
                      statusEntry={ownerUpdates?.personaStatus}
                      onSetStatus={(v) =>
                        setOwner(idx, "personaStatus", {
                          ...(ownerUpdates?.personaStatus ?? {}),
                          ...v,
                        })
                      }
                      isDark={isDark}
                    >
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 24px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Inquiry ID</span>
                          <button
                            onClick={() => handleOpenInquiry(owner.personaStatus.inqueryId)}
                            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#60a5fa", fontSize: 13, textDecoration: "underline", textAlign: "left", fontFamily: "monospace" }}
                          >
                            {owner.personaStatus.inqueryId}
                          </button>
                        </div>
                      </div>
                    </DocumentCard>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    );
  };

  const sectionContent = {
    personalInfo: renderPersonalInfo,
    freelanceInfo: renderFreelanceInfo,
    businessInfo: renderBusinessInfo,
    physicalAddress: renderPhysicalAddress,
    intendedUse: renderIntendedUse,
    complianceDetails: renderComplianceDetails,
  };

  /* ════════════════════════════════════════════════════════════════════════
       PAGE LAYOUT
    ═══════════════════════════════════════════════════════════════════════════ */
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      {/* ── Top nav bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: isMobile ? "10px 12px" : "14px 24px",
          borderBottom: "1px solid var(--border-color)",
          background: "var(--bg-card)",
          position: "sticky",
          top: 64,
          zIndex: 20,
          flexWrap: "nowrap",
          overflow: "hidden",
          borderRadius: '14px 14px 0 0'
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/kyc")}
          style={{
            color: "var(--text-muted)",
            flexShrink: 0,
            padding: isMobile ? "0 6px" : undefined,
          }}
        >
          {!isMobile && "Back"}
        </Button>
        <Divider
          type="vertical"
          style={{
            height: 24,
            borderColor: "var(--border-color)",
            flexShrink: 0,
          }}
        />

        <Avatar
          size={isMobile ? 28 : 36}
          style={{
            background: "linear-gradient(135deg,#4f46e5,#06b6d4)",
            fontWeight: 700,
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          {displayName
            .split(" ")
            .slice(0, 2)
            .map((w) => w[0])
            .join("")
            .toUpperCase()}
        </Avatar>

        <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          <p
            style={{
              margin: 0,
              fontSize: isMobile ? 13 : 14,
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {displayName}
          </p>
          {!isMobile && (
            <p
              style={{
                margin: 0,
                fontSize: 11,
                color: "var(--text-muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {bp.emailId}
            </p>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexShrink: 0,
          }}
        >
          <Tag
            color={
              accountType === "Business"
                ? "blue"
                : accountType === "Freelance"
                  ? "purple"
                  : "default"
            }
            style={{
              borderRadius: 20,
              marginRight: 0,
              fontSize: isMobile ? 10 : 12,
            }}
          >
            {isMobile ? accountType.slice(0, 3) : accountType}
          </Tag>
          <Tag
            color={isUS ? "geekblue" : "volcano"}
            icon={<GlobalOutlined />}
            style={{
              borderRadius: 20,
              marginRight: 0,
              fontSize: isMobile ? 10 : 12,
            }}
          >
            {isUS ? "US" : bp.citizenshipCode || "Non-US"}
          </Tag>
        </div>

        <Button
          icon={<ReloadOutlined />}
          onClick={fetchDetail}
          loading={loading}
          size="small"
          style={{
            borderColor: "var(--border-color)",
            color: "var(--text-secondary)",
            background: "var(--input-bg)",
            flexShrink: 0,
          }}
        />
      </div>

      {/* ── Mobile: horizontal section tab bar ── */}
      {isMobile && (
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            gap: 6,
            padding: "10px 12px",
            background: sidebarBg,
            borderBottom: "1px solid var(--border-color)",
            scrollbarWidth: "none",
          }}
        >
          {sections.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActive(sec.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  borderRadius: 20,
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  background: isActive
                    ? isDark
                      ? "rgba(99,102,241,0.25)"
                      : "#e0e7ff"
                    : isDark
                      ? "rgba(255,255,255,0.06)"
                      : "#f1f5f9",
                  color: isActive
                    ? isDark
                      ? "#a5b4fc"
                      : "#4f46e5"
                    : "var(--text-secondary)",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 12,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 12 }}>{sec.icon}</span>
                {sec.label}
                <StatusDot status={sectionStatuses[sec.id]} />
              </button>
            );
          })}
        </div>
      )}

      {/* ── Body (sidebar + content) ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Desktop sidebar */}
        {!isMobile && (
          <aside
            style={{
              width: 220,
              flexShrink: 0,
              background: sidebarBg,
              borderRight: "1px solid var(--border-color)",
              display: "flex",
              flexDirection: "column",
              padding: "20px 0 80px",
              overflowY: "auto",
            }}
          >
            <p
              style={{
                padding: "0 16px",
                marginBottom: 12,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
              }}
            >
              SECTIONS
            </p>
            {sections.map((sec) => {
              const isActive = activeSection === sec.id;
              const secStatus = sectionStatuses[sec.id];
              return (
                <button
                  key={sec.id}
                  onClick={() => setActive(sec.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 16px",
                    margin: "1px 8px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    background: isActive
                      ? isDark
                        ? "rgba(99,102,241,0.18)"
                        : "#e0e7ff"
                      : "transparent",
                    color: isActive
                      ? isDark
                        ? "#a5b4fc"
                        : "#4f46e5"
                      : "var(--text-secondary)",
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 13,
                    textAlign: "left",
                    width: "calc(100% - 16px)",
                    transition: "all 0.15s",
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      flexShrink: 0,
                      color: isActive
                        ? isDark
                          ? "#a5b4fc"
                          : "#4f46e5"
                        : "var(--text-muted)",
                    }}
                  >
                    {sec.icon}
                  </span>
                  <span style={{ flex: 1 }}>{sec.label}</span>
                  <StatusDot status={secStatus} />
                </button>
              );
            })}

            <div
              style={{
                marginTop: "auto",
                padding: "16px",
                borderTop: "1px solid var(--border-color)",
              }}
            >
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "var(--text-muted)",
                }}
              >
                OVERALL PROGRESS
              </p>
              {sections.map((sec) => (
                <div
                  key={sec.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {sec.label}
                  </span>
                  <StatusDot status={sectionStatuses[sec.id]} />
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Main content */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            background: mainBg,
            padding: isMobile ? "16px 14px 120px" : "28px 32px 100px",
          }}
        >
          {sectionContent[activeSection]?.() ?? null}
        </main>
      </div>

      {/* ── Sticky bottom bar ── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between",
          gap: isMobile ? 8 : 0,
          padding: isMobile ? "10px 14px" : "14px 32px",
          background: "var(--bg-card)",
          borderTop: "1px solid var(--border-color)",
          zIndex: 30,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Approved pill */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: 20, padding: "4px 10px",
              transition: "background 0.3s ease",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", flexShrink: 0,
                boxShadow: "0 0 0 0 rgba(16,185,129,0.5)",
                animation: docCounts.approved > 0
                  ? "kycPulseGreen 2s infinite" : "none",
              }} />
              <span style={{ fontSize: isMobile ? 11 : 12, fontWeight: 600, color: "#10b981" }}>
                <AnimatedCount value={docCounts.approved} color="#10b981" />
              </span>
              <span style={{ fontSize: isMobile ? 10 : 11, color: "#10b981", opacity: 0.8 }}>Approved</span>
            </div>
            {/* Rejected pill */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(239,68,68,0.10)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 20, padding: "4px 10px",
              transition: "background 0.3s ease",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", flexShrink: 0,
                boxShadow: "0 0 0 0 rgba(239,68,68,0.5)",
                animation: docCounts.rejected > 0
                  ? "kycPulseRed 2s infinite" : "none",
              }} />
              <span style={{ fontSize: isMobile ? 11 : 12, fontWeight: 600, color: "#ef4444" }}>
                <AnimatedCount value={docCounts.rejected} color="#ef4444" />
              </span>
              <span style={{ fontSize: isMobile ? 10 : 11, color: "#ef4444", opacity: 0.8 }}>Rejected</span>
            </div>
            <span style={{ fontSize: isMobile ? 10 : 11, color: "var(--text-muted)" }}>/ {docCounts.total}</span>
          </div>
          {/* Keyframe styles injected once */}
          <style>{`
            @keyframes kycCountPop {
              0%   { transform: scale(1); }
              50%  { transform: scale(1.5); }
              100% { transform: scale(1); }
            }
            @keyframes kycPulseGreen {
              0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
              50%      { box-shadow: 0 0 0 5px rgba(16,185,129,0); }
            }
            @keyframes kycPulseRed {
              0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
              50%      { box-shadow: 0 0 0 5px rgba(239,68,68,0); }
            }
          `}</style>
          {!isMobile && (
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 11,
                color: "var(--text-muted)",
              }}
            >
              Changes will be saved and the merchant will be notified of any
              rejections.
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <Button
            onClick={() => navigate("/kyc")}
            style={{
              borderRadius: 10,
              borderColor: "var(--border-color)",
              color: "var(--text-secondary)",
              background: "var(--input-bg)",
              flex: isMobile ? 1 : undefined,
            }}
          >
            Go Back
          </Button>
          <Button
            type="primary"
            loading={submitting}
            onClick={handleSave}
            icon={<SafetyCertificateOutlined />}
            style={{
              borderRadius: 10,
              background: "linear-gradient(135deg,#4f46e5,#06b6d4)",
              border: "none",
              fontWeight: 600,
              padding: isMobile ? "0 16px" : "0 24px",
              flex: isMobile ? 2 : undefined,
            }}
          >
            Save KYC Update
          </Button>
        </div>
      </div>

      {/* ── Persona Inquiry Detail Modal ── */}
      <PersonaInquiryModal
        open={inquiryModal.open}
        loading={inquiryModal.loading}
        data={inquiryModal.data}
        onClose={() => setInquiryModal({ open: false, loading: false, data: null })}
      />
    </div>
  );
};

export default KycReviewPage;
