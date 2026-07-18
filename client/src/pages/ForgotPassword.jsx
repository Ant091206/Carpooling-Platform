import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Send, ShieldAlert } from 'lucide-react';
import api from '../services/api.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Card from '../components/ui/Card.jsx';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid work email').min(1, 'Email is required')
});

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(forgotSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data) => {
    try {
      const res = await api.post('/auth/forgot-password', { email: data.email });
      toast.success(res.data?.message || 'Security reset code sent to your email.');
      navigate('/otp-verification', { state: { email: data.email } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to dispatch security code.');
    }
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

          {/* Branding & Status Info */}
          <div className="space-y-3 text-center">
            <div className="mx-auto w-12 h-12 bg-amber-50 border border-amber-200 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Forgot Password?</h2>
              <p className="text-[#64748B] text-sm font-medium">
                We'll send a 6-digit OTP to your registered corporate email to reset your credentials.
              </p>
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input 
              icon={Mail} 
              label="Work email" 
              type="email" 
              placeholder="you@company.com" 
              error={errors.email?.message} 
              {...register('email')} 
            />

            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full mt-2"
              size="lg"
              icon={Send}
            >
              Send Reset Code
            </Button>
          </form>

          {/* Help note */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 text-[11px] text-[#64748B] leading-relaxed text-center font-medium">
            If you are unable to recover using your email, please reach out to your organization administrator or IT helpdesk.
          </div>

        </Card>
      </motion.div>
    </div>
  );
}
