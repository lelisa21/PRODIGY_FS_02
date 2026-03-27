import  { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FlipCard = ({ front, back, className = '' }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <div
      className={`relative cursor-pointer ${className}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <AnimatePresence mode="wait">
        {!isFlipped ? (
          <motion.div
            key="front"
            initial={{ rotateY: 180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -180, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
            style={{ transformStyle: "preserve-3d" }}
          >
            {front}
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: -180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 180, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
            style={{ transformStyle: "preserve-3d" }}
          >
            {back}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FlipCard;
