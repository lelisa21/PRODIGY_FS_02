import { motion } from 'framer-motion';

const SlideIn = ({ 
  children, 
  direction = 'left', 
  delay = 0, 
  duration = 0.4,
  className = '',
  once = true
}) => {
  const directions = {
    left: { x: -50, opacity: 0 },
    right: { x: 50, opacity: 0 },
    top: { y: -50, opacity: 0 },
    bottom: { y: 50, opacity: 0 }
  };
  
  const variants = {
    hidden: directions[direction],
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };
  
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default SlideIn;
