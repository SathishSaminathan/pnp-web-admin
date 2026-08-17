import React from "react";
import { Drawer, Tag, Tabs, Badge, Tooltip } from "antd";
import {
  SafetyCertificateOutlined,
  GlobalOutlined,
  KeyOutlined,
  SettingOutlined,
  FlagOutlined,
  BarsOutlined,
} from "@ant-design/icons";
import { HEALTH_STATUS_CONFIG, ENVIRONMENT_CONFIG } from "../../constants/identityProviders";
import HealthTag from "./HealthTag";

/* ── Reusable section block ── */
const Section = ({ title, icon, accent = "#4f46e5", children, isDark }) => (
  <div
    className="rounded-2xl overflow-hidden mb-4"
    style={{
      background: isDark ? "rgba(255,255,255,0.03)" : "#fff",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#f0f0f0"}`,
      boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.06)",
    }}
  >
    <div
      className="flex items-center gap-2 px-4 py-2.5"
      style={{
        background: isDark ? "rgba(255,255,255,0.04)" : `${accent}0d`,
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : `${accent}20`}`,
      }}
    >
      {icon && <span style={{ color: accent, fontSize: 14 }}>{icon}</span>}
      <span
        className="text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: isDark ? "#94a3b8" : "#64748b" }}
      >
        {title}
      </span>
    </div>
    <div className="px-4 py-3 space-y-2.5">{children}</div>
  </div>
);

/* ── Row ── */
const Row = ({ label, children, mono = false }) => (
  <div className="flex justify-between items-start gap-3">
    <span className="text-[12px] shrink-0" style={{ color: "var(--text-muted)", minWidth: 130 }}>
      {label}
    </span>
    <span
      className="text-[13px] text-right"
      style={{
        color: "var(--text-primary)",
        fontWeight: 500,
        fontFamily: mono ? "'JetBrains Mono','Fira Code',monospace" : undefined,
      }}
    >
      {children ?? "—"}
    </span>
  </div>
);

const DetailDrawer = ({ open, provider, onClose, isDark }) => {
  if (!provider) return null;

  const healthCfg = HEALTH_STATUS_CONFIG[provider.health?.status ?? "unknown"];
  const envCfg = ENVIRONMENT_CONFIG[provider.environment] ?? ENVIRONMENT_CONFIG.sandbox;
  const initials = (provider.name ?? "?")[0]?.toUpperCase();

  // Template IDs as entries
  const templateEntries = Object.entries(provider.templateId ?? {});

  // Unsupported countries
  const unsupported = (provider.notSupportedCountries ?? []).map((c) =>
    typeof c === "string" ? { code: c, reason: "" } : c
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={520}
      title={null}
      styles={{
        body: { padding: 0, background: "var(--bg-card)" },
        header: { display: "none" },
        wrapper: { boxShadow: isDark ? "-4px 0 30px rgba(0,0,0,0.5)" : "-4px 0 30px rgba(0,0,0,0.12)" },
      }}
    >
      {/* Drawer header */}
      <div
        className="sticky top-0 z-10 px-5 pt-5 pb-4"
        style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-color)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
            style={{
              background: "linear-gradient(135deg,#4f46e5,#06b6d4)",
              boxShadow: "0 4px 12px rgba(79,70,229,0.35)",
            }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-base truncate" style={{ color: "var(--text-primary)" }}>
              {provider.name}
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <HealthTag status={provider.health?.status} />
              <Tag
                color={envCfg.color}
                style={{ borderRadius: 20, fontSize: 11 }}
              >
                {envCfg.label}
              </Tag>
              <Tag
                color={provider.isActive ? "success" : "default"}
                style={{ borderRadius: 20, fontSize: 11 }}
              >
                {provider.isActive ? "Active" : "Inactive"}
              </Tag>
            </div>
          </div>
          <button
            className="ml-auto shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "var(--bg-hover)", color: "var(--text-muted)", border: "none", cursor: "pointer" }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-5 overflow-y-auto" style={{ maxHeight: "calc(100vh - 120px)" }}>
        <Tabs
          defaultActiveKey="overview"
          size="small"
          style={{ color: "var(--text-secondary)" }}
          items={[
            {
              key: "overview",
              label: "Overview",
              children: (
                <div className="pt-3">
                  <Section title="Basic Info" icon={<SafetyCertificateOutlined />} accent="#4f46e5" isDark={isDark}>
                    <Row label="Name">{provider.name}</Row>
                    <Row label="Environment">
                      <Tag color={envCfg.color} style={{ borderRadius: 20 }}>{envCfg.label}</Tag>
                    </Row>
                    <Row label="Status">
                      <Tag color={provider.isActive ? "success" : "default"} style={{ borderRadius: 20 }}>
                        {provider.isActive ? "Active" : "Inactive"}
                      </Tag>
                    </Row>
                  </Section>

                  <Section title="Health" icon={<SettingOutlined />} accent={healthCfg.hex} isDark={isDark}>
                    <Row label="Status"><HealthTag status={provider.health?.status} /></Row>
                    {provider.health?.message && (
                      <Row label="Message">{provider.health.message}</Row>
                    )}
                    <Row label="Manual Override">
                      {provider.health?.manualOverride ? (
                        <Tag color="warning" style={{ borderRadius: 20 }}>Yes</Tag>
                      ) : (
                        <Tag color="default" style={{ borderRadius: 20 }}>No</Tag>
                      )}
                    </Row>
                  </Section>

                  <Section title="Coverage" icon={<GlobalOutlined />} accent="#06b6d4" isDark={isDark}>
                    <Row label="US Provider">
                      <Tag color={provider.isUSProvider ? "blue" : "default"} style={{ borderRadius: 20 }}>
                        {provider.isUSProvider ? "Yes" : "No"}
                      </Tag>
                    </Row>
                    <Row label="Non-US Provider">
                      <Tag color={provider.isNonUSProvider ? "blue" : "default"} style={{ borderRadius: 20 }}>
                        {provider.isNonUSProvider ? "Yes" : "No"}
                      </Tag>
                    </Row>
                    <Row label="Priority (US)">{provider.priorityUS ?? "—"}</Row>
                    <Row label="Priority (Non-US)">{provider.priorityNonUS ?? "—"}</Row>
                  </Section>

                  <Section title="API Key" icon={<KeyOutlined />} accent="#f59e0b" isDark={isDark}>
                    <Row label="Masked Key" mono>
                      {provider.apiKeyMasked ?? "***hidden***"}
                    </Row>
                  </Section>
                </div>
              ),
            },
            {
              key: "templates",
              label: (
                <span>
                  Templates{" "}
                  <Badge
                    count={templateEntries.length}
                    size="small"
                    color="#4f46e5"
                    style={{ marginLeft: 4 }}
                  />
                </span>
              ),
              children: (
                <div className="pt-3">
                  <Section title="Template IDs" icon={<BarsOutlined />} accent="#4f46e5" isDark={isDark}>
                    {templateEntries.length > 0 ? (
                      templateEntries.map(([region, id]) => (
                        <Row key={region} label={region} mono>
                          {id}
                        </Row>
                      ))
                    ) : (
                      <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>
                        No template IDs configured
                      </p>
                    )}
                  </Section>
                </div>
              ),
            },
            {
              key: "countries",
              label: (
                <span>
                  Blocked{" "}
                  <Badge
                    count={unsupported.length}
                    size="small"
                    color="#ef4444"
                    style={{ marginLeft: 4 }}
                  />
                </span>
              ),
              children: (
                <div className="pt-3">
                  <Section title="Unsupported Countries" icon={<FlagOutlined />} accent="#ef4444" isDark={isDark}>
                    {unsupported.length > 0 ? (
                      unsupported.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-start justify-between gap-3 py-1.5"
                          style={{ borderBottom: i < unsupported.length - 1 ? "1px solid var(--border-color)" : "none" }}
                        >
                          <Tag color="error" style={{ borderRadius: 20, fontFamily: "monospace" }}>
                            {c.code}
                          </Tag>
                          <span className="text-[12px] text-right" style={{ color: "var(--text-muted)" }}>
                            {c.reason || "—"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>
                        No blocked countries
                      </p>
                    )}
                  </Section>
                </div>
              ),
            },
          ]}
        />
      </div>
    </Drawer>
  );
};

export default DetailDrawer;
