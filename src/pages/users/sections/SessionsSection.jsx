import React from 'react';
import { Tag, Tooltip, Empty } from 'antd';
import { CalendarOutlined, MonitorOutlined, DesktopOutlined } from '@ant-design/icons';
import { SectionHeader, InfoCard, Field, Grid2 } from '../components/UserDetailUI';
import { fmtTime, parseBrowser } from '../utils/userDetailHelpers.jsx';
import MapEmbed from '../../user-sessions/components/MapEmbed';
import { useTheme } from '../../../context/ThemeContext';

const SessionsSection = ({ recentSessions, lastLogin }) => {
    const { isDark } = useTheme();

    return (
        <div className="flex flex-col gap-6">
            {lastLogin && (
                <InfoCard>
                    <SectionHeader icon={<CalendarOutlined />} title="Last Login" />
                    <p className="text-sm m-0" style={{ color: 'var(--text-primary)' }}>
                        {fmtTime(lastLogin)}
                    </p>
                </InfoCard>
            )}

            {recentSessions?.length > 0 ? (
                <InfoCard>
                    <SectionHeader icon={<MonitorOutlined />} title="Recent Sessions" />
                    <div className="flex flex-col gap-4">
                        {recentSessions.map((s, i) => {
                            const lat = s.coordinates?.latitude;
                            const lng = s.coordinates?.longitude;
                            return (
                                <div
                                    key={s.deviceId || i}
                                    className="p-4 rounded-xl"
                                    style={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-color)',
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <DesktopOutlined style={{ color: '#60a5fa' }} />
                                            <span
                                                className="font-semibold text-sm"
                                                style={{ color: 'var(--text-primary)' }}
                                            >
                                                {s.deviceName || 'Unknown Device'}
                                            </span>
                                        </div>
                                        <div className="flex gap-1">
                                            {s.isActive && (
                                                <Tag color="success" style={{ borderRadius: 20 }}>
                                                    Active
                                                </Tag>
                                            )}
                                            {s.isVerified && (
                                                <Tag color="cyan" style={{ borderRadius: 20 }}>
                                                    Verified
                                                </Tag>
                                            )}
                                        </div>
                                    </div>
                                    <Grid2>
                                        <Field label="Device ID" value={s.deviceId} />
                                        <Field
                                            label="Browser"
                                            value={
                                                s.browser ? (
                                                    <Tooltip title={s.browser}>
                                                        <span>{parseBrowser(s.browser) ?? s.browser}</span>
                                                    </Tooltip>
                                                ) : null
                                            }
                                        />
                                        <Field label="OS" value={s.OS} />
                                        <Field label="Language" value={s.language} />
                                        <Field label="IP Address" value={s.IP?.join(', ')} />
                                        <Field label="Country" value={s.cfIpCountry ?? null} />
                                        <Field label="Location" value={s.location || null} />
                                        <Field label="Last Login" value={fmtTime(s.lastLogin)} />
                                        {lat != null && lng != null && (
                                            <Field label="Coordinates" value={`${lat}, ${lng}`} />
                                        )}
                                    </Grid2>
                                    {lat != null && lng != null && (
                                        <MapEmbed
                                            key={s.deviceId || i}
                                            lat={lat}
                                            lng={lng}
                                            isDark={isDark}
                                            style={{ marginTop: 12 }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </InfoCard>
            ) : (
                !lastLogin && <Empty description="No session data available" />
            )}
        </div>
    );
};

export default SessionsSection;
