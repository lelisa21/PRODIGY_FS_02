import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome } from 'react-icons/fi';
import Button from '../components/common/Button';
import ParticleBackground from '../components/animations/ParticleBackground';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ParticleBackground particleCount={30} opacity={0.1} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center p-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10 }}
          className="text-8xl sm:text-9xl font-bold bg-linear-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent mb-6"
        >
          404
        </motion.div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-4">
          Page Not Found
        </h1>
        
        <p className="text-secondary-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Link to="/app/dashboard">
          <Button variant="primary" size="lg" icon={<FiHome />}>
            Back to Dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
