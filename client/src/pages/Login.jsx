import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from './AuthLayout.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid work email').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    const res = await login(data.email, data.password);
    if (res.success) {
      toast.success('Welcome back to EnterprisePool!');
      navigate('/dashboard');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with your work account to manage rides and payments."
      footer={<>New to EnterprisePool? <Link to="/register" className="font-bold text-emerald-700">Create account</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input 
          icon={Mail} 
          label="Work email" 
          type="email" 
          placeholder="you@company.com" 
          error={errors.email?.message} 
          {...register('email')} 
        />
        <Input 
          icon={Lock} 
          label="Password" 
          type="password" 
          placeholder="Enter password" 
          error={errors.password?.message} 
          {...register('password')} 
        />
        <Button type="submit" loading={loading} className="w-full" size="lg">Sign In</Button>
      </form>
    </AuthLayout>
  );
}
