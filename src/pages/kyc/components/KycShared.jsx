import React, { useEffect, useRef, useReducer, useState } from "react";
import { Skeleton, Spin, Tooltip, Input, Image as AntImage, Modal } from "antd";
import {
  FileTextOutlined,
  LoadingOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  ExportOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { storageApi } from "../../../api/modules/storage";

/* ─── DocImage ────────────────────────────────────────────────────────────── */
export const IMG_W = 180;
export const IMG_H = 120;

const DOC_INIT = { url: null, phase: "idle", errored: false };
function docReducer(state, action) {
  switch (action.type) {
    case "FETCH_START":   return { url: null, phase: "url", errored: false };
    case "FETCH_SUCCESS": return { url: action.url, phase: "img", errored: false };
    case "FETCH_ERROR":   return { url: null, phase: "idle", errored: true };
    case "IMG_LOADED":    return { ...state, phase: "idle", errored: false };
    case "IMG_ERROR":     return { ...state, phase: "idle", errored: true };
    default:              return state;
  }
}

const PdfModal = ({ filePath, alt, open, url, loading, onCancel }) => {
  const [openingTab, setOpeningTab] = useState(false);

  const handleOpenTab = async () => {
    setOpeningTab(true);
    try {
      const res = await storageApi.getDocumentUrl(filePath);
      const fresh = res?.url || res?.data?.url || null;
      if (fresh) window.open(fresh, "_blank", "noreferrer");
    } catch {
      // silent
    } finally {
      setOpeningTab(false);
    }
  };

  return (
  <Modal
    open={open}
    onCancel={onCancel}
    footer={[
      <button
        key="open"
        onClick={handleOpenTab}
        disabled={!url || openingTab}
        style={{
          padding: "6px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          border: "1.5px solid #60a5fa", background: "transparent",
          color: "#60a5fa", cursor: (!url || openingTab) ? "not-allowed" : "pointer",
          opacity: (!url || openingTab) ? 0.5 : 1,
          display: "inline-flex", alignItems: "center", gap: 6,
        }}
      >
        {openingTab
          ? <LoadingOutlined style={{ fontSize: 13 }} spin />
          : <ExportOutlined style={{ fontSize: 13 }} />
        }
        Open in new tab
      </button>,
    ]}
    title={
      <span style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
        <FileTextOutlined style={{ color: "#60a5fa" }} />
        {filePath?.split("/").pop()}
      </span>
    }
    width="80vw"
    styles={{ body: { height: "75vh", padding: 0, overflow: "hidden" } }}
    centered
    destroyOnClose
  >
    {loading || !url ? (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 32, color: "#60a5fa" }} spin />} />
      </div>
    ) : (
      <iframe
        src={`${url}#navpanes=0`}
        title={alt}
        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
      />
    )}
  </Modal>
  );
};

