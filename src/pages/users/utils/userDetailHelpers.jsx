import React from 'react';
import { Tag } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import { UAParser } from 'ua-parser-js';
import { formatAmount } from '../../../utils/number.utils';

/** Safely coerce {id,name} / {_id,name} objects or plain strings to a renderable string */
export const str = (val) => {
    if (val == null) return null;
    if (typeof val === 'object') return val.name ?? val._id ?? null;
    return String(val);
};

export const fmt = (date) =>
    date
        ? new Date(date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          })
        : '—';

export const fmtTime = (date) =>
    date
        ? new Date(date).toLocaleString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          })
        : '—';

export const fmtMoney = (amount, currency = '') =>
    amount != null
        ? `${currency} ${formatAmount(amount)}`
        : '—';

export const KYC_STATUS_PROPS = {
    Approved: { color: 'success', icon: <CheckCircleOutlined /> },
    Rejected: { color: 'error', icon: <CloseCircleOutlined /> },
    Pending: { color: 'warning', icon: <ClockCircleOutlined /> },
};

export const kycTag = (status) => {
    const p = KYC_STATUS_PROPS[status] ?? { color: 'default', icon: <ClockCircleOutlined /> };
    return (
        <Tag icon={p.icon} color={p.color} style={{ borderRadius: 20 }}>
            {status || 'Unknown'}
        </Tag>
    );
};

export const parseBrowser = (ua) => {
    if (!ua) return null;
    const r = new UAParser(ua).getResult();
    return r.browser.name
        ? `${r.browser.name}${r.browser.version ? ` ${r.browser.version}` : ''}`
        : null;
};
