import React, { useState, useEffect } from 'react';
import { Card, Tabs, Form, Input, Button, List, Typography, Popconfirm, Modal, QRCode, Alert } from 'antd';
import {
    SafetyCertificateOutlined,
    LockOutlined,
    MobileOutlined,
    DesktopOutlined,
    DeleteOutlined,
    CopyOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import authApi from '../../api/modules/auth';
import { notifySuccess, notifyError } from '../../utils/notification';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';

const { Title, Text } = Typography;

const SecuritySettings = () => {
    const [loading, setLoading] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);

    // MFA State
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [mfaSetupModalOpen, setMfaSetupModalOpen] = useState(false);
    const [mfaDisableModalOpen, setMfaDisableModalOpen] = useState(false);
    const [backupCodesModalOpen, setBackupCodesModalOpen] = useState(false);
    const [mfaSetupData, setMfaSetupData] = useState(null);
    const [backupCodes, setBackupCodes] = useState([]);
    const [mfaSetupStep, setMfaSetupStep] = useState(0); // 0: QR, 1: Verify, 2: Backup codes
    const [mfaLoading, setMfaLoading] = useState(false);

    const [passwordForm] = Form.useForm();
    const [mfaVerifyForm] = Form.useForm();
    const [mfaDisableForm] = Form.useForm();
    const [backupCodesForm] = Form.useForm();

    // Initial load
    useEffect(() => {
        fetchSessions();
        // TODO: Check if MFA is already enabled from user profile
    }, []);

    const fetchSessions = async () => {
        setSessionsLoading(true);
        try {
            const res = await authApi.getActiveSessions();
            if (res.data) setSessions(res.data);
        } catch {
            setSessions([]);
        } finally {
            setSessionsLoading(false);
        }
    };

    const handlePasswordChange = async (values) => {
        setLoading(true);
        try {
            await authApi.changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            });
            notifySuccess('Password updated successfully');
            passwordForm.resetFields();
        } catch (error) {
            notifyError(error?.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handleInvalidateSession = async (sessionId) => {
        try {
            await authApi.invalidateSession(sessionId);
            notifySuccess('Session revoked');
            fetchSessions();
        } catch {
            notifyError('Failed to revoke session');
        }
    };

    const handleLogoutAll = async () => {
        try {
            await authApi.logoutAll();
            notifySuccess('All other sessions revoked');
            fetchSessions();
        } catch {
            notifyError('Failed to revoke sessions');
        }
    };

    // MFA Setup Functions
    const handleStartMfaSetup = async () => {
        setMfaLoading(true);
        setMfaSetupStep(0);
        try {
            const response = await authApi.setupMfa();
            const data = response?.data ?? response;
            setMfaSetupData({
                secret: data.secret,
                qrCodeUri: data.qrCodeUri || data.otpauthUrl,
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
        setMfaLoading(true);
        try {
            const response = await authApi.regenerateBackupCodes(values.password);
            const data = response?.data ?? response;
            setBackupCodes(data.backupCodes || []);
            backupCodesForm.resetFields();
            notifySuccess('Backup codes regenerated');
        } catch (error) {
            notifyError(error?.response?.data?.message || 'Failed to regenerate backup codes');
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

    const passwordTab = (
        <div className="max-w-md">
            <Title level={4} className="mb-6">Change Password</Title>
            <Form form={passwordForm} layout="vertical" onFinish={handlePasswordChange}>
                <Form.Item
                    label="Current Password"
                    name="currentPassword"
                    rules={[{ required: true, message: 'Current password is required' }]}
                >
                    <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
                <Form.Item
                    label="New Password"
                    name="newPassword"
                    rules={[
                        { required: true, message: 'New password is required' },
                        { min: 8, message: 'Must be at least 8 characters' }
                    ]}
                >
                    <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
                <Form.Item
                    label="Confirm New Password"
                    name="confirmPassword"
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
                    <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Update Password
                </Button>
            </Form>
        </div>
    );

    const mfaTab = (
        <div className="max-w-md">
            <Title level={4} className="mb-2">Two-Factor Authentication</Title>
            <Text type="secondary" className="block mb-6">
                Add an extra layer of security to your account by enabling 2FA.
            </Text>

            <Card className="bg-gray-50 border-gray-200 shadow-sm mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${mfaEnabled ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            <SafetyCertificateOutlined />
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">Authenticator App</div>
                            <div className={`text-sm ${mfaEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                                {mfaEnabled ? 'Enabled' : 'Not configured'}
                            </div>
                        </div>
                    </div>
                    {mfaEnabled ? (
                        <Button danger onClick={() => setMfaDisableModalOpen(true)}>
                            Disable
                        </Button>
                    ) : (
                        <Button type="primary" onClick={handleStartMfaSetup} loading={mfaLoading}>
                            Setup
                        </Button>
                    )}
                </div>
            </Card>

            {mfaEnabled && (
                <Card className="bg-gray-50 border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-lg">
                                <ReloadOutlined />
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">Backup Codes</div>
                                <div className="text-sm text-gray-500">Generate new backup codes</div>
                            </div>
                        </div>
                        <Button onClick={() => setBackupCodesModalOpen(true)}>
                            Regenerate
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );

    const sessionsTab = (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Title level={4} className="!mb-1">Active Sessions</Title>
                    <Text type="secondary">Review and revoke active sessions across your devices.</Text>
                </div>
                <Popconfirm
                    title="Revoke all other sessions?"
                    onConfirm={handleLogoutAll}
                >
                    <Button danger>Revoke All Others</Button>
                </Popconfirm>
            </div>

            {sessionsLoading ? <Loader /> : (
                <List
                    itemLayout="horizontal"
                    dataSource={sessions.length > 0 ? sessions : [{ id: 'current', device: 'Current Session (Mac OS, Chrome)', current: true }]}
                    renderItem={item => (
                        <List.Item
                            actions={[
                                !item.current && (
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleInvalidateSession(item.id)}
                                    >
                                        Revoke
                                    </Button>
                                )
                            ].filter(Boolean)}
                            className="bg-white border border-gray-100 rounded-lg p-4 mb-3 shadow-sm"
                        >
                            <List.Item.Meta
                                avatar={
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-lg">
                                        {item.device?.toLowerCase().includes('mobile') ? <MobileOutlined /> : <DesktopOutlined />}
                                    </div>
                                }
                                title={
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{item.device || 'Unknown Device'}</span>
                                        {item.current && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Current</span>}
                                    </div>
                                }
                                description={
                                    <div className="text-sm text-gray-500 mt-1">
                                        IP: {item.ip || '192.168.1.1'} • Last active: {item.lastActive || 'Just now'}
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            )}
        </div>
    );

    const items = [
        { key: 'password', label: 'Password', children: passwordTab },
        { key: 'mfa', label: 'Two-Factor Auth', children: mfaTab },
        { key: 'sessions', label: 'Active Sessions', children: sessionsTab },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <PageHeader
                title="Security Settings"
                description="Manage your password, two-factor authentication, and active sessions."
                breadcrumbs={[{ title: 'Settings' }]}
            />

            <Card className="shadow-sm border border-gray-200">
                <Tabs items={items} />
            </Card>

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
                                <QRCode
                                    value={mfaSetupData.qrCodeUri || ''}
                                    size={180}
                                    errorLevel="M"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <Text type="secondary" className="text-xs">Can't scan? Enter this code manually:</Text>
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

                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-2 gap-2">
                                {backupCodes.map((code, index) => (
                                    <div key={index} className="bg-white border rounded px-3 py-2 font-mono text-sm text-center">
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
                            <Button type="primary" icon={<CheckCircleOutlined />} onClick={closeMfaSetupModal}>
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

            {/* Backup Codes Regeneration Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <ReloadOutlined className="text-orange-500" />
                        <span>Regenerate Backup Codes</span>
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
                            description="Make sure you save the new codes in a safe place."
                            type="warning"
                            showIcon
                            className="mb-6"
                        />

                        <Form form={backupCodesForm} onFinish={handleRegenerateBackupCodes} layout="vertical">
                            <Form.Item
                                name="password"
                                label="Enter your password to continue"
                                rules={[{ required: true, message: 'Password is required' }]}
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="Your password" />
                            </Form.Item>

                            <div className="flex gap-3 justify-end">
                                <Button onClick={() => { setBackupCodesModalOpen(false); backupCodesForm.resetFields(); }}>
                                    Cancel
                                </Button>
                                <Button type="primary" htmlType="submit" loading={mfaLoading}>
                                    Generate New Codes
                                </Button>
                            </div>
                        </Form>
                    </>
                ) : (
                    <>
                        <Alert
                            message={<span className="font-semibold">Your new backup codes</span>}
                            description="Save these codes in a safe place. Each code can only be used once."
                            type="success"
                            showIcon
                            className="mb-6"
                        />

                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-2 gap-2">
                                {backupCodes.map((code, index) => (
                                    <div key={index} className="bg-white border rounded px-3 py-2 font-mono text-sm text-center">
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
                            <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => { setBackupCodesModalOpen(false); setBackupCodes([]); }}>
                                Done
                            </Button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default SecuritySettings;
