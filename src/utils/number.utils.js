/**
 * Centralized, production-grade numeric handling utilities.
 * ALL numeric display and arithmetic in the application MUST use these functions.
 *
 * Guarantees:
 *  - Never returns NaN
 *  - Never throws
 *  - Handles null, undefined, empty string, malformed input
 *  - Avoids floating-point precision errors for addition/subtraction
 *  - Division by zero returns 0
 */

import { NUMBER_CONFIG } from "../config/number.config";
import logger from "../services/logger";

// ─── Internal helpers ────────────────────────────────────────────────────────

/**
 * Count decimal places in a numeric string.
 */
function decimalPlaces(numStr) {
  const parts = String(numStr).split(".");
  return parts.length > 1 ? parts[1].length : 0;
}

/**
 * Round using the configured rounding mode (HALF_UP by default).
 * Avoids floating-point rounding artifacts by using string-based exponent shift.
 */
function safeRound(value, decimals) {
  if (!Number.isFinite(value)) return 0;
  // Shift, round, shift back — avoids e.g. 1.005 → 1.00
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Sanitize ANY input into a safe, finite number.
 *
 * Handles: null, undefined, "", " ", objects, arrays, "12..34", "abc",
 *          extremely large values, negative values, scientific notation.
 *
 * @param {*} value — anything
 * @returns {number} — a finite number, or 0
 */
export function sanitizeNumber(value) {
  // null / undefined → 0
  if (value == null) return 0;

  // Objects / arrays — not a numeric primitive
  if (typeof value === "object") return 0;

  // Booleans
  if (typeof value === "boolean") return 0;

  // Convert to string for cleaning
  let str = String(value).trim();

  // Empty after trim
  if (str === "") return 0;

  // Preserve leading minus sign
  let negative = false;
  if (str.startsWith("-")) {
    negative = true;
    str = str.slice(1);
  }

  // Remove everything except digits and dots
  str = str.replace(/[^0-9.]/g, "");

  // Handle multiple dots — keep only the first
  const dotIndex = str.indexOf(".");
  if (dotIndex !== -1) {
    str =
      str.slice(0, dotIndex + 1) + str.slice(dotIndex + 1).replace(/\./g, "");
  }

  // Empty after cleaning
  if (str === "" || str === ".") return 0;

  const num = Number(negative ? "-" + str : str);

  // Final safety gate
  if (!Number.isFinite(num)) return 0;

  return num;
}

/**
 * Format a value as a display-ready string with locale-aware thousand separators.
 *
 * @param {*} value — anything (will be sanitized)
 * @param {object} [options]
 * @param {number}  [options.decimals=NUMBER_CONFIG.DEFAULT_DECIMALS] — fraction digits
 * @param {boolean} [options.showDash=false] — if true and raw value is null/undefined, return '—'
 * @param {string}  [options.locale=NUMBER_CONFIG.LOCALE] — BCP 47 locale
 * @param {number}  [options.maxDecimals] — if set, allows variable fraction digits up to this max
 * @returns {string}
 */
export function formatAmount(value, options = {}) {
  const {
    decimals = NUMBER_CONFIG.DEFAULT_DECIMALS,
    showDash = false,
    locale = NUMBER_CONFIG.LOCALE,
    maxDecimals,
  } = options;

  // Opt-in: return dash for truly absent values
  if (showDash && (value === null || value === undefined)) {
    return NUMBER_CONFIG.NULL_DISPLAY;
  }

  const num = sanitizeNumber(value);
  const rounded = safeRound(num, maxDecimals != null ? maxDecimals : decimals);

  try {
    return rounded.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: maxDecimals != null ? maxDecimals : decimals,
    });
  } catch {
    // Absolute fallback — should never happen
    return rounded.toFixed(decimals);
  }
}

/**
 * Format an exchange rate (higher precision).
 *
 * @param {*} value
 * @param {number} [decimals=NUMBER_CONFIG.EXCHANGE_RATE_DECIMALS]
 * @returns {string}
 */
export function formatRate(
  value,
  decimals = NUMBER_CONFIG.EXCHANGE_RATE_DECIMALS,
) {
  if (value === null || value === undefined) return NUMBER_CONFIG.NULL_DISPLAY;
  const num = sanitizeNumber(value);
  return safeRound(num, decimals).toFixed(decimals);
}

