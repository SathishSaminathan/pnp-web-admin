import React from 'react';
import { Tag } from 'antd';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    CheckSquareOutlined,
    CloseCircleOutlined,
    RollbackOutlined,
    LockOutlined,
} from '@ant-design/icons';

const STATUS_MAP = {
    Initiated:   { color: 'blue',    icon: <ClockCircleOutlined />,  label: 'Initiated' },
    Approved:    { color: 'green',   icon: <CheckCircleOutlined />,  label: 'Approved' },
    InProgress:  { color: 'orange',  icon: <SyncOutlined spin />,    label: 'In Progress' },
    Completed:   { color: 'success', icon: <CheckSquareOutlined />,  label: 'Completed' },
    Rejected:    { color: 'error',   icon: <CloseCircleOutlined />,  label: 'Rejected' },
    Refunded:    { color: 'purple',  icon: <RollbackOutlined />,     label: 'Refunded' },
    Freeze:      { color: 'default', icon: <LockOutlined />,         label: 'Freeze' },
};

const CreditTxStatusTag = ({ status }) => {
    const cfg = STATUS_MAP[status] ?? { color: 'default', icon: null, label: status ?? '—' };
    return (
        <Tag icon={cfg.icon} color={cfg.color} style={{ borderRadius: 20, fontWeight: 500 }}>
            {cfg.label}
        </Tag>
    );
};

export default CreditTxStatusTag;
