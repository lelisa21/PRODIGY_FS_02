import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const Loader = ({ size = 'md', fullScreen = false, className }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };
  
  const spinner = (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={clsx(
        'border-4 border-primary-200 border-t-primary-500 rounded-full',
        sizes[size],
        className
      )}
    />
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }
  
  return spinner;
};

export default Loader;
