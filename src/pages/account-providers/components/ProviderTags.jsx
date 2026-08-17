import React from 'react';
import { Tag } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    MinusCircleOutlined,
    QuestionCircleOutlined,
} from '@ant-design/icons';
import { HEALTH_STATUS, HEALTH_STATUS_CONFIG } from '../../../constants/accountProviders';

export const HealthStatusTag = ({ status }) => {
    const cfg = HEALTH_STATUS_CONFIG[status] ?? HEALTH_STATUS_CONFIG[HEALTH_STATUS.UNKNOWN];
    const iconMap = {
        [HEALTH_STATUS.HEALTHY]:  <CheckCircleOutlined />,
        [HEALTH_STATUS.DEGRADED]: <MinusCircleOutlined />,
        [HEALTH_STATUS.DOWN]:     <CloseCircleOutlined />,
        [HEALTH_STATUS.UNKNOWN]:  <QuestionCircleOutlined />,
    };
    return (
        <Tag icon={iconMap[status] ?? <QuestionCircleOutlined />} color={cfg.color} style={{ borderRadius: 20, fontWeight: 600 }}>
            {cfg.label}
        </Tag>
    );
};

export const EnabledStatusTag = ({ isEnabled }) =>
    isEnabled ? (
        <Tag color="success" icon={<CheckCircleOutlined />} style={{ borderRadius: 20, fontWeight: 600 }}>
            Enabled
        </Tag>
    ) : (
        <Tag color="default" icon={<CloseCircleOutlined />} style={{ borderRadius: 20, fontWeight: 600 }}>
            Disabled
        </Tag>
    );
