import React, { useState, useEffect } from 'react';
import { Table, Avatar, Badge, Select } from 'antd';
import {
    RiseOutlined,
    FallOutlined,
    ExportOutlined,
    FilterOutlined,
    ArrowRightOutlined,
    UserOutlined,
    CarOutlined,
    SafetyCertificateOutlined,
    DollarCircleOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    WarningOutlined,
    EnvironmentOutlined,
    MobileOutlined,
} from '@ant-design/icons';
import Chart from 'react-apexcharts';
import { useTheme } from '../../context/ThemeContext';
import { safeDivide, formatAmount } from '../../utils/number.utils';

// ── Mini sparkline bars ───────────────────────────────────────────────────────
const Sparkline = ({ data, color }) => {
    const max = Math.max(...data);
    return (
        <div className="flex items-end gap-0.5" style={{ height: 32 }}>
            {data.map((v, i) => (
                <div key={i} style={{
                    width: 5,
                    height: `${(v / max) * 100}%`,
                    background: color,
                    borderRadius: 3,
                    opacity: 0.35 + (i / data.length) * 0.65,
                }} />
            ))}
        </div>
    );
};

// ── Stat card with gradient + sparkline ───────────────────────────────────────
const StatCard = ({ icon, iconColor, label, value, trend, trendLabel, isPositive, sparkData }) => (
    <div
        className="rounded-2xl p-4 sm:p-5 flex flex-col gap-3"
        style={{
            background: `linear-gradient(135deg, ${iconColor}0d 0%, var(--bg-card) 60%)`,
            border: `1px solid ${iconColor}28`,
            boxShadow: 'var(--shadow-card)',
            transition: 'background 0.25s ease, border-color 0.25s ease',
        }}
    >
        <div className="flex items-center justify-between">
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: `${iconColor}1a`, color: iconColor }}
            >
                {icon}
            </div>
            {sparkData && <Sparkline data={sparkData} color={iconColor} />}
        </div>
        <div>
            <div className="text-xl sm:text-2xl font-extrabold leading-tight tabular-nums" style={{ color: 'var(--text-primary)' }}>
                {value}
            </div>
            <div className="text-xs sm:text-sm font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {label}
            </div>
        </div>
        {trend && (
            <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-emerald-500' : 'text-red-400'}`}>
                {isPositive
                    ? <RiseOutlined style={{ fontSize: 10 }} />
                    : <WarningOutlined style={{ fontSize: 10 }} />}
                <span>{trend}</span>
                {trendLabel && <span className="font-normal" style={{ color: 'var(--text-muted)' }}>{trendLabel}</span>}
            </div>
        )}
    </div>
);

const { Option } = Select;

const DashCard = ({ children, className = '', style = {} }) => (
    <div
        className={`rounded-2xl p-4 sm:p-6 ${className}`}
        style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-card)',
            transition: 'background 0.25s ease, border-color 0.25s ease',
            ...style,
        }}
    >
        {children}
    </div>
);

