import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiBriefcase, FiMapPin } from 'react-icons/fi';
import Badge from '../common/Badge';
import Tooltip from '../common/Tooltip';

const EmployeeCard = ({ employee, onClick }) => {
  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      inactive: 'error',
      on_leave: 'warning',
      probation: 'info',
    };
    return colors[status] || 'default';
  };
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-soft border border-secondary-200 overflow-hidden hover:shadow-hard transition-all duration-200"
    >
      <div className="relative h-24 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="absolute -bottom-12 left-4">
          <div className="w-24 h-24 rounded-xl bg-white p-1 shadow-md">
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {employee.name?.charAt(0) || 'E'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-14 p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-secondary-900">
              {employee.name}
            </h3>
            <p className="text-sm text-secondary-500">{employee.position}</p>
          </div>
          <Badge variant={getStatusColor(employee.status)} size="sm">
            {employee.status || 'Active'}
          </Badge>
        </div>
        
        <div className="space-y-2 mt-4">
          <div className="flex items-center gap-2 text-sm text-secondary-600">
            <FiMail size={14} />
            <span className="truncate">{employee.email}</span>
          </div>
          {employee.phone && (
            <div className="flex items-center gap-2 text-sm text-secondary-600">
              <FiPhone size={14} />
              <span>{employee.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-secondary-600">
            <FiBriefcase size={14} />
            <span>{employee.department}</span>
          </div>
          {employee.location && (
            <div className="flex items-center gap-2 text-sm text-secondary-600">
              <FiMapPin size={14} />
              <span>{employee.location}</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-secondary-200">
          <button
            onClick={() => onClick?.(employee)}
            className="w-full px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
          >
            View Profile
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeeCard;
