export default function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <label className="block space-y-2">
      {label && <span className="text-sm font-bold text-slate-700">{label}</span>}
      <span className="relative block">
        {Icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-emerald-600">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <input
          className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 ${Icon ? 'pl-11' : ''} ${error ? 'border-red-300 bg-red-50' : 'border-emerald-100'} ${className}`}
          {...props}
        />
      </span>
      {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}
