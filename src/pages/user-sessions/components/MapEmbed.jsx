import React, { useState } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

/**
 * Reusable OpenStreetMap embed component.
 *
 * Props:
 *   lat      {number}  – latitude
 *   lng      {number}  – longitude
 *   isDark   {boolean} – apply dark-mode CSS filter
 *   height   {number}  – iframe height in px (default 200)
 *   style    {object}  – extra styles for the wrapper
 */
const MapEmbed = ({ lat, lng, isDark, height = 200, style }) => {
    const [loading, setLoading] = useState(true);
    const bbox = `${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}`;

    return (
        <div style={{
            borderRadius: 10,
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            position: 'relative',
            ...style,
        }}>
            {loading && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 2, height,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--bg-card)',
                }}>
                    <Spin indicator={<LoadingOutlined spin style={{ fontSize: 26, color: '#4f46e5' }} />} />
                </div>
            )}

            <div style={isDark ? { filter: 'invert(90%) hue-rotate(180deg)', transition: 'filter 0.3s' } : {}}>
                <iframe
                    title="session-location-map"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`}
                    style={{ width: '100%', height, border: 'none', display: 'block' }}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onLoad={() => setLoading(false)}
                />
            </div>

            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 12px', borderTop: '1px solid var(--border-color)',
                background: 'var(--bg-card)', flexWrap: 'wrap', gap: 4,
            }}>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    {lat.toFixed(6)}, {lng.toFixed(6)}
                </span>
                <a
                    href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12, color: '#4f46e5' }}
                >
                    Open in OSM ↗
                </a>
            </div>
        </div>
    );
};

export default MapEmbed;
