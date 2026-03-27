import { motion } from 'framer-motion';

const ScaleIn = ({ 
  children, 
  delay = 0, 
  duration = 0.3,
  scale = 0.9,
  className = '',
  once = true
}) => {
  const variants = {
    hidden: {
      opacity: 0,
      scale: scale
    },
    visible: {
      opacity: 1,
      scale: 1,
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

export default ScaleIn;
