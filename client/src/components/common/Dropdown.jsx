import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { FiChevronDown } from 'react-icons/fi';

const Dropdown = ({
  trigger,
  children,
  align = 'left',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const alignments = {
    left: 'left-0',
    right: 'right-0',
  };
  
  return (
    <div className={clsx('relative inline-block', className)} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.1 }}
            className={clsx(
              'absolute z-50 mt-2 min-w-40 bg-white rounded-lg shadow-lg border border-secondary-200 overflow-hidden',
              alignments[align]
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const DropdownItem = ({ children, onClick, className, icon }) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center w-full px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors',
        className
      )}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Dropdown;
