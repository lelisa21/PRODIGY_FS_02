import { motion } from 'framer-motion';

const FloatingElements = () => {
  const elements = [
    { icon: "📞", x: "10%", y: "20%", delay: 0 },
    { icon: "👥", x: "85%", y: "15%", delay: 0.5 },
    { icon: "📈", x: "15%", y: "70%", delay: 1 },
    { icon: "💼", x: "75%", y: "80%", delay: 1.5 },
    { icon: "📧", x: "90%", y: "45%", delay: 2 },
    { icon: "⭐", x: "5%", y: "85%", delay: 2.5 },
    { icon: "🔗", x: "50%", y: "5%", delay: 3 },
    { icon: "💡", x: "45%", y: "92%", delay: 3.5 },
  ];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {elements.map((element, index) => (
        <motion.div
          key={index}
          className="absolute text-4xl opacity-20"
          style={{ left: element.x, top: element.y }}
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
