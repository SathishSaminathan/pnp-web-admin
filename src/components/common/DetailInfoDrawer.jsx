import React from "react";
import { Drawer, Avatar, Divider } from "antd";

/**
 * Reusable detail drawer shell.
 *
 * Props:
 *  open       – boolean
 *  onClose    – fn
 *  title      – string | ReactNode
 *  icon       – ReactNode  (shown left of title in header)
 *  avatar     – ReactNode  (replaces icon; use UserAvatar for people)
 *  subtitle   – string     (small line below title)
 *  extra      – ReactNode  (top-right header action e.g. a button)
 *  width      – number     (desktop width, default 520)
 *  children   – content
 */
export const DetailInfoDrawer = ({
  open,
  onClose,
  title,
  icon,
  avatar,
  subtitle,
  extra,
  width = 520,
  children,
}) => {
  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width={isMobile ? "100vw" : width}
      extra={extra}
      styles={{
        wrapper: { boxShadow: "-8px 0 40px rgba(0,0,0,0.15)" },
        header: {
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border-color)",
          padding: "16px 20px",
        },
        body: {
          background: "var(--bg-card)",
          padding: "24px",
        },
        mask: { backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.35)" },
      }}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {avatar}
          {!avatar && icon && (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                flexShrink: 0,
              }}
            >
              {icon}
            </div>
          )}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted)" }}>
                {subtitle}
              </div>
            )}
          </div>
        </div>
      }
    >
      {children}
    </Drawer>
  );
};

/* ─── DrawerHero ──────────────────────────────────────────────────────────────
 * Full-width hero card with avatar, name, email and a tags row.
 *
 * Props:
 *  initials   – string  e.g. "JT"
 *  name       – string
 *  email      – string  (optional)
 *  tags       – ReactNode  (Tag / Badge elements)
 *  gradient   – string  (CSS gradient for avatar bg, default blue-purple)
 * ──────────────────────────────────────────────────────────────────────────── */
export const DrawerHero = ({
  initials,
  name,
  email,
  tags,
  gradient = "linear-gradient(135deg,#4f46e5,#06b6d4)",
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      gap: 10,
      padding: "24px 16px",
      borderRadius: 16,
      marginBottom: 24,
      background: "var(--input-bg)",
      border: "1px solid var(--border-color)",
    }}
  >
    <Avatar
      size={64}
      style={{
        background: gradient,
        fontSize: 22,
        fontWeight: 700,
        boxShadow: "0 6px 20px rgba(79,70,229,0.3)",
        flexShrink: 0,
      }}
    >
      {initials}
    </Avatar>
    <div>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
        {name}
      </p>
      {email && (
        <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--text-muted)", wordBreak: "break-all" }}>
          {email}
        </p>
      )}
    </div>
    {tags && (
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {tags}
      </div>
    )}
  </div>
);

/* ─── DrawerSection ───────────────────────────────────────────────────────────
 * Section heading with title, optional status badge and subtitle.
 * Renders a Divider above if `divider` is true (default).
 *
 * Props:
 *  title    – string
 *  badge    – ReactNode  (e.g. <StatusBadge />)
 *  subtitle – string
 *  divider  – boolean    (default true)
 *  first    – boolean    (skip top divider for first section, default false)
 * ──────────────────────────────────────────────────────────────────────────── */
export const DrawerSection = ({ title, badge, subtitle, first = false }) => (
  <>
    {!first && (
      <Divider style={{ margin: "20px 0 0", borderColor: "var(--border-color)" }} />
    )}
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 8,
        padding: "16px 0 18px",
        borderBottom: "1px solid var(--border-color)",
        marginBottom: 16,
      }}
    >
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
            {subtitle}
          </p>
        )}
      </div>
      {badge}
    </div>
  </>
);

/* ─── DrawerSubLabel ──────────────────────────────────────────────────────────
 * Small ALL-CAPS label for sub-sections within a DrawerSection.
 * ──────────────────────────────────────────────────────────────────────────── */
export const DrawerSubLabel = ({ text }) => (
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
    {text}
  </p>
);

/* ─── DrawerGrid ──────────────────────────────────────────────────────────────
 * Responsive auto-fill grid of label → value cells (label above, value below).
 * Matches KycShared GridInfo style exactly.
 *
 * Props:
 *  fields  – Array<{ label, value, badge? }>
 *            (items with falsy value are filtered before render)
 * ──────────────────────────────────────────────────────────────────────────── */
export const DrawerGrid = ({ fields = [] }) => {
  const visible = fields.filter((f) => f.value != null && f.value !== "");
  if (!visible.length) return null;
  return (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid var(--border-color)",
        background: "var(--bg-card)",
        padding: "16px 18px",
        marginBottom: 16,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: "14px 20px",
      }}
    >
      {visible.map(({ label, value, badge }) => (
        <div key={label}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--text-muted)",
              display: "block",
              marginBottom: 4,
            }}
          >
            {label}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", wordBreak: "break-word", overflowWrap: "anywhere" }}>
              {value || "—"}
            </span>
            {badge}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─── DrawerInfoBlock ─────────────────────────────────────────────────────────
 * A simple card for free-form content (notes, reasons, etc.).
 * ──────────────────────────────────────────────────────────────────────────── */
export const DrawerInfoBlock = ({ children }) => (
  <div
    style={{
      borderRadius: 12,
      border: "1px solid var(--border-color)",
      background: "var(--bg-card)",
      padding: "14px 16px",
      marginBottom: 16,
      fontSize: 13,
      color: "var(--text-secondary)",
      lineHeight: 1.6,
      wordBreak: "break-word",
    }}
  >
    {children}
  </div>
);

// ── Legacy exports kept for backward compatibility ────────────────────────────

export const InfoSection = ({ title, children }) => (
  <div
    style={{
      borderRadius: 12,
      border: "1px solid var(--border-color)",
      background: "var(--bg-app)",
      overflow: "hidden",
      marginBottom: 4,
    }}
  >
    <div
      style={{
        padding: "8px 14px",
        borderBottom: "1px solid var(--border-color)",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}
      >
        {title}
      </span>
    </div>
    <div className="info-section-body" style={{ padding: "4px 0" }}>{children}</div>
  </div>
);

export const InfoRow = ({ label, value, mono = false, full = false }) => {
  if (full) {
    return (
      <div
        style={{
          padding: "9px 14px",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
        <span
          style={{
            fontSize: 13,
            color: "var(--text-primary)",
            wordBreak: "break-all",
            fontFamily: mono ? "monospace" : undefined,
          }}
        >
          {value ?? "—"}
        </span>
      </div>
    );
  }
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "120px 1fr",
        gap: "6px 12px",
        padding: "9px 14px",
        borderBottom: "1px solid var(--border-color)",
        alignItems: "baseline",
      }}
    >
      <span style={{ fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          color: "var(--text-primary)",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
          fontFamily: mono ? "monospace" : undefined,
          textAlign: "right",
        }}
      >
        {value ?? "—"}
      </span>
    </div>
  );
};
