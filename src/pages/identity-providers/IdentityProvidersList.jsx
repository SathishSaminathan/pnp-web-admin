import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Select,
  Input,
  Tooltip,
  Dropdown,
  Form,
  Badge,
  Modal,
  Switch,
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  KeyOutlined,
  HeartOutlined,
  MoreOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { identityProvidersApi } from "../../api/modules/identityProviders";
import { useTheme } from "../../context/ThemeContext";
import {
  HEALTH_STATUS_CONFIG,
  ENVIRONMENT_CONFIG,
  ENVIRONMENT_OPTIONS,
  MODAL_STYLES,
} from "../../constants/identityProviders";
import { resolveMetaCounts } from "../../utils/resolveMetaCounts";
import HealthTag from "./HealthTag";
import DetailDrawer from "./DetailDrawer";
import ProviderFormModal from "./ProviderFormModal";
import HealthModal from "./HealthModal";
import RotateKeyModal from "./RotateKeyModal";
import { useNotify } from "../../hooks/useNotify";

/* ── Helpers ── */
const normalizePayload = (values) => {
  // Convert templateEntries array → object
  const templateId = {};
  (values.templateEntries ?? []).forEach(({ region, templateId: tid }) => {
    if (region) templateId[region] = tid ?? "";
  });
  // Normalize notSupportedCountries — filter out empty codes
  const notSupportedCountries = (values.notSupportedCountries ?? [])
    .filter((c) => c.code)
    .map((c) => ({ code: c.code.toUpperCase(), reason: c.reason ?? "" }));
  const payload = {
    name: values.name,
    environment: values.environment,
    isUSProvider: values.isUSProvider ?? false,
    isNonUSProvider: values.isNonUSProvider ?? false,
    priorityUS: values.priorityUS ?? 1,
    priorityNonUS: values.priorityNonUS ?? 1,
    isActive: values.isActive ?? true,
    templateId,
    notSupportedCountries,
  };
  if (values.apiKey) payload.apiKey = values.apiKey;
  return payload;
};

/* ─── Stable default for identity provider counts ─── */
const PROVIDER_COUNT_DEFAULTS = { totalProviders: 0, active: 0, healthy: 0, unhealthy: 0 };

