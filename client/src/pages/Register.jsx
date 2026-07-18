import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, User, Shield, Phone, Eye, EyeOff, Check, Car, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from './AuthLayout.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

// Zod schema for full 2-step validation
const registerSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid work email'),
  phone: z.string().min(5, 'Phone number must be valid'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Confirm password is required'),
  employee_id: z.string().min(2, 'Employee ID is required'),
  own_vehicle: z.enum(['yes', 'no']),
  vehicle_number: z.string().optional(),
  vehicle_type: z.string().optional(),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export default function Register() {
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordVal, setPasswordVal] = useState('');

  const { register, handleSubmit, trigger, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      own_vehicle: 'no',
      terms: false
    }
  });

  const ownVehicleVal = watch('own_vehicle');

  // Password strength calculation
  const getPasswordStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const pwStrength = getPasswordStrength(passwordVal);
  const strengthColors = ['bg-slate-200', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-600'];
  const strengthLabels = ['Weak', 'Weak', 'Fair', 'Strong', 'Excellent'];

  const handleNextStep = async () => {
    // Validate Step 1 fields before transitioning
    const isValid = await trigger(['name', 'email', 'phone', 'password', 'confirmPassword']);
    if (isValid) {
      setStep(2);
    }
  };

  const onSubmit = async (data) => {
    try {
      const res = await registerUser(data);
      if (res.success) {
        toast.success('EnterprisePool account created! Let us carpool.');
        navigate('/dashboard');
      } else {
        toast.error(res.message || 'Onboarding failed.');
      }
    } catch (e) {
      toast.error('An unexpected connection error occurred.');
    }
  };

  return (
    <AuthLayout 
      title={step === 1 ? "Create your account" : "Commuter details"} 
      subtitle={step === 1 ? "Employee-only access. Safe, verified, affordable." : "Just a few more details to configure your route options."}
      footer={<>Already registered? <Link to="/login" className="font-bold text-emerald-700">Sign in</Link></>}
    >
      {/* Progress Header */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Step {step} of 2</span>
        <div className="flex gap-1.5">
          <span className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-emerald-600' : 'bg-slate-200'}`} />
          <span className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-emerald-600' : 'bg-slate-200'}`} />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <Input 
                icon={User} 
                label="Full name" 
                placeholder="Aarav Sharma" 
                error={errors.name?.message} 
                {...register('name')} 
              />
              <Input 
                icon={Mail} 
                label="Work email" 
                type="email" 
                placeholder="you@company.com" 
                error={errors.email?.message} 
                {...register('email')} 
              />
              <Input 
                icon={Phone} 
                label="Phone number" 
                placeholder="+91 98765 43210" 
                error={errors.phone?.message} 
                {...register('phone')} 
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative">
                  <Input 
                    label="Password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Min 8 characters" 
                    error={errors.password?.message} 
                    {...register('password')} 
                    onChangeCapture={(e) => setPasswordVal(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-[38px] text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                <Input 
                  label="Confirm Password" 
                  type="password" 
                  placeholder="Re-enter password" 
                  error={errors.confirmPassword?.message} 
                  {...register('confirmPassword')} 
                />
              </div>

              {/* Password Strength Meter */}
              {passwordVal.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>Password Strength:</span>
                    <span className={pwStrength >= 3 ? 'text-emerald-600' : 'text-amber-500'}>
                      {strengthLabels[pwStrength]}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                    {[1, 2, 3, 4].map((index) => (
                      <div 
                        key={index} 
                        className={`h-full flex-1 transition-colors duration-300 ${index <= pwStrength ? strengthColors[pwStrength] : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <Button 
                type="button" 
                onClick={handleNextStep} 
                className="w-full mt-4" 
                size="lg"
              >
                Continue &rarr;
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <Input 
                icon={Shield} 
                label="Employee ID" 
                placeholder="EMP-1234" 
                error={errors.employee_id?.message} 
                {...register('employee_id')} 
              />

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">Do you own a vehicle?</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`flex items-center justify-center gap-2 rounded-2xl border p-4 cursor-pointer transition font-bold ${ownVehicleVal === 'yes' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-100 bg-white hover:bg-slate-50'}`}>
                    <input type="radio" value="yes" className="sr-only" {...register('own_vehicle')} />
                    <Car className="h-4 w-4" /> Yes, I do
                  </label>
                  <label className={`flex items-center justify-center gap-2 rounded-2xl border p-4 cursor-pointer transition font-bold ${ownVehicleVal === 'no' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-100 bg-white hover:bg-slate-50'}`}>
                    <input type="radio" value="no" className="sr-only" {...register('own_vehicle')} />
                    <User className="h-4 w-4" /> No vehicle
                  </label>
                </div>
              </div>

              {ownVehicleVal === 'yes' && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  <Input 
                    label="Vehicle Number" 
                    placeholder="KA-05-EV-1234" 
                    error={errors.vehicle_number?.message} 
                    {...register('vehicle_number')} 
                  />
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-800">Vehicle Type</label>
                    <select 
                      className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none"
                      {...register('vehicle_type')}
                    >
                      <option value="Electric Sedan">Electric Sedan</option>
                      <option value="CNG Hatchback">CNG Hatchback</option>
                      <option value="Electric SUV">Electric SUV</option>
                      <option value="Hybrid Sedan">Hybrid Sedan</option>
                    </select>
                  </div>
                </motion.div>
              )}

              <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mt-1 h-4.5 w-4.5 rounded border-slate-200 text-emerald-600 focus:ring-emerald-500" 
                  {...register('terms')} 
                />
                <span className="text-xs text-slate-600 leading-normal">
                  I accept the employee carpooling terms & agreements and agree to mask contact coordinates.
                </span>
              </label>
              {errors.terms && (
                <p className="text-xs text-rose-500 font-bold mt-1">{errors.terms.message}</p>
              )}

              <div className="flex gap-3 mt-6">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setStep(1)}
                  className="w-1/3"
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  loading={loading} 
                  className="w-2/3"
                  icon={Sparkles}
                >
                  Create Account
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </AuthLayout>
  );
}
