import  { useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const AnimatedBackground3D = () => {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });
  
  const rotateX = useTransform(springY, [-300, 300], [15, -15]);
  const rotateY = useTransform(springX, [-300, 300], [-15, 15]);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        mouseX.set(x);
        mouseY.set(y);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);
  
  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-125 h-125 rounded-full bg-linear-to-r from-primary-500/20 to-primary-600/20 blur-3xl"
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -50, 100, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-150px h-150px rounded-full bg-linear-to-r from-secondary-500/10 to-primary-400/10 blur-3xl"
        animate={{
          x: [0, -100, 50, 0],
          y: [0, 50, -100, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* 3D rotating cube effect */}
      <motion.div
        className="absolute -z-40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
      >
        <div className="relative w-100 h-50">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 border-2 border-b-blue-700 rounded-2xl"
              style={{
                rotateX: i * 30,
                rotateY: i * 45,
                rotateZ: i * 60,
              }}
              animate={{
                rotateX: [0, 360],
                rotateY: [0, 360],
              }}
              transition={{
                duration: 20 + i * 5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>
      </motion.div>
      
      {/* Floating particles */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-500/30 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
            ],
            y: [
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
            ],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground3D;
