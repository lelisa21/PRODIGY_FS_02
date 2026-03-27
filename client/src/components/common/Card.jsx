import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const Card = ({
  children,
  className,
  hover = false,
  padding = true,
  onClick,
  ...props
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
      className={clsx(
        'bg-white rounded-xl shadow-soft border border-secondary-200',
        padding && 'p-6',
        hover && 'transition-all duration-200 cursor-pointer hover:shadow-hard',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
