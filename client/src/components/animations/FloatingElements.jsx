import { motion } from 'framer-motion';

const FloatingElements = () => {
  const elements = [
  { icon: "☎", x: "10%", y: "20%", delay: 0, size: "15px", opacity: 0.18, color: "#1a1a1a" },
  { icon: "👤", x: "85%", y: "15%", delay: 0.5, size: "13px", opacity: 0.16, color: "#1a1a1a" },
  { icon: "📉", x: "15%", y: "70%", delay: 1, size: "16px", opacity: 0.19, color: "#1f1f1f" },
  { icon: "📁", x: "75%", y: "80%", delay: 1.5, size: "16px", opacity: 0.17, color: "#222222" },
  { icon: "✉", x: "90%", y: "45%", delay: 2, size: "16px", opacity: 0.18, color: "#1a1a1a" },
  { icon: "★", x: "5%", y: "85%", delay: 2.5, size: "16px", opacity: 0.15, color: "#1f1f1f" },
  { icon: "⟐", x: "50%", y: "5%", delay: 3, size: "16px", opacity: 0.17, color: "#1a1a1a" },
  { icon: "⚡", x: "45%", y: "92%", delay: 3.5, size: "12px", opacity: 0.16, color: "#222222" },
];
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {elements.map((element, index) => (
        <motion.div
          key={index}
          className="absolute text-4xl opacity-20"
          style={{ left: element.x, 
            top: element.y,
            fontSize:element.size,
            opacity:element.opacity,
            color:element.color
          }}
          animate={{
            y: [0, -30, 0, 30, 0],
            x: [0, 20, 0, -20, 0],
            rotate: [0, 10, 0, -10, 0],
          }}
          transition={{
            duration: 8,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {element.icon}
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingElements;
