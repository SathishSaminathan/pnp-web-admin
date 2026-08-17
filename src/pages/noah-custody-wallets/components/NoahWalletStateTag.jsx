import React from 'react';
import { Tag } from 'antd';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    StopOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';

const STATE_CONFIG = {
    LIVE:        { color: 'success',   icon: <CheckCircleOutlined />,       label: 'Live' },
    PENDING:     { color: 'warning',   icon: <ClockCircleOutlined />,       label: 'Pending' },
    INACTIVE:    { color: 'default',   icon: <StopOutlined />,              label: 'Inactive' },
    FROZEN:      { color: 'blue',      icon: <ExclamationCircleOutlined />, label: 'Frozen' },
    CLOSED:      { color: 'error',     icon: <StopOutlined />,              label: 'Closed' },
};

const NoahWalletStateTag = ({ state }) => {
    const cfg = STATE_CONFIG[state] ?? { color: 'default', icon: null, label: state || '—' };
    return (
        <Tag
            color={cfg.color}
            icon={cfg.icon}
            style={{ borderRadius: 20, fontSize: 11 }}
        >
            {cfg.label}
        </Tag>
    );
};

export default NoahWalletStateTag;
