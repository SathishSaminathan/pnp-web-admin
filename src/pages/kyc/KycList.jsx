import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useServerTable } from "../../hooks/useServerTable";
import { useMetaCounts } from "../../hooks/useMetaCounts";
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
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
  GlobalOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { kycApi } from "../../api/modules/kyc";
import { useTheme } from "../../context/ThemeContext";
import { kycStatusTag, KycDetailDrawer } from "./components";

const { Option } = Select;

/* ─── Stable default for KYC status counts (defined outside component) ─── */
const KYC_COUNT_DEFAULTS = { approved: 0, rejected: 0, pending: 0 };

/* ─── MAIN KYC LIST PAGE ─────────────────────────────────────────────────── */
const KycList = () => {
  const { isDark } = useTheme();
  const navigate   = useNavigate();

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  /* ── API function: normalises the KYC merchant response for useServerTable ── */
  const kycApiFn = useCallback(async (params, signal) => {
    const response = await kycApi.getAllMerchantsKyc(
      { ...params, isOnBoardCompleted: true },
      { signal },
    );
    if (!response?.success) return { data: [], meta: { pagination: null } };
    return response;
  }, []);

  const {
    query,
    data,
    serverPagination,
    responseMeta,
    loading,
    updateFilters,
    updatePage,
    refresh,
  } = useServerTable(kycApiFn, {
    page: 1,
    limit: 10,
    search: "",
    kycStatus: "",
    accountType: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  /* ── Debounced search ── */
  const searchTimerRef = useRef(null);
  useEffect(
    () => () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); },
    [],
  );

  const handleSearch = useCallback(
    (value) => updateFilters({ search: (value ?? "").trim() }),
    [updateFilters],
  );

  const handleSearchDebounced = useCallback(
    (value) => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => handleSearch(value), 400);
    },
    [handleSearch],
  );

  /**
   * Unified table change handler — called by Ant Design for pagination,
   * page-size, and column-sort interactions.
   */
  const handleTableChange = useCallback(
    (p, _filters, sorter) => {
      const newSortBy = sorter?.field || "createdAt";
      const newSortOrder =
        sorter?.order === "ascend"
          ? "asc"
          : sorter?.order === "descend"
          ? "desc"
          : "desc"; // revert to default when sort is cleared

      const sortChanged =
        newSortBy !== query.sortBy || newSortOrder !== query.sortOrder;

      if (sortChanged) {
        /* Sort changed → reset page to 1, carry new limit */
        updateFilters({
          sortBy: newSortBy,
          sortOrder: newSortOrder,
          limit: Math.max(1, p.pageSize),
        });
      } else {
        /* Only pagination changed → keep filters, update page/limit */
        updatePage(Math.max(1, p.current), p.pageSize);
      }
    },
    [query.sortBy, query.sortOrder, updateFilters, updatePage],
  );

  const handleFilterKycStatus = useCallback(
    (v) => updateFilters({ kycStatus: v ?? "" }),
    [updateFilters],
  );
  const handleFilterAccountType = useCallback(
    (v) => updateFilters({ accountType: v ?? "" }),
    [updateFilters],
  );

  const handleView = (record) => {
    setSelected(record);
    setDrawerOpen(true);
  };
  const handleUpdateClick = () => {
    if (selected?._id) navigate(`/kyc/${selected._id}`);
  };

  /* ── Summary counts from API meta — never derived from table rows ── */
  const kycCounts = useMetaCounts(responseMeta?.kycStatusCounts, KYC_COUNT_DEFAULTS);

  /* ── Table columns ── */
  const columns = [
    {
      title: "Merchant",
      key: "merchant",
      fixed: isMobile ? undefined : "left",
      width: isMobile ? 160 : 220,
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={36}
            style={{
              background: "linear-gradient(135deg,#4f46e5,#06b6d4)",
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {(r.fullName || "?")
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase()}
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span
              className="font-semibold text-sm truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {r.fullName || "N/A"}
            </span>
            <span
              className="text-xs truncate"
              style={{ color: "var(--text-muted)" }}
            >
              {r.emailId}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Account Type",
      dataIndex: "accountType",
      key: "accountType",
      width: 140,
      render: (t) => (
        <Tag
          color={
            t === "Business" ? "blue" : t === "Freelance" ? "purple" : "default"
          }
          style={{ borderRadius: 20 }}
        >
          {t || "Individual"}
        </Tag>
      ),
    },
    {
      title: "Citizenship",
      key: "citizenship",
      width: 120,
      render: (_, r) => {
        const code = r.citizenship || r.citizenshipCode;
        if (!code) return <span style={{ color: "var(--text-muted)" }}>—</span>;
        return (
          <Tag
            icon={<GlobalOutlined />}
            color={code === "US" ? "geekblue" : "volcano"}
            style={{ borderRadius: 20 }}
          >
            {code}
          </Tag>
        );
      },
    },
    {
      title: "KYC Status",
      dataIndex: "kycPersonalStatus",
      key: "kycPersonalStatus",
      width: isMobile ? 110 : 130,
      sorter: true,
      sortOrder:
        query.sortBy === "kycPersonalStatus"
          ? query.sortOrder === "asc"
            ? "asc"
            : "desc"
          : null,
      render: (status) => kycStatusTag(status),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 110,
      sorter: true,
      sortOrder:
        query.sortBy === "createdAt"
          ? query.sortOrder === "asc"
            ? "asc"
            : "desc"
          : null,
      render: (d) => (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {new Date(d).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: isMobile ? 100 : 100,
      fixed: isMobile ? undefined : "right",
      render: (_, record) =>
        isMobile ? (
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                { key: "view", label: "View KYC Details", icon: <EyeOutlined /> },
                {
                  key: "update",
                  label: "Update KYC Status",
                  icon: <EditOutlined />,
                },
              ],
              onClick: ({ key, domEvent }) => {
                domEvent.stopPropagation();
                if (key === "view") handleView(record);
                else if (key === "update") navigate(`/kyc/${record._id}`);
              },
            }}
          >
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        ) : (
          <Space size="small">
            <Tooltip title="View KYC Details">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handleView(record)}
                style={{ color: "var(--text-secondary)" }}
              />
            </Tooltip>
            <Tooltip title="Update KYC Status">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => navigate(`/kyc/${record._id}`)}
                style={{ color: "#60a5fa" }}
              />
            </Tooltip>
          </Space>
        ),
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
            KYC Management
          </h2>
          <p
            className="text-sm m-0 mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            Review and update KYC verification status for all merchants
          </p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={refresh}
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
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          {
            label: "Pending Review",
            count: kycCounts.pending,
            color: "#f59e0b",
            bg: isDark ? "rgba(245,158,11,0.1)" : "#fffbeb",
            border: isDark ? "rgba(245,158,11,0.25)" : "#fef3c7",
          },
          {
            label: "Verified",
            count: kycCounts.approved,
            color: "#10b981",
            bg: isDark ? "rgba(16,185,129,0.1)" : "#f0fdf4",
            border: isDark ? "rgba(16,185,129,0.25)" : "#d1fae5",
          },
          {
            label: "Rejected",
            count: kycCounts.rejected,
            color: "#ef4444",
            bg: isDark ? "rgba(239,68,68,0.1)" : "#fef2f2",
            border: isDark ? "rgba(239,68,68,0.25)" : "#fee2e2",
          },
        ].map(({ label, count, color, bg, border }) => (
          <div
            key={label}
            className="rounded-2xl p-4 flex flex-col items-center text-center"
            style={{ background: bg, border: `1px solid ${border}` }}
          >
            <span className="text-2xl sm:text-3xl font-bold" style={{ color }}>
              {count}
            </span>
            <span className="text-xs mt-1 font-medium" style={{ color }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input.Search
          placeholder="Search by name or email..."
          allowClear
          enterButton
          onSearch={handleSearch}
          onChange={(e) => {
            if (!e.target.value) handleSearch("");
            else handleSearchDebounced(e.target.value);
          }}
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
          placeholder="KYC Status"
          allowClear
          onChange={handleFilterKycStatus}
          style={{ flex: 1, minWidth: 130 }}
        >
          <Option value="Approved">✅ Approved</Option>
          <Option value="Pending">⏳ Pending</Option>
          <Option value="Rejected">❌ Rejected</Option>
        </Select>
        <Select
          placeholder="Account Type"
          allowClear
          onChange={handleFilterAccountType}
          style={{ flex: 1, minWidth: 140 }}
        >
          <Option value="Individual">Individual</Option>
          <Option value="Freelance">Freelance</Option>
          <Option value="Business">Business</Option>
        </Select>
      </div>

      {/* ── Table ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="_id"
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: query.page,
            pageSize: query.limit,
            total: serverPagination?.totalRecords ?? 0,
            showSizeChanger: true,
          }}
          className="custom-minimal-table"
          scroll={{ x: isMobile ? 900 : 1150 }}
          sticky
        />
      </div>

      {/* ── KYC Details Drawer ── */}
      <KycDetailDrawer
        open={drawerOpen}
        merchant={selected}
        onClose={() => setDrawerOpen(false)}
        onUpdateClick={handleUpdateClick}
        isDark={isDark}
      />
    </div>
  );
};

export default KycList;
