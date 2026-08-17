import React from 'react';
import { Drawer, Spin, Divider, Button, Tooltip, Space, Popconfirm } from 'antd';
import {
    MobileOutlined,
    DesktopOutlined,
    LoadingOutlined,
    CheckOutlined,
    CloseOutlined,
    PoweroffOutlined,
    SafetyCertificateOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
    activateUserDevice,
    deactivateUserDevice,
    verifyUserDevice,
    unverifyUserDevice,
    softDeleteUserDevice,
    selectUserDevicesActionLoading,
} from '../../../store/slices/userDevicesSlice';
import { message } from 'antd';
import DeviceStatusTag from './DeviceStatusTag';

/* ── helpers ── */
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

const SectionTitle = ({ children }) => (
    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 8, marginTop: 16 }}>
        {children}
    </p>
);

const DeviceDetailDrawer = ({ open, device, onClose, onUpdated }) => {
    const dispatch      = useDispatch();
    const actionLoading = useSelector(selectUserDevicesActionLoading);
    const record        = device;

    const run = async (thunk, successMsg) => {
        if (!record?._id) return;
        try {
            await dispatch(thunk(record._id)).unwrap();
            message.success(successMsg);
            onUpdated?.();
        } catch (err) { message.error(err || 'Action failed'); }
    };

    return (
        <Drawer
            open={open}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <MobileOutlined style={{ color: '#4f46e5' }} />
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Device Detail</span>
                </div>
            }
            width={420}
            styles={{ body: { background: 'var(--bg-card)', padding: '16px 20px' }, header: { background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' } }}
        >
            {!record ? (
                <div className="flex items-center justify-center h-32">
                    <Spin indicator={<LoadingOutlined spin />} />
                </div>
            ) : (
                <div>
                    {/* Status + Actions */}
                    <div className="flex items-center justify-between mb-4">
                        <DeviceStatusTag isActive={record.isActive} isVerified={record.isVerified} isDelete={record.isDelete} />
                        {!record.isDelete && (
                            <Space size="small">
                                <Tooltip title={record.isActive ? 'Deactivate' : 'Activate'}>
                                    <Button
                                        size="small"
                                        icon={record.isActive ? <PoweroffOutlined /> : <CheckOutlined />}
                                        loading={actionLoading}
                                        danger={record.isActive}
                                        onClick={() => run(
                                            record.isActive ? deactivateUserDevice : activateUserDevice,
                                            record.isActive ? 'Device deactivated' : 'Device activated',
                                        )}
                                    />
                                </Tooltip>
                                <Tooltip title={record.isVerified ? 'Untrust' : 'Trust'}>
                                    <Button
                                        size="small"
                                        icon={record.isVerified ? <CloseOutlined /> : <SafetyCertificateOutlined />}
                                        loading={actionLoading}
                                        type={record.isVerified ? 'default' : 'primary'}
                                        onClick={() => run(
                                            record.isVerified ? unverifyUserDevice : verifyUserDevice,
                                            record.isVerified ? 'Device untrusted' : 'Device trusted',
                                        )}
                                    />
                                </Tooltip>
                                <Popconfirm
                                    title="Delete this device?"
                                    description="This will soft-delete the device."
                                    onConfirm={() => run(softDeleteUserDevice, 'Device deleted')}
                                    okButtonProps={{ danger: true }}
                                    okText="Delete"
                                >
                                    <Tooltip title="Delete">
                                        <Button size="small" danger icon={<DeleteOutlined />} loading={actionLoading} />
                                    </Tooltip>
                                </Popconfirm>
                            </Space>
                        )}
                    </div>

                    <Divider style={{ borderColor: 'var(--border-color)', margin: '0 0 4px' }} />

                    {/* User */}
                    <SectionTitle>User</SectionTitle>
                    <InfoRow label="Name"    value={typeof record.userId === 'object' ? `${record.userId.firstName ?? ''} ${record.userId.lastName ?? ''}`.trim() : null} />
                    <InfoRow label="Email"   value={typeof record.userId === 'object' ? record.userId.emailId : null} />
                    <InfoRow label="User ID" value={record.userId?._id ?? record.userId} />

                    {/* Device */}
                    <SectionTitle>Device</SectionTitle>
                    <InfoRow label="Device ID"   value={record._id} />
                    <InfoRow label="Name"         value={record.deviceName} />
                    <InfoRow label="Type"         value={record.deviceName} />
                    <InfoRow label="OS"           value={record.OS} />
                    <InfoRow label="Browser"      value={record.browser} />
                    <InfoRow label="Model"        value={record.model} />
                    <InfoRow label="Manufacturer" value={record.manufacturer} />
                    <InfoRow label="Push Token"   value={record.pushToken ? `${record.pushToken.slice(0, 20)}…` : null} />

                    {/* Timestamps */}
                    <SectionTitle>Timestamps</SectionTitle>
                    <InfoRow label="First Seen"   value={record.createdAt ? new Date(record.createdAt).toLocaleString() : null} />
                    <InfoRow label="Last Seen"    value={record.lastLogin ? new Date(record.lastLogin).toLocaleString() : null} />
                    <InfoRow label="Verified At"  value={record.verifiedAt ? new Date(record.verifiedAt).toLocaleString() : null} />
                </div>
            )}
        </Drawer>
    );
};

export default DeviceDetailDrawer;
