import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { carpoolAPI } from '../../services/api';

export function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await carpoolAPI.login({
        email: data.email,
        password: data.password,
      });
      const accessToken = res.data?.data?.accessToken || res.data?.accessToken;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
      toast.success('Signed in successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid login credentials.');
    }
  };

  return (
    <Card className="w-full shadow-xl border-slate-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h2>
        <p className="text-slate-500">Sign in to your enterprise account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="name@company.com"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <div>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />
          <div className="flex justify-end mt-1.5">
            <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              Forgot password?
            </a>
          </div>
        </div>

        <Button type="submit" fullWidth isLoading={isSubmitting} className="mt-6">
          Sign In
        </Button>
      </form>
    </Card>
  );
}
