import React from 'react';
import { Tag } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    DeleteOutlined,
} from '@ant-design/icons';

/**
 * Shared active/inactive/deleted status tag for geography tables.
 */
const ActiveStatusTag = ({ isActive, isDelete }) => {
    if (isDelete) {
        return (
            <Tag
                icon={<DeleteOutlined />}
                style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#ef4444',
                    borderRadius: 20,
                    fontWeight: 600,
                }}
            >
                Deleted
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
            icon={<CloseCircleOutlined />}
            style={{
                background: 'rgba(100,116,139,0.1)',
                border: '1px solid rgba(100,116,139,0.3)',
                color: '#64748b',
                borderRadius: 20,
                fontWeight: 600,
            }}
        >
            Inactive
        </Tag>
    );
};

export default ActiveStatusTag;
