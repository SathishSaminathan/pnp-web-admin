/**
 * Monitoring integration layer.
 *
 * Provides a unified interface for error tracking and performance monitoring.
 * Supports Sentry, Datadog, and NewRelic integration via adapter pattern.
 *
 * Usage:
 *   import monitoring from '@/services/monitoring';
 *   monitoring.captureError(error, { context: 'payment-flow' });
 *   monitoring.trackEvent('transaction_completed', { amount: 100 });
 */

import logger, { getLogBuffer, clearLogBuffer } from "./logger";

// ─── Configuration ───────────────────────────────────────────────────────────

const MONITORING_CONFIG = {
  enabled: import.meta.env.VITE_MONITORING_ENABLED === "true",
  dsn: import.meta.env.VITE_SENTRY_DSN || null,
  environment:
    import.meta.env.VITE_APP_ENV ||
    (import.meta.env.DEV ? "development" : "production"),
  sampleRate: Number(import.meta.env.VITE_MONITORING_SAMPLE_RATE) || 1.0,
};

// ─── Adapter Interface ───────────────────────────────────────────────────────

let _adapter = null;

/**
 * Register a monitoring adapter (Sentry, Datadog, etc.)
 *
 * Adapter shape:
 * {
 *   captureException(error, context),
 *   captureMessage(message, level, context),
 *   setUser(user),
 *   addBreadcrumb(breadcrumb),
 *   startTransaction(name, op),
 * }
 */
export function registerMonitoringAdapter(adapter) {
  _adapter = adapter;
  logger.info("Monitoring adapter registered", {
    adapter: adapter?.name || "unknown",
  });
}

// ─── Public API ──────────────────────────────────────────────────────────────

const monitoring = {
  /**
   * Capture an error for tracking.
   */
  captureError(error, context = {}) {
    const entry = logger.error(error?.message || "Unknown error", {
      stack: error?.stack,
      ...context,
    });

    if (_adapter && MONITORING_CONFIG.enabled) {
      try {
        _adapter.captureException(error, { extra: context });
      } catch {
        // Silently fail — monitoring should never crash the app
      }
    }

    return entry;
  },

  /**
   * Capture a message/event.
   */
  captureMessage(message, level = "info", context = {}) {
    if (_adapter && MONITORING_CONFIG.enabled) {
      try {
        _adapter.captureMessage(message, level, { extra: context });
      } catch {
        // Silent
      }
    }
  },

  /**
   * Track a business event (for analytics/alerting).
   */
  trackEvent(name, data = {}) {
    logger.info(`Event: ${name}`, data);
    if (_adapter?.trackEvent && MONITORING_CONFIG.enabled) {
      try {
        _adapter.trackEvent(name, data);
      } catch {
        // Silent
      }
    }
  },

  /**
   * Set user context for error tracking.
   */
  setUser(user) {
    if (!user) {
      _adapter?.setUser?.(null);
      return;
    }
    const safeUser = {
      id: user.id || user._id,
      email: user.email, // adapter will handle masking
      role: user.role,
    };
    _adapter?.setUser?.(safeUser);
  },

  /**
   * Add a breadcrumb for error context trail.
   */
  addBreadcrumb(category, message, data = {}) {
    if (_adapter && MONITORING_CONFIG.enabled) {
      try {
        _adapter.addBreadcrumb({
          category,
          message,
          data,
          timestamp: Date.now() / 1000,
        });
      } catch {
        // Silent
      }
    }
  },

  /**
   * Flush buffered logs to monitoring service.
   */
  flushLogs() {
    const logs = getLogBuffer();
    if (logs.length === 0) return;

    if (_adapter?.flushLogs) {
      try {
        _adapter.flushLogs(logs);
        clearLogBuffer();
      } catch {
        // Will retry next flush
      }
    }
  },

  /**
   * Get monitoring config for diagnostics.
   */
  getConfig() {
    return { ...MONITORING_CONFIG, adapterRegistered: !!_adapter };
  },
};

export default monitoring;