/* ─── MAIN PAGE ─────────────────────────────────────────────────────────── */
const IdentityProvidersList = () => {
  const { isDark } = useTheme();
  const notify = useNotify();

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [providerCounts, setProviderCounts] = useState(PROVIDER_COUNT_DEFAULTS);

  /* ── Filters ── */
  const [filterActive, setFilterActive] = useState("");
  const [filterEnv, setFilterEnv] = useState("");
  const [filterCountry, setFilterCountry] = useState("");

  /* ── Detail drawer ── */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  /* ── Create / Edit modal ── */
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = create mode
  const [formLoading, setFormLoading] = useState(false);
  const [form] = Form.useForm();

  /* ── Health modal ── */
  const [healthOpen, setHealthOpen] = useState(false);
  const [healthTarget, setHealthTarget] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [healthForm] = Form.useForm();

  /* ── Rotate key modal ── */
  const [rotateOpen, setRotateOpen] = useState(false);
  const [rotateTarget, setRotateTarget] = useState(null);
  const [rotateLoading, setRotateLoading] = useState(false);
  const [rotateForm] = Form.useForm();

  /* ── Fetch ── */
  const fetchProviders = useCallback(
    async (page = 1, limit = 20, env = filterEnv, active = filterActive, country = filterCountry) => {
      setLoading(true);
      try {
        const params = { page, limit };
        if (env) params.environment = env;
        if (active !== "") params.isActive = active;
        if (country) params.country = country;
        const res = await identityProvidersApi.getAll(params);
        const data = res.data ?? res ?? [];
        setProviders(Array.isArray(data) ? data : data.data ?? []);
        setProviderCounts(resolveMetaCounts(res?.meta?.counts, PROVIDER_COUNT_DEFAULTS));
        if (res.meta?.pagination) {
          setPagination({
            current: res.meta.pagination.currentPage,
            pageSize: res.meta.pagination.limit,
            total: res.meta.pagination.totalRecords,
          });
        } else {
          setPagination((p) => ({ ...p, current: page, pageSize: limit, total: Array.isArray(data) ? data.length : data.data?.length ?? 0 }));
        }
      } catch {
        // axios interceptor handles toast
      } finally {
        setLoading(false);
      }
    },
    [filterEnv, filterActive, filterCountry]
  );

  useEffect(() => {
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => fetchProviders(pagination.current, pagination.pageSize);
  const handleTableChange = (p) => fetchProviders(p.current, p.pageSize);

  /* ── Create / Edit ── */
  const openCreate = () => {
    setEditTarget(null);
    form.resetFields();
    setFormOpen(true);
  };

  const openEdit = (record) => {
    setEditTarget(record);
    setFormOpen(true);
  };

  const handleFormSubmit = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    setFormLoading(true);
    try {
      const payload = normalizePayload(values);
      if (editTarget) {
        await identityProvidersApi.update(editTarget._id, payload);
        notify.success("Provider updated successfully");
      } else {
        await identityProvidersApi.create(payload);
        notify.success("Provider created successfully");
      }
      setFormOpen(false);
      fetchProviders(pagination.current, pagination.pageSize);
    } catch {
      // axios interceptor handles toast
    } finally {
      setFormLoading(false);
    }
  };

  /* ── Health ── */
  const openHealth = (record) => {
    setHealthTarget(record);
    setHealthOpen(true);
  };

  const handleHealthSubmit = async () => {
    let values;
    try {
      values = await healthForm.validateFields();
    } catch {
      return;
    }
    setHealthLoading(true);
    try {
      await identityProvidersApi.updateHealth(healthTarget._id, values);
      notify.success("Health status updated");
      setHealthOpen(false);
      fetchProviders(pagination.current, pagination.pageSize);
    } catch {
      // axios interceptor handles toast
    } finally {
      setHealthLoading(false);
    }
  };

  /* ── Rotate Key ── */
  const openRotate = (record) => {
    setRotateTarget(record);
    rotateForm.resetFields();
    setRotateOpen(true);
  };

  const handleRotateSubmit = async () => {
    let values;
    try {
      values = await rotateForm.validateFields();
    } catch {
      return;
    }
    setRotateLoading(true);
    try {
      await identityProvidersApi.rotateApiKey(rotateTarget._id, values.apiKey);
      notify.success("API key rotated successfully");
      setRotateOpen(false);
      fetchProviders(pagination.current, pagination.pageSize);
    } catch {
      // axios interceptor handles toast
    } finally {
      setRotateLoading(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete Provider",
      icon: <ExclamationCircleFilled style={{ color: "#ef4444" }} />,
      content: (
        <span>
          Are you sure you want to soft-delete{" "}
          <strong>{record.name}</strong>? This action can be reversed.
        </span>
      ),
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      styles: MODAL_STYLES,
      onOk: async () => {
        try {
          await identityProvidersApi.delete(record._id);
          notify.success("Provider deleted", "The provider has been removed");
          fetchProviders(pagination.current, pagination.pageSize);
        } catch {
          // axios interceptor handles toast
        }
      },
    });
  };

  /* ── Summary counts from API meta — never derived from table rows ── */
  const statCards = [
    {
      label: "Total Providers",
      count: providerCounts.totalProviders,
      hex: "#4f46e5",
      bg: (d) => (d ? "rgba(79,70,229,0.12)" : "#eef2ff"),
      border: (d) => (d ? "rgba(79,70,229,0.3)" : "#c7d2fe"),
    },
    {
      label: "Active",
      count: providerCounts.active,
      hex: "#10b981",
      bg: (d) => (d ? "rgba(16,185,129,0.12)" : "#f0fdf4"),
      border: (d) => (d ? "rgba(16,185,129,0.3)" : "#d1fae5"),
    },
    {
      label: "Healthy",
      count: providerCounts.healthy,
      hex: "#10b981",
      bg: (d) => (d ? "rgba(16,185,129,0.10)" : "#f0fdf4"),
      border: (d) => (d ? "rgba(16,185,129,0.25)" : "#bbf7d0"),
    },
    {
      label: "Degraded / Unhealthy",
      count: providerCounts.unhealthy,
      hex: "#ef4444",
      bg: (d) => (d ? "rgba(239,68,68,0.12)" : "#fef2f2"),
      border: (d) => (d ? "rgba(239,68,68,0.3)" : "#fee2e2"),
    },
  ];

  /* ── Columns ── */
  const columns = [
    {
      title: "Provider",
      key: "provider",
      width: isMobile ? 140 : 200,
      fixed: isMobile ? undefined : "left",
      render: (_, r) => (
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: "linear-gradient(135deg,#4f46e5,#06b6d4)" }}
          >
            {(r.name ?? "?")[0]?.toUpperCase()}
          </div>
          <span className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
            {r.name}
          </span>
        </div>
      ),
    },
    {
      title: "Environment",
      dataIndex: "environment",
      key: "environment",
      width: 130,
      render: (env) => {
        const cfg = ENVIRONMENT_CONFIG[env] ?? ENVIRONMENT_CONFIG.sandbox;
        return <Tag color={cfg.color} style={{ borderRadius: 20 }}>{cfg.label}</Tag>;
      },
    },
    {
      title: "Health",
      key: "health",
      width: 120,
      render: (_, r) => <HealthTag status={r.health?.status} />,
    },
    {
      title: "Coverage",
      key: "coverage",
      width: 140,
      render: (_, r) => (
        <Space size={4}>
          {r.isUSProvider && <Tag color="blue" style={{ borderRadius: 20, fontSize: 11 }}>US</Tag>}
          {r.isNonUSProvider && <Tag color="geekblue" style={{ borderRadius: 20, fontSize: 11 }}>Non-US</Tag>}
          {!r.isUSProvider && !r.isNonUSProvider && <span style={{ color: "var(--text-muted)", fontSize: 12 }}>None</span>}
        </Space>
      ),
    },
    {
      title: "Priority",
      key: "priority",
      width: 110,
      render: (_, r) => (
        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
          {r.isUSProvider && <div>US: <strong style={{ color: "var(--text-primary)" }}>{r.priorityUS}</strong></div>}
          {r.isNonUSProvider && <div>Non-US: <strong style={{ color: "var(--text-primary)" }}>{r.priorityNonUS}</strong></div>}
        </div>
      ),
    },
    {
      title: "API Key",
      key: "apiKey",
      width: 160,
      render: (_, r) => (
        <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          {r.apiKeyMasked ?? "***hidden***"}
        </span>
      ),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      width: 80,
      render: (v) => (
        <Tag color={v ? "success" : "default"} style={{ borderRadius: 20 }}>
          {v ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: isMobile ? 60 : 200,
      fixed: isMobile ? undefined : "right",
      render: (_, record) => {
        if (isMobile) {
          const items = [
            { key: "view", label: "View Details", icon: <EyeOutlined /> },
            { key: "edit", label: "Edit", icon: <EditOutlined /> },
            { key: "health", label: "Update Health", icon: <HeartOutlined /> },
            { key: "rotate", label: "Rotate API Key", icon: <KeyOutlined /> },
            { type: "divider" },
            { key: "delete", label: "Delete", icon: <DeleteOutlined />, danger: true },
          ];
          return (
            <Dropdown
              trigger={["click"]}
              menu={{
                items,
                onClick: ({ key, domEvent }) => {
                  domEvent.stopPropagation();
                  if (key === "view") { setSelected(record); setDrawerOpen(true); }
                  else if (key === "edit") openEdit(record);
                  else if (key === "health") openHealth(record);
                  else if (key === "rotate") openRotate(record);
                  else if (key === "delete") handleDelete(record);
                },
              }}
            >
              <Button
                size="small"
                icon={<MoreOutlined />}
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          );
        }

        return (
          <Space size={4}>
            <Tooltip title="View Details">
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={(e) => { e.stopPropagation(); setSelected(record); setDrawerOpen(true); }}
              />
            </Tooltip>
            <Tooltip title="Edit Provider">
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={(e) => { e.stopPropagation(); openEdit(record); }}
              />
            </Tooltip>
            <Tooltip title="Update Health">
              <Button
                size="small"
                icon={<HeartOutlined />}
                onClick={(e) => { e.stopPropagation(); openHealth(record); }}
              />
            </Tooltip>
            <Tooltip title="Rotate API Key">
              <Button
                size="small"
                icon={<KeyOutlined />}
                onClick={(e) => { e.stopPropagation(); openRotate(record); }}
              />
            </Tooltip>
            <Tooltip title="Delete Provider">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => { e.stopPropagation(); handleDelete(record); }}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2
            className="text-xl sm:text-2xl font-bold m-0 flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <SafetyCertificateOutlined style={{ color: "#4f46e5" }} />
            Identity Verification Providers
          </h2>
          <p className="text-sm m-0 mt-0.5" style={{ color: "var(--text-muted)" }}>
            Manage KYC and identity verification service providers
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
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
            {!isMobile && "Refresh"}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreate}
            style={{ borderRadius: 10, background: "#4f46e5", borderColor: "#4f46e5" }}
          >
            {!isMobile && "Add Provider"}
          </Button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map(({ label, count, hex, bg, border }) => (
          <div
            key={label}
            className="rounded-2xl p-4 flex flex-col items-center text-center"
            style={{ background: bg(isDark), border: `1px solid ${border(isDark)}` }}
          >
            <span className="text-2xl sm:text-3xl font-bold" style={{ color: hex }}>{count}</span>
            <span className="text-xs mt-1 font-medium" style={{ color: hex }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          allowClear
          placeholder="Environment"
          options={ENVIRONMENT_OPTIONS}
          onChange={(v) => {
            const val = v ?? "";
            setFilterEnv(val);
            fetchProviders(1, pagination.pageSize, val, filterActive, filterCountry);
          }}
          style={{ flex: 1, minWidth: 150 }}
          dropdownStyle={{ background: "var(--bg-card)" }}
        />
        <Select
          allowClear
          placeholder="Active status"
          onChange={(v) => {
            const val = v ?? "";
            setFilterActive(val);
            fetchProviders(1, pagination.pageSize, filterEnv, val, filterCountry);
          }}
          style={{ flex: 1, minWidth: 150 }}
          dropdownStyle={{ background: "var(--bg-card)" }}
        >
          <Select.Option value="true">Active</Select.Option>
          <Select.Option value="false">Inactive</Select.Option>
        </Select>
        <Input
          allowClear
          placeholder="Filter by country code (e.g. US)"
          style={{
            flex: 1,
            minWidth: 180,
            background: "var(--input-bg)",
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
          }}
          onChange={(e) => {
            const val = e.target.value.trim().toUpperCase();
            setFilterCountry(val);
            if (!val || val.length >= 2) {
              fetchProviders(1, pagination.pageSize, filterEnv, filterActive, val);
            }
          }}
          onPressEnter={(e) => {
            const val = e.target.value.trim().toUpperCase();
            fetchProviders(1, pagination.pageSize, filterEnv, filterActive, val);
          }}
        />
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
          dataSource={providers}
          rowKey="_id"
          loading={loading}
          scroll={{ x: isMobile ? 600 : 1100 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} providers`,
            style: { padding: "12px 16px" },
          }}
          onChange={handleTableChange}
          style={{ background: "transparent" }}
          className="custom-minimal-table"
          onRow={(record) => ({
            onClick: () => { setSelected(record); setDrawerOpen(true); },
            style: { cursor: "pointer" },
          })}
        />
      </div>

      {/* ── Detail Drawer ── */}
      <DetailDrawer
        open={drawerOpen}
        provider={selected}
        onClose={() => setDrawerOpen(false)}
        isDark={isDark}
      />

      {/* ── Create / Edit Modal ── */}
      <ProviderFormModal
        open={formOpen}
        provider={editTarget}
        form={form}
        onOk={handleFormSubmit}
        onCancel={() => { setFormOpen(false); setEditTarget(null); form.resetFields(); }}
        loading={formLoading}
      />

      {/* ── Health Modal ── */}
      <HealthModal
        open={healthOpen}
        provider={healthTarget}
        form={healthForm}
        onOk={handleHealthSubmit}
        onCancel={() => { setHealthOpen(false); setHealthTarget(null); healthForm.resetFields(); }}
        loading={healthLoading}
      />

      {/* ── Rotate Key Modal ── */}
      <RotateKeyModal
        open={rotateOpen}
        provider={rotateTarget}
        form={rotateForm}
        onOk={handleRotateSubmit}
        onCancel={() => { setRotateOpen(false); setRotateTarget(null); rotateForm.resetFields(); }}
        loading={rotateLoading}
      />
    </div>
  );
};

export default IdentityProvidersList;
