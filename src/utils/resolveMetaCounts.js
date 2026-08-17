/**
 * Resolves meta counts from an API response into a safe, typed object.
 *
 * Use this OUTSIDE React components — inside fetch functions, thunks, or
 * anywhere you need to process raw API data before storing it in state.
 * For reactive usage inside components use the `useMetaCounts` hook instead.
 *
 * Guarantees:
 *  - No undefined values
 *  - No NaN values
 *  - No negative values
 *  - No string numbers
 *  - Missing keys fall back to 0
 *
 * @template {Record<string, number>} T
 * @param {T | undefined | null} apiCounts - Raw counts object from the API response.
 * @param {T} defaultShape - Object whose keys define what to extract; all values should be 0.
 * @returns {T} Safe, resolved counts matching the shape of defaultShape.
 *
 * @example
 * // Inside a fetch function:
 * const counts = resolveMetaCounts(res.statusCounts, {
 *   pending: 0, approved: 0, completed: 0, cancelled: 0,
 * });
 * setStatusCounts(counts);
 */
import logger from "../services/logger";

export function resolveMetaCounts(apiCounts, defaultShape) {
  if (!apiCounts || typeof apiCounts !== "object") {
    if (apiCounts !== undefined) {
      logger.debug("resolveMetaCounts: Expected a counts object", {
        received: apiCounts,
      });
    }
    return { ...defaultShape };
  }

  const resolved = { ...defaultShape };

  Object.keys(defaultShape).forEach((key) => {
    const raw = apiCounts[key];
    const num = typeof raw === "number" ? raw : Number(raw);
    resolved[key] = Number.isFinite(num) && num >= 0 ? num : 0;
  });

  return resolved;
}
