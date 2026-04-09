import  { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { FiMail, FiSend, FiArrowLeft } from 'react-icons/fi';
import Button from '../common/Button';
import Input from '../common/Input';
import { useToast } from '../../context/ToastContext';
import authService from '../../services/auth.service';

const forgotSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
});

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { success: showSuccess, error: showError } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: '',
    },
  });
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSubmitted(true);
      showSuccess('Password reset link sent to your email');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-7xl"
    >
      <div className="bg-white rounded-2xl max-w-100 shadow-xl p-4 border border-secondary-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-secondary-900">Forgot Password?</h1>
          <p className="text-secondary-600 mt-2">
            Enter your email and we'll send you a link to reset your password
          </p>
        </div>
        
        {!isSubmitted ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@company.com"
              icon={<FiMail />}
              error={errors.email?.message}
              required
              {...register('email')}
            />
            
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              icon={<FiSend />}
            >
              Send Reset Link
            </Button>
            
            <div className="text-center">
              <Link to="/login" className="inline-flex items-center gap-2  text-[#0286bf] hover:text-primary-400">
                <FiArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="p-4 bg-success-50 rounded-lg">
              <p className="text-success-700 dark:text-gray-500">
                Password reset link has been sent to your email address.
                Please check your inbox and follow the instructions.
              </p>
            </div>
            <Link to="/login">
              <Button variant="primary" fullWidth>
                Return to Login
              </Button>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ForgotPassword;
