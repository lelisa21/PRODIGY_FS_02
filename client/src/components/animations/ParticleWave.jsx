import  { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const ParticleWave = () => {
  const controls = useAnimation();
  const particles = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 5,
    delay: Math.random() * 5,
  }));
  
  useEffect(() => {
    const handleResize = () => {
      controls.start({
        transition: { duration: 0 }
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [controls]);
  
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-linear-to-r from-blue-700/30 to-primary-600/30"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.x,
            top: particle.y,
          }}
          animate={{
            y: [particle.y, particle.y - 100, particle.y],
            x: [particle.x, particle.x + (Math.random() - 0.5) * 50, particle.x],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default ParticleWave;
