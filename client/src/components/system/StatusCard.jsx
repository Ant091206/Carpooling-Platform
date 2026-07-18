import HealthIndicator from './HealthIndicator.jsx';

export default function StatusCard({ icon: Icon, title, value, subtitle, status = 'HEALTHY', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-200' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
        </div>
        <HealthIndicator status={status} />
      </div>

      <div className="mt-4">
        <div className="text-2xl font-extrabold text-slate-900">{value}</div>
        {subtitle && <p className="mt-1 text-xs font-semibold text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}
