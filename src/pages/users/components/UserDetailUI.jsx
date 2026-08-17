import React from 'react';
import { Tag } from 'antd';

export const SectionHeader = ({ icon, title }) => (
    <div className="flex items-center gap-2 mb-4">
        <span className="text-base" style={{ color: '#60a5fa' }}>
            {icon}
        </span>
        <span
            className="text-sm font-bold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
        >
            {title}
        </span>
    </div>
);

export const InfoCard = ({ children, className = '' }) => (
    <div
        className={`rounded-2xl p-5 ${className}`}
        style={{
            background: 'var(--input-bg)',
            border: '1px solid var(--border-color)',
        }}
    >
        {children}
    </div>
);

export const Field = ({ label, value, full = false }) => (
    <div className={`flex flex-col gap-0.5 ${full ? 'col-span-2' : ''}`}>
        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            {label}
        </span>
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {value ?? <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>}
        </span>
    </div>
);

export const Grid2 = ({ children }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
);

export const BoolTag = ({ val, trueLabel = 'Yes', falseLabel = 'No' }) => (
    <Tag color={val ? 'success' : 'default'} style={{ borderRadius: 20 }}>
        {val ? trueLabel : falseLabel}
    </Tag>
);
