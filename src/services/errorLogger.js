/**
 * Centralized Error Logger Service
 *
 * Abstracts error logging for the error boundary architecture.
 * - Uses console in development with structured output
 * - Ready for Sentry/Datadog integration in production
 * - Never crashes if logging itself fails
 * - Generates unique error IDs for user reference
 */

import logger from "./logger.js";
import monitoring from "./monitoring.js";

/**
 * Generate a short unique error reference ID for user-facing display.
 */
function generateErrorId() {
  return `ERR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

/**
 * Log an error from the error boundary system.
 *
 * @param {Object} payload
 * @param {Error} payload.error - The caught error
 * @param {unknown} [payload.errorInfo] - React errorInfo (componentStack)
 * @param {'fatal'|'error'|'warning'} [payload.level] - Severity level
 * @param {string} [payload.source] - Origin of the error (e.g., 'root-boundary', 'page-boundary')
 * @returns {string} errorId - Unique reference ID for user support
 */
export function logError(payload) {
  const { error, errorInfo, level = "error", source = "unknown" } = payload;
  const errorId = generateErrorId();

  if (import.meta.env.DEV) {
    const groupLabel = `[ErrorBoundary:${source}] ${level.toUpperCase()} - ${error?.message || "Unknown error"}`;
    console.group(groupLabel);
    console.error("Error:", error);
    if (errorInfo?.componentStack) {
      console.error("Component Stack:", errorInfo.componentStack);
    }
    console.info("Error ID:", errorId);
    console.info("Source:", source);
    console.info("Level:", level);
    console.groupEnd();
    return errorId;
  }

  try {
    // Structured logging via existing logger service
    logger.error(`ErrorBoundary caught ${level} error`, {
      errorId,
      source,
      level,
      message: error?.message,
      stack: error?.stack?.slice(0, 1000),
      componentStack: errorInfo?.componentStack?.slice(0, 500),
    });

    // Report to monitoring (Sentry/Datadog adapter)
    monitoring.captureError(error, {
      context: `error-boundary-${source}`,
      errorId,
      level,
      componentStack: errorInfo?.componentStack,
    });
  } catch (loggingError) {
    // Never let logging failures propagate
    console.error("[ErrorLogger] Failed to log error:", loggingError);
  }

  return errorId;
}

export default { logError, generateErrorId };
