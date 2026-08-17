import React, { useEffect, useState } from "react";
import {
  Drawer,
  Button,
  Form,
  Input,
  Select,
  Tag,
  Space,
  Divider,
  Spin,
  Modal,
  Tooltip,
  notification,
} from "antd";
import {
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  StopOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  BankOutlined,
  DeleteOutlined,
  FileTextOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { bankAccountRequestsApi } from "../../api/modules/bankAccountRequests";
import { storageApi } from "../../api/modules/storage";
import { useTheme } from "../../context/ThemeContext";
import EditDocumentModal from "./EditDocumentModal";
import { MODAL_STYLES } from "../../constants/bankAccountRequests";

/* ── shared status tag (kept local so component is fully self-contained) ── */
const STATUS_COLORS = {
  pending:            { color: "warning",    label: "Pending" },
  approved:           { color: "processing", label: "Approved" },
  completed:          { color: "success",    label: "Completed" },
  rejected:           { color: "error",      label: "Rejected" },
  cancelled:          { color: "default",    label: "Cancelled" },
  under_review:       { color: "processing", label: "Under Review" },
  documents_required: { color: "warning",    label: "Documents Required" },
};

const StatusTag = ({ status }) => {
  const cfg = STATUS_COLORS[status] ?? { color: "default", label: status ?? "—" };
  return (
    <Tag color={cfg.color} style={{ borderRadius: 20, fontWeight: 500 }}>
      {cfg.label}
    </Tag>
  );
};

/* ── action definitions ─────────────────────────────────────────────────── */
const ACTION_DEFS = {
  approve: {
    key: "approve",
    label: "Approve",
    icon: <CheckOutlined />,
    color: "#10b981",
    okText: "Approve",
    okStyle: { background: "#10b981", borderColor: "#10b981" },
    visibleWhen: (r) => r.status === "pending",
  },
  reject: {
    key: "reject",
    label: "Reject",
    icon: <CloseOutlined />,
    color: "#ef4444",
    okText: "Reject",
    okStyle: { background: "#ef4444", borderColor: "#ef4444" },
    visibleWhen: (r) => r.status === "pending",
  },
  cancel: {
    key: "cancel",
    label: "Cancel",
    icon: <StopOutlined />,
    color: "#f59e0b",
    okText: "Cancel Request",
    okStyle: { background: "#f59e0b", borderColor: "#f59e0b" },
    visibleWhen: (r) => r.status === "pending" || r.status === "approved",
  },
  assign: {
    key: "assign",
    label: "Assign Provider",
    icon: <ApiOutlined />,
    color: "#8b5cf6",
    okText: "Assign",
    okStyle: { background: "#8b5cf6", borderColor: "#8b5cf6" },
    visibleWhen: (r) => r.status === "approved" && !r.assignedProvider?.providerId,
  },
  process: {
    key: "process",
    label: "Process",
    icon: <ThunderboltOutlined />,
    color: "#2563eb",
    okText: "Process",
    okStyle: { background: "#2563eb", borderColor: "#2563eb" },
    visibleWhen: (r) => r.status === "approved" && !!r.assignedProvider?.providerId,
  },
};

/* ── action-specific form fields ─────────────────────────────────────────── */
const ActionForm = ({ actionKey, form, providers, providersLoading }) => {
  const inputStyle = {
    background: "var(--input-bg)",
    borderColor: "var(--border-color)",
    color: "var(--text-primary)",
  };

  if (actionKey === "approve") {
    return (
      <Form form={form} layout="vertical">
        <Form.Item
          name="notes"
          label={<span style={{ color: "var(--text-secondary)" }}>Approval Notes</span>}
        >
          <Input.TextArea
            rows={3}
            placeholder="All documents verified and approved."
            style={inputStyle}
          />
        </Form.Item>
      </Form>
    );
  }

  if (actionKey === "reject") {
    return (
      <Form form={form} layout="vertical">
        <Form.Item
          name="reason"
          label={<span style={{ color: "var(--text-secondary)" }}>Rejection Reason</span>}
          rules={[{ required: true, message: "Please provide a reason" }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Incomplete documentation provided."
            style={inputStyle}
          />
        </Form.Item>
      </Form>
    );
  }

  if (actionKey === "cancel") {
    return (
      <Form form={form} layout="vertical">
        <Form.Item
          name="reason"
          label={<span style={{ color: "var(--text-secondary)" }}>Cancellation Reason</span>}
          rules={[{ required: true, message: "Please provide a reason" }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Cancelled at user's request."
            style={inputStyle}
          />
        </Form.Item>
      </Form>
    );
  }

  if (actionKey === "assign") {
    return (
      <Form form={form} layout="vertical">
        <Form.Item
          name="providerId"
          label={<span style={{ color: "var(--text-secondary)" }}>Service Provider</span>}
          rules={[{ required: true, message: "Please select a provider" }]}
        >
          <Select
            loading={providersLoading}
            placeholder={providersLoading ? "Loading providers…" : "Select a provider"}
            dropdownStyle={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
            }}
            style={{ width: "100%" }}
          >
            {providers.map((p) => (
              <Select.Option key={p._id} value={p._id}>
                {p.providerName} ({p.providerCode})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    );
  }

  if (actionKey === "process") {
    return (
      <Form form={form} layout="vertical">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          This will create the Checkbook account for this request. Ensure a service
          provider is already assigned before proceeding.
        </p>
      </Form>
    );
  }

  return null;
};

/* ══════════════════════════════════════════════════════════════════════════ */
/*  BankAccountRequestEditDrawer                                              */
/*  Props:                                                                    */
/*    open        – boolean                                                   */
/*    record      – the bank account request object (or null)                 */
/*    onClose     – () => void                                                */
/*    onSuccess   – () => void  called after any successful action            */
/*    onDocChange – () => void  called after edit/delete of additional docs   */
/* ══════════════════════════════════════════════════════════════════════════ */
const DOC_STATUS_COLOR = {
  pending: "orange",
  submitted: "blue",
  approved: "green",
  rejected: "red",
  not_submitted: "default",
};

const BankAccountRequestEditDrawer = ({ open, record, onClose, onSuccess, onDocChange }) => {
  const { isDark } = useTheme();
  const [form] = Form.useForm();

  const [activeAction, setActiveAction] = useState(null); // key of ACTION_DEFS
  const [submitting, setSubmitting] = useState(false);
  const [providers, setProviders] = useState([]);
  const [providersLoading, setProvidersLoading] = useState(false);

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

  /* reset whenever drawer opens for a different record */
  useEffect(() => {
    if (open) {
      setActiveAction(null);
      form.resetFields();
      setProviders([]);
    }
  }, [open, record?._id, form]);

  /* load eligible providers whenever assign action is selected */
  useEffect(() => {
    if (activeAction === "assign" && record) {
      setProvidersLoading(true);
      const isUs = record.userCountryCode === "US";
      bankAccountRequestsApi
        .getEligibleProviders(record.currency ?? "USD", isUs)
        .then((res) => setProviders(res.data ?? []))
        .catch(() => setProviders([]))
        .finally(() => setProvidersLoading(false));
    }
  }, [activeAction, record]);

  // const selectAction = (key) => {
  //   setActiveAction(key);
  //   form.resetFields();
  // };

  const handleSubmit = async () => {
    let values = {};
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setSubmitting(true);
    try {
      const id = record._id;
      if (activeAction === "approve") {
        await bankAccountRequestsApi.approve(id, values.notes);
        notification.success({ message: "Request approved successfully" });
      } else if (activeAction === "reject") {
        await bankAccountRequestsApi.reject(id, values.reason);
        notification.success({ message: "Request rejected" });
      } else if (activeAction === "cancel") {
        await bankAccountRequestsApi.cancel(id, values.reason);
        notification.success({ message: "Request cancelled" });
      } else if (activeAction === "assign") {
        await bankAccountRequestsApi.assignProvider(id, values.providerId);
        notification.success({ message: "Provider assigned successfully" });
      } else if (activeAction === "process") {
        await bankAccountRequestsApi.process(id);
        notification.success({ message: "Bank request processed successfully" });
      }
      onSuccess?.();
      onClose();
    } catch {
      // axios interceptor handles error toast
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setActiveAction(null);
    form.resetFields();
    onClose();
  };

  /* ── Doc edit/delete handlers ── */
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
      await bankAccountRequestsApi.editDocument(record._id, editDocTarget._id, values);
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
      await bankAccountRequestsApi.deleteDocument(record._id, deleteDocTarget._id, reason);
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
        message: reviewDocAction === "approved" ? "Document approved" : "Document rejected",
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

  if (!record) return null;

  // const availableActions = Object.values(ACTION_DEFS).filter((a) =>
  //   a.visibleWhen(record)
  // );
  const activeDef = activeAction ? ACTION_DEFS[activeAction] : null;

  const drawerFooter = activeAction ? (
    <div className="flex justify-end gap-2">
      <Button
        onClick={() => { setActiveAction(null); form.resetFields(); }}
        style={{
          borderColor: "var(--border-color)",
          color: "var(--text-secondary)",
          background: "var(--input-bg)",
        }}
      >
        Back
      </Button>
      <Button
        type="primary"
        loading={submitting}
        onClick={handleSubmit}
        style={activeDef?.okStyle}
      >
        {activeDef?.okText}
      </Button>
    </div>
  ) : null;

  return (
    <>
    <Drawer
      title={
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444)" }}
          >
            <EditOutlined style={{ color: "#fff", fontSize: 15 }} />
          </div>
          <div className="flex flex-col">
            <span style={{ color: "var(--text-primary)", fontWeight: 600, lineHeight: 1.3 }}>
              Edit Request
            </span>
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              {record.metadata?.referenceNumber ?? record._id}
            </span>
          </div>
        </div>
      }
      placement="right"
      width={480}
      open={open}
      onClose={handleClose}
      footer={drawerFooter}
      styles={{
        header: {
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border-color)",
        },
        body: { background: "var(--bg-card)", padding: "24px" },
        footer: {
          background: "var(--bg-card)",
          borderTop: "1px solid var(--border-color)",
          padding: "12px 24px",
        },
        mask: { backdropFilter: "blur(2px)" },
      }}
    >
      {/* ── Record Summary ───────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-4 mb-5"
        style={{
          background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
          border: "1px solid var(--border-color)",
        }}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p
              className="font-semibold text-sm m-0"
              style={{ color: "var(--text-primary)" }}
            >
              {record.accountName || "—"}
            </p>
            <p className="text-xs m-0 mt-0.5" style={{ color: "var(--text-muted)" }}>
              {record.userId?.firstName} {record.userId?.lastName} · {record.userEmail}
            </p>
          </div>
          <StatusTag status={record.status} />
        </div>
        {record.assignedProvider?.providerId && (
          <div className="mt-3 flex items-center gap-2">
            <BankOutlined style={{ color: "var(--text-muted)", fontSize: 12 }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Provider:{" "}
              <strong style={{ color: "var(--text-secondary)" }}>
                {record.assignedProvider.providerId.providerName}
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* ── Additional Documents (any status with docs, or documents_required) */}
      {(record.status === "documents_required" || record.additionalDocuments?.length > 0) && !activeAction && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Additional Documents Requested
          </p>
          {record.additionalDocuments?.length === 0 && (
            <div
              className="rounded-xl p-5 text-center"
              style={{
                background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                border: "1px dashed var(--border-color)",
              }}
            >
              <p className="text-sm m-0" style={{ color: "var(--text-muted)" }}>No documents requested yet.</p>
            </div>
          )}
          {record.additionalDocuments?.map((doc) => {
            const canEdit = ["pending", "submitted"].includes(doc.status);
            const canDelete = ["pending", "rejected"].includes(doc.status);
            const isFileType = ["document", "file"].includes(doc.type);
            const isTextType = ["string", "number", "text"].includes(doc.type);
            const hasValue = doc.status === "submitted" && doc.value;
            return (
              <div
                key={doc._id}
                className="flex flex-col gap-2 rounded-xl p-3"
                style={{
                  background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "rgba(249,115,22,0.12)" }}
                  >
                    <FileTextOutlined style={{ color: "#f97316", fontSize: 14 }} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {doc.label}
                      </span>
                      {doc.isRequired && (
                        <Tag color="red" style={{ borderRadius: 4, fontSize: 10, margin: 0, lineHeight: "16px" }}>Required</Tag>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Tag style={{ borderRadius: 4, fontSize: 11, margin: 0 }}>{doc.type}</Tag>
                      <Tag color={DOC_STATUS_COLOR[doc.status] ?? "default"} style={{ borderRadius: 4, fontSize: 11, margin: 0 }}>
                        {doc.status?.replace(/_/g, " ")}
                      </Tag>
                      <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{doc.name}</span>
                    </div>
                    {doc.description && (
                      <span className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{doc.description}</span>
                    )}
                    {hasValue && isTextType && (
                      <div
                        className="mt-1.5 px-2 py-1 rounded-lg"
                        style={{
                          background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                          border: "1px solid var(--border-color)",
                        }}
                      >
                        <span className="text-xs font-mono" style={{ color: "var(--text-primary)" }}>{doc.value}</span>
                      </div>
                    )}
                  </div>
                  <Space size={4} style={{ flexShrink: 0 }}>
                    {hasValue && isFileType && (
                      <Tooltip title="View Document">
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          loading={viewingDocId === doc._id}
                          onClick={() => handleViewDoc(doc)}
                        />
                      </Tooltip>
                    )}
                    {canEdit && (
                      <Tooltip title="Edit">
                        <Button size="small" icon={<EditOutlined />} onClick={() => openEditDoc(doc)} />
                      </Tooltip>
                    )}
                    {canDelete && (
                      <Tooltip title="Delete">
                        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => openDeleteDoc(doc)} />
                      </Tooltip>
                    )}
                  </Space>
                </div>
                {doc.status === "submitted" && (
                  <div className="flex gap-2 pt-2 border-t" style={{ borderColor: "var(--border-color)" }}>
                    <Button
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={() => openReviewDoc(doc, "approved")}
                      style={{
                        flex: 1,
                        color: "#10b981",
                        borderColor: "#10b981",
                        background: isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.04)",
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      danger
                      icon={<CloseOutlined />}
                      onClick={() => openReviewDoc(doc, "rejected")}
                      style={{ flex: 1 }}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Action Selector ──────────────────────────────────────────────── */}
      {/* {!activeAction && availableActions.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
            Available Actions
          </p>
          {availableActions.map((action) => (
            <button
              key={action.key}
              onClick={() => selectAction(action.key)}
              className="w-full flex items-center gap-4 rounded-xl p-4 text-left transition-all"
              style={{
                background: isDark ? "rgba(255,255,255,0.04)" : "#fff",
                border: `1px solid var(--border-color)`,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = action.color;
                e.currentTarget.style.background = isDark
                  ? `${action.color}18`
                  : `${action.color}0d`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.background = isDark
                  ? "rgba(255,255,255,0.04)"
                  : "#fff";
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${action.color}20` }}
              >
                <span style={{ color: action.color, fontSize: 16 }}>
                  {action.icon}
                </span>
              </div>
              <span
                className="font-semibold text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                {action.label}
              </span>
              <span
                className="ml-auto text-lg"
                style={{ color: "var(--text-muted)" }}
              >
                ›
              </span>
            </button>
          ))}
        </div>
      )} */}

      {/* ── Active Action Form ────────────────────────────────────────────── */}
      {activeAction && activeDef && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${activeDef.color}20` }}
            >
              <span style={{ color: activeDef.color, fontSize: 16 }}>
                {activeDef.icon}
              </span>
            </div>
            <span
              className="font-semibold text-base"
              style={{ color: "var(--text-primary)" }}
            >
              {activeDef.label}
            </span>
          </div>
          <Divider style={{ borderColor: "var(--border-color)", margin: "12px 0" }} />
          <ActionForm
            actionKey={activeAction}
            form={form}
            providers={providers}
            providersLoading={providersLoading}
          />
        </div>
      )}
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
          <span style={{ color: "var(--text-primary)" }}>Delete Document</span>
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
        <strong style={{ color: "var(--text-primary)" }}>{deleteDocTarget?.label ?? "—"}</strong>?
      </p>
      <Form form={deleteDocForm} layout="vertical">
        <Form.Item
          name="reason"
          label={<span style={{ color: "var(--text-secondary)" }}>Reason <span style={{ color: "var(--text-muted)" }}>(optional)</span></span>}
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
            <CheckOutlined style={{ color: "#10b981", fontSize: 16 }} />
          ) : (
            <CloseOutlined style={{ color: "#ef4444", fontSize: 16 }} />
          )}
          <span style={{ color: "var(--text-primary)" }}>
            {reviewDocAction === "approved" ? "Approve Document" : "Reject Document"}
          </span>
        </div>
      }
      open={reviewDocOpen}
      onOk={handleReviewDocSubmit}
      onCancel={closeReviewDoc}
      confirmLoading={reviewDocLoading}
      okText={reviewDocAction === "approved" ? "Approve" : "Reject"}
      okButtonProps={{
        style: reviewDocAction === "approved"
          ? { background: "#10b981", borderColor: "#10b981" }
          : { background: "#ef4444", borderColor: "#ef4444" },
      }}
      styles={MODAL_STYLES}
    >
      <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
        {reviewDocAction === "approved" ? "Approving" : "Rejecting"} document:{" "}
        <strong style={{ color: "var(--text-primary)" }}>{reviewDocTarget?.label ?? "—"}</strong>
      </p>
      <Form form={reviewDocForm} layout="vertical">
        <Form.Item
          name="notes"
          label={
            <span style={{ color: "var(--text-secondary)" }}>
              {reviewDocAction === "rejected" ? "Reason for Rejection" : "Notes"}{" "}
              {reviewDocAction !== "rejected" && (
                <span style={{ color: "var(--text-muted)" }}>(optional)</span>
              )}
            </span>
          }
          rules={
            reviewDocAction === "rejected"
              ? [{ required: true, message: "Please provide a reason for rejection" }]
              : []
          }
          style={{ marginBottom: 0 }}
        >
          <Input.TextArea
            rows={3}
            placeholder={reviewDocAction === "approved" ? "Document looks good." : "Reason for rejection..."}
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

export default BankAccountRequestEditDrawer;
