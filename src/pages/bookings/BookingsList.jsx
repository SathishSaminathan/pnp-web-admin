import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  Input,
  Select,
  DatePicker,
  Tag,
  Avatar,
  Drawer,
  Tooltip,
  Rate,
  Alert,
} from "antd";
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
  ExclamationCircleOutlined,
  FileTextOutlined,
  StarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  fetchBookings,
  selectBookingsList,
  selectBookingsTotalCount,
  selectBookingsLoading,
  selectBookingsError,
  setLastParams,
  clearListError,
} from "../../store/slices/bookingsSlice";

const { RangePicker } = DatePicker;

// ── Status config (Meralot API status values) ────────────────────────────────
const STATUS_CFG = {
  providerReview:   { color: "processing", icon: <ClockCircleOutlined />,      label: "Pending Review" },
  bookingApproved:  { color: "blue",       icon: <SyncOutlined spin />,         label: "Approved"       },
  bookingExpired:   { color: "warning",    icon: <ExclamationCircleOutlined />, label: "Expired"        },
  bookingDeclined:  { color: "error",      icon: <CloseCircleOutlined />,       label: "Declined"       },
  bookingCompleted: { color: "success",    icon: <CheckCircleOutlined />,       label: "Completed"      },
};

const STATUS_OPTIONS = [
  { label: "Pending Review", value: "providerReview"   },
  { label: "Approved",       value: "bookingApproved"  },
  { label: "Completed",      value: "bookingCompleted" },
  { label: "Declined",       value: "bookingDeclined"  },
  { label: "Expired",        value: "bookingExpired"   },
];

const formatDuration = (startDt, endDt, hourFallback) => {
  if (startDt && endDt) {
    const diffMin = endDt.diff(startDt, "minute");
    if (diffMin >= 60) {
      return `${(diffMin / 60).toFixed(diffMin % 60 === 0 ? 0 : 1)}h`;
    }
    return `${diffMin}m`;
  }
  if (hourFallback != null) return `${hourFallback}h`;
  return "—";
};

const formatMoney = (amount, currency) => {
  const n = Number(amount ?? 0);
  const symbol = currency || "₹";
  return `${symbol}${n.toFixed(2)}`;
};

// ── Normalize raw API booking → display shape ────────────────────────────────
const normalizeBooking = (b) => {
  const user    = b.userDetail    ?? {};
  const space   = b.spaceDetail   ?? {};
  const vehicle = b.vehicleDetail ?? null;
  const reviews = b.reviews       ?? {};

  // API stores times in UTC (fromTime / toTime)
  const startDt = b.fromTime ? dayjs(b.fromTime) : (b.startTime ? dayjs(b.startTime) : null);
  const endDt   = b.toTime   ? dayjs(b.toTime)   : (b.endTime   ? dayjs(b.endTime)   : null);

  const vehicleLabel = vehicle
    ? [vehicle.manufacturer, vehicle.model, vehicle.vehicleNo].filter(Boolean).join(" · ")
      || vehicle.vehicleType
      || "—"
    : "—";

  return {
    id:          b._id ?? b.id,
    raw:         b,
    user:        user.name
      ?? user.fullName
      ?? ([user.firstName, user.lastName].filter(Boolean).join(" ") || "—"),
    avatar:      user.profilePicture ?? user.profilePictureUrl ?? user.photo ?? null,
    phone:       user.phone ?? user.phoneNumber ?? user.mobile ?? "",
    email:       user.email ?? "",
    spot:        space.spaceName ?? space.name ?? space.title ?? "—",
    spotCode:    space.spotCode ?? space.spaceCode ?? space.code ?? "",
    city:        space.address?.city ?? space.city ?? space.location?.city ?? "",
    currency:    space.currency ?? "₹",
    date:        startDt ? startDt.format("YYYY-MM-DD") : "",
    startTime:   startDt ? startDt.format("HH:mm") : "",
    endTime:     endDt   ? endDt.format("HH:mm")   : "",
    duration:    formatDuration(startDt, endDt, b.hour),
    hour:        b.hour ?? null,
    amount:      Number(b.price ?? b.totalAmount ?? b.amount ?? 0),
    status:      b.status ?? "",
    notes:       b.notes ?? "",
    vehicleLabel,
    vehicleType: vehicle?.vehicleType ?? "",
    vehicleNo:   vehicle?.vehicleNo ?? "",
    stayReview:  reviews.stayReview ?? null,
    guestReview: reviews.guestReview ?? null,
    spaceProviderId: b.spaceProviderId ?? "",
    userId:      b.userId ?? "",
  };
};

