/**
 * Maps a card configuration array to card objects with values resolved from meta counts.
 *
 * Each card in the config defines which backend key to read (`key`).
 * If the key is missing or the value is not a valid number, `value` defaults to 0.
 *
 * @template {object} TCardConfig
 * @param {(TCardConfig & { label: string; key: string })[]} cardConfig
 *   Array of card descriptors. Each must have at least `label` and `key`.
 * @param {Record<string, unknown>} metaCounts
 *   Flat counts object extracted from the API response meta.
 * @returns {(TCardConfig & { label: string; key: string; value: number })[]}
 *   Same array with a resolved numeric `value` added to every entry.
 *
 * @example
 * const CARD_CONFIG = [
 *   { label: 'Active',  key: 'active',  color: '#10b981', icon: <CheckCircleOutlined /> },
 *   { label: 'Frozen',  key: 'frozen',  color: '#f59e0b', icon: <WarningOutlined /> },
 *   { label: 'Closed',  key: 'closed',  color: '#6b7280', icon: <CloseCircleOutlined /> },
 * ];
 * const cards = mapCardsFromMeta(CARD_CONFIG, metaCounts);
 * // cards[0].value === metaCounts.active ?? 0
 */
export function mapCardsFromMeta(cardConfig, metaCounts) {
  return cardConfig.map((card) => {
    const raw = metaCounts?.[card.key];
    const num = typeof raw === "number" ? raw : Number(raw);
    return { ...card, value: Number.isFinite(num) && num >= 0 ? num : 0 };
  });
}
