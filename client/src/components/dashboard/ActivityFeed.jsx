import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { 
  FiUserPlus, FiUserCheck, FiEdit, FiTrash2, 
  FiClock, FiBriefcase, FiAward 
} from 'react-icons/fi';

const ActivityFeed = ({ activities, loading = false }) => {
  const getActivityIcon = (type) => {
    const icons = {
      create: <FiUserPlus className="text-success-500" />,
      update: <FiEdit className="text-primary-500" />,
      delete: <FiTrash2 className="text-error-500" />,
      hire: <FiUserCheck className="text-success-500" />,
      promotion: <FiAward className="text-warning-500" />,
      department: <FiBriefcase className="text-info-500" />,
      default: <FiClock className="text-secondary-500" />,
    };
    return icons[type] || icons.default;
  };
  
  const getActivityColor = (type) => {
    const colors = {
      create: 'bg-success-50 border-success-200',
      update: 'bg-primary-50 border-primary-200',
      delete: 'bg-error-50 border-error-200',
      hire: 'bg-success-50 border-success-200',
      promotion: 'bg-warning-50 border-warning-200',
      department: 'bg-info-50 border-info-200',
      default: 'bg-secondary-50 border-secondary-200',
    };
    return colors[type] || colors.default;
  };
  
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-lg" />
        ))}
      </div>
    );
  }
  
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-secondary-400">No recent activities</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id || index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`flex items-start gap-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}
        >
          <div className="flex-shrink-0 mt-1">
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-secondary-900">
              {activity.description}
            </p>
            <p className="text-xs text-secondary-500 mt-1">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </p>
          </div>
          {activity.user && (
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {activity.user.charAt(0)}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default ActivityFeed;
