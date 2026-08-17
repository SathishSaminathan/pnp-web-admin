import React from "react";
import { Tag } from "antd";
import { STATUS_CONFIG } from "../../constants/bankAccountRequests";

const StatusTag = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? {
    color: "default",
    icon: null,
    label: status ?? "—",
  };
  return (
    <Tag
      color={cfg.color}
      icon={cfg.icon}
      style={{ borderRadius: 20, fontWeight: 500 }}
    >
      {cfg.label}
    </Tag>
  );
};

export default StatusTag;
