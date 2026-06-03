import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  FiArrowRight,
  FiBriefcase,
  FiUsers,
  FiTrendingUp,
  FiShield,
  FiBarChart2,
  FiStar,
  FiPlay,
  FiPause,
  FiChevronDown,
  FiCheckCircle,
} from "react-icons/fi";
import Button from "../components/common/Button";
import MagneticButton from "../components/animations/MagneticButton";
import RippleButton from "../components/animations/RippleButton";
import TextReveal from "../components/animations/TextReveal";
import ParticleWave from "../components/animations/ParticleWave";
import FloatingElements from "../components/animations/FloatingElements";
import AnimatedBackground3D from "../components/animations/AnimatedBackground3D";
import UnifiedRope3D from "../components/animations/UnifiedRope3D";
import { useAuthContext } from "../context/AuthContext";
import Footer from "../components/layout/Footer";

const Landing = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const { demoLogin } = useAuthContext();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const scale = useSpring(useTransform(scrollYProgress, [0, 1], [1, 1.2]), {
    stiffness: 100,
    damping: 30,
  });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const features = [
    {
      icon: <FiUsers className="text-3xl" />,
      title: "Employee Management",
      description:
        "Centralized database for all employee information, from onboarding to exit",
      stats: "98%",
      statLabel: "Data Accuracy",
      color: "primary",
    },
    {
      icon: <FiTrendingUp className="text-3xl" />,
      title: "Performance Tracking",
      description:
        "Real-time performance metrics and KPI tracking for better decisions",
      stats: "45%",
      statLabel: "Productivity Increase",
      color: "success",
    },
    {
      icon: <FiBarChart2 className="text-3xl" />,
      title: "Advanced Analytics",
      description:
        "AI-powered insights and predictive analytics for workforce planning",
      stats: "85%",
      statLabel: "Forecast Accuracy",
      color: "warning",
    },
    {
      icon: <FiShield className="text-3xl" />,
      title: "Enterprise Security",
      description:
        "Bank-grade security with role-based access and audit trails",
      stats: "99.9%",
      statLabel: "Uptime Guarantee",
      color: "info",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Lamesa",
      role: "HR Director, TechCorp",
      content:
        "This EMS transformed how we manage our 5000+ employees. The analytics and automation saved us 40 hours per week!",
      rating: 5,
      image: "testWomen.png",
    },
    {
      name: "Adonay Tola",
      role: "CEO, InnovateLabs",
      content:
        "The best investment we made this year. The interface is intuitive and the support is exceptional.",
      rating: 5,
      image: "testMan.png",
    },
    {
      name: "Rakeb Dugasa",
      role: "Operations Manager, GlobalTech",
      content:
        "Real-time insights and seamless integration with our existing tools. Absolutely game-changing!",
      rating: 5,
      image:
        "https://t4.ftcdn.net/jpg/06/36/94/27/240_F_636942772_50sjVSej3AtdpJ4W2494gSa4MkkE2XyZ.jpg",
    },
  ];

  const platformHighlights = [
    "One-click demo login with seeded workforce data",
    "Role-based dashboards, employee profiles, audit logs, and reports",
    "Express, MongoDB, JWT auth, Socket.IO, React Query, Zustand, and Vite",
    "Security middleware, validation, rate limiting, and production checks",
  ];

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    await demoLogin();
    setIsDemoLoading(false);
  };

  //   const stats = [
  //     { value: "1000+", label: "Active Users", icon: <FiUsers /> },
  //     { value: "50+", label: "Enterprise Clients", icon: <FiAward /> },
  //     { value: "91.9%", label: "Uptime", icon: <FiShield /> },
  //     { value: "24/7", label: "Support", icon: <FiCheck /> },
  //   ];

  return (
    <>
    <Helmet>
      <title>GreatTeam EMS | Production-Ready Full-Stack Employee Management</title>
      <meta
        name="description"
        content="Explore GreatTeam EMS, a production-ready full-stack employee management platform with one-click demo login, workforce analytics, RBAC, audit logs, reports, and real-time messaging."
      />
      <meta property="og:title" content="GreatTeam EMS | Platform Demo" />
      <meta property="og:description" content="One-click demo of a production-grade React, Express, MongoDB, and Socket.IO employee management platform." />
      <meta property="og:type" content="website" />
    </Helmet>
    <div className="min-h-screen bg-linear-to-br from-secondary-50 to-white overflow-hidden">
      {/* Animated Backgrounds */}

      <ParticleWave />
      <FloatingElements />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Animated Video Background */}
        <motion.div className="absolute inset-0 z-0" style={{ scale, opacity }}>
          <video
            autoPlay={isVideoPlaying}
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-20"
          >
            <source src="bgVedio.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-linear-to-b from-secondary-900/50 via-transparent to-secondary-900/50" />
        </motion.div>

        {/* Video Control Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-8 right-8 z-20 p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all"
          onClick={() => setIsVideoPlaying(!isVideoPlaying)}
          aria-label={isVideoPlaying ? "Pause background video" : "Play background video"}
        >
          {isVideoPlaying ? (
            <FiPause className="text-white" />
          ) : (
            <FiPlay className="text-white" />
          )}
        </motion.button>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-block px-4 py-2 rounded-full bg-primary-500/10 backdrop-blur-sm border border-primary-500/20 mb-6"
            >
              <span className="text-primary-500 text-sm font-medium">
                Production-ready workforce management platform
              </span>
            </motion.div>

            <TextReveal
              text="GreatTeam Employee Management System"
              className="text-4xl sm:text-6xl md:text-7xl font-bold text-secondary-900 mb-6"
              delay={0.3}
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-secondary-600  mx-auto mb-10"
            >
              A production-minded HR platform with RBAC, analytics, audit
              activity, employee operations, reports, and real-time messaging.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <RippleButton
                onClick={handleDemoLogin}
                disabled={isDemoLoading}
                className="px-8 py-4 bg-linear-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all disabled:opacity-70"
              >
                {isDemoLoading ? "Loading Demo..." : "Try Demo"}
                <FiBriefcase className="inline ml-2" />
              </RippleButton>
              <Link to="/login">
                <MagneticButton className="px-8 py-4 bg-white border-2 border-primary-500 text-primary-600 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-all">
                  Sign In
                </MagneticButton>
              </Link>
            </motion.div>

            {/* Stats
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-primary-500">
                    {stat.value}
                  </div>
                  <div className="text-sm text-secondary-500 mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div> */}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <FiChevronDown className="text-secondary-400 text-2xl" />
        </motion.div>
      </section>

      <section className="relative py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600 mb-3">
              Explore the platform instantly
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
              Try a complete workspace without creating an account.
            </h2>
            <p className="text-lg text-secondary-600 mb-6">
              The demo account skips registration, seeds a realistic company
              dataset, and opens directly into the dashboards and workflows that
              make workforce operations easier to manage.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                onClick={handleDemoLogin}
                isLoading={isDemoLoading}
                icon={<FiBriefcase />}
                size="lg"
              >
                Launch Demo
              </Button>
              <Link to="/about-project">
                <Button type="button" variant="outline" size="lg" icon={<FiArrowRight />} iconPosition="right">
                  Technical Overview
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {platformHighlights.map((highlight) => (
              <div
                key={highlight}
                className="flex gap-3 rounded-lg border border-secondary-200 bg-secondary-50 p-4"
              >
                <FiCheckCircle className="mt-1 shrink-0 text-success" />
                <p className="text-secondary-700">{highlight}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
              Powerful Features for Modern Enterprises
            </h2>
            <p className="text-xl text-secondary-600 max-w-7xl mx-auto">
              Everything you need to manage your workforce efficiently
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative bg-white rounded-2xl p-6 shadow-soft hover:shadow-hard transition-all duration-300"
              >
                <div
                  className={`w-16 h-16 rounded-xl bg-${feature.color}-100 flex items-center justify-center text-${feature.color}-600 mb-4 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-secondary-600 mb-4">{feature.description}</p>
                <div className="border-t border-secondary-200 pt-4">
                  <div className="text-2xl font-bold text-primary-500">
                    {feature.stats}
                  </div>
                  <div className="text-sm text-secondary-500">
                    {feature.statLabel}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-10 overflow-hidden">
        <div className="absolute inset-0 z-10">
          <AnimatedBackground3D />
        </div>

        <div className="relative z-10">
          <UnifiedRope3D />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white/80 backdrop-blur-md rounded-2xl p-12 max-w-7xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
              Experience the Future of HR
            </h2>
            <p className="text-xl text-secondary-600 mb-8">
              Join thousands of companies that have revolutionized their
              workforce management
            </p>
            <Link to="/register">
              <Button
                variant="primary"
                size="lg"
                icon={<FiArrowRight />}
                iconPosition="right"
              >
                Start Your Journey
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-secondary-600 max-w-5xl mx-auto">
              See what our clients say about their experience with EMS
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-6 shadow-soft"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-secondary-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-secondary-500">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="text-warning-500 fill-current" />
                  ))}
                </div>
                <p className="text-secondary-600">{testimonial.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-linear-to-r from-primary-500 to-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Workforce?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of businesses already using EMS
            </p>
            <Link to="/register">
              <MagneticButton className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg hover:shadow-xl transition-all">
                Get Started Today
                <FiArrowRight className="inline ml-2" />
              </MagneticButton>
            </Link>
          </motion.div>
        </div>
      </section>

      <section><Footer /> </section>
    </div>
    </>
  );
};

// 3D Rope Animation Component
const RopeAnimation3D = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = 200;
    };

    class RopePoint {
      constructor(x, y, index) {
        this.x = x;
        this.y = y;
        this.originalX = x;
        this.originalY = y;
        this.index = index;
        this.vx = 0;
        this.vy = 0;
      }

      update(time) {
        // Create wave motion
        const waveX = Math.sin(time * 2 + this.index * 0.1) * 20;
        const waveY = Math.cos(time * 1.5 + this.index * 0.15) * 15;

        this.x = this.originalX + waveX;
        this.y =
          this.originalY + waveY + Math.sin(time * 3 + this.index * 0.2) * 5;
      }

      draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249, 161, 185, ${0.3 + Math.sin(time * 2 + this.index * 0.1) * 0.2})`;
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(249, 161, 185, 0.5)";
      }
    }

    let points = [];
    const numPoints = 50;
    const spacing = 15;

    const initRope = () => {
      points = [];
      const startX = (canvas.width - (numPoints - 1) * spacing) / 2;
      const startY = canvas.height / 2;

      for (let i = 0; i < numPoints; i++) {
        points.push(new RopePoint(startX + i * spacing, startY, i));
      }
    };

    const drawConnections = () => {
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];

        const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        gradient.addColorStop(
          0,
          `rgba(249, 161, 185, ${0.2 + Math.sin(time * 2 + i * 0.05) * 0.1})`,
        );
        gradient.addColorStop(
          1,
          `rgba(232, 134, 156, ${0.2 + Math.cos(time * 2 + i * 0.05) * 0.1})`,
        );

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2 + Math.sin(time * 3 + i * 0.1) * 0.5;
        ctx.stroke();

        // Add glow effect
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(249, 161, 185, 0.1)`;
        ctx.lineWidth = 6;
        ctx.stroke();
      }
    };

    const drawParticles = () => {
      for (let i = 0; i < points.length; i++) {
        points[i].draw(ctx);
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      time += 0.02;

      points.forEach((point) => point.update(time));

      drawConnections();
      drawParticles();

      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initRope();
    animate();

    window.addEventListener("resize", () => {
      resizeCanvas();
      initRope();
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-100px pointer-events-none"
      style={{ background: "transparent" }}
    />
  );
};

export default Landing;
