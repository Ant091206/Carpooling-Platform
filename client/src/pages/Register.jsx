import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Mail, User, Shield, Phone, Lock, Sparkles, Eye, EyeOff, 
  Building2, Globe, MapPin, Loader2, Check, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from './AuthLayout.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

// ─── Validation Schemas ───────────────────────────────────────────
const employeeSchema = z.object({
  companyCode: z.string().min(1, 'Company code is required'),
  organization_id: z.number({ required_error: 'Valid company code lookup is required' }),
  employee_id: z.string().min(1, 'Employee ID is required').max(50),
  name: z.string().min(1, 'Full name is required').max(100),
  email: z.string().email('Please enter a valid work email').max(100),
  phone: z.string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 10, { message: 'Phone number must be exactly 10 digits' }),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
  department: z.string().max(100).optional().or(z.literal('')),
  designation: z.string().max(100).optional().or(z.literal(''))
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(150),
  company_code: z.string()
    .min(3, 'Company code must be 3-50 characters')
    .max(50)
    .regex(/^[A-Z0-9]+$/, 'Company code must be alphanumeric'),
  email: z.string().email('Please enter a valid company email').max(100),
  phone: z.string().optional().or(z.literal('')),
  website: z.string().url('Must be a valid URL link').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  admin_name: z.string().min(1, 'Admin name is required').max(100),
  admin_email: z.string().email('Please enter a valid admin email').max(100),
  admin_password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  admin_phone: z.string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 10, { message: 'Phone number must be exactly 10 digits' })
});