// ── Mini sparkline bars ───────────────────────────────────────────────────────
const Sparkline = ({ data, color }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5" style={{ height: 30 }}>
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: `${(v / max) * 100}%`,
            background: color,
            borderRadius: 3,
            opacity: 0.35 + (i / data.length) * 0.65,
          }}
        />
      ))}
    </div>
  );
};

const StatCard = ({ icon, iconColor, label, value, sub, sparkData }) => (
  <div
    className="rounded-2xl p-4 flex flex-col gap-3 min-w-[140px]"
    style={{
      background: `linear-gradient(135deg, ${iconColor}0d 0%, var(--bg-card) 60%)`,
      border: `1px solid ${iconColor}28`,
      boxShadow: "var(--shadow-card)",
    }}
  >
    <div className="flex items-center justify-between">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
        style={{ background: `${iconColor}1a`, color: iconColor }}
      >
        {icon}
      </div>
      {sparkData && <Sparkline data={sparkData} color={iconColor} />}
    </div>
    <div className="min-w-0">
      <div className="text-xl sm:text-2xl font-extrabold leading-tight tabular-nums" style={{ color: "var(--text-primary)" }}>
        {value}
      </div>
      <div className="text-xs font-semibold mt-0.5" style={{ color: "var(--text-muted)" }}>
        {label}
      </div>
      {sub && (
        <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</div>
      )}
    </div>
  </div>
);

const DetailRow = ({ icon, label, value }) => (
  <div
    className="flex items-start gap-3 py-3"
    style={{ borderBottom: "1px solid var(--border-color)" }}
  >
    <span className="text-base mt-0.5 shrink-0" style={{ color: "#60a5fa" }}>{icon}</span>
    <div className="flex flex-col min-w-0 flex-1">
      <span className="text-xs font-semibold mb-0.5" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      <span className="text-sm font-medium break-all" style={{ color: "var(--text-primary)" }}>
        {value || <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontWeight: 400 }}>—</span>}
      </span>
    </div>
  </div>
);

/**
 * Build GET /booking query params per Meralot docs.
 * - Use `date` OR (`fromDate` + `toDate`), never both.
 * - status: comma-separated when multiple selected.
 */
const buildBookingParams = ({
  page = 1,
  pageSize = 10,
  statusFilter = [],
  dateRange = null,
  userId = "",
  spaceProviderId = "",
} = {}) => {
  const params = {
    offset: Math.max(0, (page - 1) * pageSize),
    limit:  pageSize,
  };

  if (Array.isArray(statusFilter) && statusFilter.length > 0) {
    params.status = statusFilter.join(",");
  } else if (typeof statusFilter === "string" && statusFilter) {
    params.status = statusFilter;
  }

  if (dateRange?.[0] && dateRange?.[1]) {
    const from = dateRange[0].format("YYYY-MM-DD");
    const to   = dateRange[1].format("YYYY-MM-DD");
    if (from === to) {
      params.date = from;
    } else {
      params.fromDate = from;
      params.toDate   = to;
    }
  }

  const uid = userId?.trim();
  const spid = spaceProviderId?.trim();
  if (uid)  params.userId = uid;
  if (spid) params.spaceProviderId = spid;

  return params;
};

