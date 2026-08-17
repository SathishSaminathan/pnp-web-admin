import React from 'react';
import { Tag } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';

const kycStatusTag = (status) => {
    const map = {
        Approved:        { color: 'success', icon: <CheckCircleOutlined /> },
        Verified:        { color: 'success', icon: <CheckCircleOutlined /> },
        Rejected:        { color: 'error',   icon: <CloseCircleOutlined /> },
        Pending:         { color: 'warning', icon: <ClockCircleOutlined /> },
        'Not Submitted': { color: 'default', icon: <ClockCircleOutlined /> },
    };
    const cfg = map[status] ?? { color: 'default', icon: <ClockCircleOutlined /> };
    return (
        <Tag icon={cfg.icon} color={cfg.color} style={{ borderRadius: 20, fontWeight: 600 }}>
            {status || 'Pending'}
        </Tag>
    );
};

export default kycStatusTag;
