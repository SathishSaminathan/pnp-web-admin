import React, { useState } from "react";
import { Table, Input, Select, DatePicker, Tag, Avatar, Drawer, Tooltip } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  CarOutlined,
  ClockCircleOutlined,
  DollarCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  EyeOutlined,
  RiseOutlined,
  FallOutlined,
  SwapOutlined,
  WalletOutlined,
  CreditCardOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
// TODO: Replace with real API call when backend is ready
// import { getTransactions } from "../../api/modules/transactions";
import MOCK_TXN from "./mockTransactions.json";

const { RangePicker } = DatePicker;

const TYPE_CFG = {
  "Parking Fee":  { color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  icon: <CarOutlined /> },
  "Refund":       { color: "#10b981", bg: "rgba(16,185,129,0.12)",  icon: <ArrowDownOutlined /> },
  "Extension":    { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)",  icon: <ClockCircleOutlined /> },
  "Cancellation": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: <CloseCircleOutlined /> },
  "Penalty":      { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   icon: <ThunderboltOutlined /> },
};

const STATUS_CFG = {
  Success: { color: "success",    icon: <CheckCircleOutlined />, dot: "#10b981" },
  Pending: { color: "processing", icon: <SyncOutlined spin />,   dot: "#f59e0b" },
  Failed:  { color: "error",      icon: <CloseCircleOutlined />, dot: "#ef4444" },
};

const METHOD_ICON = {
  Card:   <CreditCardOutlined />,
  UPI:    <SwapOutlined />,
  Wallet: <WalletOutlined />,
};

const Sparkline = ({ data, color }) => {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-0.5" style={{ height: 28 }}>
      {data.map((v, i) => (
        <div key={i} style={{ width: 5, height: `${(v / max) * 100}%`, background: color, borderRadius: 2, opacity: 0.4 + (i / data.length) * 0.6 }} />
      ))}
    </div>
  );
};

const StatCard = ({ label, value, trend, trendUp, color, icon, sparkData, sub }) => (
  <div className="rounded-2xl p-4 flex flex-col gap-3"
    style={{ border: `1px solid ${color}22`, boxShadow: "var(--shadow-card)", background: `linear-gradient(135deg, ${color}0a 0%, var(--bg-card) 65%)` }}>
    <div className="flex items-center justify-between">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: `${color}18`, color }}>
        {icon}
      </div>
      {sparkData && <Sparkline data={sparkData} color={color} />}
    </div>
    <div>
      <div className="text-xl font-extrabold leading-tight tabular-nums" style={{ color: "var(--text-primary)" }}>{value}</div>
      <div className="text-xs font-semibold mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
    </div>
    {trend && (
      <div className={`flex items-center gap-1 text-xs font-bold ${trendUp ? "text-emerald-500" : "text-red-400"}`}>
        {trendUp ? <RiseOutlined style={{ fontSize: 10 }} /> : <FallOutlined style={{ fontSize: 10 }} />}
        {trend}
        {sub && <span className="font-normal ml-1" style={{ color: "var(--text-muted)" }}>{sub}</span>}
      </div>
    )}
  </div>
);

const QUICK_FILTERS = [
  { label: "All",           value: "" },
  { label: "Parking Fee",   value: "Parking Fee" },
  { label: "Refunds",       value: "Refund" },
  { label: "Extensions",    value: "Extension" },
  { label: "Penalties",     value: "Penalty" },
  { label: "Cancellations", value: "Cancellation" },
];

const DetailRow = ({ icon, label, value, valueStyle = {} }) => (
  <div className="flex items-start gap-3 py-3" style={{ borderBottom: "1px solid var(--border-color)" }}>
    <span className="text-base mt-0.5 shrink-0" style={{ color: "#60a5fa" }}>{icon}</span>
    <div className="flex flex-col min-w-0 flex-1">
      <span className="text-xs font-semibold mb-0.5" style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className="text-sm font-medium break-all" style={{ color: "var(--text-primary)", ...valueStyle }}>
        {value || <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontWeight: 400 }}>—</span>}
      </span>
    </div>
  </div>
);