const Dashboard = () => {
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setLoading(false), 500);
    }, []);

    // ── Overview stats ────────────────────────────
    const overviewStats = [
        {
            title: 'Total Users',
            value: '12,480',
            trend: '+8.3%',
            trendLabel: 'vs last month',
            isPositive: true,
            icon: <UserOutlined />,
            iconColor: '#3b82f6',
            sparkData: [65, 72, 68, 85, 90, 95, 124],
        },
        {
            title: 'Active Bookings',
            value: '1,034',
            trend: '+14.2%',
            trendLabel: 'vs last month',
            isPositive: true,
            icon: <CarOutlined />,
            iconColor: '#10b981',
            sparkData: [40, 55, 48, 70, 66, 88, 103],
        },
        {
            title: 'Total Revenue',
            value: '$48,920',
            trend: '+6.1%',
            trendLabel: 'vs last month',
            isPositive: true,
            icon: <DollarCircleOutlined />,
            iconColor: '#f59e0b',
            sparkData: [120, 185, 160, 220, 190, 280, 310],
        },
        {
            title: 'Pending KYC',
            value: '87',
            trend: 'Requires Attention',
            trendLabel: '',
            isPositive: false,
            icon: <SafetyCertificateOutlined />,
            iconColor: '#ef4444',
            sparkData: [12, 18, 14, 22, 19, 25, 21],
        },
    ];

    // ── Booking stat cards ────────────────────────
    const bookingStats = [
        {
            title: 'Completed Bookings',
            value: '9,821',
            trend: '+3.4%',
            trendLabel: 'last month',
            isPositive: true,
            icon: <CheckCircleOutlined />,
            iconColor: '#10b981',
            sparkData: [55, 70, 65, 88, 82, 95, 98],
        },
        {
            title: 'Ongoing Sessions',
            value: '342',
            trend: 'Live right now',
            trendLabel: '',
            isPositive: true,
            icon: <ClockCircleOutlined />,
            iconColor: '#3b82f6',
            sparkData: [18, 25, 30, 28, 35, 32, 34],
        },
        {
            title: 'Cancelled Bookings',
            value: '218',
            trend: '-2.1%',
            trendLabel: 'last month',
            isPositive: false,
            icon: <CloseCircleOutlined />,
            iconColor: '#ef4444',
            sparkData: [30, 22, 28, 20, 25, 18, 21],
        },
    ];

    // ── Urgent items ──────────────────────────────
    const urgentItems = [
        {
            id: 1,
            type: 'KYC Verification',
            detail: 'Document expired • High Priority',
            icon: <WarningOutlined />,
            iconBg: isDark ? 'rgba(239,68,68,0.2)' : '#fef2f2',
            iconColor: '#ef4444',
        },
        {
            id: 2,
            type: 'New User Signup',
            detail: 'Awaiting document upload',
            icon: <UserOutlined />,
            iconBg: isDark ? 'rgba(37,99,235,0.2)' : '#eff6ff',
            iconColor: '#3b82f6',
        },
        {
            id: 3,
            type: 'Booking Dispute',
            detail: 'Spot #B-44 • Overcharge claim',
            icon: <CarOutlined />,
            iconBg: isDark ? 'rgba(245,158,11,0.2)' : '#fffbeb',
            iconColor: '#f59e0b',
        },
    ];

    // ── Recent bookings table ─────────────────────
    const recentBookings = [
        { id: '#BKG-1021', user: 'Sarah Johnson',  avatar: 'https://i.pravatar.cc/150?u=11', spot: 'Downtown Plaza • Spot A3', date: 'Jun 05, 2026', amount: '$12.00', status: 'Completed' },
        { id: '#BKG-1022', user: 'Michael Chen',   avatar: 'https://i.pravatar.cc/150?u=12', spot: 'Central Park • Spot B7',   date: 'Jun 05, 2026', amount: '$8.50',  status: 'Active'    },
        { id: '#BKG-1023', user: 'Priya Johns',    avatar: 'https://i.pravatar.cc/150?u=13', spot: 'Airport Terminal • Spot C1', date: 'Jun 04, 2026', amount: '$24.00', status: 'Completed' },
        { id: '#BKG-1024', user: 'David Wilson',   avatar: 'https://i.pravatar.cc/150?u=14', spot: 'Mall Basement • Spot D9', date: 'Jun 04, 2026', amount: '$6.00',  status: 'Cancelled' },
        { id: '#BKG-1025', user: 'Kiruthika Sathish', avatar: 'https://i.pravatar.cc/150?u=15', spot: 'Tech Park • Spot E2',  date: 'Jun 03, 2026', amount: '$15.00', status: 'Active'    },
    ];

    const statusCfg = {
        Completed: { color: isDark ? '#10b981' : '#16a34a', bg: isDark ? 'rgba(16,185,129,0.15)' : '#f0fdf4' },
        Active:    { color: isDark ? '#3b82f6' : '#2563eb', bg: isDark ? 'rgba(37,99,235,0.15)'   : '#eff6ff' },
        Cancelled: { color: isDark ? '#ef4444' : '#dc2626', bg: isDark ? 'rgba(239,68,68,0.15)'   : '#fef2f2' },
    };

    const bookingColumns = [
        {
            title: 'BOOKING ID', dataIndex: 'id',
            render: v => <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{v}</span>,
        },
        {
            title: 'USER', dataIndex: 'user',
            render: (text, rec) => (
                <div className="flex items-center gap-2">
                    <Avatar src={rec.avatar} size={30} />
                    <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{text}</span>
                </div>
            ),
        },
        {
            title: 'SPOT', dataIndex: 'spot',
            render: v => (
                <span className="text-sm flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                    <EnvironmentOutlined style={{ fontSize: 12, color: '#3b82f6' }} /> {v}
                </span>
            ),
        },
        {
            title: 'DATE', dataIndex: 'date',
            render: v => <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{v}</span>,
        },
        {
            title: 'AMOUNT', dataIndex: 'amount',
            render: v => <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{v}</span>,
        },
        {
            title: 'STATUS', dataIndex: 'status',
            render: s => {
                const c = statusCfg[s] || statusCfg.Completed;
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ color: c.color, background: c.bg }}>
                        {s}
                    </span>
                );
            },
        },
    ];

    // ── Recent users table ────────────────────────
    const recentUsers = [
        { id: '69a6e897', name: 'Antony',           phone: '+91 9597250318', status: 'phoneVerified',           joined: 'Mar 03, 2026', kyc: 'Pending',  avatar: 'https://i.pravatar.cc/150?u=21' },
        { id: '69b41476', name: 'Kiruthika Sathish', phone: '+91 8760508352', status: 'personalDetailsUpdated',  joined: 'Mar 13, 2026', kyc: 'Approved', avatar: 'https://i.pravatar.cc/150?u=22' },
        { id: '69cac003', name: 'Priya Johns',       phone: '+1 7132951495',  status: 'personalDetailsUpdated',  joined: 'Mar 30, 2026', kyc: 'Pending',  avatar: 'https://i.pravatar.cc/150?u=23' },
        { id: '69e8f860', name: 'Navin Mathew',      phone: '+1 2679877756',  status: 'personalDetailsUpdated',  joined: 'Apr 22, 2026', kyc: 'Approved', avatar: 'https://i.pravatar.cc/150?u=24' },
        { id: '69a7e09a', name: 'Sathish Saminathan', phone: '+91 7904557013', status: 'personalDetailsUpdated', joined: 'Mar 04, 2026', kyc: 'Pending',  avatar: 'https://i.pravatar.cc/150?u=25' },
    ];

    const kycCfg = {
        Approved: { color: isDark ? '#10b981' : '#16a34a', bg: isDark ? 'rgba(16,185,129,0.15)' : '#f0fdf4' },
        Pending:  { color: isDark ? '#f59e0b' : '#d97706', bg: isDark ? 'rgba(245,158,11,0.15)'  : '#fffbeb' },
    };

    const userColumns = [
        {
            title: 'USER', dataIndex: 'name',
            render: (text, rec) => (
                <div className="flex items-center gap-2">
                    <Avatar src={rec.avatar} size={30} />
                    <div>
                        <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{text}</div>
                        <div className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                            <MobileOutlined style={{ fontSize: 10 }} /> {rec.phone}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'JOINED', dataIndex: 'joined',
            render: v => <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{v}</span>,
        },
        {
            title: 'KYC STATUS', dataIndex: 'kyc',
            render: s => {
                const c = kycCfg[s] || kycCfg.Pending;
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ color: c.color, background: c.bg }}>
                        {s}
                    </span>
                );
            },
        },
    ];

    // ── Charts ────────────────────────────────────
    const barOptions = {
        chart: { type: 'bar', fontFamily: 'inherit', toolbar: { show: false } },
        colors: ['#3B82F6'],
        plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
        dataLabels: { enabled: false },
        xaxis: {
            categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: isDark ? '#64748b' : '#94a3b8', fontSize: '12px', fontWeight: 600 } },
        },
        yaxis: { show: false },
        grid: { show: false },
        legend: { show: false },
        tooltip: { theme: isDark ? 'dark' : 'light', y: { formatter: v => `${v} bookings` } },
    };
    const barSeries = [{ name: 'Bookings', data: [120, 185, 160, 240, 210, 290, 175] }];

    const lineOptions = {
        chart: { type: 'area', fontFamily: 'inherit', toolbar: { show: false }, zoom: { enabled: false } },
        colors: ['#10b981'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: isDark ? 0.3 : 0.2, opacityTo: 0, stops: [0, 90, 100] } },
        xaxis: {
            categories: ['1 Jun', '5', '10', '15', '20', '25', '30 Jun'],
            axisBorder: { show: true, color: 'var(--border-color)', height: 2 },
            axisTicks: { show: false },
            labels: { style: { colors: isDark ? '#64748b' : '#94a3b8', fontSize: '11px', fontWeight: 600 } },
        },
        yaxis: { show: false },
        grid: { show: false, padding: { left: 10, right: 10, top: 0, bottom: 0 } },
        legend: { show: false },
        tooltip: { theme: isDark ? 'dark' : 'light', y: { formatter: v => `$${v}` } },
    };
    const lineSeries = [{ name: 'Revenue', data: [1200, 1850, 1600, 2200, 1900, 2800, 3100] }];

    const donutOptions = {
        chart: { type: 'donut', fontFamily: 'inherit' },
        labels: ['Completed', 'Active', 'Cancelled'],
        colors: ['#10B981', '#3B82F6', '#EF4444'],
        legend: {
            show: true, position: 'bottom',
            markers: { shape: 'circle', width: 10, height: 10 },
            labels: { colors: isDark ? '#94a3b8' : '#475569' },
            fontSize: '13px', fontWeight: 600,
        },
        dataLabels: { enabled: false },
        plotOptions: { pie: { donut: { size: '72%', labels: { show: false } } } },
        stroke: { show: true, colors: [isDark ? '#1e2a3a' : '#ffffff'], width: 8 },
        tooltip: { theme: isDark ? 'dark' : 'light' },
    };
    const donutSeries = [62, 24, 14];

    return (
        <div className="space-y-4 sm:space-y-6 pb-12 font-sans -mx-4 sm:-mx-10 px-4 sm:px-10 pt-4 sm:pt-6 min-h-screen"
             style={{ background: 'var(--bg-app)', transition: 'background 0.25s ease' }}>

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>
                        Meralot Admin
                    </h1>
                    <p className="text-sm mt-1 m-0" style={{ color: 'var(--text-secondary)' }}>
                        Parking platform overview — Last 30 days
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
                            style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}>
                        <ExportOutlined /> <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
            </div>

            {/* ── Overview stat cards ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                {overviewStats.map((s, i) => (
                    <StatCard
                        key={i}
                        icon={s.icon}
                        iconColor={s.iconColor}
                        label={s.title}
                        value={s.value}
                        trend={s.trend}
                        trendLabel={s.trendLabel}
                        isPositive={s.isPositive}
                        sparkData={s.sparkData}
                    />
                ))}
            </div>

            {/* ── Booking Trends + Urgent Items ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                <DashCard className="xl:col-span-2">
                    <div className="flex justify-between items-center mb-4 gap-2">
                        <div className="min-w-0">
                            <h2 className="text-base sm:text-lg font-bold m-0 truncate" style={{ color: 'var(--text-primary)' }}>Booking Trends</h2>
                            <p className="text-xs m-0 mt-0.5 hidden sm:block" style={{ color: 'var(--text-secondary)' }}>Daily bookings this week</p>
                        </div>
                        <span className="text-xs font-semibold px-2 sm:px-3 py-1 rounded-lg shrink-0"
                              style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                            This week
                        </span>
                    </div>
                    <Chart options={barOptions} series={barSeries} type="bar" height={220} width="100%" />
                </DashCard>

                <DashCard>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-base sm:text-lg font-bold m-0" style={{ color: 'var(--text-primary)' }}>Action Required</h2>
                        <Badge count={urgentItems.length} style={{ backgroundColor: '#ef4444' }} />
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                        {urgentItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl"
                                 style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)' }}>
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0"
                                         style={{ background: item.iconBg, color: item.iconColor }}>
                                        {item.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs sm:text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{item.type}</div>
                                        <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{item.detail}</div>
                                    </div>
                                </div>
                                <button className="text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0">
                                    Review
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="mt-3 sm:mt-4 w-full text-center text-sm font-semibold text-blue-500 hover:text-blue-600 flex items-center justify-center gap-1">
                        View all requests <ArrowRightOutlined />
                    </button>
                </DashCard>
            </div>

            {/* ── Recent Bookings ── */}
            <DashCard>
                <div className="flex justify-between items-center mb-4 sm:mb-5 flex-wrap gap-3">
                    <h2 className="text-base sm:text-lg font-bold m-0" style={{ color: 'var(--text-primary)' }}>Recent Bookings</h2>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold"
                            style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)', background: 'var(--input-bg)' }}>
                        <FilterOutlined /> <span className="hidden sm:inline">Filter</span>
                    </button>
                </div>
                <Table
                    columns={bookingColumns}
                    dataSource={recentBookings}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    className="custom-invoice-table"
                    scroll={{ x: 700 }}
                />
            </DashCard>

            {/* ── Booking stat cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {bookingStats.map((stat, i) => (
                    <StatCard
                        key={i}
                        icon={stat.icon}
                        iconColor={stat.iconColor}
                        label={stat.title}
                        value={stat.value}
                        trend={stat.trend}
                        trendLabel={stat.trendLabel}
                        isPositive={stat.isPositive}
                        sparkData={stat.sparkData}
                    />
                ))}
            </div>

            {/* ── Revenue chart + Booking breakdown ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                <DashCard>
                    <div className="flex justify-between items-center mb-3 sm:mb-4 gap-2">
                        <h2 className="text-base sm:text-xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>Revenue</h2>
                        <Select defaultValue="monthly" bordered={false} size="small" style={{ minWidth: 80 }}>
                            <Option value="monthly">Monthly</Option>
                            <Option value="weekly">Weekly</Option>
                        </Select>
                    </div>
                    <div className="mb-3 sm:mb-4">
                        <div className="text-xl sm:text-2xl font-bold m-0 mb-1" style={{ color: 'var(--text-primary)' }}>$48,920</div>
                        <p className="text-xs m-0" style={{ color: 'var(--text-muted)' }}>This month revenue is 6.1% higher than last month</p>
                    </div>
                    <Chart options={lineOptions} series={lineSeries} type="area" height={220} width="100%" />
                </DashCard>

                <DashCard className="flex flex-col">
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                        <h2 className="text-base sm:text-xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>Booking Breakdown</h2>
                        <span className="text-base sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>10,381</span>
                    </div>
                    <div className="relative" style={{ height: 280 }}>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingBottom: '15%' }}>
                            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>10,381</span>
                            <div className="flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full border border-green-500"
                                 style={{ background: isDark ? 'rgba(16,185,129,0.15)' : '#f0fdf4' }}>
                                <RiseOutlined className="text-green-500 text-xs" />
                                <span className="text-green-500 text-xs font-bold">8.3% growth</span>
                            </div>
                        </div>
                        <Chart options={donutOptions} series={donutSeries} type="donut" width="100%" height={280} />
                    </div>
                </DashCard>
            </div>

            {/* ── Recent Users ── */}
            <DashCard>
                <div className="flex justify-between items-center mb-4 sm:mb-5 flex-wrap gap-3">
                    <h2 className="text-base sm:text-lg font-bold m-0" style={{ color: 'var(--text-primary)' }}>Recent Users</h2>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-blue-500 hover:text-blue-600">
                        View all <ArrowRightOutlined />
                    </button>
                </div>
                <Table
                    columns={userColumns}
                    dataSource={recentUsers}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    className="custom-invoice-table"
                    scroll={{ x: 500 }}
                />
            </DashCard>

            <style>{`
                .custom-invoice-table .ant-table-thead > tr > th {
                    background: transparent !important;
                    border-bottom: 2px solid var(--table-border) !important;
                    padding-bottom: 12px;
                }
                .custom-invoice-table .ant-table-thead > tr > th::before { display: none !important; }
                .custom-invoice-table .ant-table-tbody > tr > td {
                    border-bottom: 1px solid var(--table-border) !important;
                    padding: 14px 16px;
                    background: transparent !important;
                }
                .custom-invoice-table .ant-table-tbody > tr:hover > td {
                    background: var(--input-bg) !important;
                }
                .custom-invoice-table .ant-table-cell { background: transparent !important; }
            `}</style>
        </div>
    );
};

export default Dashboard;
