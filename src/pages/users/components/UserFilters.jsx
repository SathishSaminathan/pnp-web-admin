import React from "react";
import { Select, Input, Button, DatePicker } from "antd";
import dayjs from "dayjs";

const KYC_STATUS_OPTIONS = [
  { label: "Not Submitted", value: "Not Submitted" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
];

const UserFilters = ({
  filters,
  countryInput,
  onCountryInputChange,
  hasActiveFilters,
  loading,
  total,
  onFilterChange,
  onLastSeenChange,
  onClearFilters,
}) => (
  <div
    className="rounded-xl p-4"
    style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-color)",
      boxShadow: "var(--shadow-card)",
    }}
  >
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3">
      <Select
        placeholder="Status"
        allowClear
        value={filters.isActive === "" ? undefined : filters.isActive}
        onChange={(v) => onFilterChange("isActive", v ?? "")}
        style={{ width: "100%" }}
        options={[
          { label: "Active", value: true },
          { label: "Inactive", value: false },
        ]}
      />
      <Select
        placeholder="KYC Status"
        allowClear
        value={filters.kycStatus || undefined}
        onChange={(v) => onFilterChange("kycStatus", v ?? "")}
        style={{ width: "100%" }}
        options={KYC_STATUS_OPTIONS}
      />
      <Select
        placeholder="Verified"
        allowClear
        value={filters.isVerified === "" ? undefined : filters.isVerified}
        onChange={(v) => onFilterChange("isVerified", v ?? "")}
        style={{ width: "100%" }}
        options={[
          { label: "Verified", value: true },
          { label: "Not Verified", value: false },
        ]}
      />
      <Input
        placeholder="Country (e.g. US)"
        allowClear
        value={countryInput}
        onChange={(e) => onCountryInputChange(e.target.value)}
        onClear={() => onCountryInputChange("")}
        style={{
          background: "var(--input-bg)",
          borderColor: "var(--border-color)",
          color: "var(--text-primary)",
        }}
      />
      <Select
        placeholder="Online Status"
        allowClear
        value={filters.isOnline === "" ? undefined : filters.isOnline}
        onChange={(v) => onFilterChange("isOnline", v ?? "")}
        style={{ width: "100%" }}
        options={[
          { label: "Online", value: true },
          { label: "Offline", value: false },
        ]}
      />
      <DatePicker.RangePicker
        placeholder={["Last Seen From", "Last Seen To"]}
        allowClear
        style={{ width: "100%" }}
        value={
          filters.lastSeenStart && filters.lastSeenEnd
            ? [dayjs(filters.lastSeenStart), dayjs(filters.lastSeenEnd)]
            : null
        }
        onChange={(dates) => onLastSeenChange(dates)}
      />
    </div>

    {(hasActiveFilters || (!loading && total > 0)) && (
      <div
        className="flex items-center gap-2 mt-3 pt-3"
        style={{ borderTop: "1px solid var(--border-color)" }}
      >
        {hasActiveFilters && (
          <Button
            size="small"
            type="link"
            danger
            onClick={onClearFilters}
            style={{ fontSize: 12, padding: "0 4px" }}
          >
            Clear all
          </Button>
        )}
        {!loading && total > 0 && (
          <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>
            {total} user{total !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    )}
  </div>
);

export default UserFilters;
