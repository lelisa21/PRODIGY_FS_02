import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiXCircle, FiX } from 'react-icons/fi';

const Toast = ({ id, type, message, duration = 5000, onClose }) => {
  const icons = {
    success: <FiCheckCircle className="text-success-500" size={20} />,
    error: <FiAlertCircle className="text-error-500" size={20} />,
    warning: <FiAlertCircle className="text-warning-500" size={20} />,
    info: <FiInfo className="text-primary-500" size={20} />,
  };
  
  const bgColors = {
    success: 'bg-success-50 border-success-200',
    error: 'bg-error-50 border-error-200',
    warning: 'bg-warning-50 border-warning-200',
    info: 'bg-primary-50 border-primary-200',
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      className={clsx(
        'flex items-center p-4 mb-3 rounded-lg border shadow-lg min-w-70 max-w-md',
        bgColors[type]
      )}
    >
      <div className="flex-0 mr-3">{icons[type]}</div>
      <div className="flex-1 text-sm text-secondary-900">{message}</div>
      <button
        onClick={() => onClose(id)}
        className="flex-0 ml-4 text-secondary-400 hover:text-secondary-600"
      >
        <FiX size={16} />
      </button>
    </motion.div>
  );
};

export default Toast;
