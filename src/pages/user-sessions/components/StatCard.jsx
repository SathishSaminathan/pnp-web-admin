import React from 'react';

const StatCard = ({ label, value, color, icon }) => (
    <div
        className="rounded-2xl w-full flex flex-col overflow-hidden"
        style={{
            background: `linear-gradient(135deg, ${color}09 0%, var(--bg-card) 60%)`,
            border: `1px solid ${color}25`,
            boxShadow: 'var(--shadow-card)',
        }}
    >
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {label}
            </span>
            <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: `${color}18`, color }}
            >
                {icon}
            </div>
        </div>
        <div className="px-4 pb-4">
            <span
                className="font-extrabold tabular-nums leading-none"
                style={{ fontSize: '2rem', color: 'var(--text-primary)' }}
            >
                {value ?? 0}
            </span>
        </div>
        <div style={{ height: 3, background: color, opacity: 0.65 }} />
    </div>
);

export default StatCard;
