import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Checkbox, Alert } from 'antd';
import {
    UserOutlined,
    LockOutlined,
    SafetyCertificateOutlined,
    ArrowRightOutlined,
    SecurityScanOutlined,
    ThunderboltOutlined,
    GlobalOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';

/* ── Neural Network Particle Canvas ── */
const ParticleNetwork = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animId;
        const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
        resize();
        window.addEventListener('resize', resize);

        const N = 55;
        const particles = Array.from({ length: N }, () => ({
            x: Math.random() * canvas.offsetWidth,
            y: Math.random() * canvas.offsetHeight,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            r: Math.random() * 1.6 + 0.6,
            phase: Math.random() * Math.PI * 2,
        }));

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.x += p.vx; p.y += p.vy; p.phase += 0.018;
                if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height)  p.vy *= -1;
                const a = 0.3 + 0.28 * Math.sin(p.phase);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(96,165,250,0.6)';
                ctx.fillStyle = `rgba(96,165,250,${a})`;
                ctx.fill();
                ctx.shadowBlur = 0;
            });
            for (let i = 0; i < N; i++) {
                for (let j = i + 1; j < N; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const d  = Math.sqrt(dx * dx + dy * dy);
                    if (d < 135) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(99,102,241,${0.2 * (1 - d / 135)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            animId = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
    }, []);
    return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
};

/* ── Typewriter ── */
const PHRASES = ['Users & Owners', 'Earnings', 'Visit History', 'Listings'];
const useTypewriter = () => {
    const [text, setText]       = useState('');
    const [wIdx, setWIdx]       = useState(0);
    const [cIdx, setCIdx]       = useState(0);
    const [deleting, setDel]    = useState(false);
    useEffect(() => {
        const phrase = PHRASES[wIdx];
        const delay  = (!deleting && cIdx === phrase.length) ? 2200
                     : (deleting && cIdx === 0) ? 400
                     : deleting ? 42 : 72;
        const t = setTimeout(() => {
            if (!deleting && cIdx < phrase.length) { setText(phrase.slice(0, cIdx + 1)); setCIdx(c => c + 1); }
            else if (!deleting && cIdx === phrase.length) { setDel(true); }
            else if (deleting && cIdx > 0)  { setText(phrase.slice(0, cIdx - 1)); setCIdx(c => c - 1); }
            else { setDel(false); setWIdx(i => (i + 1) % PHRASES.length); }
        }, delay);
        return () => clearTimeout(t);
    }, [cIdx, deleting, wIdx]);
    return text;
};

const REMEMBER_KEY = '_nf_adm_rem_email';

const Login = () => {
    const { login, verifyMfa } = useAuth();
    const [loading, setLoading] = useState(false);
    const [mfaRequired, setMfaRequired] = useState(false);
    const [tempUserId, setTempUserId] = useState(null);
    const [error, setError] = useState(null);
    const typewritten = useTypewriter();

    const savedEmail = (() => { try { return localStorage.getItem(REMEMBER_KEY) || ''; } catch { return ''; } })();

    const onFinishAuth = async (values) => {
        setLoading(true);
        setError(null);
        try {
            try {
                if (values.remember) {
                    localStorage.setItem(REMEMBER_KEY, values.username);
                } else {
                    localStorage.removeItem(REMEMBER_KEY);
                }
            } catch { /* non-critical: ignore if storage unavailable */ }
            const res = await login({ email: values.username, password: values.password });
            if (res?.requiresMfa) {
                setMfaRequired(true);
                setTempUserId(res.tempUserId);
            }
        } catch (err) {
            setError('Invalid credentials. Please check your email and password.');
        } finally {
            setLoading(false);
        }
    };

    const onFinishMfa = async (values) => {
        setLoading(true);
        setError(null);
        try {
            await verifyMfa(tempUserId, values.mfaCode);
        } catch (err) {
            setError('Invalid verification code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: <ThunderboltOutlined />, title: 'Live operations',  desc: 'Users, owners, listings, and visit history' },
        { icon: <SecurityScanOutlined />, title: 'Admin access',   desc: 'Email and password login for PNP staff' },
        { icon: <GlobalOutlined />,       title: 'Earnings', desc: 'Platform fees, settlements, and host payouts' },
    ];

    return (
        <div className="min-h-screen flex" style={{ background: '#f4f7fe' }}>

            {/* ══ Left branding panel ══ */}
            <div
                className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-8 xl:p-12"
                style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%)' }}
            >
                {/* Neural-network particle canvas */}
                <ParticleNetwork />

                {/* Animated glowing blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-32 -left-32 w-130 h-130 rounded-full animate-blob"
                         style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)', filter: 'blur(72px)' }} />
                    <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full animate-blob animation-delay-2000"
                         style={{ background: 'radial-gradient(circle, rgba(165,180,252,0.2), transparent 70%)', filter: 'blur(72px)' }} />
                    <div className="absolute -bottom-24 left-1/4 w-110 h-110 rounded-full animate-blob animation-delay-4000"
                         style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)', filter: 'blur(72px)' }} />
                </div>

                {/* Multi-level circuit grid */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px),
                        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: '80px 80px, 80px 80px, 20px 20px, 20px 20px',
                }} />

                {/* Horizontal scan line */}
                <div className="nf-scan-line absolute left-0 right-0 h-[1.5px] pointer-events-none"
                     style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.3) 70%, transparent 100%)' }} />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
                        <img src="/meralottm.png" alt="Meralot" className="h-7 w-auto object-contain" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.5))' }} />
                        <span className="text-sm font-bold tracking-wide" style={{ color: '#ffffff' }}>PNP</span>
                    </div>
                </div>

                {/* Center content */}
                <div className="relative z-10 flex-1 flex flex-col justify-center max-w-lg">
                    {/* Status badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 w-fit"
                         style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}>
                        <span className="w-2 h-2 rounded-full bg-white nf-pulse-dot" />
                        <span className="text-xs font-semibold tracking-widest text-white">ENTERPRISE PLATFORM</span>
                    </div>

                    {/* Typewriter headline */}
                    <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-3 tracking-tight" style={{ color: '#f1f5f9' }}>
                        Admin<br />
                        <span style={{ color: '#ffffff' }}>
                            {typewritten || '\u00A0'}
                        </span>
                        <span className="nf-cursor" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 200 }}>|</span>
                    </h1>
                    <p className="text-base leading-relaxed mb-7" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Manage users, owners, earnings, and visit history from one dashboard.
                    </p>

                    {/* Feature cards */}
                    <div className="space-y-2">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl nf-feature-card"
                                 style={{ background: 'rgba(255,255,255,0.028)', border: '1px solid rgba(255,255,255,0.055)', animationDelay: `${i * 0.12 + 0.2}s` }}>
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0"
                     style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', boxShadow: '0 0 14px rgba(255,255,255,0.1)' }}>
                                    {f.icon}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold" style={{ color: '#ffffff' }}>{f.title}</div>
                                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{f.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom stats */}
                <div className="relative z-10 flex gap-8">
                    {[
                        { value: '99.9%', label: 'Uptime SLA' },
                        { value: '256-bit', label: 'Encryption' },
                        { value: '24/7', label: 'Monitoring' },
                    ].map((s, i) => (
                        <div key={i} className="nf-fade-up" style={{ animationDelay: `${i * 0.15 + 0.4}s` }}>
                            <div className="text-xl font-bold"
                                 style={{ background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                {s.value}
                            </div>
                            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ══ Right form panel ══ */}
            <div className="w-full lg:w-[48%] flex items-center justify-center p-5 sm:p-8 lg:p-12 relative overflow-hidden"
                 style={{ background: '#ffffff' }}>

                {/* Subtle radial glow behind form */}
                <div className="absolute inset-0 pointer-events-none"
                     style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(37,99,235,0.05), transparent)' }} />

                <div className="w-full max-w-105 relative z-10 nf-fade-up">

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                            <img src="/meralottm.png" alt="Meralot" className="h-7 w-auto object-contain" style={{ filter: 'drop-shadow(0 0 4px rgba(37,99,235,0.4))' }} />
                            <span className="text-sm font-bold tracking-wide" style={{ color: '#2563eb' }}>PNP</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2" style={{ color: '#111827' }}>
                            {mfaRequired ? 'Verify Identity' : 'Sign in'}
                        </h2>
                        <p className="text-sm" style={{ color: '#6b7280' }}>
                            {mfaRequired
                                ? 'Enter the 6-digit code from your authenticator app.'
                                : 'Use admin@pnp.app / Admin@123 for the demo.'}
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
                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}
                        />
                    )}

                    {!mfaRequired ? (
                        <Form
                            name="login_form"
                            onFinish={onFinishAuth}
                            layout="vertical"
                            size="large"
                            requiredMark={false}
                            initialValues={{ username: savedEmail, remember: !!savedEmail }}
                        >
                            <Form.Item
                                name="username"
                                label={<span className="text-sm font-semibold" style={{ color: '#374151' }}>Email Address</span>}
                                rules={[{ required: true, message: 'Please enter your email' }]}
                            >
                                <Input
                                    prefix={<UserOutlined style={{ color: '#9ca3af' }} className="mr-1" />}
                                    placeholder="admin@pnp.app"
                                    className="rounded-xl h-12 text-sm"
                                    style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label={<span className="text-sm font-semibold" style={{ color: '#374151' }}>Password</span>}
                                rules={[{ required: true, message: 'Please enter your password' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#9ca3af' }} className="mr-1" />}
                                    placeholder="••••••••"
                                    className="rounded-xl h-12 text-sm"
                                    style={{ background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' }}
                                />
                            </Form.Item>

                            <div className="flex justify-between items-center mb-6">
                                <Form.Item name="remember" valuePropName="checked" noStyle>
                                    <Checkbox style={{ color: '#6b7280' }}>
                                        <span className="text-sm">Remember me</span>
                                    </Checkbox>
                                </Form.Item>
                            </div>

                            <Form.Item className="mb-0">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    icon={!loading && <ArrowRightOutlined />}
                                    iconPosition="end"
                                    className="w-full h-12 rounded-xl text-sm font-semibold border-0 nf-btn-primary"
                                    style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
                                >
                                    Sign in to Dashboard
                                </Button>
                            </Form.Item>
                        </Form>
                    ) : (
                        <Form name="mfa_form" onFinish={onFinishMfa} layout="vertical" size="large">
                            <div className="p-4 rounded-2xl mb-6 flex items-start gap-3"
                                 style={{ background: '#eff6ff', border: '1px solid #bfdbfe', backdropFilter: 'blur(8px)' }}>
                                <SafetyCertificateOutlined style={{ color: '#2563eb', fontSize: 18, marginTop: 2 }} />
                                <div>
                                    <div className="text-sm font-semibold mb-0.5" style={{ color: '#1d4ed8' }}>Authenticator Required</div>
                                    <div className="text-xs" style={{ color: '#6b7280' }}>Open your authenticator app and enter the 6-digit code shown.</div>
                                </div>
                            </div>

                            <Form.Item
                                name="mfaCode"
                                label={<span className="text-sm font-semibold" style={{ color: '#374151' }}>Verification Code</span>}
                                rules={[
                                    { required: true, message: 'Please enter your 6-digit code' },
                                    { len: 6, message: 'Code must be exactly 6 digits' }
                                ]}
                            >
                                <Input
                                    prefix={<SafetyCertificateOutlined style={{ color: '#9ca3af' }} />}
                                    placeholder="000 000"
                                    maxLength={6}
                                    className="rounded-xl text-center text-3xl tracking-[0.6em] font-mono h-16"
                                    style={{ background: '#0c1525', border: '1px solid #1a2d45', color: '#e2e8f0' }}
                                />
                            </Form.Item>

                            <Form.Item className="mt-6 mb-0">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="w-full h-12 rounded-xl text-sm font-semibold border-0 mb-3 nf-btn-primary"
                                    style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
                                >
                                    Verify & Continue
                                </Button>
                                <Button
                                    type="text"
                                    className="w-full h-10 rounded-xl text-sm font-medium"
                                    style={{ color: '#9ca3af' }}
                                    onClick={() => { setMfaRequired(false); setError(null); }}
                                    disabled={loading}
                                >
                                    ← Back to login
                                </Button>
                            </Form.Item>
                        </Form>
                    )}

                    <p className="text-center text-xs mt-8" style={{ color: '#9ca3af' }}>
                        By signing in you agree to our{' '}
                        <a href="#" style={{ color: '#2563eb' }}>Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" style={{ color: '#2563eb' }}>Privacy Policy</a>
                    </p>
                </div>
            </div>

            <style>{`
                /* ── Scan line ── */
                @keyframes nfScan {
                    0%   { top: -2px;   opacity: 0; }
                    3%   { opacity: 1; }
                    97%  { opacity: 1; }
                    100% { top: 100%;   opacity: 0; }
                }
                .nf-scan-line { animation: nfScan 9s linear infinite; }

                /* ── Cursor blink ── */
                @keyframes nfBlink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
                .nf-cursor { animation: nfBlink 0.75s step-end infinite; }

                /* ── Pulse dot ── */
                @keyframes nfPulseDot {
                    0%,100% { box-shadow: 0 0 0 0   rgba(255,255,255,0.7); }
                    60%      { box-shadow: 0 0 0 5px rgba(255,255,255,0);   }
                }
                .nf-pulse-dot { animation: nfPulseDot 1.6s ease-in-out infinite; }

                /* ── Logo glow ── */
                @keyframes nfLogoGlow {
                    0%,100% { box-shadow: 0 0 18px rgba(37,99,235,0.5), 0 0 36px rgba(37,99,235,0.18); }
                    50%      { box-shadow: 0 0 28px rgba(37,99,235,0.75), 0 0 56px rgba(37,99,235,0.28); }
                }
                .nf-logo-glow { animation: nfLogoGlow 3s ease-in-out infinite; }

                /* ── Feature card entrance + hover ── */
                @keyframes nfFadeUp {
                    from { opacity: 0; transform: translateY(14px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .nf-feature-card {
                    animation: nfFadeUp 0.55s ease both;
                    transition: background 0.2s, border-color 0.2s, transform 0.2s, box-shadow 0.2s;
                }
                .nf-feature-card:hover {
                    background: rgba(255,255,255,0.22) !important;
                    border-color: rgba(255,255,255,0.5) !important;
                    transform: translateX(5px);
                    box-shadow: 0 0 22px rgba(255,255,255,0.1);
                }

                /* ── Page fade-up ── */
                .nf-fade-up { animation: nfFadeUp 0.55s ease both; }

                /* ── Primary button ── */
                .nf-btn-primary {
                    box-shadow: 0 4px 24px rgba(37,99,235,0.35), 0 0 0 1px rgba(37,99,235,0.15) !important;
                    transition: transform 0.18s ease, box-shadow 0.18s ease !important;
                }
                .nf-btn-primary:not([disabled]):hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 36px rgba(37,99,235,0.45), 0 0 0 1px rgba(37,99,235,0.25) !important;
                }
                .nf-btn-primary:not([disabled]):active { transform: translateY(0); }

                /* ── Ant input overrides ── */
                .ant-input-affix-wrapper {
                    background: #f9fafb !important;
                    border-color: #e5e7eb !important;
                    transition: border-color 0.2s, box-shadow 0.2s !important;
                }
                .ant-input-affix-wrapper input {
                    background: transparent !important;
                    color: #111827 !important;
                }
                .ant-input-affix-wrapper input::placeholder { color: #9ca3af !important; }
                .ant-input-affix-wrapper:hover   { border-color: #93c5fd !important; }
                .ant-input-affix-wrapper:focus-within {
                    border-color: #2563eb !important;
                    box-shadow: 0 0 0 2px rgba(37,99,235,0.12) !important;
                }
                .ant-input-password-icon       { color: #9ca3af !important; }
                .ant-input-password-icon:hover { color: #6b7280 !important; }
                .ant-form-item-label > label   { color: #374151 !important; }
                .ant-checkbox-wrapper          { color: #6b7280 !important; }
                .ant-checkbox-inner            { background: #ffffff !important; border-color: #d1d5db !important; }
                .ant-checkbox-checked .ant-checkbox-inner { background: #2563eb !important; border-color: #2563eb !important; }
            `}</style>
        </div>
    );
};

export default Login;
