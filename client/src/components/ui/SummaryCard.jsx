import Card from './Card.jsx';

export default function SummaryCard({ icon: Icon, label, value, trend, desc, color = 'emerald' }) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-700 hover:border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 hover:border-blue-100',
    rose: 'bg-rose-50 text-rose-600 hover:border-rose-100',
    amber: 'bg-amber-50 text-amber-700 hover:border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-700 hover:border-indigo-100',
  };

  return (
    <Card className={`p-5 bg-white border border-slate-100 hover:border-slate-200 transition shadow-sm rounded-2xl flex gap-3.5 items-center`}>
      <span className={`grid h-12 w-12 place-items-center rounded-2xl ${colorMap[color] || colorMap.emerald} shrink-0`}>
        {Icon && <Icon className="h-5 w-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase text-slate-500 tracking-wider truncate">{label}</p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <p className="font-heading text-2xl font-extrabold text-slate-950">{value}</p>
          {trend && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              {trend}
            </span>
          )}
        </div>
        {desc && <p className="text-xxs font-medium text-slate-400 mt-1 truncate">{desc}</p>}
      </div>
    </Card>
  );
}
