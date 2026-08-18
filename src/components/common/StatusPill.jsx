import React from 'react';

const TONE_BY_VALUE = {
  PAID: 'success',
  COMPLETED: 'success',
  SETTLED: 'success',
  AVAILABLE: 'success',
  YES: 'success',
  VERIFIED: 'success',
  UNVERIFIED: 'warning',
  COMPLETE: 'success',
  UPCOMING: 'info',
  ACTIVE: 'warning',
  PENDING: 'success',
  CANCELLED: 'danger',
  NO: 'muted',
  BLOCKED: 'danger',
  FAILED: 'danger',
};

const LABEL_BY_VALUE = {
  PAID: 'Paid',
  SETTLED: 'Paid',
  PENDING: 'Paid',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
};

const StatusPill = ({ value, tone, children }) => {
  const key = String(value ?? children ?? '').toUpperCase();
  const label = children ?? LABEL_BY_VALUE[key] ?? value ?? '—';
  const resolved = tone || TONE_BY_VALUE[key] || 'muted';

  return (
    <span className={`status-pill status-pill--${resolved}`}>
      {label}
    </span>
  );
};

export default StatusPill;
