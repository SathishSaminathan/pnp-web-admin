import React from 'react';

const StatCard = ({ icon, color = '#2563eb', label, value, hint }) => (
  <div
    className="pnp-stat-card"
    style={{
      '--stat-color': color,
      background: `linear-gradient(145deg, ${color}14 0%, var(--bg-card) 52%)`,
      borderColor: `${color}33`,
    }}
  >
    <div className="pnp-stat-card__row">
      <div className="pnp-stat-card__icon" style={{ background: `${color}1f`, color }}>
        {icon}
      </div>
      {hint ? <span className="pnp-stat-card__hint">{hint}</span> : null}
    </div>
    <div className="pnp-stat-card__value">{value}</div>
    <div className="pnp-stat-card__label">{label}</div>
  </div>
);

export default StatCard;
