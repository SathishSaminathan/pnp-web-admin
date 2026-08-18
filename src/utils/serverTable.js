export const serverTablePagination = (query, serverPagination, updatePage) => ({
  current: Number(query?.page) || 1,
  pageSize: Number(query?.limit) || 10,
  total: serverPagination?.totalRecords ?? serverPagination?.total ?? 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
  onChange: (page, limit) => updatePage(page, limit),
});

export const cityOptions = (cities = []) =>
  cities.map(city => ({ value: city, label: city }));

/**
 * Normalize list API payloads. Handles:
 * - { items, total, meta }
 * - { data: T[] }
 * - { data: { items, total, meta } }
 * - T[]
 */
export const extractTablePayload = res => {
  if (res == null) return { rows: [], pagination: null, meta: null };

  if (Array.isArray(res)) {
    return { rows: res, pagination: null, meta: null };
  }

  const nested =
    res.items != null || res.total != null || res.meta != null
      ? res
      : res.data != null
        ? res.data
        : res;

  const rows = Array.isArray(nested)
    ? nested
    : Array.isArray(nested?.items)
      ? nested.items
      : Array.isArray(nested?.data)
        ? nested.data
        : [];

  const pagination =
    nested?.meta?.pagination ??
    res?.meta?.pagination ??
    (nested && nested.total != null
      ? {
          page: nested.page,
          limit: nested.limit,
          total: nested.total,
          totalRecords: nested.total,
          totalPages: nested.totalPages,
        }
      : null);

  return {
    rows,
    pagination,
    meta: nested?.meta ?? res?.meta ?? null,
  };
};
