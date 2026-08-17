/**
 * Strips internal, null, undefined, and empty-string values from a query
 * object and returns a clean params object ready for axios `{ params }`.
 *
 * Rules:
 *  - Fields whose key starts with "_" are treated as internal hook fields
 *    (e.g. _rev) and are never sent to the API.
 *  - undefined, null, and "" are stripped.
 *  - Numeric 0 and boolean false ARE included (they are valid API values).
 *
 * @param {Record<string, any>} query
 * @returns {Record<string, any>}
 */
export const buildQueryParams = (query) => {
  if (!query || typeof query !== "object") return {};

  const params = {};

  for (const [key, value] of Object.entries(query)) {
    if (key.startsWith("_")) continue; // skip internal hook tracking fields
    if (value === undefined || value === null || value === "") continue;
    params[key] = value;
  }

  return params;
};
