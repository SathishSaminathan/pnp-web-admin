/**
 * Centralized numeric configuration for the fintech application.
 * All formatting must respect this config.
 * Change decimal/rounding behavior here — applied globally.
 */
export const NUMBER_CONFIG = {
  /** Default decimal places for currency formatting */
  DEFAULT_DECIMALS: 2,
  /** Maximum decimal places (crypto values, exchange rates) */
  MAX_DECIMALS: 8,
  /** Decimal places for exchange rate display */
  EXCHANGE_RATE_DECIMALS: 6,
  /** Rounding mode: 'HALF_UP' = standard banker's rounding */
  ROUNDING_MODE: "HALF_UP",
  /** Locale for toLocaleString formatting */
  LOCALE: "en-US",
  /** Fallback display when value is null/undefined and no default desired */
  NULL_DISPLAY: "—",
};