export const DocImage = ({ filePath, alt = "document", isDark, size = "default" }) => {
  const [docState, dispatch] = useReducer(docReducer, DOC_INIT);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfModalLoading, setPdfModalLoading] = useState(false);
  const mounted = useRef(true);
  const retryCount = useRef(0);

  const isPdf = !!filePath && filePath.toLowerCase().endsWith(".pdf");

  const W = size === "sm" ? 120 : IMG_W;
  const H = size === "sm" ? 80  : IMG_H;

  const fetchUrl = () => {
    if (!filePath) return;
    dispatch({ type: "FETCH_START" });
    storageApi
      .getDocumentUrl(filePath)
      .then((res) => {
        if (!mounted.current) return;
        const signed = res?.url || res?.data?.url || null;
        if (signed) dispatch({ type: "FETCH_SUCCESS", url: signed });
        else dispatch({ type: "FETCH_ERROR" });
      })
      .catch(() => { if (mounted.current) dispatch({ type: "FETCH_ERROR" }); });
  };

  // PDFs: skip pre-fetching — <embed> can't retry on expiry and has CORS issues.
  // The click-to-open / modal path fetches a fresh URL at click time instead.
  // Images: pre-fetch the signed URL and use directly as <img src>.
  useEffect(() => {
    mounted.current = true;
    retryCount.current = 0;
    fetchUrl();
    return () => { mounted.current = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filePath]);

  const { url, phase, errored } = docState;
  const urlLoading = phase === "url";
  const imgLoading = phase === "img";

  // Always fetch a fresh URL before opening in a new tab (avoids 5s expiry)
  const openFreshTab = async (e) => {
    if (e) e.stopPropagation();
    try {
      const res = await storageApi.getDocumentUrl(filePath);
      const fresh = res?.url || res?.data?.url || null;
      if (fresh) window.open(fresh, "_blank", "noreferrer");
    } catch {
      // silent
    }
  };

  const boxStyle = {
    width: W, height: H, borderRadius: 10, flexShrink: 0,
    border: "1px solid var(--border-color)",
    background: isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexDirection: "column", gap: 6, overflow: "hidden", position: "relative",
  };

  if (!filePath)
    return (
      <div style={boxStyle}>
        <FileTextOutlined style={{ fontSize: 24, color: "var(--text-muted)" }} />
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>No file</span>
      </div>
    );

  // PDF: show preview modal with iframe on click, fetching a fresh URL each time
  const handleOpenPdfModal = async () => {
    setPdfModalOpen(true);
    setPdfUrl(null);
    setPdfModalLoading(true);
    try {
      const res = await storageApi.getDocumentUrl(filePath);
      const signed = res?.url || res?.data?.url || null;
      if (mounted.current) setPdfUrl(signed);
    } catch {
      // silent
    } finally {
      if (mounted.current) setPdfModalLoading(false);
    }
  };

  if (isPdf) {
    const PDF_H = H * 2;
    const pdfBoxStyle = { ...boxStyle, height: PDF_H };

    if (urlLoading)
      return (
        <div style={pdfBoxStyle}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 22, color: "#60a5fa" }} spin />} />
          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Loading PDF…</span>
        </div>
      );

    if (errored || !url)
      return (
        <>
          <div
            role="button"
            onClick={handleOpenPdfModal}
            style={{ ...pdfBoxStyle, cursor: "pointer", border: "1px solid var(--border-color)", gap: 8 }}
          >
            <FileTextOutlined style={{ fontSize: 28, color: "#60a5fa" }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textAlign: "center", padding: "0 8px" }}>
              PDF — click to open
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(96,165,250,0.15)", padding: "3px 10px", borderRadius: 20 }}>
              <EyeOutlined style={{ fontSize: 11, color: "#60a5fa" }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: "#60a5fa" }}>Open</span>
            </div>
          </div>
          <PdfModal filePath={filePath} alt={alt} open={pdfModalOpen} url={pdfUrl} loading={pdfModalLoading} onCancel={() => { setPdfModalOpen(false); setPdfUrl(null); }} />
        </>
      );

    // Inline preview via <iframe> — starts its GET immediately (unlike <embed>
    // which waits for the PDF plugin to init, risking the 5-second expiry).
    // key={url} forces a fresh mount when Reload fetches a new signed URL.
    return (
      <>
        <div style={{ position: "relative", width: W, height: PDF_H, borderRadius: 10, overflow: "hidden", border: "1px solid var(--border-color)", flexShrink: 0 }}>
          <iframe
            key={url}
            src={url}
            title={alt}
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          />
          <div style={{ position: "absolute", bottom: 6, right: 6, display: "flex", gap: 4 }}>
            <div
              onClick={() => { retryCount.current = 0; fetchUrl(); }}
              style={{ background: "rgba(0,0,0,0.55)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, backdropFilter: "blur(4px)" }}
            >
              <ReloadOutlined style={{ fontSize: 11, color: "#fff" }} />
              <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>Reload</span>
            </div>
            <div
              onClick={handleOpenPdfModal}
              style={{ background: "rgba(0,0,0,0.55)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, backdropFilter: "blur(4px)" }}
            >
              <ExportOutlined style={{ fontSize: 11, color: "#fff" }} />
              <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>Full screen</span>
            </div>
          </div>
        </div>
        <PdfModal filePath={filePath} alt={alt} open={pdfModalOpen} url={pdfUrl} loading={pdfModalLoading} onCancel={() => { setPdfModalOpen(false); setPdfUrl(null); }} />
      </>
    );
  }

  if (urlLoading)
    return (
      <div style={boxStyle}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 20, color: "#60a5fa" }} spin />} />
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Loading…</span>
      </div>
    );

  if (errored)
    return (
      <div style={{ ...boxStyle, border: "1.5px dashed #f87171" }}>
        <FileTextOutlined style={{ fontSize: 24, color: "#f87171" }} />
        <span style={{ fontSize: 10, color: "#f87171" }}>Preview unavailable</span>
      </div>
    );

  return (
    <div style={{ position: "relative", width: W, height: H, flexShrink: 0 }}>
      {imgLoading && (
        <div style={{ ...boxStyle, position: "absolute", inset: 0, zIndex: 1 }}>
          <Skeleton.Image active style={{ width: W, height: H }} />
        </div>
      )}
      <AntImage
        src={url}
        alt={alt}
        width={W}
        height={H}
        onLoad={() => dispatch({ type: "IMG_LOADED" })}
        onError={() => {
          // Signed URL may have expired (5s TTL) — re-fetch a fresh one (max 2 retries)
          if (retryCount.current < 2) {
            retryCount.current += 1;
            fetchUrl();
          } else {
            dispatch({ type: "IMG_ERROR" });
          }
        }}
        style={{
          objectFit: "cover",
          borderRadius: 10,
          border: "1px solid var(--border-color)",
          display: "block",
          opacity: imgLoading ? 0 : 1,
          transition: "opacity 0.25s ease",
        }}
        preview={{
          mask: (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", height: "100%", padding: "0 10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 20, backdropFilter: "blur(4px)" }}>
                <EyeOutlined style={{ fontSize: 13 }} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>Preview</span>
              </div>
              <div
                onClick={openFreshTab}
                style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: 20, cursor: "pointer", backdropFilter: "blur(4px)" }}
              >
                <ExportOutlined style={{ fontSize: 13 }} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>New Tab</span>
              </div>
            </div>
          ),
          toolbarRender: (originalNode) => (
            <div style={{ display: "flex", alignItems: "center" }}>
              {originalNode}
              <Tooltip title="Open in new tab">
                <span
                  onClick={openFreshTab}
                  style={{ color: "rgba(255,255,255,0.85)", cursor: "pointer", display: "inline-flex", alignItems: "center", padding: "0 12px", fontSize: 20 }}
                >
                  <ExportOutlined />
                </span>
              </Tooltip>
            </div>
          ),
        }}
      />
    </div>
  );
};

