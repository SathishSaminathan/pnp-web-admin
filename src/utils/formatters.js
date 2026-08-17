import { NUMBER_CONFIG } from "../config/number.config";
import { formatAmount } from "./number.utils";

export const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

export const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

/**
 * Format a date with timezone indicator (fintech-grade).
 */
export const formatDateTimeTZ = (d, timezone) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: timezone || undefined,
      timeZoneName: "short",
    });
  } catch {
    return formatDateTime(d);
  }
};

/**
 * Format a currency amount with symbol.
 *
 * @param {*} amount - Amount to format
 * @param {string} currencyCode - ISO 4217 currency code (e.g. 'USD', 'EUR', 'INR')
 * @returns {string} Formatted string like "$1,234.56"
 */
export const formatCurrency = (amount, currencyCode = "USD") => {
  if (amount === null || amount === undefined)
    return NUMBER_CONFIG.NULL_DISPLAY;
  try {
    const num = Number(amount);
    if (!Number.isFinite(num)) return NUMBER_CONFIG.NULL_DISPLAY;
    return num.toLocaleString(NUMBER_CONFIG.LOCALE, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: NUMBER_CONFIG.DEFAULT_DECIMALS,
      maximumFractionDigits: NUMBER_CONFIG.DEFAULT_DECIMALS,
    });
  } catch {
    // Fallback if currency code is invalid
    return `${currencyCode} ${formatAmount(amount)}`;
  }
};

export const initials = (first, last) =>
  `${(first || "?")[0]}${(last || "")[0] || ""}`.toUpperCase();
