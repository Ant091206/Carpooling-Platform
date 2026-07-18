import { useId } from 'react';

export default function Input({ label, error, icon: Icon, className = '', ...props }) {
  const id = useId();
  return (
    <div className="relative w-full space-y-1">
      <div className="relative flex items-center">
        {Icon && (
          <span className="absolute left-4 text-slate-400 pointer-events-none transition-colors peer-focus:text-emerald-500">
            <Icon className="h-4.5 w-4.5" />
          </span>
        )}
        <input
          id={id}
          className={`peer w-full rounded-xl border bg-white py-3 pr-4 text-sm text-slate-900 outline-none transition-all duration-200
            ${Icon ? 'pl-11' : 'pl-4'} 
            ${error 
              ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 bg-rose-50/20' 
              : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
            } 
            placeholder-transparent focus:placeholder-slate-400/50
            placeholder-shown:pt-3 placeholder-shown:pb-3 pt-5 pb-1.5 ${className}`}
          placeholder=" "
          {...props}
        />
        {label && (
          <label
            htmlFor={id}
            className={`absolute left-0 top-0 text-slate-400 text-[10px] font-extrabold tracking-wide uppercase transition-all duration-200 pointer-events-none origin-left
              ${Icon ? 'translate-x-11' : 'translate-x-4'} 
              peer-placeholder-shown:text-xs peer-placeholder-shown:font-semibold peer-placeholder-shown:translate-y-3.5
              peer-focus:text-[10px] peer-focus:font-extrabold peer-focus:translate-y-1 peer-focus:text-emerald-600
              ${error ? 'peer-focus:text-rose-500' : ''}`}
          >
            {label}
          </label>
        )}
      </div>
      {error && <p className="text-[11px] font-bold text-rose-500 pl-1">{error}</p>}
    </div>
  );
}
