import React, { useState, useEffect } from 'react';
import { Drawer, Spin, Tag, Divider, Button, Tooltip } from 'antd';
import { UAParser } from 'ua-parser-js';
import {
    MonitorOutlined,
    GlobalOutlined,
    ClockCircleOutlined,
    LoadingOutlined,
    PoweroffOutlined,
    MobileOutlined,
    DesktopOutlined,
    TabletOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { terminateUserSession, selectUserSessionsActionLoading } from '../../../store/slices/userSessionsSlice';
import { message } from 'antd';
import SessionStatusTag from './SessionStatusTag';
import MapEmbed from './MapEmbed';
import { useTheme } from '../../../context/ThemeContext';

/* ── helpers ── */
const parseBrowser = (ua) => {
    if (!ua) return null;
    const r = new UAParser(ua).getResult();
    return r.browser.name
        ? `${r.browser.name}${r.browser.version ? ` ${r.browser.version}` : ''}`
        : null;
};

const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-start gap-4 py-2.5" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <span className="text-xs font-semibold uppercase tracking-wide shrink-0" style={{ color: 'var(--text-muted)', minWidth: 120 }}>
            {label}
        </span>
        <span className="text-sm text-right font-medium break-all" style={{ color: 'var(--text-primary)' }}>
            {value ?? '—'}
        </span>
    </div>
);

const DeviceIcon = ({ type }) => {
    const style = { fontSize: 18, color: 'var(--text-secondary)' };
    if (!type) return <MonitorOutlined style={style} />;
    const t = type.toLowerCase();
    if (t.includes('mobile') || t.includes('phone')) return <MobileOutlined style={style} />;
    if (t.includes('tablet')) return <TabletOutlined style={style} />;
    return <DesktopOutlined style={style} />;
};

const SectionTitle = ({ children }) => (
    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 8, marginTop: 16 }}>
        {children}
    </p>
);

const SessionDetailDrawer = ({ open, session, onClose, onTerminated }) => {
    const dispatch       = useDispatch();
    const actionLoading  = useSelector(selectUserSessionsActionLoading);
    const { isDark }     = useTheme();
    const record         = session;

    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const handleTerminate = async () => {
        if (!record?._id) return;
        try {
            await dispatch(terminateUserSession(record._id)).unwrap();
            message.success('Session terminated successfully');
            onTerminated?.();
        } catch (err) {
            message.error(err || 'Failed to terminate session');
        }
    };

    const isTerminated = record?.isDelete || !record?.isActive;

    return (
        <Drawer
            open={open}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <MonitorOutlined style={{ color: '#4f46e5' }} />
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Session Detail</span>
                </div>
            }
            width={isMobile ? '100%' : 420}
            placement={isMobile ? 'bottom' : 'right'}
            height={isMobile ? '88vh' : undefined}
            styles={{ body: { background: 'var(--bg-card)', padding: '16px 20px', overflowY: 'auto' }, header: { background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' } }}
        >
            {!record ? (
                <div className="flex items-center justify-center h-32">
                    <Spin indicator={<LoadingOutlined spin />} />
                </div>
            ) : (
                <div>
                    {/* Status Banner */}
                    <div className="flex items-center justify-between mb-4">
                        <SessionStatusTag isActive={record.isActive} isDelete={record.isDelete} />
                        {!isTerminated && (
                            <Tooltip title="Terminate this session">
                                <Button
                                    danger
                                    size="small"
                                    icon={<PoweroffOutlined />}
                                    loading={actionLoading}
                                    onClick={handleTerminate}
                                >
                                    Terminate
                                </Button>
                            </Tooltip>
                        )}
                    </div>

                    <Divider style={{ borderColor: 'var(--border-color)', margin: '0 0 4px' }} />

                    {/* User Info */}
                    <SectionTitle>User</SectionTitle>
                    <InfoRow label="Name"    value={record.user ? `${record.user.firstName ?? ''} ${record.user.lastName ?? ''}`.trim() || null : null} />
                    <InfoRow label="Email"   value={record.user?.emailId ?? null} />
                    <InfoRow label="User ID" value={record.user?._id ?? (typeof record.userId === 'string' ? record.userId : null)} />

                    {/* Session Info */}
                    <SectionTitle>Session</SectionTitle>
                    <InfoRow label="Session ID" value={record._id} />
                    <InfoRow label="Created"    value={record.createdAt ? new Date(record.createdAt).toLocaleString() : null} />
                    <InfoRow label="Expires At" value={record.expiresAt ? new Date(record.expiresAt).toLocaleString() : null} />
                    <InfoRow label="Last Active" value={record.lastRequestTime ? new Date(record.lastRequestTime).toLocaleString() : null} />
                    <InfoRow label="Login At"   value={record.lastLogin ? new Date(record.lastLogin).toLocaleString() : null} />

                    {/* Device Info */}
                    <SectionTitle>Device</SectionTitle>
                    <div className="flex items-center gap-2 py-2">
                        <DeviceIcon type={record.deviceType} />
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {record.deviceName ?? record.deviceType ?? 'Unknown Device'}
                        </span>
                    </div>
                    <InfoRow label="Device Name" value={record.deviceName} />
                    <InfoRow label="Browser"     value={
                        record.browser
                            ? <Tooltip title={record.browser}><span>{parseBrowser(record.browser) ?? record.browser}</span></Tooltip>
                            : null
                    } />
                    <InfoRow label="OS"          value={record.OS} />
                    <InfoRow label="Device ID"   value={record.deviceId} />

                    {/* Network */}
                    <SectionTitle>Network</SectionTitle>
                    <InfoRow label="IP Address" value={Array.isArray(record.IP) ? record.IP.join(', ') : record.IP} />
                    <InfoRow label="Country"    value={record.cfIpCountry ?? null} />
                    <InfoRow label="Location"   value={record.location || null} />
                    <InfoRow label="Latitude"   value={record.latitude ?? null} />
                    <InfoRow label="Longitude"  value={record.longitude ?? null} />

                    {/* Map — rendered only when coordinates are available.
                        key={record._id} forces remount on session change, resetting loading. */}
                    {record.latitude != null && record.longitude != null && (
                        <MapEmbed key={record._id} lat={record.latitude} lng={record.longitude} isDark={isDark} style={{ marginTop: 12 }} />
                    )}

                    {/* Terminated info */}
                    {record.isDelete && (
                        <>
                            <SectionTitle>Termination</SectionTitle>
                            <InfoRow label="Terminated At" value={record.deletedAt ? new Date(record.deletedAt).toLocaleString() : null} />
                            <InfoRow label="Reason"        value={record.terminationReason} />
                        </>
                    )}
                </div>
            )}
        </Drawer>
    );
};

export default SessionDetailDrawer;
