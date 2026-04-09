import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { 
  FiUser, FiMail, FiLock, FiBriefcase, 
  FiUserPlus, FiPhone, FiCompass
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
    showSuccess(result.message || '🎉 Account created! Welcome to the team!');
    navigate('/login');
  } else {
    showError(result.error);
  }
};
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-5xl mx-auto"
    >
      {/* New split-screen modern design - left: happy welcome + illustration vibe, right: clean form */}
      <div className="flex flex-col lg:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* LEFT SIDE - Welcoming brand area (makes you feel happy & excited) */}
        <div className="lg:w-5/12 bg-gradient-to-br from-[#321555] via-teal-600 to-blue-600 p-5 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle background sparkles / happy pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-8 h-8 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-1/3 right-12 w-6 h-6 bg-white rounded-full animate-pulse delay-300"></div>
            <div className="absolute bottom-1/4 left-1/4 w-10 h-10 bg-white rounded-full animate-pulse delay-700"></div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                <FiCompass className="text-white text-2xl" />
              </div>
               <h2 onClick = {() => navigate("/")} className="text-3xl font-bold text-white tracking-tighter cursor-pointer"> GreatTeam</h2>
            </div>
            
            <h1 className="text-3xl font-semibold text-white leading-none tracking-tighter mb-6">
              Welcome to the<br />future of work! ✨
            </h1>
            <p className="text-indigo-100 text-xl ">
              Join thousands of teams already streamlining their enterprise magic.
            </p>
            
            {/* Happy micro-copy + trust signals */}
            <div className="mt-12 space-y-6 text-white/90">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">🚀</div>
                <div>
                  <p className="font-medium">Setup in under 60 seconds</p>
                  <p className="text-sm opacity-80">No credit card. No hassle.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">🔒</div>
                <div>
                  <p className="font-medium">Enterprise-grade security</p>
                  <p className="text-sm opacity-80">Your data stays safe and sound</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">🌍</div>
                <div>
                  <p className="font-medium">Built for global teams</p>
                  <p className="text-sm opacity-80">From Addis Ababa to anywhere</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom happy illustration / quote */}
          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 text-white border border-white/20">
              <p className="italic text-lg">"signing up!"</p>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-9 h-9 bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center text-xl">👋</div>
            
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - The actual form (clean, spacious, premium) */}
        <div className=" p-4 lg:p- flex flex-col bg-amber-200/15">
          
          <div className="max-w-4xl mx-auto w-full">
            {/* Form header */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-semibold text-gray-900">Create your account</h1>
              <p className="text-gray-500 mt-3">Let's make your team unstoppable</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 ">
              
              {/* Two-column grid - feels modern and fast */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ">
                <Input
                  label="Full Name"
                  placeholder="Abeba Worku"
                  icon={<FiUser />}
                  error={errors.name?.message}
                  required
                  {...register('name')}
                />
                <Input
                  label="Work Email"
                  type="email"
                  placeholder="abeba@futurecompany.com"
                  icon={<FiMail />}
                  error={errors.email?.message}
                  required
                  {...register('email')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input
                  label="Department"
                  placeholder="Engineering"
                  icon={<FiBriefcase />}
                  error={errors.department?.message}
                  required
                  {...register('department')}
                />
                
                <Input
                  label="Your Position"
                  placeholder="Software Engineer"
                  icon={<FiBriefcase />}
                  error={errors.position?.message}
                  required
                  {...register('position')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Create Password"
                  type="password"
                  placeholder="••••••••"
                  icon={<FiLock />}
                  error={errors.password?.message}
                  required
                  {...register('password')}
                
                />
                
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  icon={<FiLock />}
                  error={errors.confirmPassword?.message}
                  required
                  {...register('confirmPassword')}
                />
              </div>

              <Input
                label="Phone Number (Optional)"
                type="tel"
                placeholder="+251 9XX XXX XXX"
                icon={<FiPhone />}
                error={errors.phone?.message}
                {...register('phone')}
              />

              {/* Terms - modern & friendly */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 w-5 h-5 accent-indigo-600 border-2 border-gray-300 rounded-xl focus:ring-0 cursor-pointer"
                  required
                />
                <span className="text-md text-gray-600 leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-teal-600 hover:text-teal-700 font-medium underline-offset-2 hover:underline">Terms</a>
                  {' '}and{' '}
                  <a href="#" className="text-teal-600 hover:text-teal-700 font-medium underline-offset-2 hover:underline">Privacy Policy</a>
                  . Your data is safe with us ❤️
                </span>
              </div>
             
             <div className='flex justify-center mt-4'>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="text-center text-lg font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all align-middle "
                icon={<FiUserPlus />}
              >
                Create my account
              </Button>
             </div>
            </form>

            {/* Already have account */}
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Already part of the team?{' '}
                <Link 
                  to="/login" 
                  className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                >
                  Sign in here →
                </Link>
              </p>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="px-4 bg-white text-gray-400">or continue with</span>
              </div>
            </div>

            {/* Social buttons - modern & bigger */}
            <div className="grid grid-cols-2 gap-4 mb-2xl">
              <button className="flex items-center justify-center gap-3 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-2xl py-4 px-6 transition-all active:scale-95">
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

export default RegisterForm;
