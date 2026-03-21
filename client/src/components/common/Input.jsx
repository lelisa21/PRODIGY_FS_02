import  { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Input = ({
  label,
  type = 'text',
  error,
  success,
  icon,
  iconPosition = 'left',
  helper,
  required,
  fullWidth = true,
  className,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  const baseStyles = 'block rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';
  
  const stateStyles = error
    ? 'border-error-500 bg-error-50 text-error-900 focus:ring-error-500'
    : success
    ? 'border-success-500 bg-success-50 text-success-900 focus:ring-success-500'
    : 'border-secondary-300 bg-white text-secondary-900 hover:border-secondary-400 focus:border-primary-500';
  
  const sizeStyles = 'px-4 py-2.5 text-base';
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <div className={clsx('mb-4', widthClass, className)}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700 mb-1.5">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
            {icon}
          </div>
        )}
        <input
          type={inputType}
          className={clsx(
            baseStyles,
            stateStyles,
            sizeStyles,
            icon && iconPosition === 'left' && 'pl-10',
            icon && iconPosition === 'right' && 'pr-10',
            type === 'password' && 'pr-12'
          )}
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
            {icon}
          </div>
        )}
      </div>
      <AnimatePresence>
        {(error || helper) && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={clsx('text-sm mt-1', error ? 'text-error-500' : 'text-secondary-500')}
          >
            {error || helper}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Input;
