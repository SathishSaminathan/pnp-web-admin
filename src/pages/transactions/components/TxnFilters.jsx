import React, { useState, useRef, useCallback } from 'react';
import { Select, Button, DatePicker, Input } from 'antd';
import { ReloadOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';
import { merchantsApi } from '../../../api/modules/merchants';

const { Option } = Select;
const { RangePicker } = DatePicker;

const STATUS_OPTIONS = [
    { value: 'Initiated',  label: 'Initiated' },
    { value: 'Approved',   label: 'Approved' },
    { value: 'InProgress', label: 'In Progress' },
    { value: 'Completed',  label: 'Completed' },
    { value: 'Rejected',   label: 'Rejected' },
    { value: 'Refunded',   label: 'Refunded' },
    { value: 'Freeze',     label: 'Freeze' },
];

const TYPE_OPTIONS = [
    { value: 'credit', label: 'Credit' },
    { value: 'debit',  label: 'Debit' },
];

const PAYMENT_METHOD_OPTIONS = [
    { value: 'ACH',  label: 'ACH' },
    { value: 'Wire', label: 'Wire' },
    { value: 'Card', label: 'Card' },
    { value: 'SEPA', label: 'SEPA' },
];

const FUND_TRANSFER_STATUS_OPTIONS = [
    { value: 'IN_PROCESS', label: 'In Process' },
    { value: 'PAID',       label: 'Paid' },
    { value: 'FAILED',     label: 'Failed' },
    { value: 'PRINTED',    label: 'Printed' },
    { value: 'VOID',       label: 'Void' },
    { value: 'EXPIRED',    label: 'Expired' },
    { value: 'MAILED',     label: 'Mailed' },
    { value: 'REFUNDED',   label: 'Refunded' },
];

const SOURCE_ACCOUNT_TYPE_OPTIONS = [
    { value: 'Virtual Account', label: 'Virtual Account' },
    { value: 'wallet',          label: 'Wallet' },
    { value: 'bank',            label: 'Bank' },
    { value: 'card',            label: 'Card' },
    { value: 'External Wallet', label: 'External Wallet' },
];

const DEST_ACCOUNT_TYPE_OPTIONS = [
    { value: 'Virtual Account', label: 'Virtual Account' },
    { value: 'wallet',          label: 'Wallet' },
    { value: 'bank',            label: 'Bank' },
    { value: 'Card',            label: 'Card' },
    { value: 'External Wallet', label: 'External Wallet' },
    { value: 'PayPal',          label: 'PayPal' },
    { value: 'Venmo',           label: 'Venmo' },
    { value: 'pos',             label: 'POS' },
];

const TxnFilters = ({
    // merchant select
    userId, onUserId,
    // text filters
    search, onSearch,
    transactionId, onTransactionId,
    // selects
    filterStatus, onFilterStatus,
    filterType, onFilterType,
    filterPaymentMethod, onFilterPaymentMethod,
    filterSourceAccountType, onFilterSourceAccountType,
    filterDestAccountType, onFilterDestAccountType,
    filterFundTransferStatus, onFilterFundTransferStatus,
    filterIsInternal, onFilterIsInternal,
    // date
    dateRange, onDateRange,
    // include deleted
    includeDeleted, onIncludeDeleted,
    // misc
    loading, onRefresh, isMobile, isDark,
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
        } catch { /* silent */ } finally {
            setMerchantLoading(false);
        }
    }, []);

    const handleMerchantSearch = (val) => {
        clearTimeout(searchDebounce.current);
        searchDebounce.current = setTimeout(() => searchMerchants(val), 350);
    };

    const cardStyle = {
        background: isDark ? 'var(--bg-card)' : '#fff',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
        boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
    };

    return (
        <div className="rounded-2xl p-4 space-y-3" style={cardStyle}>
            {/* Row 1: merchant + search + txn ID + status + type */}
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

                <Input
                    allowClear
                    value={search}
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="Search TXN ID / description…"
                    prefix={<SearchOutlined className="opacity-40" />}
                    style={{ flex: '1 1 180px', background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}
                />

                <Input
                    allowClear
                    value={transactionId}
                    onChange={(e) => onTransactionId(e.target.value)}
                    placeholder="Exact TXN ID"
                    style={{ width: 160, background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}
                />

                <Select
                    value={filterStatus || undefined}
                    placeholder="Status"
                    allowClear
                    popupMatchSelectWidth={false}
                    onChange={(v) => onFilterStatus(v ?? '')}
                    style={{ width: 140 }}
                >
                    {STATUS_OPTIONS.map((o) => (
                        <Option key={o.value} value={o.value}>{o.label}</Option>
                    ))}
                </Select>

                <Select
                    value={filterType || undefined}
                    placeholder="Type"
                    allowClear
                    popupMatchSelectWidth={false}
                    onChange={(v) => onFilterType(v ?? '')}
                    style={{ width: 110 }}
                >
                    {TYPE_OPTIONS.map((o) => (
                        <Option key={o.value} value={o.value}>{o.label}</Option>
                    ))}
                </Select>
            </div>

            {/* Row 2: payment method + source account type + dest account type + fund transfer status + isInternal */}
            <div className="flex flex-wrap gap-2">
                <Select
                    value={filterPaymentMethod || undefined}
                    placeholder="Payment Method"
                    allowClear
                    popupMatchSelectWidth={false}
                    onChange={(v) => onFilterPaymentMethod(v ?? '')}
                    style={{ width: 150 }}
                >
                    {PAYMENT_METHOD_OPTIONS.map((o) => (
                        <Option key={o.value} value={o.value}>{o.label}</Option>
                    ))}
                </Select>

                <Select
                    value={filterSourceAccountType || undefined}
                    placeholder="Source Account"
                    allowClear
                    popupMatchSelectWidth={false}
                    onChange={(v) => onFilterSourceAccountType(v ?? '')}
                    style={{ width: 160 }}
                >
                    {SOURCE_ACCOUNT_TYPE_OPTIONS.map((o) => (
                        <Option key={o.value} value={o.value}>{o.label}</Option>
                    ))}
                </Select>

                <Select
                    value={filterDestAccountType || undefined}
                    placeholder="Dest. Account"
                    allowClear
                    popupMatchSelectWidth={false}
                    onChange={(v) => onFilterDestAccountType(v ?? '')}
                    style={{ width: 160 }}
                >
                    {DEST_ACCOUNT_TYPE_OPTIONS.map((o) => (
                        <Option key={o.value} value={o.value}>{o.label}</Option>
                    ))}
                </Select>

                <Select
                    value={filterFundTransferStatus || undefined}
                    placeholder="Fund Transfer Status"
                    allowClear
                    popupMatchSelectWidth={false}
                    onChange={(v) => onFilterFundTransferStatus(v ?? '')}
                    style={{ width: 180 }}
                >
                    {FUND_TRANSFER_STATUS_OPTIONS.map((o) => (
                        <Option key={o.value} value={o.value}>{o.label}</Option>
                    ))}
                </Select>

                <Select
                    value={filterIsInternal !== '' ? filterIsInternal : undefined}
                    placeholder="Internal?"
                    allowClear
                    popupMatchSelectWidth={false}
                    onChange={(v) => onFilterIsInternal(v ?? '')}
                    style={{ width: 120 }}
                >
                    <Option value="true">Internal</Option>
                    <Option value="false">External</Option>
                </Select>
            </div>

            {/* Row 3: date range + include deleted + refresh */}
            <div className="flex flex-wrap gap-2 items-center">
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
                        background: includeDeleted
                            ? 'rgba(239,68,68,0.1)'
                            : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                        border: `1px solid ${includeDeleted ? 'rgba(239,68,68,0.3)' : 'var(--border-color)'}`,
                        transition: 'all 0.2s',
                    }}
                    onClick={() => onIncludeDeleted(!includeDeleted)}
                >
                    <div
                        className="w-8 h-4 rounded-full relative transition-all duration-200"
                        style={{ background: includeDeleted ? '#ef4444' : (isDark ? 'rgba(255,255,255,0.15)' : '#d1d5db') }}
                    >
                        <div
                            className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-200"
                            style={{ left: includeDeleted ? 'calc(100% - 14px)' : '2px' }}
                        />
                    </div>
                    <span className="text-xs font-medium" style={{ color: includeDeleted ? '#ef4444' : 'var(--text-muted)' }}>
                        Include Deleted
                    </span>
                </div>

                <Button
                    icon={<ReloadOutlined />}
                    onClick={onRefresh}
                    loading={loading}
                    style={{ marginLeft: 'auto' }}
                >
                    Refresh
                </Button>
            </div>
        </div>
    );
};

export default TxnFilters;
