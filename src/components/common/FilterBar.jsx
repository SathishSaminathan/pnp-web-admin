import React from 'react';
import { Button, DatePicker, Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

const FilterBar = ({
  search,
  searchPlaceholder = 'Search',
  onSearchChange,
  filters = [],
  dateRange,
  onDateRangeChange,
  extra,
  onClear,
  hasActiveFilters,
}) => (
  <div style={{ marginBottom: 16 }} className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center">
    {onSearchChange ? (
      <Input
        allowClear
        prefix={<SearchOutlined style={{ color: 'var(--text-muted)' }} />}
        placeholder={searchPlaceholder}
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        style={{ maxWidth: 320, minWidth: 220 }}
      />
    ) : null}
    {filters.map(filter => (
      <Select
        key={filter.key}
        allowClear={filter.allowClear !== false}
        placeholder={filter.placeholder}
        value={filter.value || undefined}
        onChange={value => filter.onChange(value ?? '')}
        options={filter.options}
        popupMatchSelectWidth={false}
        style={{ minWidth: filter.width || 160 }}
      />
    ))}
    {onDateRangeChange ? (
      <RangePicker
        value={dateRange}
        onChange={onDateRangeChange}
        format="DD MMM YYYY"
        allowClear
      />
    ) : null}
    {extra}
    {hasActiveFilters && onClear ? (
      <Button onClick={onClear}>Clear filters</Button>
    ) : null}
  </div>
);

export default FilterBar;