/* ─── StatusDot ───────────────────────────────────────────────────────────── */
export const StatusDot = ({ status }) => {
  const col = { Approved: "#10b981", Verified: "#10b981", Rejected: "#ef4444", Pending: "#f59e0b" }[status] ?? "#94a3b8";
  return (
    <span style={{ width: 8, height: 8, borderRadius: "50%", background: col, flexShrink: 0, display: "inline-block" }} />
  );
};

/* ─── StatusBadge ─────────────────────────────────────────────────────────── */
export const StatusBadge = ({ status }) => {
  const cfg = {
    Approved:        { color: "#10b981", bg: "rgba(16,185,129,0.15)",  text: "APPROVED" },
    Verified:        { color: "#10b981", bg: "rgba(16,185,129,0.15)",  text: "VERIFIED" },
    Rejected:        { color: "#ef4444", bg: "rgba(239,68,68,0.15)",   text: "REJECTED" },
    Pending:         { color: "#f59e0b", bg: "rgba(245,158,11,0.15)",  text: "PENDING REVIEW" },
    "Not Submitted": { color: "#94a3b8", bg: "rgba(148,163,184,0.15)", text: "NOT SUBMITTED" },
  }[status] ?? { color: "#f59e0b", bg: "rgba(245,158,11,0.15)", text: "PENDING REVIEW" };
  return (
    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: cfg.color, background: cfg.bg }}>
      {cfg.text}
    </span>
  );
};

/* ─── InfoRow ─────────────────────────────────────────────────────────────── */
export const InfoRow = ({ label, value }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
      {label}
    </span>
    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
      {value || "—"}
    </span>
  </div>
);

/* ─── SectionHeader ───────────────────────────────────────────────────────── */
export const SectionHeader = ({ title, status, subtitle }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 18, marginBottom: 24, borderBottom: "1px solid var(--border-color)" }}>
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>{subtitle}</p>}
    </div>
    {status && <StatusBadge status={status} />}
  </div>
);

