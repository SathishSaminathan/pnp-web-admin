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
    return String(value.uri || value.url || value.photoUrl || '').trim();
  }
  return String(value).trim();
};

const UserAvatar = ({ src, name = '', size = 36 }) => {
  const photoUrl = useMemo(() => resolvePhotoUrl(src), [src]);
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(photoUrl) && !failed;
  const initials = initialsFromName(name);

  useEffect(() => {
    setFailed(false);
  }, [photoUrl]);

  return (
    <Avatar
      size={size}
      alt={name || 'User'}
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
        alt: name || 'User',
        style: { objectFit: 'cover', width: '100%', height: '100%' },
        onError: () => setFailed(true),
      }}
    >
      {initials}
    </Avatar>
  );
};

export default UserAvatar;
