/**
 * Safely extracts counts from an API response meta object.
 *
 * Handles different backend structures gracefully:
 *   - meta.counts       → { active: 5, inactive: 2 }
 *   - meta.statusCounts → { active: 5, inactive: 2 }
 *   - meta directly     → { active: 5, inactive: 2 }  (when counts sit at the meta root)
 *
 * Returns an empty object (never null/undefined) so callers can always
 * safely do `metaCounts?.['someKey'] ?? 0`.
 *
 * @param {any} meta - The meta object from the API response.
 * @returns {Record<string, number>} Flat counts object (may be empty).
 */
export function extractMetaCounts(meta) {
  if (!meta || typeof meta !== "object") return {};
  if (meta.counts && typeof meta.counts === "object") return meta.counts;
  if (meta.statusCounts && typeof meta.statusCounts === "object")
    return meta.statusCounts;
  return meta;
}
