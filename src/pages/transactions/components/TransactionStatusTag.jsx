import React from 'react';
import { Tag } from 'antd';

const STATUS_MAP = {
    Completed:  { color: 'success',   label: 'Completed' },
    Approved:   { color: 'cyan',      label: 'Approved' },
    InProgress: { color: 'processing',label: 'In Progress' },
    Initiated:  { color: 'gold',      label: 'Initiated' },
    Rejected:   { color: 'error',     label: 'Rejected' },
    Refunded:   { color: 'purple',    label: 'Refunded' },
    Freeze:     { color: 'blue',      label: 'Freeze' },
};

const TransactionStatusTag = ({ status }) => {
    const cfg = STATUS_MAP[status] ?? { color: 'default', label: status ?? '—' };
    return (
        <Tag color={cfg.color} style={{ borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
            {cfg.label}
        </Tag>
    );
};

export default TransactionStatusTag;
