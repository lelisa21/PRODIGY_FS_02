import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { 
  FiMail, FiLock, FiLogIn, FiCompass 
} from 'react-icons/fi';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';

const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password is too long'),
  rememberMe: z.boolean().optional(),
});

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const { error: showError, success: showSuccess } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });
  
  const onSubmit = async (data) => {
    const result = await login(data.email, data.password, data.rememberMe);
    if (result.success) {
      showSuccess('🎉 Welcome back! Login successful');
      navigate('/app/dashboard');
    } else {
      showError(result.error || 'Login failed. Please check your credentials.');
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-5xl mx-auto"
    >
      {/* Same split-screen layout as Register */}
      <div className="flex flex-col lg:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* LEFT SIDE - Same welcoming brand area */}
        <div className="lg:w-5/12 bg-gradient-to-br from-[#321555] via-teal-600 to-blue-600 p-5 flex flex-col justify-between relative overflow-hidden">
          
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                <FiCompass className="text-white text-2xl" />
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tighter"> GreatTeam</h2>
            </div>
            
            <h1 className="text-3xl font-semibold text-white leading-none tracking-tighter mb-6">
              Welcome back! 👋
            </h1>
            <p className="text-indigo-100 text-xl">
              Great to see you again. Let's get back to building amazing things.
            </p>
            
            {/* Trust signals */}
            <div className="mt-12 space-y-6 text-white/90">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">⚡</div>
                <div>
                  <p className="font-medium">Lightning fast login</p>
                  <p className="text-sm opacity-80">Less than 3 seconds</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">🔒</div>
                <div>
                  <p className="font-medium">Enterprise-grade security</p>
                  <p className="text-sm opacity-80">Your data stays safe</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">🌍</div>
                <div>
                  <p className="font-medium">Built for global teams</p>
                  <p className="text-sm opacity-80">From Addis Ababa to the world</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom illustration */}
          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 text-white border border-white/20">
              <p className="italic text-lg">"I'm back and ready to deep into  it todays work!"</p>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center text-xl">🚀</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Clean Login Form */}
        <div className=" p-8 lg:p-12 flex flex-col bg-white">
          <div className=" mx-auto w-full flex-1 flex flex-col justify-center">
            
            {/* Form header */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-semibold text-gray-900">Sign in to TeamFlow</h1>
              <p className="text-gray-500 mt-3">Access your workspace and continue where you left off</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <Input
                label="Work Email"
                type="email"
                placeholder="abeba@futurecompany.com"
                icon={<FiMail />}
                error={errors.email?.message}
                required
                {...register('email')}
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={<FiLock />}
                error={errors.password?.message}
                required
                {...register('password')}
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 w-5 h-5 accent-indigo-600 border-2 border-gray-300 rounded-xl focus:ring-0 cursor-pointer"
                    {...register('rememberMe')}
                  />
                  <span className="ml-3 text-gray-600">Remember me</span>
                </label>
                
                <Link
                  to="/forgot-password"
                  className="text-teal-600 hover:text-teal-700 font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full text-lg font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all"
                icon={<FiLogIn />}
              >
                Sign In
              </Button>
            </form>

            {/* Already have account link */}
            <div className="mt-8 text-center">
              <p className="text-gray-500">
                New here?{' '}
                <Link 
                  to="/register" 
                  className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                >
                  Create an account →
                </Link>
              </p>
            </div>

            {/* Divider */}
            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="px-4 bg-white text-gray-400">or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-2xl py-4 px-6 transition-all active:scale-95">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
                <span className="font-medium text-gray-700">Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-2xl py-4 px-6 transition-all active:scale-95">
                <img src="https://github.com/favicon.ico" alt="GitHub" className="w-6 h-6" />
                <span className="font-medium text-gray-700">GitHub</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginForm;
