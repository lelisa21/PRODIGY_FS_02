import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock } from 'react-icons/fi';
import Button from '../components/common/Button';

const NotAuthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 border border-secondary-100 text-center max-w-md w-full"
      >
        <div className="w-16 h-16 bg-warning-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiLock size={32} className="text-warning-600" />
        </div>
        <h1 className="text-2xl font-bold text-secondary-900">Access Restricted</h1>
        <p className="text-secondary-600 mt-2">
          You don’t have permission to view this page.
        </p>
        <div className="mt-6 flex justify-center">
          <Link to="/app/dashboard">
            <Button variant="primary">Back to Dashboard</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotAuthorized;
