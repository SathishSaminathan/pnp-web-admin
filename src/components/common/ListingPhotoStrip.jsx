import React from 'react';
import { Image } from 'antd';

const listingPhotos = photos => (Array.isArray(photos) ? photos : []).filter(Boolean);

export const ListingPhotoStrip = ({ photos = [], size = 56, max = 4 }) => {
  const items = listingPhotos(photos);
  if (!items.length) {
    return <span className="pnp-cell-muted">No photos</span>;
  }

  return (
    <Image.PreviewGroup>
      <div className="flex items-center gap-1">
        {items.slice(0, max).map((src, index) => (
          <Image
            key={`${src}-${index}`}
            src={src}
            alt={`Photo ${index + 1}`}
            width={size}
            height={size}
            style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-color)' }}
          />
        ))}
        {items.length > max ? (
          <span className="pnp-cell-muted text-xs">+{items.length - max}</span>
        ) : null}
      </div>
    </Image.PreviewGroup>
  );
};

export default ListingPhotoStrip;
