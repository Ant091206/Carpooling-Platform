import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ErrorState } from '../../components/ErrorState';
import { Skeleton } from '../../components/Skeleton';
import { carpoolAPI } from '../../services/api';
import { User, Bell, Shield, HelpCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Settings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabs = [
    { name: 'Profile', icon: User, current: true },
    { name: 'Notifications', icon: Bell, current: false },
    { name: 'Security', icon: Shield, current: false },
    { name: 'Help', icon: HelpCircle, current: false },
  ];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
  });

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await carpoolAPI.getProfile();
      const profile = res.data?.data || res.data;
      reset({
        firstName: profile.first_name || profile.firstName || '',
        lastName: profile.last_name || profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onSubmit = async (data) => {
    try {
      await carpoolAPI.updateProfile({
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
      });
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save profile.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your account preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64">
          <nav className="space-y-1">
            {tabs.map((item) => (
              <a
                key={item.name}
                href="#"
                className={twMerge(
                  clsx(
                    item.current
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors'
                  )
                )}
              >
                <item.icon
                  className={twMerge(
                    clsx(
                      item.current ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-500',
                      'mr-3 h-5 w-5 flex-shrink-0'
                    )
                  )}
                />
                {item.name}
              </a>
            ))}
          </nav>
        </aside>

        <Card className="flex-1">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Profile Settings</h2>

          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-2xl border-2 border-primary-200">
              JD
            </div>
            <div>
              <Button variant="outline" size="sm" className="mb-2">
                Change Avatar
              </Button>
              <p className="text-xs text-slate-500">JPG, GIF or PNG. Max size 2MB.</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={fetchProfile} />
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  error={errors.firstName?.message}
                  {...register('firstName', { required: 'First name is required' })}
                />
                <Input
                  label="Last Name"
                  error={errors.lastName?.message}
                  {...register('lastName', { required: 'Last name is required' })}
                />
              </div>
              <Input
                label="Email Address"
                type="email"
                disabled
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Phone Number"
                type="tel"
                error={errors.phone?.message}
                {...register('phone', { required: 'Phone number is required' })}
              />
              <div className="pt-4 flex justify-end">
                <Button type="submit" isLoading={isSubmitting}>
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
