import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

countries.registerLocale(en);

// Non-standard but widely used codes
const SPECIAL_CODES = new Set(["XK"]); // Kosovo

/**
 * Validate an ISO 3166-1 alpha-2 country code.
 * Also accepts special-case codes (e.g. XK for Kosovo).
 */
export const isValidCountryCode = (code) => {
  if (!code || typeof code !== "string") return false;
  const upper = code.trim().toUpperCase();
  return countries.isValid(upper) || SPECIAL_CODES.has(upper);
};

/**
 * Get the English name for an ISO 3166-1 alpha-2 country code.
 * Returns null when the code is invalid.
 */
export const getCountryName = (code) => {
  if (!code || typeof code !== "string") return null;
  const upper = code.trim().toUpperCase();
  return countries.getName(upper, "en") || null;
};
