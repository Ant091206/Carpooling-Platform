import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Lock, Mail, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from './AuthLayout.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid work email').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
});

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      rememberMe: false
    }
  });

  const onSubmit = async (data) => {
    const res = await login(data.email, data.password);
    if (res.success) {
      toast.success('Welcome back to EnterprisePool!');
      const savedUser = JSON.parse(localStorage.getItem('user'));
      
      // Perform role-based redirects
      if (savedUser?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      toast.error(res.message || 'Login failed. Please verify credentials.');
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with your work account to manage rides and payments."
      footer={
        <div className="text-xs text-slate-600 font-semibold mt-6">
          New to EnterprisePool?{' '}
          <Link to="/register" className="font-extrabold text-[#10B981] hover:underline">
            Create account
          </Link>
        </div>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input 
            icon={Mail} 
            label="Work email" 
            type="email" 
            placeholder="you@company.com" 
            error={errors.email?.message} 
            {...register('email')} 
          />
          
          <div className="relative">
            <Input 
              icon={Lock}
              label="Password" 
              type={showPassword ? "text" : "password"} 
              placeholder="Enter password" 
              error={errors.password?.message} 
              {...register('password')} 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-[38px] text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                className="h-4.5 w-4.5 rounded-lg border-slate-200 text-[#10B981] focus:ring-[#10B981] accent-[#10B981]" 
                {...register('rememberMe')} 
              />
              <span className="text-xs text-[#334155] font-extrabold tracking-wide uppercase">
                Remember Me
              </span>
            </label>
            <Link 
              to="/forgot-password"
              className="text-xs font-extrabold text-[#10B981] hover:underline tracking-wide uppercase"
            >
              Forgot Password?
            </Link>
          </div>

          <Button 
            type="submit" 
            loading={loading} 
            className="w-full mt-2" 
            size="lg"
            icon={LogIn}
          >
            Sign In
          </Button>
        </form>
      </motion.div>
    </AuthLayout>
  );
}
