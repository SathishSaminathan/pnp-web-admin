import React from "react";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

export const STATUS_CONFIG = {
  pending: {
    color: "warning",
    icon: <ClockCircleOutlined />,
    label: "Pending",
    hex: "#f59e0b",
    bg: (dark) => (dark ? "rgba(245,158,11,0.12)" : "#fffbeb"),
    border: (dark) => (dark ? "rgba(245,158,11,0.3)" : "#fef3c7"),
  },
  approved: {
    color: "processing",
    icon: <CheckCircleOutlined />,
    label: "Approved",
    hex: "#3b82f6",
    bg: (dark) => (dark ? "rgba(59,130,246,0.12)" : "#eff6ff"),
    border: (dark) => (dark ? "rgba(59,130,246,0.3)" : "#bfdbfe"),
  },
  completed: {
    color: "success",
    icon: <CheckCircleOutlined />,
    label: "Completed",
    hex: "#10b981",
    bg: (dark) => (dark ? "rgba(16,185,129,0.12)" : "#f0fdf4"),
    border: (dark) => (dark ? "rgba(16,185,129,0.3)" : "#d1fae5"),
  },
  rejected: {
    color: "error",
    icon: <CloseCircleOutlined />,
    label: "Rejected",
    hex: "#ef4444",
    bg: (dark) => (dark ? "rgba(239,68,68,0.12)" : "#fef2f2"),
    border: (dark) => (dark ? "rgba(239,68,68,0.3)" : "#fee2e2"),
  },
  cancelled: {
    color: "default",
    icon: <CloseCircleOutlined />,
    label: "Cancelled",
    hex: "#6b7280",
    bg: (dark) => (dark ? "rgba(107,114,128,0.12)" : "#f9fafb"),
    border: (dark) => (dark ? "rgba(107,114,128,0.3)" : "#e5e7eb"),
  },
  under_review: {
    color: "processing",
    icon: <SyncOutlined spin />,
    label: "Under Review",
    hex: "#8b5cf6",
    bg: (dark) => (dark ? "rgba(139,92,246,0.12)" : "#f5f3ff"),
    border: (dark) => (dark ? "rgba(139,92,246,0.3)" : "#ede9fe"),
  },
  documents_required: {
    color: "warning",
    icon: <FileTextOutlined />,
    label: "Documents Required",
    hex: "#f97316",
    bg: (dark) => (dark ? "rgba(249,115,22,0.12)" : "#fff7ed"),
    border: (dark) => (dark ? "rgba(249,115,22,0.3)" : "#fed7aa"),
  },
};

export const MODAL_STYLES = {
  content: { background: "var(--bg-card)" },
  header: { background: "var(--bg-card)" },
  footer: { background: "var(--bg-card)" },
};

export const MODAL_ACTION_CONFIG = {
  approve: {
    title: "Approve Request",
    descPrefix: "Approving",
    okText: "Approve",
    okButtonProps: { style: { background: "#10b981", borderColor: "#10b981" } },
  },
  reject: {
    title: "Reject Request",
    descPrefix: "Rejecting",
    okText: "Reject",
    okButtonProps: { danger: true },
  },
  cancel: {
    title: "Cancel Request",
    descPrefix: "Cancelling",
    okText: "Cancel Request",
    okButtonProps: { danger: true },
  },
  assign: {
    title: "Assign Service Provider",
    descPrefix: "Assigning provider for",
    okText: "Assign",
    okButtonProps: { style: { background: "#8b5cf6", borderColor: "#8b5cf6" } },
  },
  process: {
    title: "Process Bank Request",
    okText: "Process",
    okButtonProps: { style: { background: "#2563eb", borderColor: "#2563eb" } },
  },
};
