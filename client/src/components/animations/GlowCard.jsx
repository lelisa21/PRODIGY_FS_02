import { motion } from 'framer-motion';

const GlowCard = ({ children, className = '', glowColor = 'primary', ...props }) => {
  const colors = {
    primary: 'rgba(249, 161, 85, 0.5)',
    success: 'rgba(16, 185, 129, 0.5)',
    warning: 'rgba(245, 158, 11, 0.5)',
    error: 'rgba(239, 68, 68, 0.5)',
    info: 'rgba(59, 130, 246, 0.5)',
  };
  
  return (
    <motion.div
      className={`relative bg-white rounded-xl overflow-hidden ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...props}
    >
      {/* Animated gradient border */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${colors[glowColor]}, transparent 70%)`,
          opacity: 0,
        }}
        animate={{
          opacity: [0, 0.3, 0],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Inner content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GlowCard;
