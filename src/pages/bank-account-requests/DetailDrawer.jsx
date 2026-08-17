import React, { useState, useEffect } from "react";
import {
  Drawer,
  Form,
  Modal,
  Button,
  Tag,
  Tooltip,
  Input,
  notification,
  Tabs,
  Badge,
} from "antd";
import {
  BankOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  UserOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  ApartmentOutlined,
  BankFilled,
  WarningOutlined,
  GlobalOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { formatDateTime } from "../../utils/formatters";
import { formatAmount } from '../../utils/number.utils';
import { calculateAccountCreationFees } from '../../utils/calculateAccountCreationFees';
import StatusTag from "./StatusTag";
import EditDocumentModal from "./EditDocumentModal";
import { bankAccountRequestsApi } from "../../api/modules/bankAccountRequests";
import { storageApi } from "../../api/modules/storage";
import { MODAL_STYLES } from "../../constants/bankAccountRequests";

export const Section = ({ title, icon, children, isDark, accent }) => (
  <div
    className="rounded-2xl overflow-hidden"
    style={{
      background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
      boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
    }}
  >
    <div
      className="flex items-center gap-2 px-4 py-2.5"
      style={{
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}`,
      }}
    >
      {icon && (
        <span style={{ color: accent ?? "var(--text-muted)", fontSize: 13, lineHeight: 1 }}>
          {icon}
        </span>
      )}
      <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        {title}
      </span>
    </div>
    <div className="px-4 py-3 space-y-2.5">{children}</div>
  </div>
);

export const Row = ({ label, value, mono }) => (
  <div className="flex justify-between items-baseline gap-4 text-sm">
    <span className="shrink-0" style={{ color: "var(--text-muted)", minWidth: 110, fontSize: 12 }}>{label}</span>
    <span
      className={`text-right truncate ${mono ? "font-mono text-xs" : ""}`}
      style={{ color: "var(--text-primary)", fontWeight: 500 }}
    >
      {value || "—"}
    </span>
  </div>
);

const DOC_STATUS_COLOR = {
  pending: "orange",
  submitted: "blue",
  approved: "green",
  rejected: "red",
  not_submitted: "default",
};

const DOC_STATUS_ACCENT = {
  pending: "#f59e0b",
  submitted: "#3b82f6",
  approved: "#10b981",
  rejected: "#ef4444",
  not_submitted: "#94a3b8",
};

const DOC_STATUS_BG = {
  pending:      { light: "rgba(245,158,11,0.04)",  dark: "rgba(245,158,11,0.07)" },
  submitted:    { light: "rgba(59,130,246,0.04)",  dark: "rgba(59,130,246,0.07)" },
  approved:     { light: "rgba(16,185,129,0.04)",  dark: "rgba(16,185,129,0.08)" },
  rejected:     { light: "rgba(239,68,68,0.04)",   dark: "rgba(239,68,68,0.08)" },
  not_submitted:{ light: "rgba(0,0,0,0.02)",       dark: "rgba(255,255,255,0.03)" },
};

const DetailDrawer = ({ open, record, onClose, isDark, onDocChange }) => {
  /* ── Edit document state ── */
  const [editDocOpen, setEditDocOpen] = useState(false);
  const [editDocTarget, setEditDocTarget] = useState(null);
  const [editDocLoading, setEditDocLoading] = useState(false);
  const [editDocForm] = Form.useForm();

  /* ── Delete document state ── */
  const [deleteDocOpen, setDeleteDocOpen] = useState(false);
  const [deleteDocTarget, setDeleteDocTarget] = useState(null);
  const [deleteDocLoading, setDeleteDocLoading] = useState(false);
  const [deleteDocForm] = Form.useForm();

  /* ── Review document state ── */
  const [reviewDocOpen, setReviewDocOpen] = useState(false);
  const [reviewDocTarget, setReviewDocTarget] = useState(null);
  const [reviewDocAction, setReviewDocAction] = useState(null); // "approved" | "rejected"
  const [reviewDocLoading, setReviewDocLoading] = useState(false);
  const [reviewDocForm] = Form.useForm();
  const [viewingDocId, setViewingDocId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (record?._id) {
      setActiveTab("overview");
    }
  }, [record?._id]);

  if (!record) return null;

  const submittedDocsCount =
    record.additionalDocuments?.filter((d) => d.status === "submitted")
      .length ?? 0;

  const openEditDoc = (doc) => {
    setEditDocTarget(doc);
    editDocForm.setFieldsValue({
      label: doc.label,
      name: doc.name,
      type: doc.type,
      description: doc.description ?? "",
      isRequired: doc.isRequired ?? false,
    });
    setEditDocOpen(true);
  };

  const closeEditDoc = () => {
    setEditDocOpen(false);
    setEditDocTarget(null);
    editDocForm.resetFields();
  };

  const handleEditDocSubmit = async () => {
    let values;
    try {
      values = await editDocForm.validateFields();
    } catch {
      return;
    }
    setEditDocLoading(true);
    try {
      await bankAccountRequestsApi.editDocument(
        record._id,
        editDocTarget._id,
        values,
      );
      notification.success({ message: "Document updated successfully" });
      closeEditDoc();
      onDocChange?.();
    } catch {
      // axios interceptor handles error toast
    } finally {
      setEditDocLoading(false);
    }
  };

  const openDeleteDoc = (doc) => {
    setDeleteDocTarget(doc);
    setDeleteDocOpen(true);
  };

  const closeDeleteDoc = () => {
    setDeleteDocOpen(false);
    setDeleteDocTarget(null);
    deleteDocForm.resetFields();
  };

  const handleDeleteDoc = async () => {
    const { reason } = deleteDocForm.getFieldsValue();
    setDeleteDocLoading(true);
    try {
      await bankAccountRequestsApi.deleteDocument(
        record._id,
        deleteDocTarget._id,
        reason,
      );
      notification.success({ message: "Document deleted successfully" });
      closeDeleteDoc();
      onDocChange?.();
    } catch {
      // axios interceptor handles error toast
    } finally {
      setDeleteDocLoading(false);
    }
  };

  const openReviewDoc = (doc, action) => {
    setReviewDocTarget(doc);
    setReviewDocAction(action);
    setReviewDocOpen(true);
    reviewDocForm.resetFields();
  };

  const closeReviewDoc = () => {
    setReviewDocOpen(false);
    setReviewDocTarget(null);
    setReviewDocAction(null);
    reviewDocForm.resetFields();
  };

  const handleReviewDocSubmit = async () => {
    let values = {};
    try {
      values = await reviewDocForm.validateFields();
    } catch {
      return;
    }
    setReviewDocLoading(true);
    try {
      await bankAccountRequestsApi.reviewDocument(
        record._id,
        reviewDocTarget._id,
        reviewDocAction,
        values.notes,
      );
      notification.success({
        message:
          reviewDocAction === "approved"
            ? "Document approved"
            : "Document rejected",
      });
      closeReviewDoc();
      onDocChange?.();
    } catch {
      // axios interceptor handles error toast
    } finally {
      setReviewDocLoading(false);
    }
  };

  const handleViewDoc = async (doc) => {
    setViewingDocId(doc._id);
    try {
      const res = await storageApi.getDocumentUrl(doc.value);
      const url = res?.url ?? res?.data?.url;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      notification.error({ message: "Failed to load document" });
    } finally {
      setViewingDocId(null);
    }
  };

  return (
    <>
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", boxShadow: "0 2px 8px rgba(124,58,237,0.35)" }}
            >
              <BankFilled style={{ color: "#fff", fontSize: 17 }} />
            </div>
            <div>
              <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>
                Request Details
              </div>
              {record?.metadata?.referenceNumber && (
                <div style={{ color: "var(--text-muted)", fontSize: 11, fontFamily: "monospace", marginTop: 2 }}>
                  {record.metadata.referenceNumber}
                </div>
              )}
            </div>
          </div>
        }
        placement="right"
        width={540}
        open={open}
        onClose={onClose}
        styles={{
          header: {
            background: "var(--bg-card)",
            borderBottom: "1px solid var(--border-color)",
          },
          body: { background: "var(--bg-card)", padding: "24px" },
          mask: { backdropFilter: "blur(2px)" },
        }}
      >
        {/* Hero strip — user + status */}
        <div
          className="rounded-2xl p-4 mb-4 flex items-center gap-4"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(37,99,235,0.18), rgba(124,58,237,0.12))"
              : "linear-gradient(135deg, rgba(37,99,235,0.07), rgba(124,58,237,0.05))",
            border: `1px solid ${isDark ? "rgba(124,58,237,0.3)" : "rgba(124,58,237,0.15)"}`,
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-bold text-base"
            style={{
              background: "linear-gradient(135deg,#4f46e5,#06b6d4)",
              color: "#fff",
              fontSize: 16,
              letterSpacing: 1,
            }}
          >
            {`${record.userId?.firstName?.[0] ?? ""}${record.userId?.lastName?.[0] ?? ""}`
              .toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
              {`${record.userId?.firstName ?? ""} ${record.userId?.lastName ?? ""}`.trim() || "Unknown"}
            </div>
            <div className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
              {record.userEmail}
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusTag status={record.status} />
            </div>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="small"
          style={{ marginBottom: 0 }}
          items={[
            {
              key: "overview",
              label: "Overview",
              children: (
                <div className="space-y-3 pt-2">

                  {/* Account Info */}
                  <Section title="Account" icon={<BankOutlined />} isDark={isDark} accent="#2563eb">
                    <Row label="Account Name" value={record.accountName} />
                    <Row label="Type" value={record.accountType?.replace(/_/g, " ")} />
                    <Row label="Currency" value={record.currency} />
                    <Row label="Purpose" value={record.accountPurpose} />
                    {record.ssn?.last4 && <Row label="SSN (last 4)" value={`••••${record.ssn.last4}`} mono />}
                    {record.passport?.last4 && <Row label="Passport (last 4)" value={`••••${record.passport.last4}`} mono />}
                  </Section>

                  {/* Account Creation Fees */}
                  {(() => {
                    const feeResult = calculateAccountCreationFees(record.accountCreationFee);
                    if (feeResult.breakdown.length === 0) return null;
                    return (
                      <Section title="Account Creation Fees" icon={<TagsOutlined />} isDark={isDark} accent="#0891b2">
                        {feeResult.breakdown.map((fee, idx) => (
                          <div key={idx} className="flex justify-between items-center gap-4 text-sm">
                            <span className="flex items-center gap-2 shrink-0" style={{ color: "var(--text-muted)", fontSize: 12 }}>
                              {fee.name}
                              <span
                                className="text-[10px] font-medium px-1.5 py-px rounded"
                                style={{
                                  background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                                  color: "var(--text-muted)",
                                }}
                              >
                                {fee.type}
                              </span>
                            </span>
                            <span
                              className="text-right font-mono text-xs"
                              style={{ color: fee.shouldDeduct ? "#ef4444" : "#10b981", fontWeight: 500 }}
                            >
                              {fee.shouldDeduct ? "−" : "+"}${formatAmount(fee.calculatedAmount)}
                            </span>
                          </div>
                        ))}

                        {/* Divider */}
                        <div style={{ borderTop: `1px dashed ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, margin: "4px 0" }} />

                        <div className="flex justify-between items-baseline gap-4 text-sm">
                          <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 12 }}>Total Fees</span>
                          <span className="font-mono text-xs" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                            ${formatAmount(feeResult.totalFees)}
                          </span>
                        </div>

                        {feeResult.totalDeduct > 0 && (
                          <div className="flex justify-between items-baseline gap-4 text-sm">
                            <span style={{ color: "#ef4444", fontSize: 12 }}>Total Deducted</span>
                            <span className="font-mono text-xs" style={{ color: "#ef4444", fontWeight: 600 }}>
                              −${formatAmount(feeResult.totalDeduct)}
                            </span>
                          </div>
                        )}

                        {feeResult.totalAdd > 0 && (
                          <div className="flex justify-between items-baseline gap-4 text-sm">
                            <span style={{ color: "#10b981", fontSize: 12 }}>Total Added</span>
                            <span className="font-mono text-xs" style={{ color: "#10b981", fontWeight: 600 }}>
                              +${formatAmount(feeResult.totalAdd)}
                            </span>
                          </div>
                        )}
                      </Section>
                    );
                  })()}

                  {/* Timeline */}
                  <Section title="Timeline" icon={<CalendarOutlined />} isDark={isDark} accent="#7c3aed">
                    <Row label="Requested" value={formatDateTime(record.requestedAt)} />
                    <Row label="Created" value={formatDateTime(record.createdAt)} />
                    {record.approvedAt && <Row label="Approved" value={formatDateTime(record.approvedAt)} />}
                    {record.completedAt && <Row label="Completed" value={formatDateTime(record.completedAt)} />}
                    {record.cancelledAt && <Row label="Cancelled" value={formatDateTime(record.cancelledAt)} />}
                  </Section>

                  {/* Approval Info */}
                  {record.approvedBy && (
                    <Section title="Approval" icon={<SafetyCertificateOutlined />} isDark={isDark} accent="#10b981">
                      <Row
                        label="Approved By"
                        value={`${record.approvedBy.firstName} ${record.approvedBy.lastName}`}
                      />
                      <Row label="Email" value={record.approvedBy.emailId} mono />
                      {record.approvalNotes && <Row label="Notes" value={record.approvalNotes} />}
                    </Section>
                  )}

                  {/* Assigned Provider */}
                  {record.assignedProvider?.providerId && (
                    <Section title="Provider" icon={<ApartmentOutlined />} isDark={isDark} accent="#0891b2">
                      <Row label="Name" value={record.assignedProvider.providerId.providerName} />
                      <Row label="Code" value={record.assignedProvider.providerId.providerCode} mono />
                      <Row label="Assigned" value={formatDateTime(record.assignedProvider.assignedAt)} />
                    </Section>
                  )}

                  {/* Created Account */}
                  {record.createdAccountId && (
                    <Section title="Created Account" icon={<BankFilled />} isDark={isDark} accent="#059669">
                      <Row label="Account Number" value={record.createdAccountId.accountNumber} mono />
                      <Row label="Type" value={record.createdAccountId.accountType?.replace(/_/g, " ")} />
                      <Row label="Balance" value={`$${formatAmount(record.createdAccountId?.accountBalance)}`} />
                    </Section>
                  )}

                  {/* Rejection/Cancellation */}
                  {record.rejectionReason && (
                    <Section title="Cancellation Reason" icon={<WarningOutlined />} isDark={isDark} accent="#ef4444">
                      <p className="text-sm" style={{ color: "var(--text-secondary)", margin: 0 }}>
                        {record.rejectionReason}
                      </p>
                    </Section>
                  )}

                  {/* Metadata */}
                  <Section title="Metadata" icon={<GlobalOutlined />} isDark={isDark} accent="#94a3b8">
                    <Row label="IP Address" value={record.metadata?.ipAddress} mono />
                    <Row label="Source" value={record.metadata?.sourceApplication} />
                    <Row label="Priority" value={record.priority} />
                  </Section>

                </div>
              ),
            },
            {
              key: "documents",
              label: (
                <span className="flex items-center gap-1.5">
                  Documents
                  {submittedDocsCount > 0 && (
                    <Badge
                      count={submittedDocsCount}
                      size="small"
                      color="#f59e0b"
                      style={{ boxShadow: "none" }}
                    />
                  )}
                </span>
              ),
              children: (
                <div className="pt-1">
                  {record.additionalDocuments?.length > 0 ? (
                    <>
                      {/* Summary strip */}
                      {(() => {
                        const docs = record.additionalDocuments;
                        const counts = [
                          { label: "Submitted", color: "#3b82f6", n: docs.filter(d => d.status === "submitted").length },
                          { label: "Approved",  color: "#10b981", n: docs.filter(d => d.status === "approved").length },
                          { label: "Rejected",  color: "#ef4444", n: docs.filter(d => d.status === "rejected").length },
                          { label: "Pending",   color: "#f59e0b", n: docs.filter(d => ["pending","not_submitted"].includes(d.status)).length },
                        ].filter(c => c.n > 0);
                        return counts.length > 0 ? (
                          <div
                            className="flex items-center gap-3 px-3 py-2 rounded-xl mb-4 flex-wrap"
                            style={{
                              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                              border: "1px solid var(--border-color)",
                            }}
                          >
                            <span className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
                              {docs.length} document{docs.length !== 1 ? "s" : ""}
                            </span>
                            <span style={{ color: "var(--border-color)" }}>·</span>
                            {counts.map(c => (
                              <span key={c.label} className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                                <span className="text-[11px] font-medium" style={{ color: c.color }}>
                                  {c.n} {c.label}
                                </span>
                              </span>
                            ))}
                          </div>
                        ) : null;
                      })()}

                      <div className="space-y-3">
                        {record.additionalDocuments.map((doc) => {
                          const canEdit = ["pending"].includes(doc.status);
                          const canDelete = ["pending", "rejected"].includes(doc.status);
                          const isFileType = ["document", "file"].includes(doc.type);
                          const isTextType = ["string", "number", "text"].includes(doc.type);
                          const hasValue = doc.value && ["submitted", "approved", "rejected"].includes(doc.status);
                          const isSubmitted = doc.status === "submitted";
                          const accent = DOC_STATUS_ACCENT[doc.status] ?? "#94a3b8";
                          const bgSet = DOC_STATUS_BG[doc.status] ?? DOC_STATUS_BG.not_submitted;
                          const bg = isDark ? bgSet.dark : bgSet.light;

                          return (
                            <div
                              key={doc._id}
                              className="rounded-xl overflow-hidden"
                              style={{
                                background: isDark ? "rgba(255,255,255,0.05)" : "#fff",
                                border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
                                boxShadow: isDark ? "none" : "0 1px 4px rgba(0,0,0,0.06)",
                              }}
                            >
                              {/* Colored top accent bar */}
                              <div style={{ height: 3, background: accent }} />

                              {/* Main body */}
                              <div className="px-4 pt-3 pb-3" style={{ background: bg }}>
                                {/* Row 1: title + status + actions */}
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                                    <span
                                      style={{
                                        fontSize: 16,
                                        color: accent,
                                        lineHeight: 1,
                                        flexShrink: 0,
                                      }}
                                    >
                                      {isFileType ? <FileOutlined /> : <FileTextOutlined />}
                                    </span>
                                    <span
                                      className="text-sm font-semibold"
                                      style={{ color: "var(--text-primary)" }}
                                    >
                                      {doc.label}
                                    </span>
                                    {doc.isRequired && (
                                      <span
                                        className="text-[10px] font-semibold px-2 py-px rounded-full"
                                        style={{
                                          background: "rgba(239,68,68,0.1)",
                                          color: "#ef4444",
                                          border: "1px solid rgba(239,68,68,0.2)",
                                        }}
                                      >
                                        Required
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <Tag
                                      color={DOC_STATUS_COLOR[doc.status] ?? "default"}
                                      style={{
                                        borderRadius: 20,
                                        fontSize: 11,
                                        margin: 0,
                                        lineHeight: "20px",
                                        padding: "0 8px",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {doc.status?.replace(/_/g, " ")}
                                    </Tag>
                                    {canEdit && (
                                      <Tooltip title="Edit">
                                        <Button size="small" type="text" icon={<EditOutlined />} onClick={() => openEditDoc(doc)} />
                                      </Tooltip>
                                    )}
                                    {canDelete && (
                                      <Tooltip title="Delete">
                                        <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => openDeleteDoc(doc)} />
                                      </Tooltip>
                                    )}
                                  </div>
                                </div>

                                {/* Row 2: type + name chips */}
                                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                  <span
                                    className="text-[10px] font-mono px-2 py-0.5 rounded"
                                    style={{
                                      background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
                                      color: "var(--text-secondary)",
                                      letterSpacing: "0.02em",
                                    }}
                                  >
                                    {doc.type}
                                  </span>
                                  {doc.name && (
                                    <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                                      {doc.name}
                                    </span>
                                  )}
                                </div>

                                {/* Description */}
                                {doc.description && (
                                  <p className="text-xs mt-2" style={{ color: "var(--text-muted)", margin: "8px 0 0" }}>
                                    {doc.description}
                                  </p>
                                )}

                                {/* Value */}
                                {hasValue && (
                                  <div className="mt-3">
                                    {isTextType && (
                                      <div
                                        className="px-3 py-2.5 rounded-lg text-sm font-mono break-all"
                                        style={{
                                          background: isDark ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.04)",
                                          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                                          color: "var(--text-primary)",
                                        }}
                                      >
                                        {doc.value}
                                      </div>
                                    )}
                                    {isFileType && (
                                      <button
                                        onClick={() => !viewingDocId && handleViewDoc(doc)}
                                        disabled={!!viewingDocId}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                                        style={{
                                          border: `1px solid ${accent}55`,
                                          background: `${accent}12`,
                                          color: accent,
                                          cursor: viewingDocId === doc._id ? "wait" : "pointer",
                                          opacity: viewingDocId && viewingDocId !== doc._id ? 0.5 : 1,
                                        }}
                                      >
                                        {viewingDocId === doc._id
                                          ? <ClockCircleOutlined style={{ fontSize: 14 }} />
                                          : <LinkOutlined style={{ fontSize: 14 }} />}
                                        {viewingDocId === doc._id ? "Opening…" : "Open File"}
                                      </button>
                                    )}
                                  </div>
                                )}

                                {/* Timestamps */}
                                {(doc.submittedAt || doc.reviewedAt) && (
                                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                                    {doc.submittedAt && (
                                      <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                                        <ClockCircleOutlined style={{ fontSize: 10 }} />
                                        Submitted {formatDateTime(doc.submittedAt)}
                                      </span>
                                    )}
                                    {doc.reviewedAt && (
                                      <span
                                        className="flex items-center gap-1 text-[11px] font-medium"
                                        style={{ color: doc.status === "approved" ? "#10b981" : "#ef4444" }}
                                      >
                                        {doc.status === "approved"
                                          ? <CheckCircleOutlined style={{ fontSize: 10 }} />
                                          : <CloseCircleOutlined style={{ fontSize: 10 }} />}
                                        Reviewed {formatDateTime(doc.reviewedAt)}
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Awaiting submission placeholder */}
                                {["pending", "not_submitted"].includes(doc.status) && (
                                  <div
                                    className="mt-3 px-3 py-2 rounded-lg text-xs flex items-center gap-2"
                                    style={{
                                      background: isDark ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.06)",
                                      border: "1px dashed rgba(245,158,11,0.4)",
                                      color: "#f59e0b",
                                    }}
                                  >
                                    <ClockCircleOutlined style={{ fontSize: 11 }} />
                                    Awaiting user submission
                                  </div>
                                )}
                              </div>

                              {/* Approve / Reject footer */}
                              {isSubmitted && (
                                <div
                                  className="grid grid-cols-2"
                                  style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}` }}
                                >
                                  <button
                                    onClick={() => openReviewDoc(doc, "approved")}
                                    className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all hover:opacity-80"
                                    style={{
                                      color: "#10b981",
                                      background: isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.05)",
                                      borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
                                    }}
                                  >
                                    <CheckCircleOutlined style={{ fontSize: 15 }} />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => openReviewDoc(doc, "rejected")}
                                    className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all hover:opacity-80"
                                    style={{
                                      color: "#ef4444",
                                      background: isDark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.05)",
                                    }}
                                  >
                                    <CloseCircleOutlined style={{ fontSize: 15 }} />
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center py-16 text-center"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                        style={{
                          background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                          border: "1px solid var(--border-color)",
                        }}
                      >
                        <FileOutlined style={{ fontSize: 24, color: "var(--text-muted)" }} />
                      </div>
                      <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
                        No documents requested yet
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Additional documents will appear here when requested.
                      </p>
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Drawer>

      {/* Edit Document Modal */}
      <EditDocumentModal
        open={editDocOpen}
        target={editDocTarget}
        form={editDocForm}
        onOk={handleEditDocSubmit}
        onCancel={closeEditDoc}
        loading={editDocLoading}
        isMobile={false}
      />

      {/* Delete Document Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <DeleteOutlined style={{ color: "#ef4444", fontSize: 16 }} />
            <span style={{ color: "var(--text-primary)" }}>
              Delete Document
            </span>
          </div>
        }
        open={deleteDocOpen}
        onOk={handleDeleteDoc}
        onCancel={closeDeleteDoc}
        confirmLoading={deleteDocLoading}
        okText="Delete"
        okButtonProps={{ danger: true }}
        styles={MODAL_STYLES}
      >
        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          Delete document:{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            {deleteDocTarget?.label ?? "—"}
          </strong>
          ? Only documents with status{" "}
          <Tag color="orange" style={{ margin: 0 }}>
            pending
          </Tag>{" "}
          or{" "}
          <Tag color="red" style={{ margin: 0 }}>
            rejected
          </Tag>{" "}
          can be deleted.
        </p>
        <Form form={deleteDocForm} layout="vertical">
          <Form.Item
            name="reason"
            label={
              <span style={{ color: "var(--text-secondary)" }}>
                Reason{" "}
                <span style={{ color: "var(--text-muted)" }}>(optional)</span>
              </span>
            }
            style={{ marginBottom: 0 }}
          >
            <Input.TextArea
              rows={2}
              placeholder="Reason for deletion..."
              style={{
                background: "var(--input-bg)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Review Document Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            {reviewDocAction === "approved" ? (
              <CheckCircleOutlined style={{ color: "#10b981", fontSize: 16 }} />
            ) : (
              <CloseCircleOutlined style={{ color: "#ef4444", fontSize: 16 }} />
            )}
            <span style={{ color: "var(--text-primary)" }}>
              {reviewDocAction === "approved"
                ? "Approve Document"
                : "Reject Document"}
            </span>
          </div>
        }
        open={reviewDocOpen}
        onOk={handleReviewDocSubmit}
        onCancel={closeReviewDoc}
        confirmLoading={reviewDocLoading}
        okText={reviewDocAction === "approved" ? "Approve" : "Reject"}
        okButtonProps={{
          style:
            reviewDocAction === "approved"
              ? { background: "#10b981", borderColor: "#10b981" }
              : { background: "#ef4444", borderColor: "#ef4444" },
        }}
        styles={MODAL_STYLES}
      >
        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          {reviewDocAction === "approved" ? "Approving" : "Rejecting"} document:{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            {reviewDocTarget?.label ?? "—"}
          </strong>
        </p>
        <Form form={reviewDocForm} layout="vertical">
          <Form.Item
            name="notes"
            label={
              <span style={{ color: "var(--text-secondary)" }}>
                {reviewDocAction === "rejected"
                  ? "Reason for Rejection"
                  : "Notes"}{" "}
                {reviewDocAction !== "rejected" && (
                  <span style={{ color: "var(--text-muted)" }}>(optional)</span>
                )}
              </span>
            }
            rules={
              reviewDocAction === "rejected"
                ? [
                    {
                      required: true,
                      message: "Please provide a reason for rejection",
                    },
                  ]
                : []
            }
            style={{ marginBottom: 0 }}
          >
            <Input.TextArea
              rows={3}
              placeholder={
                reviewDocAction === "approved"
                  ? "Document looks good."
                  : "Reason for rejection..."
              }
              style={{
                background: "var(--input-bg)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DetailDrawer;
