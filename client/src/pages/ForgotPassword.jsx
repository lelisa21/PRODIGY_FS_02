import { motion } from 'framer-motion';
import { ForgotPassword as ForgotPasswordForm } from '../components/auth';
import ParticleBackground from '../components/animations/ParticleBackground';

const ForgotPassword = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ParticleBackground particleCount={40} color="#f9a155" opacity={0.2} />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 mx-auto p-6 flex justify-center"
      >
        <ForgotPasswordForm />
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
