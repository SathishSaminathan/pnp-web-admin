import React from 'react';
import { Pagination } from 'antd';
import { SkeletonBone } from './skeletons';

const cellValue = (col, row, index) => {
  const value = Array.isArray(col.dataIndex)
    ? col.dataIndex.reduce((acc, key) => acc?.[key], row)
    : col.dataIndex != null
      ? row?.[col.dataIndex]
      : row;
  if (typeof col.render === 'function') return col.render(value, row, index);
  if (value == null || value === '') return '—';
  return value;
};

const pinStyle = (col, columns) => {
  const width = col.width;
  const base = {
    width,
    minWidth: width,
    maxWidth: col.ellipsis ? width : undefined,
    textAlign: col.align || 'left',
  };

  if (col.fixed !== 'left' && col.fixed !== 'right') return base;

  if (col.fixed === 'left') {
    let left = 0;
    for (const item of columns) {
      if (item === col) break;
      if (item.fixed === 'left') left += Number(item.width) || 0;
    }
    return { ...base, position: 'sticky', left, zIndex: 3 };
  }

  let right = 0;
  for (let i = columns.length - 1; i >= 0; i -= 1) {
    if (columns[i] === col) break;
    if (columns[i].fixed === 'right') right += Number(columns[i].width) || 0;
  }
  return { ...base, position: 'sticky', right, zIndex: 3 };
};

const rowKeyOf = (rowKey, row, index) => {
  if (typeof rowKey === 'function') return rowKey(row);
  if (rowKey && row?.[rowKey] != null) return row[rowKey];
  return row?.id ?? row?.key ?? index;
};

const DataTable = ({
  wrapped = true,
  className = '',
  pagination,
  loading = false,
  dataSource,
  columns = [],
  skeletonRows,
  skeletonMinWidth,
  rowKey = 'id',
}) => {
  const rows = Array.isArray(dataSource) ? dataSource : [];
  const cols = Array.isArray(columns) ? columns : [];
  const rowCount = skeletonRows || Number(pagination?.pageSize) || 10;
  const showSkeleton = Boolean(loading && rows.length === 0);
  const minWidth =
    skeletonMinWidth ||
    cols.reduce((sum, col) => sum + (Number(col.width) || 120), 0) ||
    720;

  const table = (
    <div className={`pnp-data-table ${className}`.trim()}>
      {loading && rows.length ? <div className="pnp-skeleton-progress" /> : null}
      <div className="pnp-simple-table-scroll">
        <table className="pnp-simple-table" style={{ minWidth }}>
          <thead>
            <tr>
              {cols.map((col, index) => (
                <th
                  key={col.key || col.dataIndex || index}
                  className={col.fixed ? `is-pinned is-pinned-${col.fixed}` : undefined}
                  style={pinStyle(col, cols)}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {showSkeleton
              ? Array.from({ length: rowCount }).map((_, rowIndex) => (
                  <tr key={`skeleton-${rowIndex}`}>
                    {cols.map((col, colIndex) => (
                      <td
                        key={col.key || col.dataIndex || colIndex}
                        className={col.fixed ? `is-pinned is-pinned-${col.fixed}` : undefined}
                        style={pinStyle(col, cols)}
                      >
                        <SkeletonBone width={colIndex === 0 ? '72%' : '58%'} height={12} />
                      </td>
                    ))}
                  </tr>
                ))
              : null}
            {!showSkeleton && rows.length
              ? rows.map((row, index) => (
                  <tr key={rowKeyOf(rowKey, row, index)}>
                    {cols.map((col, colIndex) => (
                      <td
                        key={col.key || col.dataIndex || colIndex}
                        className={[
                          col.fixed ? `is-pinned is-pinned-${col.fixed}` : '',
                          col.ellipsis ? 'is-ellipsis' : '',
                        ].filter(Boolean).join(' ') || undefined}
                        style={pinStyle(col, cols)}
                      >
                        {cellValue(col, row, index)}
                      </td>
                    ))}
                  </tr>
                ))
              : null}
            {!showSkeleton && !rows.length ? (
              <tr>
                <td colSpan={Math.max(cols.length, 1)} className="pnp-table-empty">
                  No records
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {pagination === false ? null : (
        <div className="pnp-table-footer">
          <span className="pnp-table-total">
            {Number(pagination?.total) || 0} records
          </span>
          <Pagination
            current={Number(pagination?.current) || 1}
            pageSize={Number(pagination?.pageSize) || 10}
            total={Number(pagination?.total) || 0}
            showSizeChanger={pagination?.showSizeChanger !== false}
            pageSizeOptions={pagination?.pageSizeOptions || ['10', '20', '50']}
            onChange={pagination?.onChange}
            showLessItems
          />
        </div>
      )}
    </div>
  );

  if (!wrapped) return table;
  return (
    <div className={`pnp-table-card${loading && rows.length ? ' is-refreshing' : ''}`.trim()}>
      {table}
    </div>
  );
};

export default DataTable;
