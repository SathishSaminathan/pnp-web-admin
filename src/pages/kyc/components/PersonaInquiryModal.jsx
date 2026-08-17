import React, { useState, useEffect } from "react";
import { Modal, Divider } from "antd";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return isMobile;
};

/* ── Shimmer keyframe injected once ── */
const SHIMMER_STYLE = `
  @keyframes _modalShimmer {
    0%   { background-position: 200% center; }
    100% { background-position: -200% center; }
  }
`;

/* ── Single shimmer bar — exact pixel dimensions, no antd min-width ── */
const Bar = ({ w, h = 16, mt = 0, mb = 0 }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: 4,
      marginTop: mt,
      marginBottom: mb,
      flexShrink: 0,
      background:
        "linear-gradient(90deg, var(--border-color, #e5e7eb) 25%, rgba(200,200,200,0.15) 50%, var(--border-color, #e5e7eb) 75%)",
      backgroundSize: "400% 100%",
      animation: "_modalShimmer 1.4s ease infinite",
    }}
  />
);

/*
  SkeletonField — exact same DOM shape as the real field:
    <div flexDirection=column gap=2>
      <span fontSize=11 lineHeight≈16>label</span>
      <span fontSize=13 lineHeight≈19>value</span>
    </div>
*/
const SkeletonField = ({ labelW = 70, valueW = 120 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <Bar w={labelW} h={16} />   {/* matches rendered fontSize:11 line-height */}
    <Bar w={valueW} h={19} />   {/* matches rendered fontSize:13 line-height */}
  </div>
);

/* ── Skeleton heading — matches <p fontSize=11 marginBottom=10> ── */
const SkeletonHeading = ({ w = 70 }) => <Bar w={w} h={11} mb={10} />;

/* ── Full skeleton matching the real modal layout exactly ── */
const InquiryModalSkeleton = ({ isMobile }) => {
  const cols = isMobile ? "1fr" : "1fr 1fr";
  return (
    <>
      <style>{SHIMMER_STYLE}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Identity — 4 fields */}
        <div>
          <SkeletonHeading w={70} />
          <div style={{ display: "grid", gridTemplateColumns: cols, gap: "10px 24px" }}>
            <SkeletonField labelW={68}  valueW={isMobile ? "80%" : 140} />
            <SkeletonField labelW={58}  valueW={isMobile ? "60%" : 90}  />
            <SkeletonField labelW={56}  valueW={isMobile ? "60%" : 90}  />
            <SkeletonField labelW={72}  valueW={isMobile ? "50%" : 80}  />
          </div>
        </div>

        <Divider style={{ margin: "4px 0", borderColor: "var(--border-color)" }} />

        {/* Address — 5 fields */}
        <div>
          <SkeletonHeading w={60} />
          <div style={{ display: "grid", gridTemplateColumns: cols, gap: "10px 24px" }}>
            <SkeletonField labelW={80}  valueW={isMobile ? "75%" : 110} />
            <SkeletonField labelW={80}  valueW={isMobile ? "60%" : 90}  />
            <SkeletonField labelW={28}  valueW={isMobile ? "55%" : 80}  />
            <SkeletonField labelW={34}  valueW={isMobile ? "55%" : 80}  />
            <SkeletonField labelW={64}  valueW={isMobile ? "45%" : 70}  />
          </div>
        </div>

        <Divider style={{ margin: "4px 0", borderColor: "var(--border-color)" }} />

        {/* Documents — 3 rows */}
        <div>
          <SkeletonHeading w={76} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[160, 130, 60].map((vw, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Bar w={isMobile ? 90 : 120} h={16} />
                <Bar w={isMobile ? "55%" : vw} h={16} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   PersonaInquiryModal
   Props:
     open      – boolean
     loading   – boolean
     data      – result object from /kyc/getInquiryInfo  (data.result)
     onClose   – () => void
     isDark    – boolean (optional, for Divider color)
═══════════════════════════════════════════════════════════════════════════ */
const PersonaInquiryModal = ({ open, loading, data, onClose }) => {
  const isMobile = useIsMobile();
  const gridCols = isMobile ? "1fr" : "1fr 1fr";
  const identityFields = data
    ? [
        { label: "Inquiry ID", value: data.inquiryId },
        { label: "First Name", value: data.firstName },
        { label: "Last Name", value: data.lastName },
        { label: "Date of Birth", value: data.dob },
      ]
    : [];

  const addressFields = data
    ? [
        { label: "Address Line 1", value: data.addressLine1 },
        { label: "Address Line 2", value: data.addressLine2 },
        { label: "City", value: data.city },
        { label: "State", value: data.state },
        { label: "Postal Code", value: data.postalCode },
      ]
    : [];

  const documentLinks = data
    ? [
        { label: "Document Front", url: data.documentFront },
        { label: "Document Back", url: data.documentBack },
        { label: "Selfie", url: data.selfie },
      ]
    : [];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <span style={{ color: "var(--text-primary)", fontSize: 15, fontWeight: 700 }}>
          Persona Inquiry Details
        </span>
      }
      width={isMobile ? "95vw" : 560}
      style={isMobile ? { top: 16 } : undefined}
      styles={{
        content: { background: "var(--bg-card)", borderRadius: 16 },
        header: { background: "var(--bg-card)", borderBottom: "1px solid var(--border-color)" },
        mask: { backdropFilter: "blur(2px)" },
        body: isMobile ? { maxHeight: "80vh", overflowY: "auto" } : undefined,
      }}
    >
      {loading ? (
        <InquiryModalSkeleton isMobile={isMobile} />
      ) : data ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* ── Identity ── */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 10 }}>
              IDENTITY
            </p>
            <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: "10px 24px" }}>
              {identityFields.map(({ label, value }) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: 13, color: value ? "var(--text-primary)" : "var(--text-muted)", fontStyle: value ? "normal" : "italic" }}>
                    {value ?? "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Divider style={{ margin: "4px 0", borderColor: "var(--border-color)" }} />

          {/* ── Address ── */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 10 }}>
              ADDRESS
            </p>
            <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: "10px 24px" }}>
              {addressFields.map(({ label, value }) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: 13, color: value ? "var(--text-primary)" : "var(--text-muted)", fontStyle: value ? "normal" : "italic" }}>
                    {value ?? "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Divider style={{ margin: "4px 0", borderColor: "var(--border-color)" }} />

          {/* ── Documents ── */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 10 }}>
              DOCUMENTS
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {documentLinks.map(({ label, url }) => (
                <div key={label} style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 2 : 12 }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, width: isMobile ? "auto" : 120, flexShrink: 0 }}>{label}</span>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 13, color: "#60a5fa", textDecoration: "underline", wordBreak: "break-all" }}
                    >
                      View {label}
                    </a>
                  ) : (
                    <span style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>Not available</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>No data available.</p>
      )}
    </Modal>
  );
};

export default PersonaInquiryModal;
