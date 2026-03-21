import React from 'react';
import { motion } from 'framer-motion';
import { LoginForm } from '../components/auth';
import ParticleBackground from '../components/animations/ParticleBackground';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ParticleBackground particleCount={50} color="#f9a155" opacity={0.2} />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 w-full max-w-md mx-auto p-6"
      >
        <LoginForm />
      </motion.div>
    </div>
  );
};

export default Login;
