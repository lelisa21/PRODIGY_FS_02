import { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const AnimatedNumber = ({ 
  value, 
  duration = 0.5,
  format = (val) => val,
  className = '',
  prefix = '',
  suffix = ''
}) => {
  const nodeRef = useRef();
  const springValue = useSpring(0, {
    duration: duration * 1000,
    bounce: 0
  });
  
  useEffect(() => {
    springValue.set(value);
  }, [springValue, value]);
  
  const displayValue = useTransform(springValue, (current) => {
    return format(Math.round(current));
  });
  
  return (
    <motion.span className={className} ref={nodeRef}>
      {prefix.get ? prefix.get(displayValue) : prefix}
      {displayValue && displayValue.get ? displayValue.get() : displayValue}
      {suffix && suffix.get ? suffix.get(displayValue) : suffix}
    </motion.span>
  );
};

export default AnimatedNumber;
