import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';

export function Login() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    console.log(data);
    navigate('/dashboard');
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
          {...register('email', { required: true })}
        />
        <div>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            {...register('password', { required: true })}
          />
          <div className="flex justify-end mt-1.5">
            <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              Forgot password?
            </a>
          </div>
        </div>

        <Button type="submit" fullWidth className="mt-6">
          Sign In
        </Button>
      </form>
    </Card>
  );
}
