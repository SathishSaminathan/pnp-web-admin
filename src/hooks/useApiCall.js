import { useCallback, useEffect, useRef, useState } from "react";
import { withRetry, apiCircuitBreaker } from "../services/resilience";
import logger from "../services/logger";
import { notifyError } from "../utils/notification";

/**
 * Hook for making resilient API calls with retry, loading state, and error handling.
 *
 * Usage:
 *   const { execute, loading, error } = useApiCall();
 *   const result = await execute(() => api.doSomething(data), {
 *     retry: true,
 *     endpoint: 'create-transaction',
 *   });
 *
 * Features:
 * - Automatic retry for retryable errors
 * - Loading state management
 * - Duplicate submission prevention
 * - Error normalization
 * - AbortController cleanup on unmount
 * - Circuit breaker integration
 */
export function useApiCall() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pendingRef = useRef(false);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Cancel any in-flight request on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(async (fn, options = {}) => {
    const {
      retry = false,
      endpoint = "unknown",
      showToast = false,
      useCircuitBreaker = false,
    } = options;

    // Duplicate guard
    if (pendingRef.current) {
      logger.debug("useApiCall: blocked duplicate call", { endpoint });
      return null;
    }

    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    pendingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const wrappedFn = () => fn(controller.signal);

      let result;
      if (useCircuitBreaker) {
        result = retry
          ? await apiCircuitBreaker.execute(() =>
              withRetry(wrappedFn, { endpoint, maxAttempts: 3 }),
            )
          : await apiCircuitBreaker.execute(wrappedFn);
      } else {
        result = retry
          ? await withRetry(wrappedFn, { endpoint, maxAttempts: 3 })
          : await wrappedFn();
      }

      return result;
    } catch (err) {
      // Swallow abort errors silently
      if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") {
        return null;
      }
      if (mountedRef.current) {
        setError(err);
        if (showToast && !err.handled) {
          notifyError(err?.message || "An error occurred");
        }
      }
      logger.apiError(endpoint, err);
      return null;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      pendingRef.current = false;
      abortControllerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return { execute, loading, error, reset, cancel };
}

export default useApiCall;
