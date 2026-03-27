import { motion } from 'framer-motion';

const FadeIn = ({ 
  children, 
  delay = 0, 
  duration = 0.5, 
  direction = 'up',
  distance = 20,
  className = '',
  once = true,
  threshold = 0.1
}) => {
  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {}
  };
  
  const variants = {
    hidden: {
      opacity: 0,
      ...directions[direction]
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: 'easeOut'
      }
    }
  };
  
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, threshold }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;
