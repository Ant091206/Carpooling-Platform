import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700',
  secondary: 'bg-white text-slate-800 border border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50',
  ghost: 'bg-transparent text-slate-700 hover:bg-emerald-50',
  dark: 'bg-slate-900 text-white hover:bg-slate-800',
  outline: 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-3 text-sm',
  lg: 'px-7 py-4 text-base',
};

export default function Button({ children, className = '', variant = 'primary', size = 'md', icon: Icon, loading = false, as: Component = 'button', type = 'button', ...props }) {
  return (
    <Component
      type={Component === 'button' ? type : undefined}
      disabled={Component === 'button' ? loading || props.disabled : undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </Component>
  );
}
