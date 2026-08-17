import React, { useState } from 'react';
import { Form, Input, Button, Alert, Steps } from 'antd';
import {
    MailOutlined,
    SafetyCertificateOutlined,
    ArrowLeftOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import authApi from '../../api/modules/auth';
import { notifySuccess, notifyError } from '../../utils/notification';

const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0); // 0: email, 1: mfa, 2: success
    const [error, setError] = useState(null);
    const [tempUserId, setTempUserId] = useState(null);
    const [mfaMethod, setMfaMethod] = useState(null);
    const [emailForm] = Form.useForm();
    const [mfaForm] = Form.useForm();

    const onSubmitEmail = async (values) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authApi.forgotPassword(values.email);
            const payload = response?.data ?? response;

            if (payload?.requiresMFA || payload?.requiresMfa) {
                // MFA is enabled for this user
                setTempUserId(payload.userId ?? payload.tempUserId);
                setMfaMethod(payload.mfaMethod || 'totp');
                setCurrentStep(1);
                notifySuccess('Please verify your identity with MFA');
            } else {
                // No MFA, reset link sent directly
                setCurrentStep(2);
                notifySuccess('Password reset link sent to your email');
            }
        } catch (err) {
            const message = err?.response?.data?.message || 'Failed to process request. Please try again.';
            setError(message);
            notifyError(message);
        } finally {
            setLoading(false);
        }
    };

    const onSubmitMfa = async (values) => {
        setLoading(true);
        setError(null);
        try {
            await authApi.forgotPasswordVerifyMfa(tempUserId, values.mfaCode);
            setCurrentStep(2);
            notifySuccess('Verification successful! Reset link sent to your email.');
        } catch (err) {
            const message = err?.response?.data?.message || 'Invalid verification code. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (mfaMethod !== 'totp') {
            setLoading(true);
            try {
                await authApi.sendMfaOtp(tempUserId);
                notifySuccess('New code sent successfully');
            } catch (err) {
                notifyError('Failed to resend code');
            } finally {
                setLoading(false);
            }
        }
    };

    const stepItems = [
        { title: 'Email' },
        { title: 'Verify' },
        { title: 'Done' },
    ];

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
                        Password <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #a78bfa)' }}>Recovery</span>
                    </h1>
                    <p className="text-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        We'll help you regain access to your account securely.
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
                    {/* Steps indicator */}
                    <div className="mb-8">
                        <Steps
                            current={currentStep}
                            items={stepItems}
                            size="small"
                            className="custom-steps"
                        />
                    </div>

                    {/* Back to login link */}
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
                        style={{ color: '#64748b' }}
                    >
                        <ArrowLeftOutlined /> Back to login
                    </Link>

                    {/* Step 0: Email Input */}
                    {currentStep === 0 && (
                        <>
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
                                <p className="text-sm" style={{ color: '#64748b' }}>
                                    Enter your email address and we'll send you a reset link.
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
                                form={emailForm}
                                name="forgot_password_form"
                                onFinish={onSubmitEmail}
                                layout="vertical"
                                size="large"
                                requiredMark={false}
                            >
                                <Form.Item
                                    name="email"
                                    label={<span className="text-sm font-semibold" style={{ color: '#94a3b8' }}>Email Address</span>}
                                    rules={[
                                        { required: true, message: 'Please enter your email' },
                                        { type: 'email', message: 'Please enter a valid email' }
                                    ]}
                                >
                                    <Input
                                        prefix={<MailOutlined style={{ color: '#475569' }} />}
                                        placeholder="admin@company.com"
                                        className="rounded-xl h-12"
                                        style={{ background: '#161b27', border: '1px solid #2d3f55', color: '#e2e8f0' }}
                                    />
                                </Form.Item>

                                <Form.Item className="mt-6 mb-0">
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        className="w-full h-12 rounded-xl text-sm font-semibold border-0"
                                        style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }}
                                    >
                                        Send Reset Link
                                    </Button>
                                </Form.Item>
                            </Form>
                        </>
                    )}

                    {/* Step 1: MFA Verification */}
                    {currentStep === 1 && (
                        <>
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">Verify Your Identity</h2>
                                <p className="text-sm" style={{ color: '#64748b' }}>
                                    {mfaMethod === 'totp'
                                        ? 'Enter the 6-digit code from your authenticator app.'
                                        : `Enter the 6-digit code sent to your ${mfaMethod === 'sms' ? 'phone' : 'email'}.`
                                    }
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

                            <div className="p-4 rounded-2xl mb-6 flex items-start gap-3"
                                 style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)' }}>
                                <SafetyCertificateOutlined style={{ color: '#60a5fa', fontSize: 18, marginTop: 2 }} />
                                <div>
                                    <div className="text-sm font-semibold mb-0.5" style={{ color: '#93c5fd' }}>
                                        {mfaMethod === 'totp' ? 'Authenticator Required' : 'Verification Code Sent'}
                                    </div>
                                    <div className="text-xs" style={{ color: '#475569' }}>
                                        {mfaMethod === 'totp'
                                            ? 'Open your authenticator app and enter the 6-digit code shown.'
                                            : `A code has been sent to your ${mfaMethod === 'sms' ? 'phone number' : 'email address'}.`
                                        }
                                    </div>
                                </div>
                            </div>

                            <Form
                                form={mfaForm}
                                name="forgot_password_mfa_form"
                                onFinish={onSubmitMfa}
                                layout="vertical"
                                size="large"
                            >
                                <Form.Item
                                    name="mfaCode"
                                    label={<span className="text-sm font-semibold" style={{ color: '#94a3b8' }}>Verification Code</span>}
                                    rules={[
                                        { required: true, message: 'Please enter your 6-digit code' },
                                        { len: 6, message: 'Code must be exactly 6 digits' }
                                    ]}
                                >
                                    <Input
                                        prefix={<SafetyCertificateOutlined style={{ color: '#475569' }} />}
                                        placeholder="000 000"
                                        maxLength={6}
                                        className="rounded-xl text-center text-3xl tracking-[0.6em] font-mono h-16"
                                        style={{ background: '#161b27', border: '1px solid #2d3f55', color: '#e2e8f0' }}
                                    />
                                </Form.Item>

                                <Form.Item className="mt-6 mb-0">
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        className="w-full h-12 rounded-xl text-sm font-semibold border-0 mb-3"
                                        style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }}
                                    >
                                        Verify & Send Reset Link
                                    </Button>

                                    {mfaMethod !== 'totp' && (
                                        <Button
                                            type="text"
                                            className="w-full h-10 rounded-xl text-sm font-medium"
                                            style={{ color: '#64748b' }}
                                            onClick={handleResendOtp}
                                            disabled={loading}
                                        >
                                            Resend Code
                                        </Button>
                                    )}

                                    <Button
                                        type="text"
                                        className="w-full h-10 rounded-xl text-sm font-medium"
                                        style={{ color: '#64748b' }}
                                        onClick={() => { setCurrentStep(0); setError(null); }}
                                        disabled={loading}
                                    >
                                        ← Back to email
                                    </Button>
                                </Form.Item>
                            </Form>
                        </>
                    )}

                    {/* Step 2: Success */}
                    {currentStep === 2 && (
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                                 style={{ background: 'rgba(34,197,94,0.15)' }}>
                                <CheckCircleOutlined style={{ fontSize: 40, color: '#22c55e' }} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
                            <p className="text-sm mb-8" style={{ color: '#64748b' }}>
                                We've sent a password reset link to your email address.
                                Please check your inbox and follow the instructions.
                            </p>
                            <p className="text-xs mb-6" style={{ color: '#475569' }}>
                                Didn't receive the email? Check your spam folder or{' '}
                                <button
                                    onClick={() => setCurrentStep(0)}
                                    className="text-blue-400 hover:text-blue-300 underline"
                                >
                                    try again
                                </button>
                            </p>
                            <Link to="/login">
                                <Button
                                    type="primary"
                                    className="h-12 px-8 rounded-xl text-sm font-semibold border-0"
                                    style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }}
                                >
                                    Return to Login
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom styles for dark theme steps */}
            <style>{`
                .custom-steps .ant-steps-item-title {
                    color: #64748b !important;
                }
                .custom-steps .ant-steps-item-finish .ant-steps-item-title {
                    color: #22c55e !important;
                }
                .custom-steps .ant-steps-item-process .ant-steps-item-title {
                    color: #60a5fa !important;
                }
                .custom-steps .ant-steps-item-icon {
                    background: #1e293b !important;
                    border-color: #334155 !important;
                }
                .custom-steps .ant-steps-item-finish .ant-steps-item-icon {
                    background: rgba(34,197,94,0.15) !important;
                    border-color: #22c55e !important;
                }
                .custom-steps .ant-steps-item-process .ant-steps-item-icon {
                    background: linear-gradient(135deg, #2563eb, #4f46e5) !important;
                    border-color: transparent !important;
                }
            `}</style>
        </div>
    );
};

export default ForgotPassword;
