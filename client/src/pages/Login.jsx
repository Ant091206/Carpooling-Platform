import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import AuthLayout from './AuthLayout.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const res = await login(data.email, data.password);
    if (res.success) {
      toast.success('Welcome back. Ride board refreshed.');
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
        <Input icon={Mail} label="Work email" type="email" placeholder="you@company.com" error={errors.email?.message} {...register('email', { required: 'Work email is required' })} />
        <Input icon={Lock} label="Password" type="password" placeholder="Enter password" error={errors.password?.message} {...register('password', { required: 'Password is required' })} />
        <Button type="submit" loading={loading} className="w-full" size="lg">Sign In</Button>
      </form>
    </AuthLayout>
  );
}
