import React, { useState, useRef, useEffect } from 'react';
import { Select, Input, DatePicker } from 'antd';
import { STATUSES } from '../constants';

const { Option } = Select;
const { RangePicker } = DatePicker;

const CreditTxFilters = ({
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    filterMethod,
    setFilterMethod,
    dateRange,
    setDateRange,
    handleSearch,
    isMobile,
    isDark,
}) => {
    const [methodInput, setMethodInput] = useState(filterMethod);
    const debounceRef = useRef(null);

    // Sync if parent resets the value (e.g. on clear)
    useEffect(() => {
        setMethodInput(filterMethod);
    }, [filterMethod]);

    const handleMethodChange = (e) => {
        const val = e.target.value;
        setMethodInput(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setFilterMethod(val);
        }, 500);
    };

    const handleMethodClear = () => {
        clearTimeout(debounceRef.current);
        setMethodInput('');
        setFilterMethod('');
    };

    return (
    <div
        className="rounded-2xl p-4 mb-4 flex flex-wrap gap-3 items-center"
        style={{
            background: isDark ? 'var(--bg-card)' : '#fff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
            boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
        }}
    >
        <Input.Search
            placeholder="Search by email…"
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={handleSearch}
            style={{ width: isMobile ? '100%' : 220 }}
            styles={{
                affixWrapper: {
                    background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                    borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
                },
            }}
        />

        <Select
            allowClear
            placeholder="Status"
            value={filterStatus || undefined}
            onChange={(v) => setFilterStatus(v ?? '')}
            style={{ width: isMobile ? '100%' : 160 }}
            popupMatchSelectWidth={false}
        >
            {STATUSES.map((s) => <Option key={s} value={s}>{s}</Option>)}
        </Select>

        <Input
            allowClear
            placeholder="Payment method…"
            value={methodInput}
            onChange={handleMethodChange}
            onClear={handleMethodClear}
            style={{
                width: isMobile ? '100%' : 160,
                background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
                color: 'var(--text-primary)',
            }}
        />

        {!isMobile && (
            <RangePicker
                value={dateRange}
                onChange={(v) => setDateRange(v)}
                style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                    borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
                }}
            />
        )}
    </div>
    );
};

export default CreditTxFilters;
