import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { FiLock, FiCheckCircle, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import Button from '../common/Button';
import Input from '../common/Input';
import { useToast } from '../../context/ToastContext';
import authService from '../../services/auth.service';

const resetSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { success: showSuccess, error: showError } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      setIsSubmitted(true);
      showSuccess('Password reset successfully');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-secondary-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiLock size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-secondary-900">Reset Password</h1>
          <p className="text-secondary-600 mt-2">
            Create a new password for your account
          </p>
        </div>
        
        {!isSubmitted ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              icon={<FiLock />}
              error={errors.password?.message}
              required
              {...register('password')}
            />
            
            <Input
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your new password"
              icon={<FiLock />}
              error={errors.confirmPassword?.message}
              required
              {...register('confirmPassword')}
            />
            
            <div className="bg-secondary-50 rounded-lg p-3 text-xs text-secondary-600 space-y-1">
              <p>Password must contain:</p>
              <ul className="list-disc list-inside ml-2 space-y-0.5">
                <li>At least 8 characters</li>
                <li>At least one uppercase letter</li>
                <li>At least one lowercase letter</li>
                <li>At least one number</li>
                <li>At least one special character</li>
              </ul>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              icon={<FiCheckCircle />}
            >
              Reset Password
            </Button>
            
            <div className="text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700">
                <FiArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="p-4 bg-success-50 rounded-lg">
              <FiCheckCircle size={48} className="mx-auto text-success-500 mb-3" />
              <p className="text-success-700 font-medium mb-2">
                Password Reset Successful!
              </p>
              <p className="text-success-600 text-sm">
                Your password has been reset successfully. Redirecting to login...
              </p>
            </div>
            <Link to="/login">
              <Button variant="primary" fullWidth>
                Go to Login
              </Button>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ResetPassword;
