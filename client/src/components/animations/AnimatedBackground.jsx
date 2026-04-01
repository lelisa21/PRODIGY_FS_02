import  { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    let gradientOffset = 0;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create gradient
      const gradient = ctx.createLinearGradient(
        Math.sin(gradientOffset) * 100 + canvas.width / 2,
        Math.cos(gradientOffset) * 100 + canvas.height / 2,
        Math.sin(gradientOffset + Math.PI) * 100 + canvas.width / 2,
        Math.cos(gradientOffset + Math.PI) * 100 + canvas.height / 2
      );
      
      gradient.addColorStop(0, 'rgba(249, 161, 255, 0.05)');
      gradient.addColorStop(0.5, 'rgba(132, 134, 56, 0.05)');
      gradient.addColorStop(1, 'rgba(216, 16, 42, 0.05)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      gradientOffset += 0.005;
      animationFrameId = requestAnimationFrame(animate);
    };
    
    resizeCanvas();
    animate();
    
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default AnimatedBackground;
