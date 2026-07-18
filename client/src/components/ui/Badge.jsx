const tones = {
  green:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  blue:    'bg-sky-50 text-sky-700 border-sky-200',
  amber:   'bg-amber-50 text-amber-700 border-amber-200',
  slate:   'bg-slate-50 text-slate-700 border-slate-200',
  red:     'bg-red-50 text-red-700 border-red-200',
  // variant aliases (used in M6/M7 pages)
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger:  'bg-red-50 text-red-700 border-red-200',
  info:    'bg-sky-50 text-sky-700 border-sky-200',
};

export default function Badge({ children, tone, variant, className = '' }) {
  // Accept either `tone` (existing API) or `variant` (M6/M7 API) — no duplicates
  const key = tone || variant || 'green';
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${tones[key] || tones.green} ${className}`}>
      {children}
    </span>
  );
}
