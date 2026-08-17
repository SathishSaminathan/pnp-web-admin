import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Select,
  Input,
  Avatar,
  Tooltip,
  Dropdown,
  Form,
  notification,
  Badge,
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  CheckOutlined,
  StopOutlined,
  CloseOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  FileAddOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { bankAccountRequestsApi } from "../../api/modules/bankAccountRequests";
import { useTheme } from "../../context/ThemeContext";
import { STATUS_CONFIG } from "../../constants/bankAccountRequests";
import { formatDate, initials } from "../../utils/formatters";
import { resolveMetaCounts } from "../../utils/resolveMetaCounts";
import StatusTag from "./StatusTag";
import DetailDrawer from "./DetailDrawer";
import ActionModal from "./ActionModal";
import RequestDocumentsModal from "./RequestDocumentsModal";


/* ─── Stable default for bank account request status counts ─── */
const BANK_REQ_COUNT_DEFAULTS = { pending: 0, approved: 0, completed: 0, cancelled: 0 };

/* ─── MAIN PAGE ─────────────────────────────────────────────────────────── */
const BankAccountRequestsList = () => {
  const { isDark } = useTheme();

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [statusCounts, setStatusCounts] = useState(BANK_REQ_COUNT_DEFAULTS);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  /* ── Action modal state ── */
  const [actionModal, setActionModal] = useState(null); // null | 'approve' | 'reject' | 'cancel' | 'assign' | 'process'
  const [actionTarget, setActionTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [form] = Form.useForm();
  const [docForm] = Form.useForm();

  /* ── Copy-to-clipboard flash state ── */
  const [copiedRef, setCopiedRef] = useState(null);

  /* ── Request Documents modal state ── */
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docTarget, setDocTarget] = useState(null);
  const [docLoading, setDocLoading] = useState(false);

  const openAction = useCallback(
    (type, record) => {
      setActionTarget(record);
      setActionModal(type);
      form.resetFields();
      if (type === "assign") {
        setProvidersLoading(true);
        const isUs = record.userCountryCode === "US";
        bankAccountRequestsApi
          .getEligibleProviders(record.currency ?? "USD", isUs)
          .then((res) => setProviders(res.data ?? []))
          .catch(() => setProviders([]))
          .finally(() => setProvidersLoading(false));
      }
    },
    [form],
  );

  const closeAction = () => {
    setActionModal(null);
    setActionTarget(null);
    form.resetFields();
  };

  const handleActionSubmit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setActionLoading(true);
    try {
      const id = actionTarget._id;
      if (actionModal === "approve") {
        await bankAccountRequestsApi.approve(id, values.notes);
        notification.success({ message: "Request approved successfully" });
      } else if (actionModal === "reject") {
        await bankAccountRequestsApi.reject(id, values.reason);
        notification.success({ message: "Request rejected" });
      } else if (actionModal === "cancel") {
        await bankAccountRequestsApi.cancel(id, values.reason);
        notification.success({ message: "Request cancelled" });
      } else if (actionModal === "assign") {
        await bankAccountRequestsApi.assignProvider(id, values.providerId);
        notification.success({ message: "Provider assigned successfully" });
      } else if (actionModal === "process") {
        await bankAccountRequestsApi.process(id);
        notification.success({
          message: "Bank request processed successfully",
        });
      }
      closeAction();
      fetchRequests(
        pagination.current,
        pagination.pageSize,
        searchText,
        filterStatus,
      );
    } catch {
      // axios interceptor handles error toast
    } finally {
      setActionLoading(false);
    }
  };

  const openDocModal = (record) => {
    setDocTarget(record);
    setDocModalOpen(true);
    docForm.setFieldsValue({
      message: "Please upload the listed documents.",
      documents: [{ label: "", name: "", type: "text", description: "", isRequired: true }],
    });
  };

  const closeDocModal = () => {
    setDocModalOpen(false);
    setDocTarget(null);
    docForm.resetFields();
  };

  const handleDocSubmit = async () => {
    let values;
    try {
      values = await docForm.validateFields();
    } catch {
      return;
    }
    setDocLoading(true);
    try {
      await bankAccountRequestsApi.requestDocuments(
        docTarget._id,
        values.documents,
        values.message,
      );
      notification.success({ message: "Document request sent successfully" });
      closeDocModal();
      fetchRequests(pagination.current, pagination.pageSize, searchText, filterStatus);
    } catch {
      // axios interceptor handles error toast
    } finally {
      setDocLoading(false);
    }
  };

  /* ── Fetch ── */
  const fetchRequests = useCallback(
    async (page = 1, limit = 20, search = "", status = "") => {
      setLoading(true);
      try {
        const params = { page, limit };
        if (search) params.search = search;
        if (status) params.status = status;

        const response = await bankAccountRequestsApi.getAll(params);
        if (response.success) {
          setRequests(response.data ?? []);
          setStatusCounts(resolveMetaCounts(response?.meta?.statusCounts, BANK_REQ_COUNT_DEFAULTS));
          if (response.meta?.pagination) {
            setPagination({
              current: response.meta.pagination.currentPage,
              pageSize: response.meta.pagination.limit,
              total: response.meta.pagination.totalRecords,
            });
          } else {
            // fallback if API doesn't return meta
            setPagination((prev) => ({
              ...prev,
              current: page,
              pageSize: limit,
            }));
          }
        }
      } catch {
        // axios interceptor handles toast
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchRequests(1, pagination.pageSize, searchText, filterStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTableChange = (p) =>
    fetchRequests(p.current, p.pageSize, searchText, filterStatus);

  const handleSearch = (v) => {
    const trimmed = v.trim();
    setSearchText(trimmed);
    fetchRequests(1, pagination.pageSize, trimmed, filterStatus);
  };

  const handleStatusFilter = (v) => {
    const val = v ?? "";
    setFilterStatus(val);
    fetchRequests(1, pagination.pageSize, searchText, val);
  };

  const handleRefresh = () =>
    fetchRequests(
      pagination.current,
      pagination.pageSize,
      searchText,
      filterStatus,
    );

  const refreshSelected = async () => {
    if (selected) {
      try {
        const res = await bankAccountRequestsApi.getById(selected._id);
        if (res?.data) setSelected(res.data);
      } catch {
        // ignore — list refresh below will still run
      }
    }
    fetchRequests(pagination.current, pagination.pageSize, searchText, filterStatus);
  };

  /* ── Columns ── */
  const columns = [
    {
      title: "Reference",
      key: "reference",
      width: isMobile ? 130 : 200,
      fixed: isMobile ? undefined : "left",
      render: (_, r) => {
        const ref = r.metadata?.referenceNumber ?? r._id?.slice(-8);
        const isCopied = copiedRef === r._id;
        return (
          <Tooltip title={isCopied ? "Copied!" : "Click to copy"}>
            <span
              className="text-xs font-mono flex items-center gap-1 cursor-pointer group"
              style={{ color: "var(--text-muted)" }}
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(ref ?? "");
                setCopiedRef(r._id);
                setTimeout(() => setCopiedRef(null), 1500);
              }}
            >
              {ref}
              {isCopied ? (
                <svg
                  className="shrink-0 transition-all"
                  style={{ color: "#10b981", opacity: 1 }}
                  width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg
                  className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0"
                  width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "User",
      key: "user",
      width: isMobile ? 150 : 220,
      render: (_, r) => {
        const first = r.userId?.firstName ?? "";
        const last = r.userId?.lastName ?? "";
        const fullName = `${first} ${last}`.trim() || "Unknown";
        return (
          <div className="flex items-center gap-3">
            <Avatar
              size={34}
              style={{
                background: "linear-gradient(135deg,#4f46e5,#06b6d4)",
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {initials(first, last)}
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span
                className="font-semibold text-sm truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {fullName}
              </span>
              <span
                className="text-xs truncate"
                style={{ color: "var(--text-muted)" }}
              >
                {r.userEmail}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Account Name",
      dataIndex: "accountName",
      key: "accountName",
      width: 160,
      render: (v) => (
        <span className="text-sm" style={{ color: "var(--text-primary)" }}>
          {v || "—"}
        </span>
      ),
    },
    {
      title: "Type",
      dataIndex: "accountType",
      key: "accountType",
      width: 160,
      render: (t) => (
        <Tag color="blue" style={{ borderRadius: 20 }}>
          {t?.replace(/_/g, " ") ?? "—"}
        </Tag>
      ),
    },
    {
      title: "Currency",
      dataIndex: "currency",
      key: "currency",
      width: 120,
      render: (c) => (
        <Tag color="geekblue" style={{ borderRadius: 20, fontWeight: 600 }}>
          {c ?? "—"}
        </Tag>
      ),
    },
    {
      title: "Country",
      dataIndex: "userCountryCode",
      key: "userCountryCode",
      width: 120,
      render: (code) => (
        <Tag
          color={code === "US" ? "blue" : "volcano"}
          style={{ borderRadius: 20 }}
        >
          {code ?? "—"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (s) => <StatusTag status={s} />,
    },
    {
      title: "NOAH Customer",
      key: "noahCustomer",
      width: 180,
      render: (_, r) => {
        const noah = r.noahCustomer;
        if (!noah) return <span style={{ color: "var(--text-muted)" }}>—</span>;
        const onboardColor =
          noah.onboardingStatus === "Approved"
            ? "success"
            : noah.onboardingStatus === "Rejected"
            ? "error"
            : "warning";
        return (
          <div className="flex flex-col gap-1">
            <Tag color={onboardColor} style={{ borderRadius: 20, width: "fit-content" }}>
              {noah.onboardingStatus ?? "—"}
            </Tag>
            {(noah.fiatOnboardings ?? []).map((f) => (
              <Tag
                key={f.currency}
                color={f.status === "Approved" ? "cyan" : f.status === "Rejected" ? "red" : "default"}
                style={{ borderRadius: 20, fontSize: 11, width: "fit-content" }}
              >
                {f.currency}: {f.status}
              </Tag>
            ))}
          </div>
        );
      },
    },
    {
      title: "Requested",
      dataIndex: "requestedAt",
      key: "requestedAt",
      width: 120,
      render: (d) => (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {formatDate(d)}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: isMobile ? 100 : 240,
      fixed: isMobile ? undefined : "right",
      render: (_, record) => {
        const status = record.status;
        const hasProvider = !!record.assignedProvider?.providerId;
        const submittedDocsCount = record.additionalDocuments?.filter(
          (d) => d.status === "submitted"
        ).length ?? 0;

        // Action availability per status
        const canApproveReject = ["pending", "under_review", "documents_required"].includes(status);
        const canCancel = ["pending", "under_review", "documents_required", "approved"].includes(status);
        const canRequestDocs = ["pending", "under_review", "documents_required"].includes(status);
        const canAssignProvider = status === "approved" || (status === "under_review" && !hasProvider);
        const canProcess = status === "approved" && hasProvider;

        if (isMobile) {
          const items = [
            {
              key: "view",
              label: submittedDocsCount > 0
                ? `View Details (${submittedDocsCount} doc${submittedDocsCount > 1 ? "s" : ""} pending)`
                : "View Details",
              icon: <EyeOutlined />,
            },
            ...(canRequestDocs
              ? [{ key: "docs", label: "Request Documents", icon: <FileAddOutlined /> }]
              : []),
            ...(canApproveReject || canCancel || canAssignProvider || canProcess
              ? [{ type: "divider" }]
              : []),
            ...(canApproveReject
              ? [{ key: "approve", label: "Approve", icon: <CheckOutlined /> }]
              : []),
            ...(canApproveReject
              ? [{ key: "reject", label: "Reject", icon: <CloseOutlined />, danger: true }]
              : []),
            ...(canCancel
              ? [{ key: "cancel", label: "Cancel", icon: <StopOutlined />, danger: true }]
              : []),
            ...(canAssignProvider
              ? [{ key: "assign", label: "Assign Provider", icon: <ApiOutlined /> }]
              : []),
            ...(canProcess
              ? [{ key: "process", label: "Process Request", icon: <ThunderboltOutlined /> }]
              : []),
          ];
          return (
            <Badge count={submittedDocsCount} size="small" color="#f59e0b" offset={[-2, 2]}>
              <Dropdown
                trigger={["click"]}
                menu={{
                  items,
                  onClick: ({ key, domEvent }) => {
                    domEvent.stopPropagation();
                    if (key === "view") {
                      setSelected(record);
                      setDrawerOpen(true);
                    } else if (key === "docs") {
                      openDocModal(record);
                    } else if (key === "approve") {
                      openAction("approve", record);
                    } else if (key === "reject") {
                      openAction("reject", record);
                    } else if (key === "cancel") {
                      openAction("cancel", record);
                    } else if (key === "assign") {
                      openAction("assign", record);
                    } else if (key === "process") {
                      openAction("process", record);
                    }
                  },
                }}
              >
                <Button
                  size="small"
                  icon={<MoreOutlined />}
                  onClick={(e) => e.stopPropagation()}
                />
              </Dropdown>
            </Badge>
          );
        }

        return (
          <Space size={4}>
            <Tooltip title={submittedDocsCount > 0 ? `View Details — ${submittedDocsCount} submitted doc${submittedDocsCount > 1 ? "s" : ""} pending review` : "View Details"}>
              <Badge count={submittedDocsCount} size="small" color="#f59e0b" offset={[-2, 2]}>
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(record);
                    setDrawerOpen(true);
                  }}
                />
              </Badge>
            </Tooltip>
            {canRequestDocs && (
              <Tooltip title="Request Additional Documents">
                <Button
                  size="small"
                  icon={<FileAddOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    openDocModal(record);
                  }}
                />
              </Tooltip>
            )}
            {canApproveReject && (
              <Tooltip title="Approve">
                <Button
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    openAction("approve", record);
                  }}
                />
              </Tooltip>
            )}
            {canApproveReject && (
              <Tooltip title="Reject">
                <Button
                  size="small"
                  danger
                  icon={<CloseOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    openAction("reject", record);
                  }}
                />
              </Tooltip>
            )}
            {canCancel && (
              <Tooltip title="Cancel">
                <Button
                  size="small"
                  icon={<StopOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    openAction("cancel", record);
                  }}
                />
              </Tooltip>
            )}
            {canAssignProvider && (
              <Tooltip title="Assign Service Provider">
                <Button
                  size="small"
                  icon={<ApiOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    openAction("assign", record);
                  }}
                />
              </Tooltip>
            )}
            {canProcess && (
              <Tooltip title="Process Bank Request">
                <Button
                  size="small"
                  icon={<ThunderboltOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    openAction("process", record);
                  }}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  /* ── Summary counts from API meta — never derived from table rows ── */
  const statCards = [
    {
      label: "Pending",
      count: statusCounts.pending,
      ...STATUS_CONFIG.pending,
    },
    {
      label: "Approved",
      count: statusCounts.approved,
      ...STATUS_CONFIG.approved,
    },
    {
      label: "Completed",
      count: statusCounts.completed,
      ...STATUS_CONFIG.completed,
    },
    {
      label: "Cancelled",
      count: statusCounts.cancelled,
      ...STATUS_CONFIG.cancelled,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2
            className="text-xl sm:text-2xl font-bold m-0"
            style={{ color: "var(--text-primary)" }}
          >
            Bank Account Requests
          </h2>
          <p
            className="text-sm m-0 mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            Review and manage bank account opening requests
          </p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading}
          style={{
            borderRadius: 10,
            borderColor: "var(--border-color)",
            color: "var(--text-secondary)",
            background: "var(--input-bg)",
          }}
        >
          Refresh
        </Button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map(({ label, count, hex, bg, border }) => (
          <div
            key={label}
            className="rounded-2xl p-4 flex flex-col items-center text-center"
            style={{
              background: bg(isDark),
              border: `1px solid ${border(isDark)}`,
            }}
          >
            <span
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: hex }}
            >
              {count}
            </span>
            <span className="text-xs mt-1 font-medium" style={{ color: hex }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input.Search
          placeholder="Search by email or name..."
          allowClear
          enterButton
          onSearch={handleSearch}
          onChange={(e) => !e.target.value && handleSearch("")}
          style={{ flex: 2 }}
          styles={{
            input: {
              background: "var(--input-bg)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            },
          }}
        />
        <Select
          allowClear
          placeholder="Filter by status"
          onChange={handleStatusFilter}
          style={{ flex: 1, minWidth: 160 }}
          dropdownStyle={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
          }}
        >
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <Select.Option key={key} value={key}>
              {cfg.label}
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* ── Table ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: "1px solid var(--border-color)",
          background: "var(--bg-card)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="_id"
          loading={loading}
          scroll={{ x: isMobile ? 900 : 1500 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} requests`,
            style: { padding: "12px 16px" },
          }}
          onChange={handleTableChange}
          style={{ background: "transparent" }}
          className="custom-minimal-table"
          rowClassName={() => "cursor-default"}
          onRow={(record) => ({
            onClick: () => {
              setSelected(record);
              setDrawerOpen(true);
            },
            style: { cursor: "pointer" },
          })}
        />
      </div>

      {/* ── Detail Drawer ── */}
      <DetailDrawer
        open={drawerOpen}
        record={selected}
        onClose={() => setDrawerOpen(false)}
        isDark={isDark}
        onDocChange={refreshSelected}
      />

      {/* ── Action Modals (approve / reject / cancel / assign / process) ── */}
      <ActionModal
        type={actionModal}
        open={Boolean(actionModal)}
        target={actionTarget}
        form={form}
        onOk={handleActionSubmit}
        onCancel={closeAction}
        loading={actionLoading}
        providers={providers}
        providersLoading={providersLoading}
      />

      {/* ── Request Additional Documents Modal ── */}
      <RequestDocumentsModal
        open={docModalOpen}
        target={docTarget}
        form={docForm}
        onOk={handleDocSubmit}
        onCancel={closeDocModal}
        loading={docLoading}
        isDark={isDark}
        isMobile={isMobile}
      />
    </div>
  );
};

export default BankAccountRequestsList;
