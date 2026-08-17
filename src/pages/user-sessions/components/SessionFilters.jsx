import React from 'react';
import { Select, DatePicker } from 'antd';

const { Option } = Select;
const { RangePicker } = DatePicker;

const SessionFilters = ({
    filterStatus,
    includeDeleted,
    merchantOptions,
    merchantLoading,
    onStatusChange,
    onMerchantSearch,
    onMerchantChange,
    onDateRangeChange,
    onIncludeDeletedChange,
}) => (
    <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
        <Select
            allowClear
            placeholder="Filter by status"
            style={{ minWidth: 150 }}
            onChange={onStatusChange}
            value={filterStatus || undefined}
            styles={{ popup: { root: { background: 'var(--bg-card)' } } }}
        >
            <Option value="active">Active</Option>
            <Option value="terminated">Terminated</Option>
        </Select>

        <Select
            showSearch
            allowClear
            placeholder="Search merchant..."
            style={{ minWidth: 200 }}
            loading={merchantLoading}
            filterOption={false}
            onSearch={onMerchantSearch}
            onChange={onMerchantChange}
            options={merchantOptions.map((o) => ({
                value: o.value,
                label: (
                    <div>
                        <span className="font-medium">{o.label}</span>
                        <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>{o.email}</span>
                    </div>
                ),
            }))}
            notFoundContent={merchantLoading ? 'Searching…' : 'Type to search'}
        />

        <RangePicker
            onChange={onDateRangeChange}
            style={{ minWidth: 240 }}
            allowClear
        />

        <Select
            allowClear
            placeholder="Include deleted"
            style={{ minWidth: 150 }}
            onChange={onIncludeDeletedChange}
            value={includeDeleted ? 'true' : undefined}
        >
            <Option value="true">Include Deleted</Option>
        </Select>
    </div>
);

export default SessionFilters;
