// src/components/dashboard/ActivityFeed.jsx
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { 
  FiUserPlus, FiUserCheck, FiEdit, FiTrash2, 
  FiClock, FiBriefcase, FiAward, FiLogIn, FiLogOut,
  FiEye, FiSettings, FiUsers
} from 'react-icons/fi';

const ActivityFeed = ({ activities, loading = false }) => {
  const navigate = useNavigate();

  const getActivityIcon = (action) => {
    const icons = {
      CREATE: <FiUserPlus className="text-emerald-500" size={16} />,
      UPDATE: <FiEdit className="text-amber-500" size={16} />,
      DELETE: <FiTrash2 className="text-rose-500" size={16} />,
      LOGIN: <FiLogIn className="text-emerald-500" size={16} />,
      LOGOUT: <FiLogOut className="text-rose-500" size={16} />,
      VIEW: <FiEye className="text-sky-500" size={16} />,
      EMPLOYEE: <FiUsers className="text-emerald-500" size={16} />,
      USER: <FiUserCheck className="text-amber-500" size={16} />,
      DEPARTMENT: <FiBriefcase className="text-sky-500" size={16} />,
      SETTINGS: <FiSettings className="text-purple-500" size={16} />,
      default: <FiClock className="text-neutral-500" size={16} />,
    };
    return icons[action] || icons.default;
  };
  
  const getActivityColor = (action) => {
    const colors = {
      CREATE: 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15',
      UPDATE: 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15',
      DELETE: 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/15',
      LOGIN: 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15',
      LOGOUT: 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/15',
      VIEW: 'bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/15',
      default: 'bg-neutral-500/10 border-neutral-500/20 hover:bg-neutral-500/15',
    };
    return colors[action] || colors.default;
  };

  const getInitials = (name) => {
    if (!name || name === 'System') return 'SY';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleActivityClick = (activity) => {
    // Navigate to the target if it's an employee
    if (activity.targetId && activity.resource === 'EMPLOYEE') {
      navigate(`/employees/${activity.targetId}`);
    } else if (activity.userId && activity.action === 'LOGIN') {
      navigate(`/app/profile/${activity.userId}`);
    } else if (activity.resourceId && activity.resource === 'EMPLOYEE') {
      navigate(`/employees/${activity.resourceId}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-neutral-800 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }
  
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <FiClock className="text-4xl text-neutral-600 mx-auto mb-3" />
        <p className="text-neutral-400">No recent activities</p>
        <p className="text-neutral-500 text-sm mt-1">
          Activities will appear here when users perform actions
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id || index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: Math.min(index * 0.05, 0.5) }}
          whileHover={{ scale: 1.02 }}
          onClick={() => handleActivityClick(activity)}
          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${getActivityColor(activity.action)}`}
        >
          {/* Icon */}
          <div className="shrink-0 mt-0.5">
            {getActivityIcon(activity.action)}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-neutral-900">
              {activity.description}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-neutral-400">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </p>
              {activity.ipAddress && (
                <span className="text-xs text-neutral-500">
                  • {activity.ipAddress}
                </span>
              )}
              {activity.status === 'FAILED' && (
                <span className="text-xs text-rose-400">
                  • Failed
                </span>
              )}
            </div>
          </div>
          
          {/* User Avatar / Initials */}
          {activity.userAvatar ? (
            <div className="shrink-0">
              <img 
                src={activity.userAvatar} 
                alt={activity.user}
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {activity.userInitials || getInitials(activity.user)}
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
