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
