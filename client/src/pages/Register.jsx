import { motion } from 'framer-motion';
import { RegisterForm } from '../components/auth';
import AnimatedBackground from '../components/animations/AnimatedBackground';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12">
      <AnimatedBackground />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl mx-auto p-6"
      >
        <RegisterForm />
      </motion.div>
    </div>
  );
};

export default Register;
