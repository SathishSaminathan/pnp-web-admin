import React, { useState, useRef, useCallback } from 'react';
import { Select, Button, DatePicker, Switch } from 'antd';
import { ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { merchantsApi } from '../../../api/modules/merchants';

const { Option } = Select;
const { RangePicker } = DatePicker;

const BLOCKCHAIN_OPTIONS = [
    { value: 'MATIC-AMOY',  label: 'MATIC-AMOY' },
    { value: 'MATIC',       label: 'MATIC (Polygon)' },
    { value: 'ETH-SEPOLIA', label: 'ETH-SEPOLIA' },
    { value: 'ETH',         label: 'ETH (Ethereum)' },
];

const NETWORK_OPTIONS = [
    { value: 'PolygonTestAmoy', label: 'Polygon Test Amoy' },
    { value: 'Polygon',        label: 'Polygon' },
    { value: 'EthereumSepolia', label: 'Ethereum Sepolia' },
    { value: 'Ethereum',       label: 'Ethereum' },
];

const STATE_OPTIONS = [
    { value: 'LIVE',     label: '🟢 Live' },
    { value: 'PENDING',  label: '🟡 Pending' },
    { value: 'INACTIVE', label: '⚫ Inactive' },
    { value: 'FROZEN',   label: '🔵 Frozen' },
    { value: 'CLOSED',   label: '🔴 Closed' },
];

const NoahWalletFilters = ({
    userId,
    onUserId,
    filterBlockchain,
    onFilterBlockchain,
    filterNetwork,
    onFilterNetwork,
    filterState,
    onFilterState,
    filterIsActive,
    onFilterIsActive,
    dateRange,
    onDateRange,
    includeDeleted,
    onIncludeDeleted,
    loading,
    onRefresh,
    isMobile,
    isDark,
}) => {
    const [merchantOptions, setMerchantOptions] = useState([]);
    const [merchantLoading, setMerchantLoading] = useState(false);
    const searchDebounce = useRef(null);

    const searchMerchants = useCallback(async (search) => {
        if (!search?.trim()) { setMerchantOptions([]); return; }
        setMerchantLoading(true);
        try {
            const res = await merchantsApi.getAllMerchants({ search: search.trim(), limit: 20 });
            if (res.success) {
                setMerchantOptions(
                    (res.data ?? []).map((m) => ({
                        value: m._id,
                        label: `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || m.emailId,
                        email: m.emailId,
                    }))
                );
            }
        } catch {
            // silent
        } finally {
            setMerchantLoading(false);
        }
    }, []);

    const handleMerchantSearch = (val) => {
        clearTimeout(searchDebounce.current);
        searchDebounce.current = setTimeout(() => searchMerchants(val), 350);
    };

    return (
    <div
        className="rounded-2xl p-4 space-y-3"
        style={{
            background: isDark ? 'var(--bg-card)' : '#fff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
            boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
        }}
    >
        {/* Row 1: merchant + blockchain + network + state */}
        <div className="flex flex-wrap gap-2">
            <Select
                showSearch
                allowClear
                value={userId || undefined}
                placeholder={<span><UserOutlined className="mr-1.5 opacity-40" />Search merchant…</span>}
                filterOption={false}
                loading={merchantLoading}
                onSearch={handleMerchantSearch}
                onChange={(v) => onUserId(v ?? '')}
                notFoundContent={merchantLoading ? 'Searching…' : 'Type to search merchants'}
                style={{ flex: '1 1 200px' }}
                optionLabelProp="label"
            >
                {merchantOptions.map((o) => (
                    <Option key={o.value} value={o.value} label={o.label}>
                        <div className="flex flex-col leading-tight py-0.5">
                            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{o.label}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.email}</span>
                        </div>
                    </Option>
                ))}
            </Select>
            <Select
                value={filterBlockchain || undefined}
                placeholder="Blockchain"
                allowClear
                popupMatchSelectWidth={false}
                onChange={(v) => onFilterBlockchain(v ?? '')}
                style={{ width: 150 }}
            >
                {BLOCKCHAIN_OPTIONS.map((o) => (
                    <Option key={o.value} value={o.value}>{o.label}</Option>
                ))}
            </Select>
            <Select
                value={filterNetwork || undefined}
                placeholder="Network"
                allowClear
                popupMatchSelectWidth={false}
                onChange={(v) => onFilterNetwork(v ?? '')}
                style={{ width: 160 }}
            >
                {NETWORK_OPTIONS.map((o) => (
                    <Option key={o.value} value={o.value}>{o.label}</Option>
                ))}
            </Select>
            <Select
                value={filterState || undefined}
                placeholder="State"
                allowClear
                popupMatchSelectWidth={false}
                onChange={(v) => onFilterState(v ?? '')}
                style={{ width: 130 }}
            >
                {STATE_OPTIONS.map((o) => (
                    <Option key={o.value} value={o.value}>{o.label}</Option>
                ))}
            </Select>
        </div>

        {/* Row 2: isActive + date range + includeDeleted + refresh */}
        <div className="flex flex-wrap gap-2 items-center">
            <Select
                value={filterIsActive !== '' ? filterIsActive : undefined}
                placeholder="Active Status"
                allowClear
                popupMatchSelectWidth={false}
                onChange={(v) => onFilterIsActive(v ?? '')}
                style={{ width: 140 }}
            >
                <Option value="true">✅ Active</Option>
                <Option value="false">❌ Inactive</Option>
            </Select>
            {!isMobile && (
                <RangePicker
                    value={dateRange}
                    onChange={(v) => onDateRange(v ?? [null, null])}
                    size="middle"
                    style={{
                        width: 230,
                        background: 'var(--input-bg)',
                        borderColor: 'var(--border-color)',
                    }}
                    placeholder={['Date From', 'Date To']}
                />
            )}
            <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer select-none"
                style={{
                    border: `1px solid var(--border-color)`,
                    background: includeDeleted
                        ? (isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)')
                        : 'var(--input-bg)',
                }}
                onClick={() => onIncludeDeleted(!includeDeleted)}
            >
                <Switch
                    size="small"
                    checked={includeDeleted}
                    onChange={onIncludeDeleted}
                    onClick={(_, e) => e.stopPropagation()}
                />
                <span className="text-xs font-medium" style={{ color: includeDeleted ? '#6366f1' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    Include Deleted
                </span>
            </div>
            <Button
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                loading={loading}
                style={{
                    borderRadius: 10,
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)',
                    background: 'var(--input-bg)',
                    marginLeft: 'auto',
                }}
            >
                Refresh
            </Button>
        </div>
    </div>
    );
};

export default NoahWalletFilters;
