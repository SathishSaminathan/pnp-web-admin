import React from 'react';
import { Table } from 'antd';

const DataTable = ({ wrapped = true, className = '', pagination, ...props }) => {
  const table = (
    <Table
      className={`pnp-data-table ${className}`.trim()}
      pagination={
        pagination === false
          ? false
          : {
              pageSize: 10,
              showSizeChanger: false,
              showTotal: total => (
                <span className="pnp-table-total">{total} records</span>
              ),
              ...pagination,
            }
      }
      {...props}
    />
  );

  if (!wrapped) return table;
  return <div className="pnp-table-card">{table}</div>;
};

export default DataTable;
