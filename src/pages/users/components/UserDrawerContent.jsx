import React, { useState } from "react";
import { Avatar, Tag, Button, message, Image as AntImage } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  IdcardOutlined,
  CalendarOutlined,
  GlobalOutlined,
  EyeOutlined,
  FileTextOutlined,
  CheckOutlined,
  CloseOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { usersApi } from "../../../api/modules/users";
import { DocImage, StatusBadge } from "../../kyc/components/KycShared";

const Field = ({ icon, label, value }) => (
  <div
    className="flex items-start gap-3 py-3"
    style={{ borderBottom: "1px solid var(--border-color)" }}
  >
    <span className="text-base shrink-0 mt-0.5" style={{ color: "#60a5fa" }}>
      {icon}
    </span>
    <div className="flex flex-col min-w-0 flex-1">
      <span
        className="text-xs font-semibold mb-0.5"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      <span
        className="text-sm font-medium break-all"
        style={{ color: "var(--text-primary)" }}
      >
        {value || (
          <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontWeight: 400 }}>
            Not provided
          </span>
        )}
      </span>
    </div>
  </div>
);

const SectionLabel = ({ icon, title }) => (
  <div className="flex items-center gap-2 mb-2 px-1">
    <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{icon}</span>
    <span
      className="text-xs font-bold uppercase tracking-widest"
      style={{ color: "var(--text-muted)" }}
    >
      {title}
    </span>
  </div>
);

const SectionCard = ({ children }) => (
  <div
    className="rounded-2xl px-4 py-1"
    style={{ background: "var(--input-bg)", border: "1px solid var(--border-color)" }}
  >
    {children}
  </div>
);

/* ─── UserDocumentCard ─────────────────────────────────────────────────────── */
const normalizeDocStatus = (s) => {
  if (!s) return "Pending";
  const map = {
    approved: "Approved",
    rejected: "Rejected",
    reviewpending: "Pending",
    pending: "Pending",
  };
  return map[s.toLowerCase()] ?? s;
};

const DocActionButton = ({ label, icon, active, activeColor, loading, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    style={{
      padding: "6px 16px",
      borderRadius: 8,
      fontSize: 12,
      fontWeight: 600,
      cursor: disabled || loading ? "not-allowed" : "pointer",
      border: active
        ? `1.5px solid ${activeColor}`
        : `1.5px solid ${activeColor}66`,
      background: active ? activeColor : "transparent",
      color: active ? "#fff" : activeColor,
      opacity: disabled || loading ? 0.65 : 1,
      transition: "all 0.15s",
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
    }}
  >
    {loading ? <LoadingOutlined style={{ fontSize: 12 }} spin /> : icon}
    {label}
  </button>
);

const UserDocumentCard = ({ doc, userId, isDark, onStatusChange }) => {
  const [actionLoading, setActionLoading] = useState({});
  const normalized = normalizeDocStatus(doc.status);

  const handleAction = async (status) => {
    setActionLoading((prev) => ({ ...prev, [status]: true }));
    try {
      const res = await usersApi.updateDocumentStatus({ userId, documentId: doc._id, status });
      if (res.status !== false) {
        message.success(`Document ${status} successfully`);
        onStatusChange?.();
      } else {
        message.error(res.message || `Failed to ${status} document`);
      }
    } catch (err) {
      if (!err?.handled) message.error(`Failed to ${status} document`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [status]: false }));
    }
  };

  // Prefer storage file paths for DocImage (handles retry + PDF); fall back to signed URLs
  const pages = [
    { path: doc.frontPage, signedUrl: doc.frontPageSignedUrl, label: "Front Page" },
    { path: doc.backPage,  signedUrl: doc.backPageSignedUrl,  label: "Back Page"  },
  ].filter((p) => p.path || p.signedUrl);

  return (
    <div style={{
      borderRadius: 14,
      border: "1px solid var(--border-color)",
      background: isDark ? "rgba(255,255,255,0.02)" : "#fff",
      marginBottom: 12,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FileTextOutlined style={{ color: "#60a5fa", fontSize: 15 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
            {doc.type || "Document"}
          </span>
        </div>
        <StatusBadge status={normalized} />
      </div>

      {/* Images / Files */}
      {pages.length > 0 && (
        <div style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--border-color)",
        }}>
          {/* Use DocImage (with storage path + retry) when path available, else direct AntD Image */}
          {pages.some((p) => p.path) ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              {pages.map(({ path, signedUrl, label }) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  {path
                    ? <DocImage filePath={path} alt={label} isDark={isDark} />
                    : (
                      <AntImage
                        src={signedUrl}
                        alt={label}
                        width={180}
                        height={120}
                        style={{ objectFit: "cover", borderRadius: 10, border: "1px solid var(--border-color)" }}
                      />
                    )
                  }
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{label}</span>
                </div>
              ))}
            </div>
          ) : (
            // All signed-URL only — use PreviewGroup for lightbox
            <AntImage.PreviewGroup>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                {pages.map(({ signedUrl, label }) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <AntImage
                      src={signedUrl}
                      alt={label}
                      width={180}
                      height={120}
                      style={{ objectFit: "cover", borderRadius: 10, border: "1px solid var(--border-color)" }}
                      placeholder={
                        <div style={{
                          width: 180, height: 120,
                          background: isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          borderRadius: 10,
                        }}>
                          <LoadingOutlined style={{ color: "#60a5fa", fontSize: 20 }} />
                        </div>
                      }
                    />
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{label}</span>
                  </div>
                ))}
              </div>
            </AntImage.PreviewGroup>
          )}
        </div>
      )}

      {/* Approve / Reject actions */}
      <div style={{ padding: "12px 16px", display: "flex", gap: 8 }}>
        <DocActionButton
          label="Approve"
          icon={<CheckOutlined style={{ fontSize: 11 }} />}
          active={normalized === "Approved"}
          activeColor="#10b981"
          loading={actionLoading["approved"]}
          disabled={normalized === "Approved"}
          onClick={() => handleAction("approved")}
        />
        <DocActionButton
          label="Reject"
          icon={<CloseOutlined style={{ fontSize: 11 }} />}
          active={normalized === "Rejected"}
          activeColor="#ef4444"
          loading={actionLoading["rejected"]}
          disabled={normalized === "Rejected"}
          onClick={() => handleAction("rejected")}
        />
      </div>
    </div>
  );
};

