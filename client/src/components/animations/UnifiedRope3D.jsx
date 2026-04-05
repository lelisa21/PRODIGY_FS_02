import { useEffect, useRef } from "react";

const UnifiedRope3D = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = 220;
    };

    // Rope point
    class RopePoint {
      constructor(x, y, index) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.index = index;
      }

      update(time) {
        const wave = Math.sin(time * 2 + this.index * 0.2);

        this.x = this.baseX + wave * 20;
        this.y =
          this.baseY +
          Math.cos(time * 1.5 + this.index * 0.25) * 15 +
          wave * 5;
      }
    }

    //  Particles linked to rope
    class Particle {
      constructor(point) {
        this.point = point;
        this.offset = Math.random() * 20;
        this.size = Math.random() * 2 + 1;
      }

      draw(time) {
        const x = this.point.x + Math.sin(time + this.offset) * 10;
        const y = this.point.y + Math.cos(time + this.offset) * 10;

        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fill();
      }
    }

    let points = [];
    let particles = [];

    const init = () => {
      points = [];
      particles = [];

      const count = 60;
      const spacing = canvas.width / count;
      const centerY = canvas.height / 2;

      for (let i = 0; i < count; i++) {
        const p = new RopePoint(i * spacing, centerY, i);
        points.push(p);

        if (i % 2 === 0) {
          particles.push(new Particle(p));
        }
      }
    };

    //  Draw rope with depth (fake 3D)
    const drawRope = () => {
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];

        // depth illusion
        const depth = (Math.sin(time * 2 + i * 0.1) + 1) / 2;

        const gradient = ctx.createLinearGradient(
          p1.x,
          p1.y,
          p2.x,
          p2.y
        );

        gradient.addColorStop(
          0,
          `rgba(99,102,241,${0.2 + depth * 0.5})`
        );
        gradient.addColorStop(
          1,
          `rgba(236,72,153,${0.2 + (1 - depth) * 0.5})`
        );

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2 + depth * 2;
        ctx.stroke();

        // glow
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(99,102,241,0.1)`;
        ctx.lineWidth = 8;
        ctx.stroke();
      }
    };

    const drawParticles = () => {
      particles.forEach((p) => p.draw(time));
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      time += 0.02;

      points.forEach((p) => p.update(time));

      drawRope();
      drawParticles();

      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    init();
    animate();

    window.addEventListener("resize", () => {
      resizeCanvas();
      init();
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[220px] pointer-events-none"
    />
  );
};

export default UnifiedRope3D;
