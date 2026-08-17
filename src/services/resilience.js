/**
 * Resilience utilities: exponential backoff retry, circuit breaker, debounce/throttle.
 *
 * Provides production-grade reliability patterns for API calls.
 */

import logger from "./logger";

// ─── Exponential Backoff Retry ───────────────────────────────────────────────

const DEFAULT_RETRY_OPTIONS = {
  maxAttempts: 3,
  baseDelay: 1000, // ms
  maxDelay: 10000, // ms
  backoffFactor: 2,
  retryableStatuses: [408, 429, 502, 503, 504],
  retryableErrors: ["ERR_NETWORK", "ECONNABORTED", "ETIMEDOUT"],
};

/**
 * Execute an async function with exponential backoff retry.
 *
 * @param {() => Promise<T>} fn - Async function to retry
 * @param {object} options - Retry configuration
 * @returns {Promise<T>}
 */
export async function withRetry(fn, options = {}) {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const status = error?.response?.status;
      const code = error?.code;

      const isRetryable =
        config.retryableStatuses.includes(status) ||
        config.retryableErrors.includes(code);

      if (!isRetryable || attempt === config.maxAttempts) {
        throw error;
      }

      // Calculate delay with jitter
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffFactor, attempt - 1) +
          Math.random() * 500,
        config.maxDelay,
      );

      logger.retry(options.endpoint || "unknown", attempt, config.maxAttempts);
      await sleep(delay);
    }
  }

  throw lastError;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Circuit Breaker ─────────────────────────────────────────────────────────

/**
 * Simple circuit breaker implementation.
 *
 * States: CLOSED (normal), OPEN (failing, reject calls), HALF_OPEN (testing recovery)
 */
export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000; // 30s
    this.monitorWindow = options.monitorWindow || 60000; // 60s

    this._state = "CLOSED";
    this._failures = [];
    this._lastFailureTime = null;
    this._openedAt = null;
  }

  get state() {
    if (this._state === "OPEN") {
      // Check if reset timeout has elapsed → move to HALF_OPEN
      if (Date.now() - this._openedAt >= this.resetTimeout) {
        this._state = "HALF_OPEN";
      }
    }
    return this._state;
  }

  /**
   * Execute a function through the circuit breaker.
   */
  async execute(fn) {
    if (this.state === "OPEN") {
      logger.warn("Circuit breaker OPEN — request rejected");
      throw new Error(
        "Service temporarily unavailable. Please try again later.",
      );
    }

    try {
      const result = await fn();
      this._onSuccess();
      return result;
    } catch (error) {
      this._onFailure();
      throw error;
    }
  }

  _onSuccess() {
    if (this._state === "HALF_OPEN") {
      this._state = "CLOSED";
      this._failures = [];
      logger.info("Circuit breaker recovered → CLOSED");
    }
  }

  _onFailure() {
    const now = Date.now();
    // Remove failures outside the monitoring window
    this._failures = this._failures.filter((t) => now - t < this.monitorWindow);
    this._failures.push(now);
    this._lastFailureTime = now;

    if (this._failures.length >= this.failureThreshold) {
      this._state = "OPEN";
      this._openedAt = now;
      logger.error("Circuit breaker OPEN — too many failures", {
        failures: this._failures.length,
        threshold: this.failureThreshold,
      });
    }
  }

  reset() {
    this._state = "CLOSED";
    this._failures = [];
    this._openedAt = null;
  }
}

// Global circuit breaker for the API layer
export const apiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000,
  monitorWindow: 60000,
});

// ─── Debounce & Throttle ─────────────────────────────────────────────────────

/**
 * Debounce a function call.
 */
export function debounce(fn, delay = 300) {
  let timer = null;
  const debounced = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

/**
 * Throttle a function call.
 */
export function throttle(fn, limit = 1000) {
  let inThrottle = false;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// ─── Duplicate Submission Guard ──────────────────────────────────────────────

const _pendingRequests = new Map();

/**
 * Prevent duplicate API submissions (e.g. double-click on "Submit" button).
 *
 * @param {string} key - Unique key for this operation (e.g. 'create-transaction-{id}')
 * @param {() => Promise<T>} fn - The async operation
 * @returns {Promise<T>}
 */
export async function preventDuplicateSubmission(key, fn) {
  if (_pendingRequests.has(key)) {
    logger.warn("Duplicate submission blocked", { key });
    return _pendingRequests.get(key);
  }

  const promise = fn().finally(() => {
    _pendingRequests.delete(key);
  });

  _pendingRequests.set(key, promise);
  return promise;
}
