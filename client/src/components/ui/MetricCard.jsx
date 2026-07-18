import Card from './Card.jsx';

export default function MetricCard({ title, value, unit = '', description = '', className = '' }) {
  return (
    <Card className={`p-5 bg-white border border-slate-100 rounded-2xl shadow-sm ${className}`}>
      <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">{title}</p>
      <h4 className="font-heading text-3xl font-extrabold text-slate-950 mt-2">
        {value}
        {unit && <span className="text-sm font-semibold text-slate-500 ml-1">{unit}</span>}
      </h4>
      {description && <p className="text-xs text-slate-500 mt-1 font-medium">{description}</p>}
    </Card>
  );
}
