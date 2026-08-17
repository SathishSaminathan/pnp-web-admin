import React from "react";
import { Tag } from "antd";
import { HEALTH_STATUS_CONFIG } from "../../constants/identityProviders";

const HealthTag = ({ status }) => {
  const cfg = HEALTH_STATUS_CONFIG[status] ?? HEALTH_STATUS_CONFIG.unknown;
  return (
    <Tag
      color={cfg.color}
      icon={<cfg.icon />}
      style={{ borderRadius: 20, fontWeight: 500 }}
    >
      {cfg.label}
    </Tag>
  );
};

export default HealthTag;
