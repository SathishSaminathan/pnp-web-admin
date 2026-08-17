import React, { useState } from 'react';
import { Avatar, Modal, Switch, Tag, Input, Button, Select, QRCode, Alert, Form } from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    SafetyCertificateOutlined,
    LogoutOutlined,
    BellOutlined,
    LockOutlined,
    GlobalOutlined,
    MoonOutlined,
    SunOutlined,
    BgColorsOutlined,
    CheckCircleFilled,
    CreditCardOutlined,
    TeamOutlined,
    FileTextOutlined,
    SettingOutlined,
    ClockCircleOutlined,
    CopyOutlined,
    ExclamationCircleOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import authApi from '../../api/modules/auth';
import { notifySuccess, notifyError } from '../../utils/notification';

const { Option } = Select;

// ----------------------------------------------------------
//  Reusable section card
// ----------------------------------------------------------
const SettingCard = ({ children, className = '' }) => (
    <div
        className={`rounded-2xl p-6 ${className}`}
        style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-card)',
            transition: 'background 0.25s ease',
        }}
    >
        {children}
    </div>
);

const SectionTitle = ({ icon, title, subtitle }) => (
    <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-base">
            {icon}
        </div>
        <div>
            <h3 className="text-base font-bold m-0" style={{ color: 'var(--text-primary)' }}>{title}</h3>
            {subtitle && <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
        </div>
    </div>
);

const RowItem = ({ label, description, action, noBorder }) => (
    <div className={`flex items-center justify-between gap-4 py-4 ${!noBorder ? 'border-b' : ''}`}
         style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</div>
            {description && <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{description}</div>}
        </div>
        <div className="shrink-0">{action}</div>
    </div>
);

// ----------------------------------------------------------
//  Main Settings page
// ----------------------------------------------------------
const Settings = () => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    const [activeTab, setActiveTab] = useState('profile');
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false,
        weekly: true,
        security: true,
        marketing: false,
    });

    const handleLogout = () => {
        Modal.confirm({
            title: 'Sign Out',
            content: 'Are you sure you want to sign out of the admin panel?',
            okText: 'Yes, Sign Out',
            okButtonProps: { danger: true },
            cancelText: 'Cancel',
            centered: true,
            onOk: logout,
        });
    };

    const tabs = [
        { key: 'profile',       label: 'Profile',        icon: <UserOutlined /> },
        { key: 'security',      label: 'Security',       icon: <LockOutlined /> },
        { key: 'notifications', label: 'Notifications',  icon: <BellOutlined /> },
        { key: 'appearance',    label: 'Appearance',     icon: <BgColorsOutlined /> },
    ];

    // ── Tab rendering ─────────────────────────────
    const renderTab = () => {
        switch (activeTab) {
            case 'profile':       return <ProfileTab user={user} isDark={isDark} handleLogout={handleLogout} />;
            case 'security':      return <SecurityTab isDark={isDark} />;
            case 'notifications': return <NotificationsTab notifications={notifications} setNotifications={setNotifications} />;
            case 'appearance':    return <AppearanceTab isDark={isDark} toggleTheme={toggleTheme} />;
            default:              return null;
        }
    };

    return (
        <div className="pb-12 font-sans" style={{ color: 'var(--text-primary)' }}>
            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>Settings</h1>
                <p className="text-sm mt-1 m-0" style={{ color: 'var(--text-secondary)' }}>
                    Manage your account, security and application preferences.
                </p>
            </div>

            {/* Tab nav */}
            <div className="flex gap-2 mb-6 p-1 rounded-2xl scrollbar-hide"
                 style={{
                     background: 'var(--bg-card)',
                     border: '1px solid var(--border-color)',
                     overflowX: 'auto',
                     WebkitOverflowScrolling: 'touch',
                 }}>
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shrink-0"
                        style={{
                            background: activeTab === t.key ? '#2563eb' : 'transparent',
                            color: activeTab === t.key ? '#fff' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            border: 'none',
                        }}
                    >
                        {t.icon} <span className="hidden sm:inline">{t.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="max-w-4xl">
                {renderTab()}
            </div>
        </div>
    );
};

