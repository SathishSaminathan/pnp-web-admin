import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Badge, Button, Modal, Tooltip } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    BarChartOutlined,
    UserOutlined,
    LogoutOutlined,
    BellOutlined,
    SettingOutlined,
    CarOutlined,
    SafetyCertificateOutlined,
    ShopOutlined,
    FileTextOutlined,
    BankOutlined,
    MessageOutlined,
    GiftOutlined,
    SunOutlined,
    MoonOutlined,
    ExclamationCircleFilled,
    ApiOutlined,
    SolutionOutlined,
    MobileOutlined,
    PercentageOutlined,
    BankOutlined as BankFilled,
    WalletOutlined,
    TeamOutlined,
    LinkOutlined,
    SwapOutlined,
    DollarOutlined,
    CreditCardOutlined,
    DatabaseOutlined,
    MonitorOutlined,
    KeyOutlined,
    GlobalOutlined,
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [signOutOpen, setSignOutOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

    useEffect(() => {
        const onResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setMobileOpen(false);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const unreadCount = 3; // replace with real count from context/API
    const { isDark, toggleTheme } = useTheme();

    const handleLogout = () => setSignOutOpen(true);

    const userMenu = {
        items: [
            {
                key: 'profile',
                label: <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>My Profile</span>,
                icon: <UserOutlined style={{ color: 'var(--text-muted)' }} />,
                onClick: () => navigate('/settings')
            },
            {
                key: 'settings',
                label: <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Preferences</span>,
                icon: <SettingOutlined style={{ color: 'var(--text-muted)' }} />
            },
            { type: 'divider' },
            {
                key: 'logout',
                label: <span style={{ color: '#f87171', fontWeight: 500 }}>Sign out</span>,
                icon: <LogoutOutlined style={{ color: '#f87171' }} />,
                onClick: handleLogout,
            },
        ],
    };

    const sideMenu = [
        {
            key: '/',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: 'separator-1',
            type: 'group',
            label: 'People',
            children: [
                { key: '/users', icon: <UserOutlined />, label: 'Users' },
                { key: '/owners', icon: <TeamOutlined />, label: 'Owners' },
            ],
        },
        {
            key: 'separator-2',
            type: 'group',
            label: 'Operations',
            children: [
                { key: '/listings', icon: <ShopOutlined />, label: 'Listings' },
                { key: '/history', icon: <FileTextOutlined />, label: 'History' },
                { key: '/earnings', icon: <DollarOutlined />, label: 'Earnings' },
            ],
        },
        {
            key: 'separator-3',
            type: 'group',
            label: 'Administration',
            children: [
                { key: '/settings', icon: <SafetyCertificateOutlined />, label: 'Settings' },
            ],
        },
    ];

    return (
        <Layout className="min-h-screen font-sans" style={{ background: 'var(--bg-app)' }}>
            {/* Mobile backdrop overlay */}
            {isMobile && mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50"
                    style={{ zIndex: 25, backdropFilter: 'blur(2px)' }}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <Sider
                trigger={null}
                collapsible
                collapsed={isMobile ? false : collapsed}
                collapsedWidth={80}
                width={200}
                style={{
                    background: 'var(--bg-sidebar)',
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    borderRight: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-card)',
                    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), background 0.25s ease',
                    transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
                    zIndex: 30,
                }}
            >
                {/* Logo Area */}
                <div className="h-20 flex items-center justify-center sticky top-0 z-10 mx-6 pt-4"
                     style={{ background: 'var(--bg-sidebar)' }}>
                    <div className={`flex items-center gap-3 w-full ${collapsed ? 'justify-center' : 'justify-start'}`}>
                        <img
                            src="/meralottm.png"
                            alt="Meralot"
                            className={`object-contain rounded shrink-0 ${collapsed ? 'h-8 w-8' : 'h-8 w-8'}`}
                        />
                        {!collapsed && (
                            <span className="text-lg font-bold tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
                                PNP Admin
                            </span>
                        )}
                    </div>
                </div>

                {/* Navigation Menu */}
                <div className="px-4">
                    <Menu
                        theme={isDark ? 'dark' : 'light'}
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        items={sideMenu}
                        onClick={({ key }) => { navigate(key); if (isMobile) setMobileOpen(false); }}
                        style={{ background: 'transparent', borderRight: 0 }}
                        className="custom-light-menu"
                    />
                </div>
            </Sider>

            {/* Main Content Area */}
            <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 200), transition: 'all 0.2s', minHeight: '100vh', background: 'transparent' }}>
                {/* Top Header */}
                <Header
                    style={{ background: 'var(--bg-header)', padding: 0, borderBottom: '1px solid var(--border-color)', transition: 'background 0.25s ease' }}
                    className="h-16 sticky top-0 z-[200] flex items-center justify-between px-6"
                >
                    <div className="flex items-center gap-4">
                        <Button
                            type="text"
                            icon={isMobile
                                ? <MenuUnfoldOutlined style={{ color: 'var(--text-secondary)', fontSize: 18 }} />
                                : collapsed
                                    ? <MenuUnfoldOutlined style={{ color: 'var(--text-secondary)', fontSize: 18 }} />
                                    : <MenuFoldOutlined style={{ color: 'var(--text-secondary)', fontSize: 18 }} />
                            }
                            onClick={() => isMobile ? setMobileOpen(v => !v) : setCollapsed(v => !v)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl"
                            style={{ background: 'transparent' }}
                        />

                        {/* Search Bar */}
                        <div className="hidden md:flex relative w-72">
                            <input
                                type="text"
                                placeholder="Find something here..."
                                className="w-full pl-5 pr-10 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                style={{
                                    background: 'var(--input-bg)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mr-2">
                        {/* Dark Mode Toggle */}
                        <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                            <button
                                onClick={(e) => {
                                    const r = e.currentTarget.getBoundingClientRect();
                                    toggleTheme(r.left + r.width / 2, r.top + r.height / 2);
                                }}
                                className="theme-toggle-btn"
                                aria-label="Toggle dark mode"
                            />
                        </Tooltip>

                        <Tooltip title="Notifications">
                            <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                                <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                                    style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                                    onClick={() => navigate('/notifications')}
                                >
                                    <BellOutlined className="text-base" />
                                </div>
                            </Badge>
                        </Tooltip>
                        <Badge count={5} size="small" offset={[-2, 2]}>
                            <div className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                                 style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                <MessageOutlined className="text-base" />
                            </div>
                        </Badge>
                        <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
                            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white cursor-pointer hover:bg-blue-700 transition-colors ml-1">
                                <span className="font-semibold text-sm">
                                    {user?.firstName?.charAt(0) || 'A'}
                                </span>
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                {/* Page Content */}
                <Content className="p-4 sm:p-6 sm:px-8 pb-10">
                    <div className="w-full">
                        <Outlet />
                    </div>
                </Content>
            </Layout>

            <SignOutModal
                open={signOutOpen}
                onCancel={() => setSignOutOpen(false)}
                onConfirm={() => { setSignOutOpen(false); logout(); }}
            />
        </Layout>
    );
};

/* ── Sign-Out Confirmation Modal ── */
function SignOutModal({ open, onCancel, onConfirm }) {
    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            centered
            width={420}
            closeIcon={null}
            styles={{
                content: {
                    background: 'var(--bg-card)',
                    borderRadius: 20,
                    padding: '36px 32px 28px',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
                    border: '1px solid var(--border-color)',
                },
                mask: { backdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.55)' },
            }}
        >
            <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
                    <ExclamationCircleFilled style={{ fontSize: 32, color: '#f59e0b' }} />
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Sign Out</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        Are you sure you want to sign out of the admin panel?
                    </p>
                </div>
                <div className="flex gap-3 w-full mt-2">
                    <button
                        onClick={onCancel}
                        className="flex-1 h-11 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                        style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 h-11 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 16px rgba(239,68,68,0.35)', cursor: 'pointer', border: 'none' }}
                    >
                        Yes, Sign Out
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default MainLayout;
