import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { Mail, Lock, User, ShieldCheck, Loader2 } from 'lucide-react';

export default function Register() {
  const { register: registerAuth, loading } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { role: 'passenger' }
  });

  const onSubmit = async (data) => {
    const res = await registerAuth(data);
    if (res.success) {
      toast.success('Registration successful! Welcome aboard.');
      navigate('/dashboard');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
        <p className="text-slate-500 text-sm">Join the enterprise commute pool</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 block">Full Name</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <User className="h-5 w-5" />
            </span>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-sm outline-none transition-all ${
                errors.name ? 'border-red-300 bg-red-50/20 focus:border-red-500' : 'border-slate-200 focus:border-brand-500'
              }`}
              placeholder="John Doe"
            />
          </div>
          {errors.name && <span className="text-xs text-red-550 font-medium block">{errors.name.message}</span>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 block">Work Email</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Mail className="h-5 w-5" />
            </span>
            <input
              type="email"
              {...register('email', {
                required: 'Work email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-sm outline-none transition-all ${
                errors.email ? 'border-red-300 bg-red-50/20 focus:border-red-500' : 'border-slate-200 focus:border-brand-500'
              }`}
              placeholder="you@company.com"
            />
          </div>
          {errors.email && <span className="text-xs text-red-550 font-medium block">{errors.email.message}</span>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 block">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Lock className="h-5 w-5" />
            </span>
            <input
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-sm outline-none transition-all ${
                errors.password ? 'border-red-300 bg-red-50/20 focus:border-red-500' : 'border-slate-200 focus:border-brand-500'
              }`}
              placeholder="••••••••"
            />
          </div>
          {errors.password && <span className="text-xs text-red-550 font-medium block">{errors.password.message}</span>}
        </div>

        {/* Commute Role */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 block">Commute Role</label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all">
              <input
                type="radio"
                value="passenger"
                {...register('role')}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-slate-300"
              />
              <span className="text-sm font-semibold text-slate-700">Passenger</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all">
              <input
                type="radio"
                value="driver"
                {...register('role')}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-slate-300"
              />
              <span className="text-sm font-semibold text-slate-700">Driver</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-2xl shadow-md shadow-brand-100 hover:shadow-lg disabled:bg-brand-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
