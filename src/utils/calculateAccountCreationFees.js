/**
 * Centralized fee calculation for accountCreationFee[] from the
 * bank-account-request API response.
 *
 * API shape:
 *   accountCreationFee: [
 *     {
 *       serviceProvider: string,
 *       fees: [
 *         { name, type, amount, description, shouldDeduct }
 *       ]
 *     }
 *   ]
 *
 * Returns a structured breakdown with totals.  Never throws — any
 * malformed / missing data is handled defensively and logged in DEV.
 */

import {
  sanitizeNumber,
  safeMultiply,
  safeDivide,
  safeSum,
} from "./number.utils";
import logger from "../services/logger";

// ─── Internal ────────────────────────────────────────────────────────────────

const FEE_TYPE = {
  FIXED: "Fixed",
  PERCENTAGE: "Percentage",
};

/**
 * Calculate the effective amount for a single fee entry.
 *
 * @param {{ type: string, amount: string }} fee
 * @param {number} baseAmount — sanitized numeric base (for percentage calc)
 * @returns {number}
 */
function resolveAmount(fee, baseAmount) {
  const raw = sanitizeNumber(fee?.amount);

  switch (fee?.type) {
    case FEE_TYPE.FIXED:
      return raw;

    case FEE_TYPE.PERCENTAGE:
      // percentage / 100 × base
      return safeDivide(safeMultiply(baseAmount, raw), 100);

    default:
      // Unknown / future type — log and treat as 0
      logger.debug(`Unknown fee type "${fee?.type}" — skipped`);
      return 0;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * @param {Array|undefined} accountCreationFee — raw API field
 * @param {*} baseAmount — source / transaction amount (for percentage fees)
 * @returns {{
 *   breakdown: Array<{
 *     name: string,
 *     type: string,
 *     rawAmount: string,
 *     calculatedAmount: number,
 *     shouldDeduct: boolean,
 *     description: string,
 *     serviceProvider: string,
 *   }>,
 *   totalFees: number,
 *   totalDeduct: number,
 *   totalAdd: number,
 * }}
 */
export function calculateAccountCreationFees(accountCreationFee, baseAmount) {
  const empty = {
    breakdown: [],
    totalFees: 0,
    totalDeduct: 0,
    totalAdd: 0,
  };

  if (!Array.isArray(accountCreationFee) || accountCreationFee.length === 0) {
    return empty;
  }

  const safeBase = sanitizeNumber(baseAmount);

  const breakdown = [];

  for (const provider of accountCreationFee) {
    if (!provider || !Array.isArray(provider.fees)) continue;

    const providerName = provider.serviceProvider ?? "";

    for (const fee of provider.fees) {
      if (!fee) continue;

      const calculatedAmount = resolveAmount(fee, safeBase);

      breakdown.push({
        name: fee.name ?? "Unnamed Fee",
        type: fee.type ?? "Unknown",
        rawAmount: fee.amount ?? "0",
        calculatedAmount,
        shouldDeduct: fee.shouldDeduct === true,
        description: fee.description ?? "",
        serviceProvider: providerName,
      });
    }
  }

  const amounts = breakdown.map((b) => b.calculatedAmount);
  const deductAmounts = breakdown
    .filter((b) => b.shouldDeduct)
    .map((b) => b.calculatedAmount);
  const addAmounts = breakdown
    .filter((b) => !b.shouldDeduct)
    .map((b) => b.calculatedAmount);

  return {
    breakdown,
    totalFees: safeSum(amounts),
    totalDeduct: safeSum(deductAmounts),
    totalAdd: safeSum(addAmounts),
  };
}
