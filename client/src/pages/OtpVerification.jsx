import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ShieldCheck, ArrowLeft, RefreshCw, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../services/api.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Card from '../components/ui/Card.jsx';

const resetSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Confirm password is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export default function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(59);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resetSchema),
    mode: 'onChange'
  });

  const passwordValue = watch('password') || '';

  useEffect(() => {
    if (!email) {
      toast.error('Session expired. Please request a new security code.');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp.map((d, idx) => (idx === index ? element.value : d))];
    setOtp(newOtp);

    // Focus next input automatically
    if (element.value !== '') {
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '') {
        if (index > 0 && inputRefs.current[index - 1]) {
          inputRefs.current[index - 1].focus();
        }
      }
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending) return;
    setResending(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setTimer(59);
      toast.success('A new verification code has been sent to your email.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  const onSubmit = async (data) => {
    const code = otp.join('');
    if (code.length < 6) {
      toast.error('Please enter the complete 6-digit verification code.');
      return;
    }

    try {
      await api.post('/auth/reset-password', {
        email,
        otp: code,
        password: data.password
      });
      toast.success('Your password has been successfully reset! Please sign in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password reset failed. Check your security code.');
    }
  };

  // Compute Password Strength
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score, label: 'None', color: 'bg-slate-200' };
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score, label: 'Medium', color: 'bg-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  };

  const renderStrengthIndicator = (pass) => {
    const strength = getPasswordStrength(pass);
    const rules = [
      { key: 'len', label: 'Minimum 8 characters', met: pass.length >= 8 },
      { key: 'up', label: 'At least one uppercase (A-Z)', met: /[A-Z]/.test(pass) },
      { key: 'lo', label: 'At least one lowercase (a-z)', met: /[a-z]/.test(pass) },
      { key: 'num', label: 'At least one number (0-9)', met: /[0-9]/.test(pass) },
      { key: 'sp', label: 'At least one special character', met: /[^A-Za-z0-9]/.test(pass) }
    ];

    if (!pass) return null;

    return (
      <div className="space-y-2 mt-2 bg-slate-50 border border-slate-100 rounded-xl p-3">
        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
          <span>Password Strength: {strength.label}</span>
          <span>{strength.score}/5</span>
        </div>
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${strength.color}`} 
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
          {rules.map((rule) => (
            <div key={rule.key} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600">
              <span className={`h-3.5 w-3.5 rounded-full flex items-center justify-center border text-[9px] ${
                rule.met ? 'bg-emerald-50 border-emerald-300 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}>
                {rule.met ? '✓' : '✗'}
              </span>
              <span>{rule.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex items-center justify-center p-6 relative overflow-hidden">
      {/* Blurred background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#10B981]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#14B8A6]/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-md w-full"
      >
        <Card className="p-8 sm:p-10 border border-[#E2E8F0] shadow-xl shadow-slate-100/50 space-y-6 bg-white rounded-3xl relative z-10">
          
          {/* Header Back Link */}
          <div className="flex items-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Link>
          </div>

          {/* Info */}
          <div className="space-y-3 text-center">
            <div className="mx-auto w-12 h-12 bg-emerald-50 border border-emerald-200 text-[#10B981] rounded-2xl flex items-center justify-center shadow-inner">
              <KeyRound className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Security Check</h2>
              <p className="text-[#64748B] text-sm font-medium">
                Enter the 6-digit key sent to:
              </p>
              <p className="text-slate-700 text-xs font-bold break-all bg-slate-50 border border-slate-200 rounded-lg p-2 mt-1">
                {email}
              </p>
            </div>
          </div>

          {/* Inputs form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block text-center">
                Verification Code
              </label>
              <div className="flex justify-center gap-2">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    ref={(el) => (inputRefs.current[index] = el)}
                    value={data}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-11 h-12 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center text-lg font-bold text-slate-800 outline-none focus:border-[#10B981] focus:bg-white focus:ring-4 focus:ring-[#10B981]/10 transition-all"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Input
                  icon={Lock}
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
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

              <Input
                icon={Lock}
                label="Confirm New Password"
                type="password"
                placeholder="Confirm password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            </div>

            {renderStrengthIndicator(passwordValue)}

            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full mt-2"
              size="lg"
              icon={ShieldCheck}
            >
              Verify & Reset Password
            </Button>
          </form>

          {/* Resend actions */}
          <div className="flex items-center justify-between text-xs px-2 pt-2 border-t border-[#E2E8F0]">
            <span className="text-[#64748B] font-semibold">Didn't receive code?</span>
            <button
              onClick={handleResend}
              disabled={timer > 0 || resending}
              className={`inline-flex items-center gap-1 font-extrabold tracking-wide uppercase ${
                timer > 0 || resending
                  ? 'text-slate-400 cursor-not-allowed' 
                  : 'text-[#10B981] hover:text-[#059669] hover:underline'
              }`}
            >
              <RefreshCw className={`h-3 w-3 ${resending ? 'animate-spin' : ''}`} />
              <span>{timer > 0 ? `Resend in ${timer}s` : 'Resend Key'}</span>
            </button>
          </div>

        </Card>
      </motion.div>
    </div>
  );
}
