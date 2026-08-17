import axios from "axios";
import { notifyError } from "../utils/notification";
import logger from "../services/logger";
import { normalizeError } from "../services/errors";
import monitoring from "../services/monitoring";
import { TOKEN_KEY, getCookie } from "../utils/cookies";

// Full absolute URLs are constructed in src/api/apiRoutes.js from VITE_API_BASE_URL.
// No baseURL here — every call passes the complete URL.
const apiClient = axios.create({
  timeout: 15000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Logout deduplication guard ---
// Prevents multiple simultaneous 401 responses from triggering multiple
// logout flows, toasts, and redirects.
let isLoggingOut = false;
let lastLogoutTime = 0;

const handleSessionExpired = async () => {
  const now = Date.now();
  if (isLoggingOut || now - lastLogoutTime < 100) return;

  isLoggingOut = true;
  lastLogoutTime = now;

  // Small delay so any in-flight 401 responses are caught by the flag above.
  await new Promise((resolve) => setTimeout(resolve, 10));

  notifyError("Session expired. Please login again.");

  // Clear all non-HttpOnly storage including the auth flag.
  localStorage.clear();
  sessionStorage.clear();

  // Expire any JS-accessible cookies for this origin.
  // The Secure flag must be included when on HTTPS so that __Host- prefixed
  // cookies (which require Secure) are properly cleared in production.
  const _secureFlag = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/" + _secureFlag);
  });

  setTimeout(() => {
    window.location.href = "/login";
    isLoggingOut = false; // reset for the next session
  }, 1500);
};

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Attach correlation ID for request tracing
    // const correlationId = generateCorrelationId();
    // config.headers["X-Correlation-ID"] = correlationId;
    // config.metadata = { startTime: Date.now(), correlationId };

    // Attach JWT Bearer token from storage when present.
    const token = getCookie(TOKEN_KEY);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    logger.error("Request interceptor error", { error: error.message });
    return Promise.reject(error);
  },
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log successful API calls in debug mode
    const duration = response.config?.metadata?.startTime
      ? Date.now() - response.config.metadata.startTime
      : null;
    logger.debug(
      `API OK: ${response.config?.method?.toUpperCase()} ${response.config?.url}`,
      {
        duration: duration ? `${duration}ms` : undefined,
        status: response.status,
      },
    );

    // Track slow requests
    if (duration && duration > 5000) {
      logger.warn("Slow API response detected", {
        url: response.config?.url,
        duration: `${duration}ms`,
      });
    }

    // Unwrap data so callers receive the API payload directly.
    return response.data;
  },
  async (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const skipToast = error.config?.skipErrorToast;
    const correlationId = error.config?.metadata?.correlationId;
    // Try common API message fields, then fall back to a readable string if data itself is a string
    const apiMessage =
      data?.message ||
      data?.error ||
      data?.msg ||
      (typeof data === "string" && data.length < 200 ? data : null);

    // Normalize for structured tracking
    const appError = normalizeError(error, correlationId);

    // Log the API failure
    logger.apiError(error.config?.url || "unknown", error, {
      correlationId,
      status,
      retryable: appError.retryable,
    });

    // Report to monitoring
    monitoring.captureError(appError, {
      url: error.config?.url,
      method: error.config?.method,
      correlationId,
    });

    if (status === 401) {
      // 401 = unauthenticated — session cookie is missing or expired.
      await handleSessionExpired();
    } else if (status === 403) {
      // 403 = authenticated but not authorised — do NOT redirect to login.
      if (!skipToast) {
        notifyError(
          apiMessage || "You do not have permission to perform this action.",
        );
      }
      error.handled = true;
    } else if (status === 429) {
      notifyError("Too many requests. Please slow down and try again.");
      error.handled = true;
    } else if (status === 500) {
      notifyError(apiMessage || "Server error. Please try again later.");
      error.handled = true;
    } else if (error.code === "ERR_NETWORK") {
      notifyError("Network error. Please check your connection.");
      error.handled = true;
    } else if (error.code === "ECONNABORTED") {
      notifyError("Request timed out. Please try again.");
      error.handled = true;
    } else if (status !== undefined) {
      notifyError(apiMessage || "An unexpected error occurred.");
      error.handled = true;
    }

    return Promise.reject(error);
  },
);

export default apiClient;