const TransactionsList = () => {
  const [search,       setSearch]       = useState("");
  const [typeFilter,   setTypeFilter]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [dateRange,    setDateRange]    = useState(null);
  const [page,         setPage]         = useState(1);
  const [selected,     setSelected]     = useState(null);
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const PAGE_SIZE = 10;

  const filtered = MOCK_TXN.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch  = !q || t.user.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.ref.toLowerCase().includes(q);
    const matchType    = !typeFilter   || t.type === typeFilter;
    const matchStatus  = !statusFilter || t.status === statusFilter;
    const matchMethod  = !methodFilter || t.method === methodFilter;
    const matchDate    = !dateRange ||
      (t.date.slice(0, 10) >= dateRange[0].format("YYYY-MM-DD") &&
       t.date.slice(0, 10) <= dateRange[1].format("YYYY-MM-DD"));
    return matchSearch && matchType && matchStatus && matchMethod && matchDate;
  });

  const revenue  = MOCK_TXN.filter(t => t.status === "Success" && t.direction === "debit").reduce((s, t) => s + t.amount, 0);
  const refunded = MOCK_TXN.filter(t => t.type === "Refund" && t.status === "Success").reduce((s, t) => s + t.amount, 0);
  const success  = MOCK_TXN.filter(t => t.status === "Success").length;
  const failed   = MOCK_TXN.filter(t => t.status === "Failed").length;

  const hasFilters = search || typeFilter || statusFilter || methodFilter || dateRange;
  const clearFilters = () => { setSearch(""); setTypeFilter(""); setStatusFilter(""); setMethodFilter(""); setDateRange(null); setPage(1); };

  const columns = [
    {
      title: "Transaction", width: 200,
      render: (_, rec) => {
        const tcfg = TYPE_CFG[rec.type] || TYPE_CFG["Parking Fee"];
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm" style={{ background: tcfg.bg, color: tcfg.color }}>{tcfg.icon}</div>
            <div className="min-w-0">
              <div className="font-bold text-xs" style={{ color: "var(--text-primary)" }}>{rec.id}</div>
              <div className="text-xs font-semibold" style={{ color: tcfg.color }}>{rec.type}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: "User", width: 170,
      render: (_, rec) => (
        <div className="flex items-center gap-2">
          <Avatar src={rec.avatar} size={30} />
          <div className="min-w-0">
            <div className="font-semibold text-sm leading-tight truncate" style={{ color: "var(--text-primary)" }}>{rec.user}</div>
            <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{rec.phone}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Spot / Booking", width: 190,
      render: (_, rec) => (
        <div>
          <div className="text-xs font-semibold flex items-center gap-1" style={{ color: "var(--text-primary)" }}>
            <EnvironmentOutlined style={{ color: "#3b82f6", fontSize: 10 }} /> {rec.spot}
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Ref: <span className="font-semibold">{rec.ref}</span> · {rec.city}</div>
        </div>
      ),
    },
    {
      title: "Date & Time", width: 140,
      render: (_, rec) => (
        <div>
          <div className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{dayjs(rec.date).format("DD MMM YYYY")}</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>{dayjs(rec.date).format("hh:mm A")}</div>
        </div>
      ),
    },
    {
      title: "Amount", width: 110,
      render: (_, rec) => (
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
            style={{ background: rec.direction === "credit" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.12)", color: rec.direction === "credit" ? "#10b981" : "#ef4444" }}>
            {rec.direction === "credit" ? <ArrowDownOutlined style={{ fontSize: 9 }} /> : <ArrowUpOutlined style={{ fontSize: 9 }} />}
          </span>
          <span className="font-extrabold text-sm tabular-nums" style={{ color: "var(--text-primary)" }}>${rec.amount.toFixed(2)}</span>
        </div>
      ),
    },
    {
      title: "Method", width: 95,
      render: (_, rec) => (
        <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg w-max"
          style={{ background: "var(--input-bg)", border: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
          {METHOD_ICON[rec.method]} {rec.method}
        </span>
      ),
    },
    {
      title: "Status", width: 110,
      render: (_, rec) => {
        const s = STATUS_CFG[rec.status] || STATUS_CFG.Success;
        return <Tag icon={s.icon} color={s.color} className="rounded-full px-2.5 font-semibold text-xs">{rec.status}</Tag>;
      },
    },
    {
      title: "", width: 48,
      render: (_, rec) => (
        <Tooltip title="View">
          <button onClick={() => { setSelected(rec); setDrawerOpen(true); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ border: "1px solid var(--border-color)", color: "#3b82f6" }}>
            <EyeOutlined />
          </button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold m-0" style={{ color: "var(--text-primary)" }}>Transactions</h2>
          <p className="text-sm m-0 mt-0.5" style={{ color: "var(--text-muted)" }}>All parking payment transactions</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl"
          style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
          Live
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard label="Total Revenue"  value={`$${revenue.toFixed(2)}`}  trend="+6.1% vs last month" trendUp color="#3b82f6" icon={<DollarCircleOutlined />} sparkData={[4,6,5,8,7,9,11]} />
        <StatCard label="Successful"     value={success}                    trend="+3.4% vs last week"  trendUp color="#10b981" icon={<CheckCircleOutlined />}  sparkData={[3,5,4,6,7,8,9]}  />
        <StatCard label="Failed"         value={failed}                     trend="-1 vs yesterday"            color="#ef4444" icon={<CloseCircleOutlined />} sparkData={[2,3,2,4,3,2,2]}  />
        <StatCard label="Refunded"       value={`$${refunded.toFixed(2)}`}  sub="this month"                   color="#8b5cf6" icon={<ArrowDownOutlined />}   sparkData={[1,2,1,3,2,3,2]}  />
      </div>

      {/* Quick filter chips */}
      <div className="flex gap-2 flex-wrap">
        {QUICK_FILTERS.map((f) => (
          <button key={f.value} onClick={() => { setTypeFilter(f.value); setPage(1); }}
            className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
            style={typeFilter === f.value
              ? { background: "#3b82f6", color: "#fff", border: "1.5px solid #3b82f6" }
              : { background: "var(--input-bg)", color: "var(--text-secondary)", border: "1.5px solid var(--border-color)" }
            }>
            {f.label}
          </button>
        ))}
      </div>

      {/* Filters bar */}
      <div className="rounded-xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-card)" }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input prefix={<SearchOutlined style={{ color: "var(--text-muted)" }} />} placeholder="Search ID, user…" allowClear value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ background: "var(--input-bg)", borderColor: "var(--border-color)" }} />
          <Select placeholder="Status" allowClear value={statusFilter || undefined} onChange={(v) => { setStatusFilter(v ?? ""); setPage(1); }} style={{ width: "100%" }}
            options={[{ label: "Success", value: "Success" }, { label: "Pending", value: "Pending" }, { label: "Failed", value: "Failed" }]} />
          <Select placeholder="Payment Method" allowClear value={methodFilter || undefined} onChange={(v) => { setMethodFilter(v ?? ""); setPage(1); }} style={{ width: "100%" }}
            options={[{ label: "Card", value: "Card" }, { label: "UPI", value: "UPI" }, { label: "Wallet", value: "Wallet" }]} />
          <RangePicker value={dateRange} onChange={(dates) => { setDateRange(dates); setPage(1); }}
            style={{ width: "100%", background: "var(--input-bg)", borderColor: "var(--border-color)" }} format="DD MMM YYYY" />
        </div>
        {hasFilters && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Showing <strong style={{ color: "var(--text-primary)" }}>{filtered.length}</strong> of {MOCK_TXN.length} transactions
            </span>
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600">
              <ReloadOutlined /> Clear all
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-card)" }}>
        <Table
          columns={columns} dataSource={filtered} rowKey="id" scroll={{ x: 1050 }}
          pagination={{ current: page, pageSize: PAGE_SIZE, total: filtered.length, onChange: (p) => setPage(p), showSizeChanger: false,
            showTotal: (total) => <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{total} transactions</span> }}
          className="custom-txn-table" sticky
        />
      </div>

      {/* Detail Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: selected ? TYPE_CFG[selected.type]?.bg : "#eff6ff", color: selected ? TYPE_CFG[selected.type]?.color : "#3b82f6" }}>
              {selected ? TYPE_CFG[selected.type]?.icon : <SwapOutlined />}
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Transaction Details</div>
              <div className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>{selected?.id}</div>
            </div>
          </div>
        }
        placement="right" onClose={() => setDrawerOpen(false)} open={drawerOpen}
        width={Math.min(420, typeof window !== "undefined" ? window.innerWidth : 420)}
        styles={{
          wrapper: { boxShadow: "-8px 0 40px rgba(0,0,0,0.3)" },
          header: { background: "var(--bg-card)", borderBottom: "1px solid var(--border-color)", padding: "16px 24px" },
          body:   { background: "var(--bg-card)", padding: "24px" },
          mask:   { backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.4)" },
        }}
      >
        {selected && (() => {
          const tcfg = TYPE_CFG[selected.type] || TYPE_CFG["Parking Fee"];
          const scfg = STATUS_CFG[selected.status] || STATUS_CFG.Success;
          return (
            <div>
              {/* Amount hero */}
              <div className="rounded-2xl p-5 mb-5 text-center"
                style={{ background: `linear-gradient(135deg, ${tcfg.color}15, ${tcfg.color}05)`, border: `1px solid ${tcfg.color}25` }}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    style={{ background: selected.direction === "credit" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.15)", color: selected.direction === "credit" ? "#10b981" : "#ef4444" }}>
                    {selected.direction === "credit" ? <ArrowDownOutlined style={{ fontSize: 10 }} /> : <ArrowUpOutlined style={{ fontSize: 10 }} />}
                  </span>
                  <span className="text-xs font-bold uppercase" style={{ color: selected.direction === "credit" ? "#10b981" : "#ef4444" }}>
                    {selected.direction === "credit" ? "Credit" : "Debit"}
                  </span>
                </div>
                <div className="text-3xl font-extrabold tabular-nums" style={{ color: "var(--text-primary)" }}>${selected.amount.toFixed(2)}</div>
                <div className="text-xs mt-1 font-semibold" style={{ color: tcfg.color }}>{selected.type}</div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <Tag icon={scfg.icon} color={scfg.color} className="rounded-full px-3 py-0.5 font-semibold">{selected.status}</Tag>
                <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg"
                  style={{ background: "var(--input-bg)", border: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                  {METHOD_ICON[selected.method]} {selected.method}
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl mb-4" style={{ background: "var(--input-bg)", border: "1px solid var(--border-color)" }}>
                <Avatar src={selected.avatar} size={44} />
                <div>
                  <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{selected.user}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{selected.phone}</div>
                </div>
              </div>

              <DetailRow icon={<CarOutlined />}          label="Parking Spot"  value={selected.spot} />
              <DetailRow icon={<EnvironmentOutlined />}  label="City"          value={selected.city} />
              <DetailRow icon={<CalendarOutlined />}     label="Date & Time"   value={dayjs(selected.date).format("DD MMMM YYYY · hh:mm A")} />
              <DetailRow icon={<SwapOutlined />}         label="Booking Ref"   value={selected.ref} />
              <DetailRow icon={<DollarCircleOutlined />} label="Amount"        value={`$${selected.amount.toFixed(2)}`} valueStyle={{ fontWeight: 700, fontSize: 16 }} />
            </div>
          );
        })()}
      </Drawer>

      <style>{`
        .custom-txn-table .ant-table-thead > tr > th { background: transparent !important; border-bottom: 2px solid var(--table-border) !important; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; color: var(--text-muted) !important; }
        .custom-txn-table .ant-table-thead > tr > th::before { display: none !important; }
        .custom-txn-table .ant-table-tbody > tr > td { border-bottom: 1px solid var(--table-border) !important; padding: 14px 16px; background: transparent !important; }
        .custom-txn-table .ant-table-tbody > tr:hover > td { background: var(--input-bg) !important; }
        .custom-txn-table .ant-table-cell { background: transparent !important; }
      `}</style>
    </div>
  );
};

export default TransactionsList;
