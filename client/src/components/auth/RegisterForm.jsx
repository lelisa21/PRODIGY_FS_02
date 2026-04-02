import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { 
  FiUser, FiMail, FiLock, FiBriefcase, 
  FiUserPlus
} from 'react-icons/fi';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';

const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long'),
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  const { error: showError, success: showSuccess } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      department: '',
      position: '',
      phone: '',
    },
  });
  
const onSubmit = async (data) => {
  const { confirmPassword, name, phone, ...registerData } = data;

  const [firstName, ...lastNameArr] = name.trim().split(" ");
  const lastName = lastNameArr.join(" ") || "";
  
  const payload = {
    ...registerData,
    profile: {
      firstName,
      lastName,
      phone: phone || ""
    }
  };

  const result = await registerUser(payload);
  if (result.success) {
    showSuccess(result.message || 'Account created successfully! Please login.');
    navigate('/login');
  } else {
    showError(result.error);
  }
};
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full  max-w-4xl"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-secondary-100 w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-linear-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiUserPlus size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-secondary-900">Create Account</h1>
          <p className="text-secondary-600 mt-2">Join our enterprise management system</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="laloo hailu"
              icon={<FiUser />}
              error={errors.name?.message}
              required
              {...register('name')}
            />
            
            <Input
              label="Email Address"
              type="email"
              placeholder="lalo@featurecompany.com"
              icon={<FiMail />}
              error={errors.email?.message}
              required
              {...register('email')}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Department"
              placeholder="Engineering"
              icon={<FiBriefcase />}
              error={errors.department?.message}
              required
              {...register('department')}
            />
            
            <Input
              label="Position"
              placeholder="Software Engineer"
              icon={<FiBriefcase />}
              error={errors.position?.message}
              required
              {...register('position')}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              placeholder="Create a strong password"
              icon={<FiLock />}
              error={errors.password?.message}
              required
              {...register('password')}
            />
            
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              icon={<FiLock />}
              error={errors.confirmPassword?.message}
              required
              {...register('confirmPassword')}
            />
          </div>
          
          <Input
            label="Phone Number (Optional)"
            type="tel"
            placeholder="+1 234 567 8900"
            icon={<FiMail />}
            error={errors.phone?.message}
            {...register('phone')}
          />
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
              required
            />
            <span className="text-sm text-secondary-600">
              I agree to the{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700">Privacy Policy</a>
            </span>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            icon={<FiUserPlus />}
          >
            Create Account
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-secondary-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-secondary-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-secondary-500">Or continue with</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors">
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            <span className="text-sm font-medium text-secondary-700">Google</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors">
            <img src="https://github.com/favicon.ico" alt="GitHub" className="w-5 h-5" />
            <span className="text-sm font-medium text-secondary-700">GitHub</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterForm;