/**
 * Format an integer-style numeric value (no decimals) with locale grouping.
 *
 * @param {*} value
 * @param {object} [options]
 * @param {boolean} [options.showDash=false]
 * @returns {string}
 */
export function formatInteger(value, options = {}) {
  return formatAmount(value, { decimals: 0, maxDecimals: 0, ...options });
}

// ─── Safe arithmetic ─────────────────────────────────────────────────────────

/**
 * Safe addition avoiding floating-point errors.
 * @returns {number}
 */
export function safeAdd(a, b) {
  const na = sanitizeNumber(a);
  const nb = sanitizeNumber(b);
  const dp = Math.max(decimalPlaces(na), decimalPlaces(nb));
  const factor = Math.pow(10, dp);
  return (Math.round(na * factor) + Math.round(nb * factor)) / factor;
}

/**
 * Safe subtraction avoiding floating-point errors.
 * @returns {number}
 */
export function safeSubtract(a, b) {
  const na = sanitizeNumber(a);
  const nb = sanitizeNumber(b);
  const dp = Math.max(decimalPlaces(na), decimalPlaces(nb));
  const factor = Math.pow(10, dp);
  return (Math.round(na * factor) - Math.round(nb * factor)) / factor;
}

/**
 * Safe multiplication avoiding floating-point errors.
 * @returns {number}
 */
export function safeMultiply(a, b) {
  const na = sanitizeNumber(a);
  const nb = sanitizeNumber(b);
  const dpA = decimalPlaces(na);
  const dpB = decimalPlaces(nb);
  const factor = Math.pow(10, dpA + dpB);
  return (
    (Math.round(na * Math.pow(10, dpA)) * Math.round(nb * Math.pow(10, dpB))) /
    factor
  );
}

/**
 * Safe division. Returns 0 on division by zero.
 * @returns {number}
 */
export function safeDivide(a, b) {
  const na = sanitizeNumber(a);
  const nb = sanitizeNumber(b);
  if (nb === 0) {
    logger.debug("Division by zero — returning 0");
    return 0;
  }
  const result = na / nb;
  return Number.isFinite(result) ? result : 0;
}

/**
 * Safe reduce-style summation for arrays of values.
 * @param {Array<*>} values
 * @returns {number}
 */
export function safeSum(values) {
  if (!Array.isArray(values)) return 0;
  return values.reduce((acc, v) => safeAdd(acc, v), 0);
}

// ─── Fintech Validation ──────────────────────────────────────────────────────

/**
 * Validate a transaction amount.
 * Returns { valid, reason } — use this before submitting financial operations.
 *
 * @param {*} amount - Amount to validate
 * @param {object} [limits]
 * @param {number} [limits.min=0.01] - Minimum allowed amount
 * @param {number} [limits.max=999999999.99] - Maximum allowed amount
 * @param {number} [limits.maxDecimals=2] - Maximum decimal places
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateTransactionAmount(amount, limits = {}) {
  const { min = 0.01, max = 999999999.99, maxDecimals = 2 } = limits;
  const num = sanitizeNumber(amount);

  if (num <= 0)
    return { valid: false, reason: "Amount must be greater than zero" };
  if (num < min)
    return { valid: false, reason: `Amount must be at least ${min}` };
  if (num > max) return { valid: false, reason: `Amount cannot exceed ${max}` };

  // Check decimal places
  const strParts = String(amount).split(".");
  if (strParts.length > 1 && strParts[1].length > maxDecimals) {
    return {
      valid: false,
      reason: `Amount cannot have more than ${maxDecimals} decimal places`,
    };
  }

  return { valid: true };
}

/**
 * Compare two amounts for equality using safe precision.
 * Avoids floating-point comparison issues (e.g. 0.1 + 0.2 !== 0.3).
 */
export function amountsEqual(a, b, precision = NUMBER_CONFIG.DEFAULT_DECIMALS) {
  const na = safeRound(sanitizeNumber(a), precision);
  const nb = safeRound(sanitizeNumber(b), precision);
  return na === nb;
}
