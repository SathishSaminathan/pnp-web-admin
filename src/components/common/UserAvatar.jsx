import React, { useEffect, useMemo, useState } from 'react';
import { Avatar } from 'antd';

const initialsFromName = name => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const resolvePhotoUrl = value => {
  if (!value) return '';
  if (typeof value === 'object') {
    return resolvePhotoUrl(value.uri || value.url || value.photoUrl || '');
  }
  return String(value).trim();
};

const UserAvatar = ({ src, name = '', size = 36, user }) => {
  const displayName = name || user?.name || '';
  const photoUrl = useMemo(
    () => resolvePhotoUrl(src) || resolvePhotoUrl(user?.photoUrl),
    [src, user],
  );
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(photoUrl) && !failed;
  const initials = initialsFromName(displayName);

  useEffect(() => {
    setFailed(false);
  }, [photoUrl]);

  return (
    <Avatar
      size={size}
      alt={displayName || 'User'}
      src={showImage ? photoUrl : undefined}
      referrerPolicy="no-referrer"
      style={{
        background: showImage ? '#e5e7eb' : 'linear-gradient(135deg, #0f766e, #14b8a6)',
        color: '#fff',
        fontWeight: 700,
        fontSize: Math.max(12, Math.round(size * 0.36)),
        flexShrink: 0,
        overflow: 'hidden',
      }}
      imgProps={{
        referrerPolicy: 'no-referrer',
        alt: displayName || 'User',
        style: { objectFit: 'cover', width: '100%', height: '100%' },
        onError: () => setFailed(true),
      }}
    >
      {initials}
    </Avatar>
  );
};

export const UserNameCell = ({
  user,
  name,
  src,
  size = 36,
  subtitle,
}) => {
  const displayName = name || user?.name || '—';
  return (
    <div className="flex items-center gap-3 min-w-0">
      <UserAvatar
        src={src || user?.photoUrl}
        name={displayName === '—' ? '' : displayName}
        size={size}
      />
      <div className="min-w-0">
        <div className="pnp-cell-strong truncate">{displayName}</div>
        {subtitle ? <div className="pnp-cell-muted truncate">{subtitle}</div> : null}
      </div>
    </div>
  );
};

export default UserAvatar;
