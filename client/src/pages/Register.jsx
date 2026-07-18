import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Mail, User, Shield, Briefcase, Phone, BadgeAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from './AuthLayout.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

const registerSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid work email'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  phone: z.string().min(5, 'Phone must be between 5 and 20 characters').max(20),
  employee_id: z.string().min(1, 'Employee ID is required'),
  organization_id: z.coerce.number().min(1, 'Please select your organization'),
  role: z.enum(['ADMIN', 'EMPLOYEE']).default('EMPLOYEE'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required')
});

const corporateOrgs = [
  { id: 1, name: 'Google Corp (GOOG123)' },
  { id: 2, name: 'Acme Corp (ACME456)' }
];

export default function Register() {
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'EMPLOYEE',
      organization_id: 1
    }
  });

  const onSubmit = async (data) => {
    // Send matching register body
    const res = await registerUser(data);
    if (res.success) {
      toast.success('Registration successful! Welcome to the workspace.');
      navigate('/profile-setup');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <AuthLayout 
      title="Create your account" 
      subtitle="Use your company identity so rides stay employee-only." 
      footer={<>Already registered? <Link to="/login" className="font-bold text-emerald-700">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input 
            icon={User} 
            label="Full name" 
            placeholder="Aarav Sharma" 
            error={errors.name?.message} 
            {...register('name')} 
          />
          <Input 
            icon={Phone} 
            label="Phone number" 
            placeholder="+91 98765 43210" 
            error={errors.phone?.message} 
            {...register('phone')} 
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input 
            icon={Mail} 
            label="Work email" 
            type="email" 
            placeholder="you@company.com" 
            error={errors.email?.message} 
            {...register('email')} 
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="Create password" 
            error={errors.password?.message} 
            {...register('password')} 
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input 
            icon={Shield} 
            label="Employee ID" 
            placeholder="EMP-1234" 
            error={errors.employee_id?.message} 
            {...register('employee_id')} 
          />
          
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-800">Organization</label>
            <select 
              className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              {...register('organization_id')}
            >
              {corporateOrgs.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
            {errors.organization_id && (
              <p className="text-xs text-rose-500 font-semibold mt-1">{errors.organization_id.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input 
            icon={Briefcase} 
            label="Department" 
            placeholder="Engineering" 
            error={errors.department?.message} 
            {...register('department')} 
          />
          <Input 
            icon={Briefcase} 
            label="Designation" 
            placeholder="Software Architect" 
            error={errors.designation?.message} 
            {...register('designation')} 
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-800">Account Role</label>
          <select 
            className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            {...register('role')}
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="ADMIN">Corporate Admin</option>
          </select>
        </div>

        <Button type="submit" loading={loading} className="w-full mt-2" size="lg">Create Account</Button>
      </form>
    </AuthLayout>
  );
}
