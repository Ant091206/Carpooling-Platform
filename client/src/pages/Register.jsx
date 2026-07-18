import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Apple, Chrome, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from './AuthLayout.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

export default function Register() {
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const res = await registerUser({ ...data, role: 'employee' });
    if (res.success) {
      toast.success('Account created. Let us finish your profile.');
      navigate('/profile-setup');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Use your company identity so rides stay employee-only." footer={<>Already registered? <Link to="/login" className="font-bold text-emerald-700">Sign in</Link></>}>
      <div className="mb-5 grid gap-3">
        <Button variant="secondary" icon={Mail} className="w-full">Continue with Email</Button>
        <Button variant="secondary" icon={Chrome} className="w-full">Continue with Google</Button>
        <Button variant="secondary" icon={Apple} className="w-full">Continue with Apple</Button>
      </div>
      <div className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400">
        <span className="h-px flex-1 bg-slate-100" /> or register directly <span className="h-px flex-1 bg-slate-100" />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input icon={User} label="Full name" placeholder="Aarav Sharma" error={errors.name?.message} {...register('name', { required: 'Full name is required' })} />
        <Input icon={Mail} label="Work email" type="email" placeholder="you@company.com" error={errors.email?.message} {...register('email', { required: 'Work email is required' })} />
        <Input label="Password" type="password" placeholder="Create a password" error={errors.password?.message} {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Use at least 6 characters' } })} />
        <Button type="submit" loading={loading} className="w-full" size="lg">Create Account</Button>
      </form>
    </AuthLayout>
  );
}
