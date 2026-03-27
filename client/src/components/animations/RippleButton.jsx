import  { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RippleButton = ({ children, className = '', onClick, ...props }) => {
  const [ripples, setRipples] = useState([]);
  
  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height);
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
      size,
    };
    
    setRipples([...ripples, newRipple]);
    
    if (onClick) onClick(e);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };
  
  return (
    <button
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white/30"
            initial={{
              width: 0,
              height: 0,
              left: ripple.x,
              top: ripple.y,
              opacity: 0.6,
            }}
            animate={{
              width: ripple.size,
              height: ripple.size,
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              opacity: 0,
            }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
            exit={{ opacity: 0 }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
};

export default RippleButton;
