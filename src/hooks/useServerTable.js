import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildQueryParams } from "../utils/buildQueryParams";
import { extractTablePayload } from "../utils/serverTable";

/**
 * Reusable server-driven table hook.
 *
 * Manages query state, fires the API on every query change,
 * cancels stale in-flight requests via AbortController, and
 * exposes helpers to update filters (resets page to 1) or
 * pagination (keeps current filters).
 *
 * The apiFn signature: (cleanParams: object, signal: AbortSignal) => Promise<Response>
 * where Response is expected to be: { data: T[], meta: { pagination: {...} } }
 *
 * All API-specific concerns (success check, param injection, etc.)
 * should be handled inside the apiFn wrapper in the calling component.
 *
 * @param {(params: object, signal: AbortSignal) => Promise<any>} apiFn
 * @param {object} initialQuery
 */
export function useServerTable(apiFn, initialQuery) {
  const [query, setQuery] = useState(() => ({ ...initialQuery, _rev: 0 }));
  const [data, setData] = useState([]);
  const [serverPagination, setServerPagination] = useState(null);
  const [responseMeta, setResponseMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Keep apiFn reference up-to-date without re-triggering the effect */
  const apiFnRef = useRef(apiFn);
  useEffect(() => {
    apiFnRef.current = apiFn;
  }, [apiFn]);

  const abortRef = useRef(null);

  /* Stable serialised key — re-runs the fetch only when query content changes */
  const queryKey = useMemo(() => JSON.stringify(query), [query]);

  useEffect(() => {
    /* Cancel any in-flight request before starting a new one */
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;

    const parsedQuery = JSON.parse(queryKey);
    const cleanParams = buildQueryParams(parsedQuery);

    setLoading(true);

    apiFnRef
      .current(cleanParams, signal)
      .then((res) => {
        if (signal.aborted) return;
        const { rows, pagination, meta } = extractTablePayload(res);
        setData(rows);
        setServerPagination(pagination);
        setResponseMeta(meta);
      })
      .catch((err) => {
        /* Silently swallow aborted/cancelled requests */
        if (
          err?.name === "CanceledError" ||
          err?.name === "AbortError" ||
          err?.code === "ERR_CANCELED"
        )
          return;
        /* Axios interceptor already shows an error toast for HTTP errors */
      })
      .finally(() => {
        if (!signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [queryKey]);

  /**
   * Low-level: update any query fields without resetting page.
   * Use this only for pagination / page-size changes.
   */
  const updateQuery = useCallback((updates) => {
    setQuery((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Update filter fields. Always resets page to 1.
   * Use this for search, dropdowns, date ranges, and sort changes.
   */
  const updateFilters = useCallback((updates) => {
    setQuery((prev) => ({ ...prev, ...updates, page: 1 }));
  }, []);

  /** Update page and/or limit without touching filters. */
  const updatePage = useCallback((page, limit) => {
    setQuery((prev) => ({
      ...prev,
      page: Math.max(1, Number(page) || 1),
      ...(limit !== undefined && { limit: Math.max(1, Number(limit) || 10) }),
    }));
  }, []);

  /**
   * Force a re-fetch of the current query without changing any params.
   * Increments an internal revision counter that buildQueryParams strips
   * before sending to the API.
   */
  const refresh = useCallback(() => {
    setQuery((prev) => ({ ...prev, _rev: (prev._rev || 0) + 1 }));
  }, []);

  return {
    query,
    data,
    serverPagination,
    responseMeta,
    loading,
    updateQuery,
    updateFilters,
    updatePage,
    refresh,
  };
}
