import { useState } from 'react';
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
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={clsx(fullWidth ? 'w-full' : '', className)}>
      {label && (
        <label className="block text-md font-medium text-gray-500 dark:text-gray-500 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900 pointer-events-none">
            {icon}
          </div>
        )}

        <input
          type={inputType}
          className={clsx(
            'block w-full rounded-md border border-amber-400 bg-white dark:bg-gray-900',
            'border-gray-100 dark:border-gray-700',
            'text-gray-900 dark:text-white',
            'px-4 py-3 text-base',
            'focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/30',
            'hover:border-gray-400 dark:hover:border-gray-100 transition-all duration-200',
            icon && iconPosition === 'left' && 'pl-9',
            ((icon && iconPosition === 'right') || type === 'password') && 'pr-11'
          )}
          {...props}
        />

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        )}

        {icon && iconPosition === 'right' && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}
      </div>

      <AnimatePresence>
        {(error || helper) && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-sm mt-1.5 ${error ? 'text-red-500' : 'text-gray-500'}`}
          >
            {error || helper}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Input;
