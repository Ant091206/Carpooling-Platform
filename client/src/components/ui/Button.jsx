import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-[#10B981] text-white shadow-md shadow-emerald-100/50 hover:bg-[#059669] hover:shadow-lg focus:ring-4 focus:ring-[#10B981]/20 active:scale-98',
  secondary: 'bg-white text-slate-800 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 focus:ring-4 focus:ring-slate-100 active:scale-98',
  ghost: 'bg-transparent text-[#334155] hover:bg-slate-100 active:scale-98',
  dark: 'bg-[#334155] text-white hover:bg-slate-800 focus:ring-4 focus:ring-slate-700/20 active:scale-98',
  outline: 'bg-white text-[#10B981] border border-[#10B981] hover:bg-emerald-50 focus:ring-4 focus:ring-[#10B981]/15 active:scale-98',
};

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
};

export default function Button({ children, className = '', variant = 'primary', size = 'md', icon: Icon, loading = false, as: Component = 'button', type = 'button', ...props }) {
  return (
    <Component
      type={Component === 'button' ? type : undefined}
      disabled={Component === 'button' ? loading || props.disabled : undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-extrabold tracking-wide uppercase transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : Icon ? <Icon className="h-4.5 w-4.5" /> : null}
      {children}
    </Component>
  );
}