export default function Register() {
  const { register: signup, registerCompany, lookupCompany, loading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('employee'); // 'employee' | 'company'
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Employee lookup states
  const [resolvedOrg, setResolvedOrg] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Forms setup with live validation while typing
  const employeeForm = useForm({
    resolver: zodResolver(employeeSchema),
    mode: 'onChange',
    defaultValues: {
      companyCode: '',
      department: '',
      designation: '',
      phone: ''
    }
  });

  const companyForm = useForm({
    resolver: zodResolver(companySchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      company_code: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      admin_name: '',
      admin_email: '',
      admin_password: '',
      admin_phone: ''
    }
  });

  // Watch password inputs for strength checks
  const passwordValue = employeeForm.watch('password') || '';
  const adminPasswordValue = companyForm.watch('admin_password') || '';

  // Handle phone format transform (XXXXX XXXXX)
  const formatPhone = (val) => {
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5, 10)}`;
  };

  const handlePhoneInputChange = (e, formType) => {
    const formatted = formatPhone(e.target.value);
    if (formType === 'employee') {
      employeeForm.setValue('phone', formatted, { shouldValidate: true });
    } else {
      companyForm.setValue('admin_phone', formatted, { shouldValidate: true });
    }
  };

  // Handle auto-uppercase and clean alphanumeric codes
  const handleCompanyCodeInputChange = (e, formType) => {
    const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (formType === 'employee') {
      employeeForm.setValue('companyCode', cleaned, { shouldValidate: true });
      if (cleaned.length >= 3) {
        debouncedLookup(cleaned);
      } else {
        setResolvedOrg(null);
        setLookupError('');
        employeeForm.setValue('organization_id', undefined);
      }
    } else {
      companyForm.setValue('company_code', cleaned, { shouldValidate: true });
    }
  };

  const handleCompanyCodeBlur = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length >= 3) {
      performLookup(val);
    }
  };

  // Direct lookup handler
  const performLookup = async (code) => {
    setIsLookingUp(true);
    setLookupError('');
    setResolvedOrg(null);

    const org = await lookupCompany(code);
    setIsLookingUp(false);
    
    if (org) {
      setResolvedOrg(org);
      employeeForm.setValue('organization_id', org.id, { shouldValidate: true });
    } else {
      setLookupError('Company not found or inactive');
      employeeForm.setValue('organization_id', undefined, { shouldValidate: true });
    }
  };

  // Debounced lookup logic
  const [timer, setTimer] = useState(null);
  const debouncedLookup = (code) => {
    if (timer) clearTimeout(timer);
    setTimer(setTimeout(() => performLookup(code), 500));
  };

  const onEmployeeSubmit = async (data) => {
    const nameParts = data.name.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Employee';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    const payload = {
      organization_id: data.organization_id,
      employee_id: data.employee_id,
      firstName,
      lastName,
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      confirmPassword: data.confirmPassword,
      department: data.department,
      designation: data.designation,
      role: 'EMPLOYEE',
      organization: resolvedOrg ? resolvedOrg.name : '',
      terms: true
    };

    const res = await signup(payload);
    if (res.success) {
      toast.success('Account registered successfully!');
      navigate('/dashboard');
    } else {
      toast.error(res.message);
    }
  };

  const onCompanySubmit = async (data) => {
    const res = await registerCompany(data);
    if (res.success) {
      toast.success('Company and administrator registered successfully!');
      navigate('/admin');
    } else {
      toast.error(res.message);
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
    <AuthLayout
      title="Create your account"
      subtitle="Join the platform to share rides with verified colleagues."
      footer={
        <div className="text-center text-xs text-[#64748B] font-semibold mt-4">
          Already registered?{' '}
          <Link to="/login" className="font-extrabold text-[#10B981] hover:underline">
            Sign in
          </Link>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Tab Switcher with ripple styles */}
        <div className="flex bg-[#F8FAFC] p-1.5 rounded-2xl border border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => setActiveTab('employee')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === 'employee'
                ? 'bg-white text-[#10B981] shadow-md shadow-slate-200/50'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Join as Employee
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('company')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === 'company'
                ? 'bg-white text-[#10B981] shadow-md shadow-slate-200/50'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Register My Company
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'employee' ? (
            <motion.form 
              key="employee-form"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.25 }}
              onSubmit={employeeForm.handleSubmit(onEmployeeSubmit)} 
              className="space-y-4"
            >
              {/* Company Code Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                  Company Code
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. DEMOCORP"
                    className="w-full pl-11 pr-12 py-3 bg-white border border-[#E2E8F0] text-sm rounded-xl outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/10 transition-all font-bold"
                    {...employeeForm.register('companyCode', {
                      onChange: (e) => handleCompanyCodeInputChange(e, 'employee'),
                      onBlur: handleCompanyCodeBlur
                    })}
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    {isLookingUp && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
                    {resolvedOrg && <Check className="h-5 w-5 text-[#22C55E]" />}
                    {lookupError && <AlertCircle className="h-5 w-5 text-[#EF4444]" />}
                  </div>
                </div>
                
                {resolvedOrg && (
                  <p className="text-xs font-bold text-[#22C55E] flex items-center gap-1">
                    ✓ Joined: {resolvedOrg.name}
                  </p>
                )}
                {lookupError && (
                  <p className="text-xs font-bold text-[#EF4444] flex items-center gap-1">
                    ✗ {lookupError}
                  </p>
                )}
                {employeeForm.formState.errors.organization_id && (
                  <p className="text-xs font-bold text-[#EF4444] mt-1">
                    Please lookup and resolve a valid company code.
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  icon={User}
                  label="Full Name"
                  placeholder="e.g. Aarav Sharma"
                  error={employeeForm.formState.errors.name?.message}
                  {...employeeForm.register('name')}
                />
                <Input
                  icon={Shield}
                  label="Employee ID"
                  placeholder="e.g. EMP-1234"
                  error={employeeForm.formState.errors.employee_id?.message}
                  {...employeeForm.register('employee_id')}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  icon={Mail}
                  label="Work Email"
                  type="email"
                  placeholder="you@company.com"
                  error={employeeForm.formState.errors.email?.message}
                  {...employeeForm.register('email')}
                />
                <Input
                  icon={Phone}
                  label="Phone Number"
                  placeholder="e.g. 98765 43210"
                  error={employeeForm.formState.errors.phone?.message}
                  {...employeeForm.register('phone', {
                    onChange: (e) => handlePhoneInputChange(e, 'employee')
                  })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  icon={Building2}
                  label="Department (Optional)"
                  placeholder="e.g. Engineering"
                  error={employeeForm.formState.errors.department?.message}
                  {...employeeForm.register('department')}
                />
                <Input
                  icon={Shield}
                  label="Designation (Optional)"
                  placeholder="e.g. Technical Analyst"
                  error={employeeForm.formState.errors.designation?.message}
                  {...employeeForm.register('designation')}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative">
                  <Input
                    icon={Lock}
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    error={employeeForm.formState.errors.password?.message}
                    {...employeeForm.register('password')}
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
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter password"
                  error={employeeForm.formState.errors.confirmPassword?.message}
                  {...employeeForm.register('confirmPassword')}
                />
              </div>

              {renderStrengthIndicator(passwordValue)}

              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full mt-4"
                size="lg"
                icon={Sparkles}
              >
                Create Account
              </Button>
            </motion.form>
          ) : (
            <motion.form 
              key="company-form"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              onSubmit={companyForm.handleSubmit(onCompanySubmit)} 
              className="space-y-6"
            >
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-[#10B981] tracking-wider uppercase border-b border-[#E2E8F0] pb-2 flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  <span>1. Company Profile Details</span>
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    icon={Building2}
                    label="Company Name"
                    placeholder="e.g. Acme Tech Inc"
                    error={companyForm.formState.errors.name?.message}
                    {...companyForm.register('name')}
                  />
                  <div>
                    <Input
                      icon={Shield}
                      label="Company Code (Unique)"
                      placeholder="e.g. ACMETECH"
                      error={companyForm.formState.errors.company_code?.message}
                      {...companyForm.register('company_code', {
                        onChange: (e) => handleCompanyCodeInputChange(e, 'company')
                      })}
                    />
                    <p className="text-[10px] text-slate-400 font-semibold mt-1 ml-1">
                      Alphanumeric (3-50 chars). Employees will input this during signup.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    icon={Mail}
                    label="Company Email"
                    type="email"
                    placeholder="info@acme.com"
                    error={companyForm.formState.errors.email?.message}
                    {...companyForm.register('email')}
                  />
                  <Input
                    icon={Phone}
                    label="Company Phone (Optional)"
                    placeholder="e.g. +91 98765 00000"
                    error={companyForm.formState.errors.phone?.message}
                    {...companyForm.register('phone')}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    icon={Globe}
                    label="Company Website (Optional)"
                    placeholder="https://acme.com"
                    error={companyForm.formState.errors.website?.message}
                    {...companyForm.register('website')}
                  />
                  <Input
                    icon={MapPin}
                    label="Corporate Address (Optional)"
                    placeholder="Corporate Head Office"
                    error={companyForm.formState.errors.address?.message}
                    {...companyForm.register('address')}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-[#10B981] tracking-wider uppercase border-b border-[#E2E8F0] pb-2 flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span>2. Administrator Account Credentials</span>
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    icon={User}
                    label="Admin Name"
                    placeholder="e.g. Rohan Sen"
                    error={companyForm.formState.errors.admin_name?.message}
                    {...companyForm.register('admin_name')}
                  />
                  <Input
                    icon={Phone}
                    label="Admin Phone"
                    placeholder="e.g. 98765 99999"
                    error={companyForm.formState.errors.admin_phone?.message}
                    {...companyForm.register('admin_phone', {
                      onChange: (e) => handlePhoneInputChange(e, 'company')
                    })}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    icon={Mail}
                    label="Admin Work Email"
                    type="email"
                    placeholder="admin@acme.com"
                    error={companyForm.formState.errors.admin_email?.message}
                    {...companyForm.register('admin_email')}
                  />
                  <div className="relative">
                    <Input
                      icon={Lock}
                      label="Admin Password"
                      type={showAdminPassword ? "text" : "password"}
                      placeholder="Min 8 characters"
                      error={companyForm.formState.errors.admin_password?.message}
                      {...companyForm.register('admin_password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3.5 top-[38px] text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    >
                      {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {renderStrengthIndicator(adminPasswordValue)}

              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full mt-4"
                size="lg"
                icon={Sparkles}
              >
                Create Company Account
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Disabled SSO options with Badge */}
        <div className="space-y-3 pt-4 border-t border-[#E2E8F0] text-center">
          <p className="text-[10px] uppercase font-extrabold tracking-widest text-[#64748B]">
            Or Register with SSO
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              disabled
              className="px-4 py-2 border border-[#E2E8F0] rounded-xl text-[#64748B] text-xs font-bold bg-slate-50 cursor-not-allowed flex items-center gap-1.5"
            >
              Google
              <span className="bg-slate-200 text-[#0F172A] text-[8px] font-extrabold px-1 py-0.5 rounded uppercase tracking-wider scale-90">Soon</span>
            </button>
            <button
              type="button"
              disabled
              className="px-4 py-2 border border-[#E2E8F0] rounded-xl text-[#64748B] text-xs font-bold bg-slate-50 cursor-not-allowed flex items-center gap-1.5"
            >
              Microsoft
              <span className="bg-slate-200 text-[#0F172A] text-[8px] font-extrabold px-1 py-0.5 rounded uppercase tracking-wider scale-90">Soon</span>
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
