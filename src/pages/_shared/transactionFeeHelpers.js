/**
 * Shared helpers for the transactionFee[] form used in Currency and
 * ExchangeRate Create / Update / BulkUpsert modals.
 *
 * Form representation: each transactionFee entry holds a `feeLines[]`
 * array — one item per fee row (e.g. Platform Fee, Gov Fee, Network Fee).
 * Each fee line carries: feeName, feeType, feeAmount, feeDescription,
 * feeShouldDeduct, feeSlabs[] (only populated when feeType === 'Slab').
 *
 * API shape: { paymentMethod, settlementDays, ..., fees: [{ name, type,
 * amount, description, shouldDeduct, slabs?: [...] }, ...] }
 */

export const FEE_TYPE_OPTIONS = [
    { value: 'Percentage', label: 'Percentage (%)' },
    { value: 'Fixed',      label: 'Fixed Amount' },
    { value: 'Slab',       label: 'Slab (tiered)' },
];

export const SLAB_BAND_TYPE_OPTIONS = [
    { value: 'Percentage', label: 'Percentage (%)' },
    { value: 'Fixed',      label: 'Fixed Amount' },
];

/**
 * Convert one API fees[] item into a feeLines[] entry for the form.
 */
const apiFeeToLine = (f) => ({
    feeName:         f.name        ?? '',
    feeType:         f.type        ?? undefined,
    feeAmount:       f.amount      ?? '',
    feeDescription:  f.description ?? '',
    feeShouldDeduct: f.shouldDeduct !== false, // default true
    feeSlabs: Array.isArray(f.slabs)
        ? f.slabs.map((s) => ({
            minAmount: s.minAmount ?? '',
            maxAmount: s.maxAmount ?? '',
            type:      s.type      ?? 'Fixed',
            amount:    s.amount    ?? '',
        }))
        : [],
});

/**
 * Flatten an API transactionFee[] entry into the form shape. Preserves the
 * full fees[] array — admins can configure multiple fees per payment method
 * (e.g. Platform Fee + Gov Fee + Network Fee), and each is editable here.
 */
export const feeToForm = (f) => ({
    paymentMethod:   f.paymentMethod,
    settlementDays:  f.settlementDays,
    minimumAmount:   f.minimumAmount,
    maximumAmount:   f.maximumAmount,
    priority:        f.priority,
    serviceProvider: f.serviceProvider?._id ?? f.serviceProvider ?? null,
    feeLines:        Array.isArray(f.fees) ? f.fees.map(apiFeeToLine) : [],
});

/**
 * Convert one feeLines[] entry back to an API fees[] item. Drops `feeSlabs`
 * for non-Slab types; drops `feeAmount` for Slab types. Returns null when the
 * line is effectively empty (no name AND no other content) so callers can
 * filter blanks out of the payload.
 */
const lineToApiFee = (line) => {
    if (!line) return null;
    const hasContent = line.feeName || line.feeType || line.feeAmount || line.feeSlabs?.length;
    if (!hasContent) return null;
    if (!line.feeName) return null; // require at least a name to persist

    const isSlab = line.feeType === 'Slab';
    const fee = {
        name:        line.feeName,
        type:        line.feeType,
        amount:      isSlab ? '' : (line.feeAmount ?? ''),
        description: line.feeDescription ?? '',
        shouldDeduct: line.feeShouldDeduct !== false, // default true
    };
    if (isSlab) {
        fee.slabs = (line.feeSlabs ?? []).map((s) => ({
            minAmount: String(s.minAmount ?? ''),
            maxAmount: String(s.maxAmount ?? ''),
            type:      s.type,
            amount:    String(s.amount ?? ''),
        }));
    }
    return fee;
};

/**
 * Convert a form transactionFee entry's feeLines[] back to the API fees[].
 * Blank lines (no name) are filtered out so users can leave half-edited rows
 * without polluting the payload.
 */
export const buildFeesForApi = (formFee) =>
    (formFee.feeLines ?? []).map(lineToApiFee).filter(Boolean);

/**
 * Convert a transactionFee[] array of form entries to the API payload shape.
 */
export const buildTransactionFeeForApi = (transactionFee) =>
    (transactionFee || []).map((f) => ({
        paymentMethod:   f.paymentMethod,
        settlementDays:  f.settlementDays,
        minimumAmount:   String(f.minimumAmount ?? ''),
        maximumAmount:   String(f.maximumAmount ?? ''),
        priority:        f.priority ?? 1,
        serviceProvider: f.serviceProvider ?? null,
        fees:            buildFeesForApi(f),
    }));