// ── Tab: Profile ──────────────────────────────
const ProfileTab = ({ user, isDark, handleLogout }) => (
        <div className="space-y-6">
            {/* Avatar + name hero */}
            <SettingCard>
                <div className="flex items-center gap-6 flex-wrap">
                    <div className="relative">
                        <Avatar
                            size={96}
                            style={{ backgroundColor: '#2563eb', fontSize: 36, fontWeight: 700 }}
                        >
                            {user?.firstName?.charAt(0) || 'A'}
                        </Avatar>
                        <button
                            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md hover:bg-blue-700 transition-colors"
                            title="Change avatar"
                        >
                            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                        </button>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>
                            {user?.firstName} {user?.lastName}
                        </h2>
                        <p className="text-sm m-0 mt-1" style={{ color: 'var(--text-secondary)' }}>{user?.emailId}</p>
                        <div className="flex items-center gap-2 mt-3">
                            <Tag color="blue" className="rounded-full text-xs font-semibold">Admin</Tag>
                            <span className="flex items-center gap-1 text-xs font-semibold text-green-500">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                                Account Active
                            </span>
                        </div>
                    </div>
                    <Button danger icon={<LogoutOutlined />} onClick={handleLogout} className="self-start sm:ml-auto">
                        Sign Out
                    </Button>
                </div>
            </SettingCard>

            {/* Personal info form */}
            <SettingCard>
                <SectionTitle icon={<UserOutlined />} title="Personal Information" subtitle="Update your name and contact details" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                        { label: 'First Name',    value: user?.firstName   || 'Admin'              },
                        { label: 'Last Name',     value: user?.lastName    || 'User'               },
                        { label: 'Email Address', value: user?.emailId     || 'admin@meralot.com'   },
                        { label: 'Phone Number',  value: user?.phone       || '+1 (555) 000-0000'  },
                        { label: 'Company',       value: 'Meralot Inc.'                             },
                        { label: 'Department',    value: 'Engineering'                             },
                    ].map(field => (
                        <div key={field.label}>
                            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                {field.label}
                            </label>
                            <Input
                                defaultValue={field.value}
                                className="rounded-xl h-10"
                                style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-end mt-5 gap-3">
                    <Button className="rounded-xl" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                        Cancel
                    </Button>
                    <Button type="primary" className="rounded-xl">Save Changes</Button>
                </div>
            </SettingCard>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Transactions Managed', value: '1,204', icon: <CreditCardOutlined />, color: '#3b82f6', bg: isDark ? 'rgba(37,99,235,0.15)' : '#eff6ff' },
                    { label: 'Merchants Approved',   value: '48',    icon: <TeamOutlined />,       color: '#10b981', bg: isDark ? 'rgba(16,185,129,0.15)' : '#f0fdf4' },
                    { label: 'Reports Generated',    value: '23',    icon: <FileTextOutlined />,   color: '#f59e0b', bg: isDark ? 'rgba(245,158,11,0.15)' : '#fffbeb' },
                    { label: 'Settings Changed',     value: '7',     icon: <SettingOutlined />,    color: '#a855f7', bg: isDark ? 'rgba(168,85,247,0.15)' : '#faf5ff' },
                ].map(s => (
                    <SettingCard key={s.label} className="flex items-center gap-3 p-4!">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                             style={{ background: s.bg, color: s.color }}>
                            {s.icon}
                        </div>
                        <div>
                            <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
                        </div>
                    </SettingCard>
                ))}
            </div>
        </div>
    );

