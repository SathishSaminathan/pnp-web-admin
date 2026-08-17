import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAccountTypes,
  selectAccountTypeTabs,
  selectAccountTypesLoading,
} from "../../store/slices/accountTypesSlice";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Drawer,
  Tabs,
  message,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { merchantsApi } from "../../api/modules/merchants";
import { usersApi } from "../../api/modules/users";
import UserDrawerContent from "./components/UserDrawerContent";
import UserFilters from "./components/UserFilters";
import getUserColumns from "./components/getUserColumns";

const INITIAL_FILTERS = { isActive: "", kycStatus: "", isVerified: "", country: "", isOnline: "", lastSeenStart: "", lastSeenEnd: "" };

const UsersList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── Account type tabs (Redux) ──
  const dispatch = useDispatch();
  const tabs = useSelector(selectAccountTypeTabs);
  const tabsLoading = useSelector(selectAccountTypesLoading);
  // useEffect(() => { dispatch(fetchAccountTypes()); }, [dispatch]);

  const rawTab = searchParams.get("tab");
  const activeTabId = rawTab || "all";

  // ── State ──
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [countryInput, setCountryInput] = useState("");
  const countryDebounceRef = useRef(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isViewDrawerVisible, setIsViewDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();

  // ── Data ──
  const fetchUsers = async (
    page = 1,
    limit = 10,
    search = "",
    tabId = activeTabId,
    activeFilters = filters,
  ) => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (tabId && tabId !== "all") params.accountType = tabId;
      if (activeFilters.isActive !== "") params.isActive = activeFilters.isActive;
      if (activeFilters.kycStatus) params.kycStatus = activeFilters.kycStatus;
      if (activeFilters.isVerified !== "") params.isVerified = activeFilters.isVerified;
      if (activeFilters.country) params.country = activeFilters.country;
      if (activeFilters.isOnline !== "") params.isOnline = activeFilters.isOnline;
      if (activeFilters.lastSeenStart) params.lastSeenStart = activeFilters.lastSeenStart;
      if (activeFilters.lastSeenEnd) params.lastSeenEnd = activeFilters.lastSeenEnd;

      const response = await usersApi.getAllUsers(params);
      if (response.status) {
        setUsers(response.data?.data ?? []);
        const total = response.data?.totalCount ?? 0;
        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize: limit,
          total,
        }));
      } else {
        message.error(response.message || "Failed to load users");
      }
    } catch (err) {
      if (!err?.handled) message.error("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, pagination.pageSize, searchText, activeTabId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabId]);

  // ── Handlers ──
  const handleTableChange = (p) => fetchUsers(p.current, p.pageSize, searchText, activeTabId);

  const handleSearch = (v) => {
    const trimmed = v.trim();
    setSearchText(trimmed);
    fetchUsers(1, pagination.pageSize, trimmed, activeTabId);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchUsers(1, pagination.pageSize, searchText, activeTabId, newFilters);
  };

  const handleCountryInputChange = (val) => {
    setCountryInput(val);
    clearTimeout(countryDebounceRef.current);
    countryDebounceRef.current = setTimeout(() => {
      handleFilterChange("country", val);
    }, 500);
  };

  const handleLastSeenChange = (dates) => {
    const newFilters = {
      ...filters,
      lastSeenStart: dates ? dates[0].startOf("day").toISOString() : "",
      lastSeenEnd: dates ? dates[1].endOf("day").toISOString() : "",
    };
    setFilters(newFilters);
    fetchUsers(1, pagination.pageSize, searchText, activeTabId, newFilters);
  };

  const handleClearFilters = () => {
    clearTimeout(countryDebounceRef.current);
    setCountryInput("");
    setFilters(INITIAL_FILTERS);
    fetchUsers(1, pagination.pageSize, searchText, activeTabId, INITIAL_FILTERS);
  };

  const handleTabChange = (tabId) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tabId === "all") next.delete("tab");
      else next.set("tab", tabId);
      return next;
    });
  };

  const handleDelete = () => message.info("Delete functionality pending API integration.");

  const handleAddSubmit = () => {
    message.info("Add functionality pending API integration.");
    setIsAddModalVisible(false);
    form.resetFields();
  };

  const handleDocumentStatusChange = async () => {
    if (!selectedUser?._id) return;
    try {
      const res = await usersApi.getUserById(selectedUser._id);
      if (res.status !== false) {
        setSelectedUser(res.data?.data ?? res.data ?? selectedUser);
      }
    } catch (_) {
      // silently ignore — the message was already shown by the drawer
    }
  };

  const hasActiveFilters =
    Object.values(filters).some((v) => v !== "") ||
    countryInput !== "";

  const columns = getUserColumns({
    isMobile,
    onView: (record) => { setSelectedUser(record); setIsViewDrawerVisible(true); },
    onDelete: handleDelete,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2
            className="text-xl sm:text-2xl font-bold m-0"
            style={{ color: "var(--text-primary)" }}
          >
            Users
          </h2>
          <p className="text-sm m-0 mt-0.5" style={{ color: "var(--text-muted)" }}>
            Manage and review all registered users
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Input.Search
            placeholder="Search users..."
            allowClear
            enterButton
            onSearch={handleSearch}
            onChange={(e) => !e.target.value && handleSearch("")}
            style={{ flex: 1, minWidth: 220 }}
            styles={{
              input: {
                background: "var(--input-bg)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              },
            }}
          />
        </div>
      </div>

      {/* Filters */}
      <UserFilters
        filters={filters}
        countryInput={countryInput}
        onCountryInputChange={handleCountryInputChange}
        hasActiveFilters={hasActiveFilters}
        loading={loading}
        total={pagination.total}
        onFilterChange={handleFilterChange}
        onLastSeenChange={handleLastSeenChange}
        onClearFilters={handleClearFilters}
      />

      {/* Account Type Tabs */}
      <Tabs
        activeKey={activeTabId}
        onChange={handleTabChange}
        items={tabs}
        loading={tabsLoading}
        style={{ marginBottom: 0 }}
      />

      {/* Table */}
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
          dataSource={users}
          rowKey="_id"
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
          }}
          className="custom-minimal-table"
          scroll={{ x: 1700 }}
          sticky
        />
      </div>

      {/* Add User Modal */}
      <Modal
        title={<span style={{ color: "var(--text-primary)" }}>Add New User</span>}
        open={isAddModalVisible}
        onCancel={() => { setIsAddModalVisible(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Create User"
        styles={{
          content: {
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: 16,
          },
          header: { background: "transparent", borderColor: "var(--border-color)" },
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleAddSubmit} className="mt-4">
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: "Please enter full name" }]}
          >
            <Input placeholder="Enter full name" style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="accountType" label="Account Type" rules={[{ required: true }]}>
            <Select placeholder="Select account type">
              <Select.Option value="Individual">Individual</Select.Option>
              <Select.Option value="Freelance">Freelance</Select.Option>
              <Select.Option value="Business">Business</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="countryCode" label="Country Code" rules={[{ required: true }]}>
            <Input placeholder="e.g. 1, 91, 44" style={{ borderRadius: 10 }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* View User Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <UserOutlined style={{ color: "#fff", fontSize: 14 }} />
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                User Profile
              </div>
              <div className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>
                Full account details
              </div>
            </div>
          </div>
        }
        placement="right"
        onClose={() => setIsViewDrawerVisible(false)}
        open={isViewDrawerVisible}
        width={Math.min(460, typeof window !== "undefined" ? window.innerWidth : 460)}
        styles={{
          wrapper: { boxShadow: "-8px 0 40px rgba(0,0,0,0.3)" },
          header: {
            background: "var(--bg-card)",
            borderBottom: "1px solid var(--border-color)",
            padding: "16px 24px",
          },
          body: { background: "var(--bg-card)", padding: "24px" },
          mask: { backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.4)" },
        }}
      >
        <UserDrawerContent user={selectedUser} onDocumentStatusChange={handleDocumentStatusChange} />
      </Drawer>
    </div>
  );
};

export default UsersList;
