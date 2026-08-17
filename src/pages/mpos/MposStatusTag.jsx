import React from 'react';
import { Tag } from 'antd';
import { MPOS_STATUS_CONFIG } from '../../constants/mpos';

const MposStatusTag = ({ status }) => {
    const cfg = MPOS_STATUS_CONFIG[status] ?? { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)', label: status };
    return (
        <Tag
            style={{
                color: cfg.color,
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 12,
            }}
        >
            {cfg.label}
        </Tag>
    );
};

export default MposStatusTag;
