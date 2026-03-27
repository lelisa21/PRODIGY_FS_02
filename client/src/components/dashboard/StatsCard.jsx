import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import AnimatedNumber from '../animations/AnimatedNumber';

const StatsCard = ({ title, value, change, icon, color = 'primary', loading = false }) => {
  const colors = {
    primary: 'bg-gradient-to-br from-primary-500 to-primary-600',
    success: 'bg-gradient-to-br from-success-500 to-success-600',
    warning: 'bg-gradient-to-br from-warning-500 to-warning-600',
    info: 'bg-gradient-to-br from-info-500 to-info-600',
  };
  
  const isPositive = change && change.startsWith('+');
  const changeColor = isPositive ? 'text-success-600' : 'text-error-600';
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-soft border border-secondary-200 p-6 transition-all duration-200 hover:shadow-hard"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={clsx('w-12 h-12 rounded-lg flex items-center justify-center', colors[color])}>
          {icon}
        </div>
        {change && (
          <span className={clsx('text-sm font-medium', changeColor)}>
            {change}
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-sm text-secondary-600 font-medium">{title}</p>
        {loading ? (
          <div className="skeleton h-8 w-24 rounded" />
        ) : (
          <p className="text-2xl font-bold text-secondary-900">
            {typeof value === 'number' ? (
              <AnimatedNumber value={value} />
            ) : (
              value
            )}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
