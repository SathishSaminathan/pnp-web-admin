import React, { useState } from 'react';
import { Tabs } from 'antd';
import { GlobalOutlined, EnvironmentOutlined, BankOutlined } from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';
import { CountriesTable, StatesTable, CitiesTable } from './components';

/* ══════════════════════════════════════════════════════════════════════════ */
const GeographyPage = () => {
    const { isDark }    = useTheme();
    const [activeTab, setActiveTab] = useState('countries');

    const tabItems = [
        {
            key: 'countries',
            label: (
                <span className="flex items-center gap-1.5">
                    <GlobalOutlined />
                    <span>Countries</span>
                </span>
            ),
            children: (
                <div className="p-4 sm:p-5">
                    <CountriesTable />
                </div>
            ),
        },
        {
            key: 'states',
            label: (
                <span className="flex items-center gap-1.5">
                    <EnvironmentOutlined />
                    <span>States</span>
                </span>
            ),
            children: (
                <div className="p-4 sm:p-5">
                    <StatesTable />
                </div>
            ),
        },
        {
            key: 'cities',
            label: (
                <span className="flex items-center gap-1.5">
                    <BankOutlined />
                    <span>Cities</span>
                </span>
            ),
            children: (
                <div className="p-4 sm:p-5">
                    <CitiesTable />
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-5">
            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                    <h2
                        className="text-xl sm:text-2xl font-bold m-0"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Geography Management
                    </h2>
                    <p
                        className="text-sm m-0 mt-0.5"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Browse and manage countries, states, and cities reference data
                    </p>
                </div>
            </div>

            {/* ── Tabbed Content ── */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-card)',
                }}
            >
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    destroyInactiveTabPane={false}
                    tabBarStyle={{
                        margin: 0,
                        padding: '0 20px',
                        borderBottom: `1px solid var(--border-color)`,
                    }}
                    style={{
                        color: 'var(--text-primary)',
                    }}
                    items={tabItems}
                />
            </div>
        </div>
    );
};

export default GeographyPage;
