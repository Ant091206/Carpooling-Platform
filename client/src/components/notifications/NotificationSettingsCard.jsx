export default function NotificationSettingsCard({ icon: Icon, title, description, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={`rounded-xl p-2.5 ${enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h4 className="text-sm font-bold text-slate-800">{title}</h4>
          <p className="mt-0.5 text-xs text-slate-400">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative h-7 w-12 rounded-full transition-all duration-300 ${
          enabled ? 'bg-emerald-500' : 'bg-slate-200'
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