// ── Main component ────────────────────────────────────────────────────────────
const BookingsList = () => {
  const dispatch = useDispatch();

  const [search, setSearch]                     = useState("");
  const [statusFilter, setStatusFilter]         = useState([]);
  const [dateRange, setDateRange]               = useState(null);
  const [userIdInput, setUserIdInput]           = useState("");
  const [providerIdInput, setProviderIdInput]   = useState("");
  const [userIdFilter, setUserIdFilter]         = useState("");
  const [providerIdFilter, setProviderIdFilter] = useState("");
  const [selected, setSelected]                 = useState(null);
  const [drawerOpen, setDrawerOpen]             = useState(false);
  const [page, setPage]                         = useState(1);
  const [pageSize]                              = useState(10);

  const idDebounceRef = useRef({ user: null, provider: null });

  const rawList    = useSelector(selectBookingsList);
  const totalCount = useSelector(selectBookingsTotalCount);
  const loading    = useSelector(selectBookingsLoading);
  const listError  = useSelector(selectBookingsError);

  const load = useCallback((pg = 1) => {
    const params = buildBookingParams({
      page: pg,
      pageSize,
      statusFilter,
      dateRange,
      userId: userIdFilter,
      spaceProviderId: providerIdFilter,
    });
    dispatch(setLastParams(params));
    dispatch(fetchBookings(params));
  }, [dispatch, pageSize, statusFilter, dateRange, userIdFilter, providerIdFilter]);

  // Initial + whenever server-side filters / page change
  useEffect(() => {
    load(page);
  }, [load, page]);

  const normalized = rawList.map(normalizeBooking);

  // Client-side text search only (API has no free-text search)
  const filtered = normalized.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.user.toLowerCase().includes(q) ||
      (b.id ?? "").toLowerCase().includes(q) ||
      b.spot.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      b.vehicleNo.toLowerCase().includes(q) ||
      b.vehicleLabel.toLowerCase().includes(q)
    );
  });

  const stats = {
    total:     totalCount,
    active:    normalized.filter((b) => b.status === "bookingApproved" || b.status === "providerReview").length,
    completed: normalized.filter((b) => b.status === "bookingCompleted").length,
    cancelled: normalized.filter((b) => b.status === "bookingDeclined" || b.status === "bookingExpired").length,
    revenue:   normalized
      .filter((b) => b.status !== "bookingDeclined" && b.status !== "bookingExpired")
      .reduce((s, b) => s + b.amount, 0),
  };

  const hasFilters =
    statusFilter.length > 0 ||
    dateRange ||
    search ||
    userIdInput.trim() ||
    providerIdInput.trim();

  const clearFilters = () => {
    clearTimeout(idDebounceRef.current.user);
    clearTimeout(idDebounceRef.current.provider);
    setSearch("");
    setStatusFilter([]);
    setDateRange(null);
    setUserIdInput("");
    setProviderIdInput("");
    setUserIdFilter("");
    setProviderIdFilter("");
    setPage(1);
  };

  const handleStatusChange = (values) => {
    setStatusFilter(values ?? []);
    setPage(1);
  };

  const handleDateChange = (dates) => {
    setDateRange(dates);
    setPage(1);
  };

  const handleIdFilterChange = (key, value) => {
    if (key === "userId") {
      setUserIdInput(value);
      clearTimeout(idDebounceRef.current.user);
      idDebounceRef.current.user = setTimeout(() => {
        setUserIdFilter(value.trim());
        setPage(1);
      }, 400);
    } else {
      setProviderIdInput(value);
      clearTimeout(idDebounceRef.current.provider);
      idDebounceRef.current.provider = setTimeout(() => {
        setProviderIdFilter(value.trim());
        setPage(1);
      }, 400);
    }
  };

  const columns = [
    {
      title: "Booking ID",
      dataIndex: "id",
      width: 140,
      render: (v) => (
        <span className="font-semibold text-xs" style={{ color: "var(--text-primary)" }}>
          {v}
        </span>
      ),
    },
    {
      title: "User",
      dataIndex: "user",
      width: 180,
      render: (text, rec) => (
        <div className="flex items-center gap-2">
          <Avatar src={rec.avatar} size={32} icon={<UserOutlined />} />
          <div>
            <div className="font-semibold text-sm leading-tight" style={{ color: "var(--text-primary)" }}>
              {text}
            </div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              {rec.phone || rec.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Parking Spot",
      dataIndex: "spot",
      width: 200,
      render: (text, rec) => (
        <div>
          <div className="flex items-center gap-1 font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            <CarOutlined style={{ color: "#3b82f6", fontSize: 12 }} />
            {text}
            {rec.spotCode ? (
              <> · <span className="font-bold text-blue-500">{rec.spotCode}</span></>
            ) : null}
          </div>
          {rec.city && (
            <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
              <EnvironmentOutlined style={{ fontSize: 10 }} /> {rec.city}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Vehicle",
      dataIndex: "vehicleLabel",
      width: 160,
      render: (text, rec) => (
        <div>
          <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {text}
          </div>
          {rec.vehicleType && (
            <div className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>
              {rec.vehicleType}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Date & Time",
      dataIndex: "date",
      width: 170,
      render: (date, rec) => (
        <div>
          <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {date ? dayjs(date).format("DD MMM YYYY") : "—"}
          </div>
          <div className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
            <ClockCircleOutlined style={{ fontSize: 10 }} />
            {rec.startTime || "—"} – {rec.endTime || "—"}
            <span
              className="ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold"
              style={{ background: "var(--input-bg)", border: "1px solid var(--border-color)", color: "var(--text-secondary)" }}
            >
              {rec.duration}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      width: 100,
      render: (v, rec) => (
        <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
          {formatMoney(v, rec.currency)}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 140,
      render: (s) => {
        const cfg = STATUS_CFG[s];
        if (!cfg) return <Tag className="rounded-full px-3 font-semibold">{s || "—"}</Tag>;
        return (
          <Tag icon={cfg.icon} color={cfg.color} className="rounded-full px-3 font-semibold">
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: "",
      width: 56,
      render: (_, rec) => (
        <Tooltip title="View Details">
          <button
            onClick={() => { setSelected(rec); setDrawerOpen(true); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-blue-50"
            style={{ border: "1px solid var(--border-color)", color: "#3b82f6" }}
          >
            <EyeOutlined />
          </button>
        </Tooltip>
      ),
    },
  ];

  const stayAvg = selected?.stayReview?.ratings
    ? (
        (Number(selected.stayReview.ratings.security || 0) +
          Number(selected.stayReview.ratings.access || 0) +
          Number(selected.stayReview.ratings.cleanliness || 0) +
          Number(selected.stayReview.ratings.listingAccuracy || 0)) / 4
      ).toFixed(1)
    : null;

  return (
    <div className="space-y-5 pb-12">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold m-0" style={{ color: "var(--text-primary)" }}>
            Bookings
          </h2>
          <p className="text-sm m-0 mt-0.5" style={{ color: "var(--text-muted)" }}>
            All parking reservations and sessions
          </p>
        </div>
        <button
          onClick={() => load(page)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          style={{
            background: "var(--input-bg)",
            border: "1px solid var(--border-color)",
            color: "var(--text-secondary)",
            opacity: loading ? 0.6 : 1,
          }}
        >
          <ReloadOutlined spin={loading} /> Refresh
        </button>
      </div>

      {listError && (
        <Alert
          type="error"
          showIcon
          closable
          message={listError}
          onClose={() => dispatch(clearListError())}
        />
      )}

      {/* ── Stat cards (page breakdown + API total) ── */}
      <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 xl:grid-cols-5 sm:overflow-visible">
        <StatCard icon={<CarOutlined />}         iconColor="#3b82f6" label="Total Bookings" value={stats.total}     sub="Matching filters" sparkData={[4, 6, 5, 8, 7, 9, 10]} />
        <StatCard icon={<SyncOutlined />}        iconColor="#10b981" label="Active (page)"  value={stats.active}    sparkData={[2, 3, 4, 3, 5, 4, 3]} />
        <StatCard icon={<CheckCircleOutlined />} iconColor="#22c55e" label="Completed (page)" value={stats.completed} sparkData={[3, 4, 5, 6, 5, 7, 6]} />
        <StatCard icon={<CloseCircleOutlined />} iconColor="#ef4444" label="Cancelled (page)" value={stats.cancelled} sparkData={[3, 2, 3, 2, 2, 1, 2]} />
        <StatCard icon={<DollarCircleOutlined />} iconColor="#f59e0b" label="Revenue (page)" value={formatMoney(stats.revenue, "₹")} sub="Excl. declined/expired" sparkData={[8, 12, 10, 16, 14, 18, 20]} />
      </div>

      {/* ── Filters ── */}
      <div
        className="rounded-xl p-4"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          <Input
            prefix={<SearchOutlined style={{ color: "var(--text-muted)" }} />}
            placeholder="Search user, booking ID, spot, vehicle…"
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: "var(--input-bg)", borderColor: "var(--border-color)" }}
          />

          <Select
            mode="multiple"
            allowClear
            maxTagCount="responsive"
            placeholder="Status (multi)"
            value={statusFilter}
            onChange={handleStatusChange}
            options={STATUS_OPTIONS}
            style={{ width: "100%" }}
          />

          <RangePicker
            value={dateRange}
            onChange={handleDateChange}
            style={{ width: "100%", background: "var(--input-bg)", borderColor: "var(--border-color)" }}
            format="DD MMM YYYY"
            allowEmpty={[false, false]}
          />

          <Input
            placeholder="Filter by userId"
            allowClear
            value={userIdInput}
            onChange={(e) => handleIdFilterChange("userId", e.target.value)}
            style={{ background: "var(--input-bg)", borderColor: "var(--border-color)" }}
          />

          <Input
            placeholder="Filter by spaceProviderId"
            allowClear
            value={providerIdInput}
            onChange={(e) => handleIdFilterChange("spaceProviderId", e.target.value)}
            style={{ background: "var(--input-bg)", borderColor: "var(--border-color)" }}
          />
        </div>

        {hasFilters && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Showing <strong style={{ color: "var(--text-primary)" }}>{filtered.length}</strong> of {totalCount} bookings
            </span>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600"
            >
              <ReloadOutlined /> Clear filters
            </button>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{
            current: page,
            pageSize,
            total: totalCount,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
            showTotal: (total) => (
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                {total} bookings
              </span>
            ),
          }}
          className="custom-bookings-table"
          sticky
        />
      </div>

      {/* ── Detail Drawer ── */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <CarOutlined style={{ color: "#fff", fontSize: 14 }} />
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                Booking Details
              </div>
              <div className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>
                {selected?.id}
              </div>
            </div>
          </div>
        }
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={Math.min(420, typeof window !== "undefined" ? window.innerWidth : 420)}
        styles={{
          wrapper: { boxShadow: "-8px 0 40px rgba(0,0,0,0.3)" },
          header: {
            background: "var(--bg-card)",
            borderBottom: "1px solid var(--border-color)",
            padding: "16px 24px",
          },
          body: { background: "var(--bg-card)", padding: "24px" },
          mask: { backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.4)" },
        }}
      >
        {selected && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <Tag
                icon={STATUS_CFG[selected.status]?.icon}
                color={STATUS_CFG[selected.status]?.color}
                className="rounded-full px-4 py-1 text-sm font-bold"
              >
                {STATUS_CFG[selected.status]?.label ?? selected.status}
              </Tag>
            </div>

            <div
              className="flex items-center gap-3 p-3 rounded-xl mb-4"
              style={{ background: "var(--input-bg)", border: "1px solid var(--border-color)" }}
            >
              <Avatar src={selected.avatar} size={44} icon={<UserOutlined />} />
              <div>
                <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{selected.user}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {selected.phone || selected.email || selected.userId}
                </div>
              </div>
            </div>

            <DetailRow
              icon={<CarOutlined />}
              label="Parking Spot"
              value={selected.spotCode ? `${selected.spot} · ${selected.spotCode}` : selected.spot}
            />
            <DetailRow icon={<EnvironmentOutlined />} label="City" value={selected.city} />
            <DetailRow
              icon={<CalendarOutlined />}
              label="Date"
              value={selected.date ? dayjs(selected.date).format("DD MMMM YYYY") : "—"}
            />
            <DetailRow
              icon={<ClockCircleOutlined />}
              label="Time (local)"
              value={`${selected.startTime || "—"} – ${selected.endTime || "—"} (${selected.duration})`}
            />
            <DetailRow
              icon={<DollarCircleOutlined />}
              label="Amount"
              value={formatMoney(selected.amount, selected.currency)}
            />
            <DetailRow icon={<CarOutlined />} label="Vehicle" value={selected.vehicleLabel} />
            <DetailRow icon={<FileTextOutlined />} label="Notes" value={selected.notes} />

            {/* Reviews */}
            <div className="mt-5 mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Reviews
            </div>

            {selected.stayReview ? (
              <div
                className="p-3 rounded-xl mb-3"
                style={{ background: "var(--input-bg)", border: "1px solid var(--border-color)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                    <StarOutlined /> Stay review
                  </span>
                  {stayAvg && <span className="text-sm font-bold">{stayAvg}</span>}
                </div>
                <Rate disabled allowHalf value={Number(stayAvg) || 0} style={{ fontSize: 14 }} />
                {selected.stayReview.comment && (
                  <p className="text-sm mt-2 mb-0" style={{ color: "var(--text-primary)" }}>
                    {selected.stayReview.comment}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-xs mb-3" style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                No stay review yet
              </div>
            )}

            {selected.guestReview ? (
              <div
                className="p-3 rounded-xl"
                style={{ background: "var(--input-bg)", border: "1px solid var(--border-color)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                    <StarOutlined /> Guest review
                  </span>
                  <span className="text-sm font-bold">{selected.guestReview.rating}</span>
                </div>
                <Rate disabled value={Number(selected.guestReview.rating) || 0} style={{ fontSize: 14 }} />
                {selected.guestReview.comment && (
                  <p className="text-sm mt-2 mb-0" style={{ color: "var(--text-primary)" }}>
                    {selected.guestReview.comment}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-xs" style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                No guest review yet
              </div>
            )}
          </div>
        )}
      </Drawer>

      <style>{`
        .custom-bookings-table .ant-table-thead > tr > th {
          background: transparent !important;
          border-bottom: 2px solid var(--table-border) !important;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: var(--text-muted) !important;
        }
        .custom-bookings-table .ant-table-thead > tr > th::before { display: none !important; }
        .custom-bookings-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid var(--table-border) !important;
          padding: 14px 16px;
          background: transparent !important;
        }
        .custom-bookings-table .ant-table-tbody > tr:hover > td {
          background: var(--input-bg) !important;
        }
        .custom-bookings-table .ant-table-cell { background: transparent !important; }
      `}</style>
    </div>
  );
};

export default BookingsList;
