/**
 * Standardized application error class for consistent error handling.
 *
 * All API errors are normalized into this shape:
 * { message, code, status, correlationId, retryable, originalError }
 */

export class AppError extends Error {
  constructor({
    message,
    code,
    status,
    correlationId,
    retryable = false,
    originalError,
  }) {
    super(message);
    this.name = "AppError";
    this.code = code || "UNKNOWN_ERROR";
    this.status = status || null;
    this.correlationId = correlationId || null;
    this.retryable = retryable;
    this.originalError = originalError || null;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
      status: this.status,
      correlationId: this.correlationId,
      retryable: this.retryable,
      timestamp: this.timestamp,
    };
  }
}

// ─── Error Classification ────────────────────────────────────────────────────

const RETRYABLE_STATUS_CODES = [408, 429, 502, 503, 504];
const RETRYABLE_ERROR_CODES = ["ERR_NETWORK", "ECONNABORTED", "ETIMEDOUT"];

/**
 * Normalize an Axios error (or generic error) into a standardized AppError.
 */
export function normalizeError(error, correlationId) {
  if (error instanceof AppError) return error;

  const status = error?.response?.status;
  const data = error?.response?.data;
  const apiMessage =
    data?.message || data?.error || data?.msg || error?.message;
  const code = data?.code || error?.code || `HTTP_${status || "UNKNOWN"}`;

  const retryable =
    RETRYABLE_STATUS_CODES.includes(status) ||
    RETRYABLE_ERROR_CODES.includes(error?.code) ||
    false;

  return new AppError({
    message: apiMessage || "An unexpected error occurred",
    code,
    status,
    correlationId,
    retryable,
    originalError: error,
  });
}

// ─── Error Type Checks ───────────────────────────────────────────────────────

export function isNetworkError(error) {
  return error?.code === "ERR_NETWORK" || !navigator.onLine;
}

export function isTimeoutError(error) {
  return error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT";
}

export function isAuthError(error) {
  return error?.status === 401 || error?.response?.status === 401;
}

export function isRateLimited(error) {
  return error?.status === 429 || error?.response?.status === 429;
}

export function isServerError(error) {
  const status = error?.status || error?.response?.status;
  return status >= 500 && status < 600;
}
