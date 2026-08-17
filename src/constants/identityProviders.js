import {
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

export const HEALTH_STATUS = {
  HEALTHY: "healthy",
  DEGRADED: "degraded",
  UNHEALTHY: "unhealthy",
  UNKNOWN: "unknown",
};

export const HEALTH_STATUS_CONFIG = {
  healthy: {
    color: "success",
    icon: CheckCircleOutlined,
    label: "Healthy",
    hex: "#10b981",
    bg: (dark) => (dark ? "rgba(16,185,129,0.12)" : "#f0fdf4"),
    border: (dark) => (dark ? "rgba(16,185,129,0.3)" : "#d1fae5"),
  },
  degraded: {
    color: "warning",
    icon: WarningOutlined,
    label: "Degraded",
    hex: "#f59e0b",
    bg: (dark) => (dark ? "rgba(245,158,11,0.12)" : "#fffbeb"),
    border: (dark) => (dark ? "rgba(245,158,11,0.3)" : "#fef3c7"),
  },
  unhealthy: {
    color: "error",
    icon: CloseCircleOutlined,
    label: "Unhealthy",
    hex: "#ef4444",
    bg: (dark) => (dark ? "rgba(239,68,68,0.12)" : "#fef2f2"),
    border: (dark) => (dark ? "rgba(239,68,68,0.3)" : "#fee2e2"),
  },
  unknown: {
    color: "default",
    icon: QuestionCircleOutlined,
    label: "Unknown",
    hex: "#94a3b8",
    bg: (dark) => (dark ? "rgba(148,163,184,0.12)" : "#f8fafc"),
    border: (dark) => (dark ? "rgba(148,163,184,0.3)" : "#e2e8f0"),
  },
};

export const ENVIRONMENT_CONFIG = {
  sandbox: {
    color: "cyan",
    label: "Sandbox",
    hex: "#06b6d4",
    bg: (dark) => (dark ? "rgba(6,182,212,0.12)" : "#ecfeff"),
    border: (dark) => (dark ? "rgba(6,182,212,0.3)" : "#a5f3fc"),
  },
  production: {
    color: "geekblue",
    label: "Production",
    hex: "#4f46e5",
    bg: (dark) => (dark ? "rgba(79,70,229,0.12)" : "#eef2ff"),
    border: (dark) => (dark ? "rgba(79,70,229,0.3)" : "#c7d2fe"),
  },
};

export const ENVIRONMENT_OPTIONS = [
  { label: "Sandbox", value: "sandbox" },
  { label: "Production", value: "production" },
];

export const HEALTH_STATUS_OPTIONS = [
  { label: "Healthy", value: "healthy" },
  { label: "Degraded", value: "degraded" },
  { label: "Unhealthy", value: "unhealthy" },
  { label: "Unknown", value: "unknown" },
];

export const MODAL_STYLES = {
  content: { background: "var(--bg-card)" },
  header: { background: "var(--bg-card)" },
  footer: { background: "var(--bg-card)" },
};
