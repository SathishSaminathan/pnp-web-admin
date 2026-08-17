import { useMemo } from "react";
import logger from "../services/logger";

/**
 * Reusable hook to extract meta counts from an API response.
 *
 * Backend returns summary counts (e.g. kycStatusCounts) alongside pagination
 * inside the `meta` field of the response. This hook merges those counts with
 * safe defaults so the UI never renders undefined, NaN, or negative values.
 *
 * Usage:
 *   const KYC_COUNT_DEFAULTS = { approved: 0, rejected: 0, pending: 0 };
 *   // Define KYC_COUNT_DEFAULTS outside the component to keep a stable reference.
 *
 *   const kycCounts = useMetaCounts(responseMeta?.kycStatusCounts, KYC_COUNT_DEFAULTS);
 *
 * @template {Record<string, number>} T
 * @param {T | undefined | null} metaCounts - Raw counts object from the API response meta.
 * @param {T} defaultValue - Fallback values (all zeroes). Must be defined outside the
 *   component to maintain a stable reference across renders.
 * @returns {T} Merged counts with all values guaranteed to be finite, non-negative numbers.
 */
export function useMetaCounts(metaCounts, defaultValue) {
  return useMemo(() => {
    if (!metaCounts || typeof metaCounts !== "object") {
      if (metaCounts !== undefined) {
        logger.debug("useMetaCounts: Expected a counts object", {
          received: metaCounts,
        });
      }
      return { ...defaultValue };
    }

    const result = { ...defaultValue };

    for (const key of Object.keys(defaultValue)) {
      const raw = metaCounts[key];
      const num = typeof raw === "number" ? raw : Number(raw);
      result[key] = Number.isFinite(num) && num >= 0 ? num : 0;
    }

    return result;
  }, [metaCounts, defaultValue]);
}
