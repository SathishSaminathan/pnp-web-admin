import React from 'react';

const TONE_BY_VALUE = {
  PAID: 'success',
  COMPLETED: 'success',
  SETTLED: 'success',
  AVAILABLE: 'success',
  YES: 'success',
  COMPLETE: 'success',
  UPCOMING: 'info',
  ACTIVE: 'warning',
  PENDING: 'warning',
  CANCELLED: 'danger',
  NO: 'muted',
  OWNER: 'purple',
  USER: 'info',
};

const StatusPill = ({ value, tone, children }) => {
  const label = children ?? value ?? '—';
  const key = String(value ?? label).toUpperCase();
  const resolved = tone || TONE_BY_VALUE[key] || 'muted';

  return (
    <span className={`status-pill status-pill--${resolved}`}>
      {label}
    </span>
  );
};

export default StatusPill;
