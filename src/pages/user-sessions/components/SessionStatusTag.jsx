import React from 'react';
import { Tag } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';

/**
 * Renders a status tag for a session.
 * isActive=true => Active (green)
 * isDelete=true => Terminated (red)
 * else          => Expired / Inactive (gray)
 */
const SessionStatusTag = ({ isActive, isDelete }) => {
    if (isDelete) {
        return (
            <Tag
                icon={<CloseCircleOutlined />}
                style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#ef4444',
                    borderRadius: 20,
                    fontWeight: 600,
                }}
            >
                Terminated
            </Tag>
        );
    }
    if (isActive) {
        return (
            <Tag
                icon={<CheckCircleOutlined />}
                style={{
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    color: '#10b981',
                    borderRadius: 20,
                    fontWeight: 600,
                }}
            >
                Active
            </Tag>
        );
    }
    return (
        <Tag
            icon={<ClockCircleOutlined />}
            style={{
                background: 'rgba(100,116,139,0.1)',
                border: '1px solid rgba(100,116,139,0.3)',
                color: '#64748b',
                borderRadius: 20,
                fontWeight: 600,
            }}
        >
            Expired
        </Tag>
    );
};

export default SessionStatusTag;
