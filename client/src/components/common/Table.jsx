import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

const Table = ({
  columns,
  data,
  loading = false,
  pagination = true,
  pageSize = 10,
  totalItems,
  currentPage = 1,
  onPageChange,
  onRowClick,
  className,
  emptyMessage = 'No data available',
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && onPageChange) {
      onPageChange(page);
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-12 rounded-lg" />
        ))}
      </div>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-secondary-400 text-lg">{emptyMessage}</div>
      </div>
    );
  }
  
  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-secondary-200">
        <thead className="bg-secondary-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={clsx(
                  'px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider',
                  column.className
                )}
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-secondary-200">
          {data.map((row, rowIndex) => (
            <motion.tr
              key={rowIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rowIndex * 0.05 }}
              onClick={() => onRowClick && onRowClick(row)}
              className={clsx(
                'hover:bg-secondary-50 transition-colors duration-150',
                onRowClick && 'cursor-pointer'
              )}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900"
                >
                  {column.render
                    ? column.render(row[column.accessor], row)
                    : row[column.accessor]}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
      
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 bg-secondary-50 border-t border-secondary-200">
          <div className="text-sm text-secondary-700">
            Showing {((currentPage - 1) * pageSize) + 1} to{' '}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md hover:bg-secondary-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronsLeft size={16} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md hover:bg-secondary-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft size={16} />
            </button>
            <span className="px-3 py-1 text-sm font-medium text-secondary-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md hover:bg-secondary-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronRight size={16} />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md hover:bg-secondary-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
