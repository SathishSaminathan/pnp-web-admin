import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Alert, Spin } from 'antd';
import {
    LockOutlined,
    ArrowLeftOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    LoadingOutlined,
} from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import authApi from '../../api/modules/auth';
import { notifySuccess, notifyError } from '../../utils/notification';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        const validateToken = async () => {
            try {
                await authApi.verifyResetToken(token);
                setTokenValid(true);
            } catch (err) {
                setTokenValid(false);
                setError(err?.response?.data?.message || 'Invalid or expired reset token');
            } finally {
                setValidating(false);
            }
        };

        if (token) {
            validateToken();
        } else {
            setValidating(false);
            setTokenValid(false);
            setError('No reset token provided');
        }
    }, [token]);

    const onSubmit = async (values) => {
        setLoading(true);
        setError(null);
        try {
            await authApi.resetPassword({
                token,
                newPassword: values.newPassword
            });
            setSuccess(true);
            notifySuccess('Password reset successfully!');
            // Redirect to login after 3 seconds
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            const message = err?.response?.data?.message || 'Failed to reset password. Please try again.';
            setError(message);
            notifyError(message);
        } finally {
            setLoading(false);
        }
    };

    const validatePassword = (_, value) => {
        if (!value) {
            return Promise.reject(new Error('Please enter a new password'));
        }
        if (value.length < 8) {
            return Promise.reject(new Error('Password must be at least 8 characters'));
        }
        if (!/[A-Z]/.test(value)) {
            return Promise.reject(new Error('Password must contain an uppercase letter'));
        }
        if (!/[a-z]/.test(value)) {
            return Promise.reject(new Error('Password must contain a lowercase letter'));
        }
        if (!/[0-9]/.test(value)) {
            return Promise.reject(new Error('Password must contain a number'));
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            return Promise.reject(new Error('Password must contain a special character'));
        }
        return Promise.resolve();
    };

    return (
        <div className="min-h-screen flex" style={{ background: '#0d1117' }}>
            {/* Left branding panel */}
            <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-8 xl:p-12"
                 style={{ background: 'linear-gradient(135deg, #0f1923 0%, #111827 50%, #0d1117 100%)' }}>

                {/* Animated gradient blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 animate-blob"
                         style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', filter: 'blur(80px)' }} />
                    <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full opacity-15 animate-blob animation-delay-2000"
                         style={{ background: 'radial-gradient(circle, #6366f1, transparent)', filter: 'blur(80px)' }} />
                    <div className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full opacity-15 animate-blob animation-delay-4000"
                         style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', filter: 'blur(80px)' }} />
                </div>

                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-[0.03]"
                     style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                        <span className="text-white font-bold text-xl">N</span>
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">Meralot Admin</span>
                </div>

                {/* Center content */}
                <div className="relative z-10 flex-1 flex flex-col justify-center max-w-lg">
                    <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
                        Reset Your <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #a78bfa)' }}>Password</span>
                    </h1>
                    <p className="text-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Choose a strong password to secure your account.
                    </p>
                </div>

                {/* Bottom stats */}
                <div className="relative z-10 flex gap-8">
                    {[
                        { value: '99.9%', label: 'Uptime SLA' },
                        { value: '256-bit', label: 'Encryption' },
                        { value: '24/7', label: 'Support' },
                    ].map((s, i) => (
                        <div key={i}>
                            <div className="text-xl font-bold text-white">{s.value}</div>
                            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12" style={{ background: '#0f1419' }}>
                <div className="w-full max-w-md">
                    {/* Loading state */}
                    {validating && (
                        <div className="text-center">
                            <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#60a5fa' }} spin />} />
                            <p className="mt-4 text-sm" style={{ color: '#64748b' }}>Validating reset token...</p>
                        </div>
                    )}

                    {/* Invalid token state */}
                    {!validating && !tokenValid && (
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                                 style={{ background: 'rgba(239,68,68,0.15)' }}>
                                <CloseCircleOutlined style={{ fontSize: 40, color: '#ef4444' }} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">Invalid Reset Link</h2>
                            <p className="text-sm mb-8" style={{ color: '#64748b' }}>
                                {error || 'This password reset link is invalid or has expired.'}
                            </p>
                            <Link to="/forgot-password">
                                <Button
                                    type="primary"
                                    className="h-12 px-8 rounded-xl text-sm font-semibold border-0 mr-3"
                                    style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }}
                                >
                                    Request New Link
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button
                                    type="text"
                                    className="h-12 px-8 rounded-xl text-sm font-medium"
                                    style={{ color: '#64748b' }}
                                >
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Success state */}
                    {!validating && tokenValid && success && (
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                                 style={{ background: 'rgba(34,197,94,0.15)' }}>
                                <CheckCircleOutlined style={{ fontSize: 40, color: '#22c55e' }} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">Password Reset!</h2>
                            <p className="text-sm mb-8" style={{ color: '#64748b' }}>
                                Your password has been successfully reset.
                                You'll be redirected to login shortly.
                            </p>
                            <Link to="/login">
                                <Button
                                    type="primary"
                                    className="h-12 px-8 rounded-xl text-sm font-semibold border-0"
                                    style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }}
                                >
                                    Go to Login
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Reset form */}
                    {!validating && tokenValid && !success && (
                        <>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
                                style={{ color: '#64748b' }}
                            >
                                <ArrowLeftOutlined /> Back to login
                            </Link>

                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">Create New Password</h2>
                                <p className="text-sm" style={{ color: '#64748b' }}>
                                    Your new password must be different from previous passwords.
                                </p>
                            </div>

                            {error && (
                                <Alert
                                    message={error}
                                    type="error"
                                    showIcon
                                    closable
                                    onClose={() => setError(null)}
                                    className="mb-6 rounded-xl"
                                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
                                />
                            )}

                            <Form
                                form={form}
                                name="reset_password_form"
                                onFinish={onSubmit}
                                layout="vertical"
                                size="large"
                                requiredMark={false}
                            >
                                <Form.Item
                                    name="newPassword"
                                    label={<span className="text-sm font-semibold" style={{ color: '#94a3b8' }}>New Password</span>}
                                    rules={[{ validator: validatePassword }]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined style={{ color: '#475569' }} />}
                                        placeholder="Enter new password"
                                        className="rounded-xl h-12"
                                        style={{ background: '#161b27', border: '1px solid #2d3f55', color: '#e2e8f0' }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="confirmPassword"
                                    label={<span className="text-sm font-semibold" style={{ color: '#94a3b8' }}>Confirm Password</span>}
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
                                        prefix={<LockOutlined style={{ color: '#475569' }} />}
                                        placeholder="Confirm new password"
                                        className="rounded-xl h-12"
                                        style={{ background: '#161b27', border: '1px solid #2d3f55', color: '#e2e8f0' }}
                                    />
                                </Form.Item>

                                {/* Password requirements */}
                                <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)' }}>
                                    <p className="text-xs font-semibold mb-2" style={{ color: '#93c5fd' }}>Password Requirements:</p>
                                    <ul className="text-xs space-y-1" style={{ color: '#64748b' }}>
                                        <li>• At least 8 characters long</li>
                                        <li>• One uppercase letter (A-Z)</li>
                                        <li>• One lowercase letter (a-z)</li>
                                        <li>• One number (0-9)</li>
                                        <li>• One special character (!@#$%^&*)</li>
                                    </ul>
                                </div>

                                <Form.Item className="mb-0">
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        className="w-full h-12 rounded-xl text-sm font-semibold border-0"
                                        style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }}
                                    >
                                        Reset Password
                                    </Button>
                                </Form.Item>
                            </Form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
