import { Server, Database, Cpu, Globe, ShieldCheck } from 'lucide-react';

export default function SystemInfoCard({ info }) {
  if (!info) return null;

  const items = [
    { icon: Globe, label: 'Environment', value: info.application?.environment || 'development' },
    { icon: Server, label: 'App Version', value: info.application?.version || '1.0.0' },
    { icon: Cpu, label: 'Node.js Version', value: info.system?.nodeVersion || 'v18.x' },
    { icon: Database, label: 'Database Engine', value: info.database?.engine || 'MySQL' },
    { icon: ShieldCheck, label: 'Platform & OS', value: `${info.system?.platform || 'win32'} (${info.system?.architecture || 'x64'})` },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-base font-extrabold text-slate-900">System Environment & Runtime</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center gap-3.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">{item.label}</p>
                <p className="mt-0.5 text-sm font-extrabold text-slate-800">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
