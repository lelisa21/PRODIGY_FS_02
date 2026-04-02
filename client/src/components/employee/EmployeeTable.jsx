import { FiEdit2, FiTrash2, FiEye, FiMoreVertical } from 'react-icons/fi';
import Table from '../common/Table';
import Badge from '../common/Badge';
import Dropdown, { DropdownItem } from '../common/Dropdown';
import { formatDate } from '../../utils/formatters';

const EmployeeTable = ({
  employees,
  loading,
  pagination,
  onEdit,
  onDelete,
  onView,
  onPageChange,
  currentPage,
  totalItems,
  pageSize = 10,
}) => {
  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      inactive: 'error',
      on_leave: 'warning',
      probation: 'info',
    };
    return colors[status] || 'default';
  };
  
  const columns = [
    {
      header: 'Employee',
      accessor: 'name',
      width: '250px',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {value?.charAt(0) || 'E'}
            </span>
          </div>
          <div>
            <p className="font-medium text-secondary-900">{value}</p>
            <p className="text-xs text-secondary-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
      width: '150px',
      render: (value) => (
        <Badge variant="info" size="sm">{value}</Badge>
      ),
    },
    {
      header: 'Position',
      accessor: 'position',
      width: '150px',
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '120px',
      render: (value) => (
        <Badge variant={getStatusColor(value)} size="sm">
          {value || 'Active'}
        </Badge>
      ),
    },
    {
      header: 'Join Date',
      accessor: 'joinDate',
      width: '120px',
      render: (value) => formatDate(value, 'MMM dd, yyyy'),
    },
    {
      header: 'Actions',
      accessor: 'id',
      width: '100px',
      render: (_, row) => (
        <Dropdown
          trigger={
            <button className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
              <FiMoreVertical size={16} />
            </button>
          }
          align="right"
        >
          <DropdownItem onClick={() => onView?.(row)} icon={<FiEye size={14} />}>
            View Details
          </DropdownItem>
          <DropdownItem onClick={() => onEdit?.(row)} icon={<FiEdit2 size={14} />}>
            Edit
          </DropdownItem>
          {onDelete && (
            <DropdownItem
              onClick={() => onDelete?.(row.id)}
              icon={<FiTrash2 size={14} />}
              className="text-error-600 hover:bg-error-50"
            >
              Delete
            </DropdownItem>
          )}
        </Dropdown>
      ),
    },
  ];
  
  return (
    <Table
      columns={columns}
      data={employees}
      loading={loading}
      pagination={pagination}
      pageSize={pageSize}
      totalItems={totalItems}
      currentPage={currentPage}
      onPageChange={onPageChange}
      onRowClick={onView}
    />
  );
};

export default EmployeeTable;