const UserDrawerContent = ({ user: m, onDocumentStatusChange }) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  if (!m) return null;

  const fullName = [m.firstName, m.lastName].filter(Boolean).join(" ") || "Unknown";
  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col gap-6 pb-4">
      {/* Hero */}
      <div
        className="flex flex-col items-center text-center gap-3 py-6 rounded-2xl"
        style={{
          background: isDark ? "rgba(37,99,235,0.07)" : "#f0f5ff",
          border: `1px solid ${isDark ? "rgba(37,99,235,0.2)" : "#dbeafe"}`,
        }}
      >
        <Avatar
          size={88}
          style={{
            background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
            fontSize: 32,
            fontWeight: 700,
            boxShadow: "0 8px 24px rgba(79,70,229,0.35)",
          }}
        >
          {initials}
        </Avatar>
        <div>
          <p className="text-lg font-bold m-0" style={{ color: "var(--text-primary)" }}>
            {fullName}
          </p>
          <p className="text-sm m-0 mt-0.5" style={{ color: "var(--text-muted)" }}>
            {m.email || "No email"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-center mt-1">
          <Tag color="blue" style={{ borderRadius: 20, fontWeight: 600, textTransform: "capitalize" }}>
            {m.status ?? "active"}
          </Tag>
          <Tag color="purple" style={{ borderRadius: 20, textTransform: "capitalize" }}>
            {m.role || "user"}
          </Tag>
        </div>
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/users/${m._id}`)}
          style={{ marginTop: 12, borderRadius: 10 }}
        >
          View Full Profile
        </Button>
      </div>

      {/* Contact */}
      <div>
        <SectionLabel icon={<MailOutlined />} title="Contact Information" />
        <SectionCard>
          <Field icon={<MailOutlined />} label="Email Address" value={m.email} />
          <div style={{ borderBottom: "none" }}>
            <Field
              icon={<PhoneOutlined />}
              label="Phone Number"
              value={m.phone?.number ? `${m.phone.countryCode} ${m.phone.number}` : null}
            />
          </div>
        </SectionCard>
      </div>

      {/* Address */}
      {m.address && (
        <div>
          <SectionLabel icon={<GlobalOutlined />} title="Address" />
          <SectionCard>
            <Field icon={<GlobalOutlined />} label="Country" value={m.address.country} />
            <Field icon={<GlobalOutlined />} label="City" value={m.address.city} />
            <Field icon={<GlobalOutlined />} label="State" value={m.address.state} />
            <Field
              icon={<GlobalOutlined />}
              label="Address"
              value={[m.address.addressLine1, m.address.addressLine2].filter(Boolean).join(", ")}
            />
            <div style={{ borderBottom: "none" }}>
              <Field icon={<GlobalOutlined />} label="Postal Code" value={m.address.postalCode} />
            </div>
          </SectionCard>
        </div>
      )}

      {/* Personal Details */}
      {(m.dob || m.currency) && (
        <div>
          <SectionLabel icon={<IdcardOutlined />} title="Personal Details" />
          <SectionCard>
            {m.dob && (
              <Field
                icon={<CalendarOutlined />}
                label="Date of Birth"
                value={new Date(m.dob).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
            )}
            {m.currency && (
              <div style={{ borderBottom: "none" }}>
                <Field icon={<BankOutlined />} label="Currency" value={m.currency} />
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* Documents */}
      {m.documents?.length > 0 && (
        <div>
          <SectionLabel icon={<IdcardOutlined />} title="Documents" />
          {m.documents.map((doc, i) => (
            <UserDocumentCard
              key={doc._id ?? i}
              doc={doc}
              userId={m._id}
              isDark={isDark}
              onStatusChange={onDocumentStatusChange}
            />
          ))}
        </div>
      )}

      {/* Account */}
      <div>
        <SectionLabel icon={<IdcardOutlined />} title="Account Details" />
        <SectionCard>
          <Field
            icon={<IdcardOutlined />}
            label="User ID"
            value={
              <span
                className="font-mono text-xs px-2 py-0.5 rounded-lg"
                style={{
                  background: isDark ? "rgba(99,102,241,0.15)" : "#eef2ff",
                  color: isDark ? "#a5b4fc" : "#4f46e5",
                }}
              >
                {m._id}
              </span>
            }
          />
          <div style={{ borderBottom: "none" }}>
            <Field
              icon={<CalendarOutlined />}
              label="Member Since"
              value={new Date(m.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default UserDrawerContent;
