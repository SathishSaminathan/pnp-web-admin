import React from "react";
import { notification } from "antd";
import { useTheme } from "../context/ThemeContext";

const TYPES = {
  success: {
    hex: "#10b981",
    bg: { light: "#f0fdf4", dark: "rgba(16,185,129,0.1)" },
    border: { light: "#bbf7d0", dark: "rgba(16,185,129,0.25)" },
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="1.5" />
        <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="#10b981" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  error: {
    hex: "#ef4444",
    bg: { light: "#fef2f2", dark: "rgba(239,68,68,0.1)" },
    border: { light: "#fecaca", dark: "rgba(239,68,68,0.25)" },
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" fill="#ef4444" fillOpacity="0.15" stroke="#ef4444" strokeWidth="1.5" />
        <path d="M7 7l6 6M13 7l-6 6" stroke="#ef4444" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  warning: {
    hex: "#f59e0b",
    bg: { light: "#fffbeb", dark: "rgba(245,158,11,0.1)" },
    border: { light: "#fde68a", dark: "rgba(245,158,11,0.25)" },
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" fill="#f59e0b" fillOpacity="0.15" stroke="#f59e0b" strokeWidth="1.5" />
        <path d="M10 6.5v4" stroke="#f59e0b" strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="10" cy="13.5" r="0.75" fill="#f59e0b" />
      </svg>
    ),
  },
  info: {
    hex: "#3b82f6",
    bg: { light: "#eff6ff", dark: "rgba(59,130,246,0.1)" },
    border: { light: "#bfdbfe", dark: "rgba(59,130,246,0.25)" },
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" fill="#3b82f6" fillOpacity="0.15" stroke="#3b82f6" strokeWidth="1.5" />
        <path d="M10 9v5" stroke="#3b82f6" strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="10" cy="6.5" r="0.75" fill="#3b82f6" />
      </svg>
    ),
  },
};

export const useNotify = () => {
  const { isDark } = useTheme();

  const fire = (type, message, description) => {
    const t = TYPES[type];

    notification.open({
      placement: "topRight",
      duration: type === "error" ? 5 : 3,
      icon: null,
      style: {
        background: isDark ? "var(--bg-card)" : "#ffffff",
        border: isDark
          ? "1px solid var(--border-color)"
          : `1px solid ${t.border.light}`,
        borderLeft: `4px solid ${t.hex}`,
        borderRadius: 10,
        boxShadow: isDark
          ? "0 12px 40px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)"
          : "0 4px 20px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)",
        padding: "12px 16px",
        minWidth: 280,
      },
      message: (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "flex", flexShrink: 0 }}>{t.icon}</span>
          <span style={{
            color: "var(--text-primary)",
            fontWeight: 600,
            fontSize: 14,
            lineHeight: "1.4",
          }}>
            {message}
          </span>
        </div>
      ),
      description: description ? (
        <span style={{
          color: "var(--text-muted)",
          fontSize: 12.5,
          lineHeight: "1.5",
          marginTop: 2,
          display: "block",
          paddingLeft: 30,
        }}>
          {description}
        </span>
      ) : undefined,
    });
  };

  return {
    success: (msg, desc) => fire("success", msg, desc),
    error:   (msg, desc) => fire("error",   msg, desc),
    warning: (msg, desc) => fire("warning", msg, desc),
    info:    (msg, desc) => fire("info",    msg, desc),
  };
};
