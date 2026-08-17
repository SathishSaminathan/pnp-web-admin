import React from 'react';
import { Tag } from 'antd';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined,
} from '@ant-design/icons';

/**
 * Maps OTP `isUsed` / `isExpired` flags to a status tag.
 */
const OtpStatusTag = ({ isUsed, isExpired, isVerified }) => {
    if (isUsed || isVerified) {
        return (
            <Tag
                icon={<CheckCircleOutlined />}
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', borderRadius: 20, fontWeight: 600 }}
            >
                Used
            </Tag>
        );
    }
    if (isExpired) {
        return (
            <Tag
                icon={<CloseCircleOutlined />}
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 20, fontWeight: 600 }}
            >
                Expired
            </Tag>
        );
    }
    return (
        <Tag
            icon={<SyncOutlined spin />}
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', borderRadius: 20, fontWeight: 600 }}
        >
            Pending
        </Tag>
    );
};

export default OtpStatusTag;
