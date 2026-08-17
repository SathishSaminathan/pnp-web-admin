import React from 'react';

const StatCard = ({ label, value, color, icon, isDark }) => (
    <div
        className="rounded-2xl p-4 flex items-center gap-3"
        style={{
            background: isDark ? 'var(--bg-card)' : '#fff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
            boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
            flex: 1,
            minWidth: 120,
        }}
    >
        <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base shrink-0"
            style={{ background: color }}
        >
            {icon}
        </div>
        <div>
            <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
        </div>
    </div>
);

export default StatCard;