// ── Tab: Security ─────────────────────────────
const SecurityTab = ({ isDark }) => {
    const { idleEnabled, idleMinutes, setIdleEnabled, setIdleMinutes, user } = useAuth();

    // MFA State — initialise from the logged-in user's profile
    const [mfaEnabled, setMfaEnabled] = useState(() => user?.mfa?.enabled === true);

    // Keep in sync if user object updates (e.g. after re-login)
    React.useEffect(() => {
        setMfaEnabled(user?.mfa?.enabled === true);
    }, [user?.mfa?.enabled]);
    const [mfaSetupModalOpen, setMfaSetupModalOpen] = useState(false);
    const [mfaDisableModalOpen, setMfaDisableModalOpen] = useState(false);
    const [backupCodesModalOpen, setBackupCodesModalOpen] = useState(false);
    const [mfaSetupData, setMfaSetupData] = useState(null);
    const [backupCodes, setBackupCodes] = useState([]);
    const [mfaSetupStep, setMfaSetupStep] = useState(0);
    const [mfaLoading, setMfaLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const [mfaVerifyForm] = Form.useForm();
    const [mfaDisableForm] = Form.useForm();
    const [backupCodesForm] = Form.useForm();
    const [passwordForm] = Form.useForm();

    // Password change handler
    const handlePasswordChange = async () => {
        try {
            const values = await passwordForm.validateFields();
            if (values.newPassword !== values.confirmPassword) {
                notifyError('Passwords do not match');
                return;
            }
            setPasswordLoading(true);
            await authApi.changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            });
            notifySuccess('Password updated successfully');
            passwordForm.resetFields();
        } catch (error) {
            notifyError(error?.response?.data?.message || 'Failed to update password');
        } finally {
            setPasswordLoading(false);
        }
    };

    // MFA Setup Functions
    const handleStartMfaSetup = async () => {
        setMfaLoading(true);
        setMfaSetupStep(0);
        try {
            const response = await authApi.setupMfa();
            const data = response?.data ?? response;
            
            // Handle various possible field names from API
            const secret = data.secret || data.base32 || data.secretKey || '';
            const qrCodeValue = data.qrCodeUri || data.otpauthUrl || data.otpauth_url || data.uri || data.qrCode || '';
            
            // Check if qrCode is a base64 image (data URL) or an otpauth URL
            const isBase64Image = qrCodeValue.startsWith('data:image');
            
            let qrCodeUri = '';
            let qrCodeImage = '';
            
            if (isBase64Image) {
                // API returned a pre-rendered QR code image
                qrCodeImage = qrCodeValue;
            } else if (qrCodeValue.startsWith('otpauth://')) {
                // API returned an otpauth URL
                qrCodeUri = qrCodeValue;
            } else if (secret) {
                // Construct the otpauth URL from the secret
                const issuer = 'Meralot Admin';
                const accountName = user?.email || 'admin@meralot.com';
                qrCodeUri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
            }
            
            setMfaSetupData({
                secret: secret,
                qrCodeUri: qrCodeUri,
                qrCodeImage: qrCodeImage,
            });
            setMfaSetupModalOpen(true);
        } catch (error) {
            notifyError(error?.response?.data?.message || 'Failed to initialize MFA setup');
        } finally {
            setMfaLoading(false);
        }
    };

    const handleVerifyMfaSetup = async (values) => {
        setMfaLoading(true);
        try {
            const response = await authApi.verifyMfaSetup(values.verificationCode);
            const data = response?.data ?? response;
            setBackupCodes(data.backupCodes || []);
            setMfaSetupStep(2);
            setMfaEnabled(true);
            notifySuccess('Two-factor authentication enabled successfully!');
        } catch (error) {
            notifyError(error?.response?.data?.message || 'Invalid verification code');
        } finally {
            setMfaLoading(false);
        }
    };

    const handleDisableMfa = async (values) => {
        setMfaLoading(true);
        try {
            await authApi.disableMfa(values.password);
            setMfaEnabled(false);
            setMfaDisableModalOpen(false);
            mfaDisableForm.resetFields();
            notifySuccess('Two-factor authentication disabled');
        } catch (error) {
            notifyError(error?.response?.data?.message || 'Failed to disable MFA');
        } finally {
            setMfaLoading(false);
        }
    };

    const handleRegenerateBackupCodes = async (values) => {
        if (mfaLoading) return; // prevent double submit
        setMfaLoading(true);
        try {
            const response = await authApi.regenerateBackupCodes(values.password);
            const data = response?.data ?? response;
            setBackupCodes(data.backupCodes || []);
            backupCodesForm.resetFields();
            notifySuccess('Backup codes regenerated');
        } catch (error) {
            const msg = error?.response?.data?.message || error?.response?.data?.error || 'Failed to regenerate backup codes';
            notifyError(`${msg} (${error?.response?.status ?? 'error'})`);
        } finally {
            setMfaLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        notifySuccess('Copied to clipboard');
    };

    const copyAllBackupCodes = () => {
        const codesText = backupCodes.join('\n');
        navigator.clipboard.writeText(codesText);
        notifySuccess('All backup codes copied to clipboard');
    };

    const closeMfaSetupModal = () => {
        setMfaSetupModalOpen(false);
        setMfaSetupData(null);
        setMfaSetupStep(0);
        mfaVerifyForm.resetFields();
    };

    return (
        <div className="space-y-6">
            <SettingCard>
                <SectionTitle icon={<LockOutlined />} title="Change Password" subtitle="Use a strong password you don't use elsewhere" />
                <Form form={passwordForm} layout="vertical" className="space-y-4 max-w-md">
                    <Form.Item
                        name="currentPassword"
                        label={<span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Current Password</span>}
                        rules={[{ required: true, message: 'Current password is required' }]}
                    >
                        <Input.Password
                            placeholder="Enter current password"
                            className="rounded-xl h-10"
                            style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="newPassword"
                        label={<span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>New Password</span>}
                        rules={[
                            { required: true, message: 'New password is required' },
                            { min: 8, message: 'Password must be at least 8 characters' }
                        ]}
                    >
                        <Input.Password
                            placeholder="Enter new password"
                            className="rounded-xl h-10"
                            style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        label={<span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Confirm New Password</span>}
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Please confirm your password' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Passwords do not match'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            placeholder="Confirm new password"
                            className="rounded-xl h-10"
                            style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}
                        />
                    </Form.Item>
                    <Button
                        type="primary"
                        className="rounded-xl w-full"
                        icon={<LockOutlined />}
                        loading={passwordLoading}
                        onClick={handlePasswordChange}
                    >
                        Update Password
                    </Button>
                </Form>
            </SettingCard>

            <SettingCard>
                <SectionTitle icon={<SafetyCertificateOutlined />} title="Two-Factor Authentication" subtitle="Add an extra layer of security to your account" />
                <RowItem
                    label="Authenticator App"
                    description="Use Google Authenticator or similar app"
                    action={
                        mfaEnabled ? (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                                    <CheckCircleFilled /> Enabled
                                </span>
                                <Button size="small" className="rounded-lg" onClick={() => setMfaDisableModalOpen(true)}>
                                    Manage
                                </Button>
                            </div>
                        ) : (
                            <Button size="small" type="primary" className="rounded-lg" loading={mfaLoading} onClick={handleStartMfaSetup}>
                                Enable
                            </Button>
                        )
                    }
                />
                <RowItem
                    label="SMS Verification"
                    description="Receive codes via text message"
                    action={<Button size="small" type="primary" className="rounded-lg" disabled>Coming Soon</Button>}
                />
                <RowItem
                    label="Recovery Codes"
                    description="Generate a new set of backup codes (invalidates old ones)"
                    action={
                        <Button
                            size="small"
                            className="rounded-lg"
                            onClick={() => setBackupCodesModalOpen(true)}
                            disabled={!mfaEnabled}
                            icon={<ReloadOutlined />}
                        >
                            Regenerate
                        </Button>
                    }
                    noBorder
                />
            </SettingCard>

            <SettingCard>
                <SectionTitle icon={<GlobalOutlined />} title="Active Sessions" subtitle="Manage where you're logged in" />
                {[
                    { device: 'MacBook Pro', location: 'Mumbai, India', time: 'Active now',     current: true  },
                    { device: 'iPhone 15',   location: 'Mumbai, India', time: '2 hours ago',    current: false },
                    { device: 'Chrome / Win', location: 'Delhi, India', time: '3 days ago',     current: false },
                ].map((s, i) => (
                    <div key={i} className={`flex items-center justify-between py-3 ${i < 2 ? 'border-b' : ''}`}
                         style={{ borderColor: 'var(--border-color)' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                 style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)' }}>
                                <GlobalOutlined style={{ color: 'var(--text-secondary)' }} />
                            </div>
                            <div>
                                <div className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                    {s.device}
                                    {s.current && <span className="text-xs font-bold text-green-500 px-2 py-0.5 rounded-full"
                                                        style={{ background: isDark ? 'rgba(16,185,129,0.15)' : '#f0fdf4' }}>Current</span>}
                                </div>
                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.location} · {s.time}</div>
                            </div>
                        </div>
                        {!s.current && (
                            <button className="text-xs font-semibold text-red-500 hover:text-red-600">Sign out</button>
                        )}
                    </div>
                ))}
                <div className="mt-4">
                    <Button danger className="rounded-xl w-full">Sign Out All Other Sessions</Button>
                </div>
            </SettingCard>

            <SettingCard>
                <SectionTitle
                    icon={<ClockCircleOutlined />}
                    title="Auto Logout"
                    subtitle="Automatically sign out after a period of inactivity"
                />
                <RowItem
                    label="Enable Auto Logout"
                    description={
                        idleEnabled
                            ? `You'll be signed out after ${idleMinutes} minute${idleMinutes === 1 ? '' : 's'} of inactivity`
                            : 'Session will not expire due to inactivity'
                    }
                    action={
                        <Switch
                            checked={idleEnabled}
                            onChange={setIdleEnabled}
                            style={{ background: idleEnabled ? '#2563eb' : undefined }}
                        />
                    }
                    noBorder={!idleEnabled}
                />
                {idleEnabled && (
                    <div className="pt-4">
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                            Inactivity Timeout Duration
                        </label>
                        <Select
                            value={idleMinutes}
                            onChange={setIdleMinutes}
                            style={{ width: 200, height: 40 }}
                        >
                            <Option value={1}>1 minute</Option>
                            <Option value={5}>5 minutes</Option>
                            <Option value={10}>10 minutes</Option>
                            <Option value={15}>15 minutes</Option>
                            <Option value={20}>20 minutes</Option>
                            <Option value={30}>30 minutes</Option>
                            <Option value={60}>1 hour</Option>
                        </Select>
                    </div>
                )}
            </SettingCard>

            {/* MFA Setup Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <SafetyCertificateOutlined className="text-blue-500" />
                        <span>Setup Two-Factor Authentication</span>
                    </div>
                }
                open={mfaSetupModalOpen}
                onCancel={closeMfaSetupModal}
                footer={null}
                width={480}
                destroyOnClose
            >
                {mfaSetupStep === 0 && mfaSetupData && (
                    <div className="text-center py-4">
                        <Alert
                            message="Scan this QR code with your authenticator app"
                            description="Use Google Authenticator, Authy, or any TOTP-compatible app"
                            type="info"
                            showIcon
                            className="mb-6"
                        />

                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-white rounded-lg shadow-sm border">
                                {mfaSetupData.qrCodeImage ? (
                                    <img 
                                        src={mfaSetupData.qrCodeImage} 
                                        alt="MFA QR Code" 
                                        width={180} 
                                        height={180}
                                        style={{ display: 'block' }}
                                    />
                                ) : mfaSetupData.qrCodeUri ? (
                                    <QRCode
                                        value={mfaSetupData.qrCodeUri}
                                        size={180}
                                        errorLevel="M"
                                        bgColor="#ffffff"
                                        color="#000000"
                                    />
                                ) : (
                                    <div className="w-[180px] h-[180px] flex items-center justify-center bg-gray-100 text-gray-500 text-sm text-center p-4">
                                        QR code unavailable.<br />Please use the manual code below.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-xs text-gray-500">Can't scan? Enter this code manually:</p>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <code className="bg-gray-100 px-3 py-1.5 rounded text-sm font-mono">
                                    {mfaSetupData.secret}
                                </code>
                                <Button
                                    type="text"
                                    icon={<CopyOutlined />}
                                    size="small"
                                    onClick={() => copyToClipboard(mfaSetupData.secret)}
                                />
                            </div>
                        </div>

                        <Button type="primary" onClick={() => setMfaSetupStep(1)}>
                            Continue to Verification
                        </Button>
                    </div>
                )}

                {mfaSetupStep === 1 && (
                    <div className="py-4">
                        <Alert
                            message="Enter the 6-digit code from your authenticator app"
                            type="info"
                            showIcon
                            className="mb-6"
                        />

                        <Form form={mfaVerifyForm} onFinish={handleVerifyMfaSetup} layout="vertical">
                            <Form.Item
                                name="verificationCode"
                                label="Verification Code"
                                rules={[
                                    { required: true, message: 'Please enter the verification code' },
                                    { len: 6, message: 'Code must be exactly 6 digits' }
                                ]}
                            >
                                <Input
                                    placeholder="000000"
                                    maxLength={6}
                                    className="text-center text-2xl tracking-widest font-mono"
                                    style={{ letterSpacing: '0.5em' }}
                                />
                            </Form.Item>

                            <div className="flex gap-3 justify-end">
                                <Button onClick={() => setMfaSetupStep(0)}>Back</Button>
                                <Button type="primary" htmlType="submit" loading={mfaLoading}>
                                    Verify & Enable
                                </Button>
                            </div>
                        </Form>
                    </div>
                )}

                {mfaSetupStep === 2 && (
                    <div className="py-4">
                        <Alert
                            message={<span className="font-semibold">Save your backup codes!</span>}
                            description="These codes can be used to access your account if you lose access to your authenticator app. Each code can only be used once."
                            type="warning"
                            showIcon
                            icon={<ExclamationCircleOutlined />}
                            className="mb-6"
                        />

                        <div className="bg-gray-900 rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-2 gap-2">
                                {backupCodes.map((code, index) => (
                                    <div key={index} className="bg-gray-800 border border-gray-600 rounded px-3 py-2 font-mono text-sm text-center text-green-400 tracking-widest">
                                        {code}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 justify-center mb-6">
                            <Button icon={<CopyOutlined />} onClick={copyAllBackupCodes}>
                                Copy All Codes
                            </Button>
                        </div>

                        <div className="flex justify-end">
                            <Button type="primary" icon={<CheckCircleFilled />} onClick={closeMfaSetupModal}>
                                Done
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* MFA Disable Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-red-500">
                        <ExclamationCircleOutlined />
                        <span>Disable Two-Factor Authentication</span>
                    </div>
                }
                open={mfaDisableModalOpen}
                onCancel={() => { setMfaDisableModalOpen(false); mfaDisableForm.resetFields(); }}
                footer={null}
                width={400}
                destroyOnClose
            >
                <Alert
                    message="This will make your account less secure"
                    description="Without 2FA, your account will only be protected by your password."
                    type="warning"
                    showIcon
                    className="mb-6"
                />

                <Form form={mfaDisableForm} onFinish={handleDisableMfa} layout="vertical">
                    <Form.Item
                        name="password"
                        label="Enter your password to confirm"
                        rules={[{ required: true, message: 'Password is required' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Your password" />
                    </Form.Item>

                    <div className="flex gap-3 justify-end">
                        <Button onClick={() => { setMfaDisableModalOpen(false); mfaDisableForm.resetFields(); }}>
                            Cancel
                        </Button>
                        <Button danger type="primary" htmlType="submit" loading={mfaLoading}>
                            Disable 2FA
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Backup Codes Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <ReloadOutlined className="text-orange-500" />
                        <span>Regenerate Recovery Codes</span>
                    </div>
                }
                open={backupCodesModalOpen}
                onCancel={() => { setBackupCodesModalOpen(false); setBackupCodes([]); backupCodesForm.resetFields(); }}
                footer={null}
                width={480}
                destroyOnClose
            >
                {backupCodes.length === 0 ? (
                    <>
                        <Alert
                            message="This will invalidate your existing backup codes"
                            description="A new set of 10 one-time-use recovery codes will be generated. Your old codes will no longer work."
                            type="warning"
                            showIcon
                            className="mb-6"
                        />

                        <Form form={backupCodesForm} onFinish={handleRegenerateBackupCodes} layout="vertical">
                            <Form.Item
                                name="password"
                                label="Confirm your password to continue"
                                rules={[{ required: true, message: 'Password is required' }]}
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="Your current password" />
                            </Form.Item>

                            <div className="flex gap-3 justify-end">
                                <Button onClick={() => { setBackupCodesModalOpen(false); backupCodesForm.resetFields(); }}>
                                    Cancel
                                </Button>
                                <Button type="primary" htmlType="submit" loading={mfaLoading} icon={<ReloadOutlined />}>
                                    Generate New Codes
                                     </Button>
                            </div>
                        </Form>
                    </>
                ) : (
                    <>
                        <Alert
                            message={<span className="font-semibold">New recovery codes generated</span>}
                            description="Save these codes somewhere safe — they won't be shown again. Each code can only be used once."
                            type="success"
                            showIcon
                            className="mb-6"
                        />

                        <div className="bg-gray-900 rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-2 gap-2">
                                {backupCodes.map((code, index) => (
                                    <div key={index} className="bg-gray-800 border border-gray-600 rounded px-3 py-2 font-mono text-sm text-center text-green-400 tracking-widest">
                                        {code}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 justify-center mb-6">
                            <Button icon={<CopyOutlined />} onClick={copyAllBackupCodes}>
                                Copy All Codes
                            </Button>
                        </div>

                        <div className="flex justify-end">
                            <Button type="primary" icon={<CheckCircleFilled />} onClick={() => { setBackupCodesModalOpen(false); setBackupCodes([]); }}>
                                Done
                            </Button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
};

// ── Tab: Notifications ───────────────────────
const NotificationsTab = ({ notifications, setNotifications }) => (
        <div className="space-y-6">
            <SettingCard>
                <SectionTitle icon={<BellOutlined />} title="Notification Channels" subtitle="Choose how you receive notifications" />
                {[
                    { key: 'email', label: 'Email Notifications',   description: 'Receive updates and alerts via email' },
                    { key: 'push',  label: 'Push Notifications',     description: 'Browser push notifications when signed in' },
                    { key: 'sms',   label: 'SMS Notifications',      description: 'Text messages for critical alerts only' },
                ].map((n, i, arr) => (
                    <RowItem
                        key={n.key}
                        label={n.label}
                        description={n.description}
                        noBorder={i === arr.length - 1}
                        action={
                            <Switch
                                checked={notifications[n.key]}
                                onChange={v => setNotifications(prev => ({ ...prev, [n.key]: v }))}
                                style={{ background: notifications[n.key] ? '#2563eb' : undefined }}
                            />
                        }
                    />
                ))}
            </SettingCard>

            <SettingCard>
                <SectionTitle icon={<MailOutlined />} title="Email Preferences" subtitle="Pick which emails you'd like to receive" />
                {[
                    { key: 'weekly',   label: 'Weekly Summary',             description: 'A weekly digest of platform activity' },
                    { key: 'security', label: 'Security Alerts',            description: 'Login attempts and suspicious activity' },
                    { key: 'marketing',label: 'Product Updates & Tips',     description: 'News about new features and improvements' },
                ].map((n, i, arr) => (
                    <RowItem
                        key={n.key}
                        label={n.label}
                        description={n.description}
                        noBorder={i === arr.length - 1}
                        action={
                            <Switch
                                checked={notifications[n.key]}
                                onChange={v => setNotifications(prev => ({ ...prev, [n.key]: v }))}
                                style={{ background: notifications[n.key] ? '#2563eb' : undefined }}
                            />
                        }
                    />
                ))}
            </SettingCard>
        </div>
    );

// ── Tab: Appearance ───────────────────────────
const AppearanceTab = ({ isDark, toggleTheme }) => (
        <div className="space-y-6">
            <SettingCard>
                <SectionTitle icon={isDark ? <MoonOutlined /> : <SunOutlined />} title="Theme" subtitle="Choose your preferred colour scheme" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {/* Light mode option */}
                    <button
                        onClick={(e) => isDark && toggleTheme(e.clientX, e.clientY)}
                        className="p-4 rounded-2xl border-2 transition-all text-left"
                        style={{
                            borderColor: !isDark ? '#2563eb' : 'var(--border-color)',
                            background: !isDark ? 'rgba(37,99,235,0.05)' : 'var(--input-bg)',
                        }}
                    >
                        <div className="w-full h-24 rounded-xl mb-3 overflow-hidden border"
                             style={{ borderColor: 'var(--border-color)', background: '#f4f7fe' }}>
                            <div className="flex h-full">
                                <div className="w-1/3 h-full bg-white border-r border-gray-100" />
                                <div className="flex-1 p-2 space-y-1.5">
                                    <div className="h-2 bg-gray-200 rounded-full w-3/4" />
                                    <div className="h-2 bg-gray-200 rounded-full w-1/2" />
                                    <div className="h-8 bg-white rounded-lg border border-gray-100 mt-2" />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Light Mode</div>
                                <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Clean white interface</div>
                            </div>
                            {!isDark && <CheckCircleFilled className="text-blue-600 text-lg" />}
                        </div>
                    </button>

                    {/* Dark mode option */}
                    <button
                        onClick={(e) => !isDark && toggleTheme(e.clientX, e.clientY)}
                        className="p-4 rounded-2xl border-2 transition-all text-left"
                        style={{
                            borderColor: isDark ? '#2563eb' : 'var(--border-color)',
                            background: isDark ? 'rgba(37,99,235,0.1)' : 'var(--input-bg)',
                        }}
                    >
                        <div className="w-full h-24 rounded-xl mb-3 overflow-hidden border"
                             style={{ borderColor: '#2d3f55', background: '#0d1117' }}>
                            <div className="flex h-full">
                                <div className="w-1/3 h-full border-r" style={{ background: '#161b27', borderColor: '#2d3f55' }} />
                                <div className="flex-1 p-2 space-y-1.5">
                                    <div className="h-2 rounded-full w-3/4" style={{ background: '#2d3f55' }} />
                                    <div className="h-2 rounded-full w-1/2" style={{ background: '#2d3f55' }} />
                                    <div className="h-8 rounded-lg border mt-2" style={{ background: '#1e2a3a', borderColor: '#2d3f55' }} />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Dark Mode</div>
                                <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Easy on the eyes</div>
                            </div>
                            {isDark && <CheckCircleFilled className="text-blue-600 text-lg" />}
                        </div>
                    </button>
                </div>

                {/* Quick toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl"
                     style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)' }}>
                    <div className="flex items-center gap-3">
                        {isDark ? <MoonOutlined style={{ color: '#60a5fa', fontSize: 18 }} /> : <SunOutlined style={{ color: '#f59e0b', fontSize: 18 }} />}
                        <div>
                            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {isDark ? 'Dark Mode' : 'Light Mode'} Active
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Click to switch theme instantly</div>
                        </div>
                    </div>
                    <button className="theme-toggle-btn" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); toggleTheme(r.left + r.width / 2, r.top + r.height / 2); }} aria-label="Toggle theme" />
                </div>
            </SettingCard>

            <SettingCard>
                <SectionTitle icon={<GlobalOutlined />} title="Language & Region" subtitle="Set your preferred language and timezone" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Language</label>
                        <Select defaultValue="en" className="w-full" style={{ height: 40 }}>
                            <Option value="en">English (US)</Option>
                            <Option value="hi">Hindi</Option>
                            <Option value="fr">French</Option>
                            <Option value="es">Spanish</Option>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Timezone</label>
                        <Select defaultValue="ist" className="w-full" style={{ height: 40 }}>
                            <Option value="utc">UTC+0:00</Option>
                            <Option value="ist">IST (UTC+5:30)</Option>
                            <Option value="est">EST (UTC-5:00)</Option>
                            <Option value="pst">PST (UTC-8:00)</Option>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Date Format</label>
                        <Select defaultValue="dd-mm-yyyy" className="w-full" style={{ height: 40 }}>
                            <Option value="dd-mm-yyyy">DD/MM/YYYY</Option>
                            <Option value="mm-dd-yyyy">MM/DD/YYYY</Option>
                            <Option value="yyyy-mm-dd">YYYY-MM-DD</Option>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Currency</label>
                        <Select defaultValue="usd" className="w-full" style={{ height: 40 }}>
                            <Option value="usd">USD ($)</Option>
                            <Option value="eur">EUR (€)</Option>
                            <Option value="inr">INR (₹)</Option>
                            <Option value="gbp">GBP (£)</Option>
                        </Select>
                    </div>
                </div>
                <div className="flex justify-end mt-5">
                    <Button type="primary" className="rounded-xl">Save Preferences</Button>
                </div>
            </SettingCard>
        </div>
    );



export default Settings;