/* ─── GridInfo ────────────────────────────────────────────────────────────── */
export const GridInfo = ({ fields, isDark }) => (
  <div style={{
    borderRadius: 14, border: "1px solid var(--border-color)",
    background: isDark ? "rgba(255,255,255,0.02)" : "#fff",
    padding: "16px 18px", marginBottom: 16,
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "14px 24px",
  }}>
    {fields.map(({ label, value, badge }) => (
      <div key={label}>
        <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
          {label}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{value || "—"}</span>
          {badge && <StatusBadge status={badge} />}
        </div>
      </div>
    ))}
  </div>
);

/* ─── ActionButtons / RejectionInput (internal to DocumentCard) ───────────── */
const ActionButtons = ({ currentStatus, onApprove, onReject }) => (
  <div style={{ display: "flex", gap: 8 }}>
    <button onClick={onApprove} style={{
      padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
      border: currentStatus === "Approved" ? "1.5px solid #10b981" : "1.5px solid rgba(16,185,129,0.4)",
      background: currentStatus === "Approved" ? "#10b981" : "transparent",
      color: currentStatus === "Approved" ? "#fff" : "#10b981", transition: "all 0.15s",
    }}>
      <CheckOutlined style={{ marginRight: 4 }} />Approve
    </button>
    <button onClick={onReject} style={{
      padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
      border: currentStatus === "Rejected" ? "1.5px solid #ef4444" : "1.5px solid rgba(239,68,68,0.4)",
      background: currentStatus === "Rejected" ? "#ef4444" : "transparent",
      color: currentStatus === "Rejected" ? "#fff" : "#ef4444", transition: "all 0.15s",
    }}>
      <CloseOutlined style={{ marginRight: 4 }} />Reject
    </button>
  </div>
);

const RejectionInput = ({ value, onChange }) => (
  <div style={{ marginTop: 8 }}>
    <Input
      value={value} onChange={(e) => onChange(e.target.value)}
      placeholder="Enter rejection reason…" size="small"
      style={{ borderRadius: 8, borderColor: "#f87171", maxWidth: 400 }} status="error"
    />
    {!value.trim() && (
      <p style={{ margin: "4px 0 0", fontSize: 11, color: "#f87171", fontWeight: 500 }}>
        ⚠ Reason is required before saving
      </p>
    )}
  </div>
);

/* ─── DocumentCard ────────────────────────────────────────────────────────── */
export const DocumentCard = ({
  title, badge, filePaths = [], statusEntry, onSetStatus,
  isDark, children, readOnly = false,
}) => {
  const hasDocs = filePaths.length > 0;
  const status = statusEntry?.status ?? "Pending";
  const reason = statusEntry?.reason ?? "";

  return (
    <div style={{ borderRadius: 14, border: "1px solid var(--border-color)", background: isDark ? "rgba(255,255,255,0.02)" : "#fff", marginBottom: 16, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 18px 12px", borderBottom: hasDocs || children ? "1px solid var(--border-color)" : "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FileTextOutlined style={{ color: "#60a5fa", fontSize: 16 }} />
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{title}</span>
            {badge && <div style={{ marginTop: 2 }}>{badge}</div>}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Document images */}
      {hasDocs && (
        <div style={{ padding: "14px 18px", display: "flex", flexWrap: "wrap", gap: 12, borderBottom: "1px solid var(--border-color)" }}>
          {filePaths.map((fp, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <DocImage filePath={fp} alt={`${title} ${i + 1}`} isDark={isDark} />
              {fp && (
                <span style={{ fontSize: 10, color: "var(--text-muted)", maxWidth: IMG_W, textAlign: "center", wordBreak: "break-all" }}>
                  {fp.split("/").pop()}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Extra content slot */}
      {children && (
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-color)" }}>
          {children}
        </div>
      )}

      {/* Edit-mode action buttons */}
      {!readOnly && (
        <div style={{ padding: "12px 18px" }}>
          <ActionButtons
            currentStatus={status}
            onApprove={() => onSetStatus({ status: "Approved", reason: "" })}
            onReject={() => onSetStatus({ status: "Rejected", reason })}
          />
          {status === "Rejected" && (
            <RejectionInput value={reason} onChange={(r) => onSetStatus({ status: "Rejected", reason: r })} />
          )}
        </div>
      )}

      {/* Read-only rejection reason */}
      {readOnly && status === "Rejected" && reason && (
        <div style={{ padding: "10px 18px", background: "rgba(239,68,68,0.05)" }}>
          <span style={{ fontSize: 11, color: "#f87171" }}>⚠ {reason}</span>
        </div>
      )}
    </div>
  );
};

