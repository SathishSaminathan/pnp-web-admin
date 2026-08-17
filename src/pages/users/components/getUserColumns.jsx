import React from "react";
import { Tag, Button, Space, Tooltip, Popconfirm, Dropdown, Modal } from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  MoreOutlined,
} from "@ant-design/icons";

const STATUS_COLOR = {
  phoneVerified: "blue",
  phoneNotVerified: "red",
  personalDetailsUpdated: "green",
};

const STATUS_LABEL = {
  phoneVerified: "Phone Verified",
  phoneNotVerified: "Unverified",
  personalDetailsUpdated: "Details Updated",
};

const getUserColumns = ({ isMobile, onView, onDelete }) => [
  {
    title: "Name",
    key: "name",
    fixed: isMobile ? undefined : "left",
    width: 180,
    render: (_, r) => (
      <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
        {[r.firstName, r.lastName].filter(Boolean).join(" ") || "N/A"}
      </span>
    ),
  },
  {
    title: "Contact Info",
    key: "contact",
    width: 220,
    render: (_, r) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-sm" style={{ color: "var(--text-primary)" }}>
          {r.email || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No email</span>}
        </span>
        {r.phone?.number && (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {r.phone.countryCode} {r.phone.number}
          </span>
        )}
      </div>
    ),
  },
  {
    title: "Role",
    dataIndex: "role",
    key: "role",
    width: 110,
    render: (v) => (
      <Tag color="purple" style={{ borderRadius: 20, textTransform: "capitalize" }}>
        {v || "—"}
      </Tag>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 170,
    render: (v) => (
      <Tag color={STATUS_COLOR[v] ?? "default"} style={{ borderRadius: 20 }}>
        {STATUS_LABEL[v] ?? v ?? "Unknown"}
      </Tag>
    ),
  },
  {
    title: "Country",
    key: "country",
    width: 100,
    render: (_, r) => {
      const country = r.address?.country;
      return country ? (
        <Tag style={{ borderRadius: 20, fontWeight: 600 }}>{country}</Tag>
      ) : (
        <span style={{ color: "var(--text-muted)" }}>—</span>
      );
    },
  },
  {
    title: "Documents",
    key: "documents",
    width: 120,
    render: (_, r) => {
      const count = r.documents?.length ?? 0;
      return (
        <Tag color={count > 0 ? "gold" : "default"} style={{ borderRadius: 20 }}>
          {count > 0 ? `${count} doc${count > 1 ? "s" : ""}` : "None"}
        </Tag>
      );
    },
  },
  {
    title: "Joined",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 110,
    render: (d) => (
      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {new Date(d).toLocaleDateString()}
      </span>
    ),
  },
  {
    title: "Actions",
    key: "actions",
    width: 110,
    fixed: isMobile ? undefined : "right",
    render: (_, record) =>
      isMobile ? (
        <Dropdown
          trigger={["click"]}
          menu={{
            items: [
              { key: "view", label: "View Details", icon: <EyeOutlined /> },
              { type: "divider" },
              { key: "delete", label: "Delete", icon: <DeleteOutlined />, danger: true },
            ],
            onClick: ({ key, domEvent }) => {
              domEvent.stopPropagation();
              if (key === "view") onView(record);
              else if (key === "delete") {
                Modal.confirm({
                  title: "Delete user",
                  content: "Are you sure you want to delete this user?",
                  okText: "Yes",
                  okButtonProps: { danger: true },
                  cancelText: "No",
                  onOk: onDelete,
                });
              }
            },
          }}
        >
          <Button size="small" icon={<MoreOutlined />} />
        </Dropdown>
      ) : (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
              style={{ color: "var(--text-secondary)" }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete user"
              description="Are you sure you want to delete this user?"
              onConfirm={onDelete}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
  },
];

export default getUserColumns;
