/**
 * Production-grade structured logging service.
 *
 * Features:
 * - Structured JSON output
 * - Automatic sensitive data masking
 * - Environment-aware (debug only in dev)
 * - Correlation ID tracking
 * - User context injection
 * - Exportable for monitoring (Sentry, Datadog, NewRelic)
 */

const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

const IS_DEV = import.meta.env.DEV;
const ENVIRONMENT =
  import.meta.env.VITE_APP_ENV || (IS_DEV ? "development" : "production");

// ─── Sensitive Data Masking ──────────────────────────────────────────────────

const MASK_PATTERNS = [
  { key: /pan|card.?number/i, mask: (v) => maskMiddle(v, 4, 4) },
  { key: /ssn|social/i, mask: (v) => `***-**-${String(v).slice(-4)}` },
  { key: /account.?number|acct/i, mask: (v) => maskMiddle(v, 4, 4) },
  { key: /token|secret|password|apikey|api.?key/i, mask: () => "[REDACTED]" },
  { key: /email/i, mask: (v) => maskEmail(v) },
  { key: /phone|mobile/i, mask: (v) => maskMiddle(v, 3, 2) },
];

function maskMiddle(value, keepStart, keepEnd) {
  const str = String(value || "");
  if (str.length <= keepStart + keepEnd) return "***";
  return str.slice(0, keepStart) + "***" + str.slice(-keepEnd);
}

function maskEmail(email) {
  const str = String(email || "");
  const atIdx = str.indexOf("@");
  if (atIdx <= 1) return "***@***";
  return str[0] + "***" + str.slice(atIdx);
}

/**
 * Deep-clone and mask sensitive fields in an object.
 */
function maskSensitiveData(data) {
  if (data === null || data === undefined) return data;
  if (typeof data !== "object") return data;
  if (Array.isArray(data)) return data.map(maskSensitiveData);

  const masked = {};
  for (const [key, value] of Object.entries(data)) {
    const pattern = MASK_PATTERNS.find((p) => p.key.test(key));
    if (pattern && typeof value === "string") {
      masked[key] = pattern.mask(value);
    } else if (typeof value === "object" && value !== null) {
      masked[key] = maskSensitiveData(value);
    } else {
      masked[key] = value;
    }
  }
  return masked;
}

// ─── Correlation & Context ───────────────────────────────────────────────────

let _correlationId = null;
let _userId = null;

export function setCorrelationId(id) {
  _correlationId = id;
}

export function setLoggerUserId(id) {
  _userId = id;
}

export function generateCorrelationId() {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  _correlationId = id;
  return id;
}

// ─── Log Buffer (for export to monitoring services) ──────────────────────────

const LOG_BUFFER_MAX = 100;
const _logBuffer = [];

function bufferLog(entry) {
  _logBuffer.push(entry);
  if (_logBuffer.length > LOG_BUFFER_MAX) _logBuffer.shift();
}

/** Get buffered logs for export to monitoring services. */
export function getLogBuffer() {
  return [..._logBuffer];
}

/** Clear the log buffer after successful export. */
export function clearLogBuffer() {
  _logBuffer.length = 0;
}

// ─── Core Logger ─────────────────────────────────────────────────────────────

function createLogEntry(level, message, meta = {}) {
  return {
    timestamp: new Date().toISOString(),
    level,
    environment: ENVIRONMENT,
    correlationId: _correlationId || undefined,
    userId: _userId || undefined,
    message,
    ...maskSensitiveData(meta),
  };
}

function emit(level, levelName, message, meta) {
  const entry = createLogEntry(levelName, message, meta);
  bufferLog(entry);

  // In production: no console output (logs are captured via buffer/monitoring)
  if (!IS_DEV) return entry;

  // In development: pretty-print for DX
  const style = {
    DEBUG: "color: #6b7280",
    INFO: "color: #2563eb",
    WARN: "color: #d97706",
    ERROR: "color: #dc2626; font-weight: bold",
  };

  const consoleMethod =
    levelName === "ERROR" ? "error" : levelName === "WARN" ? "warn" : "log";
  console[consoleMethod](
    `%c[${levelName}] ${message}`,
    style[levelName],
    meta || "",
  );

  return entry;
}

// ─── Public API ──────────────────────────────────────────────────────────────

const logger = {
  debug(message, meta) {
    if (!IS_DEV) return;
    return emit(LOG_LEVELS.DEBUG, "DEBUG", message, meta);
  },

  info(message, meta) {
    return emit(LOG_LEVELS.INFO, "INFO", message, meta);
  },

  warn(message, meta) {
    return emit(LOG_LEVELS.WARN, "WARN", message, meta);
  },

  error(message, meta) {
    return emit(LOG_LEVELS.ERROR, "ERROR", message, meta);
  },

  /** Log an API call failure with standardized shape. */
  apiError(endpoint, error, extra = {}) {
    return this.error(`API Error: ${endpoint}`, {
      endpoint,
      status: error?.response?.status || error?.status,
      code: error?.code,
      message: error?.message,
      ...extra,
    });
  },

  /** Log a validation failure. */
  validationError(field, reason, value) {
    return this.warn(`Validation failed: ${field}`, {
      field,
      reason,
      value: typeof value === "string" ? value.slice(0, 50) : value,
    });
  },

  /** Log a retry attempt. */
  retry(endpoint, attempt, maxAttempts) {
    return this.info(`Retry attempt ${attempt}/${maxAttempts}`, {
      endpoint,
      attempt,
      maxAttempts,
    });
  },

  /** Log state inconsistency. */
  stateInconsistency(description, details) {
    return this.warn(`State inconsistency: ${description}`, details);
  },
};

export default logger;
