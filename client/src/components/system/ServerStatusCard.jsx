import { Cpu, HardDrive, Zap, Radio } from 'lucide-react';

export default function ServerStatusCard({ metrics, socket }) {
  if (!metrics) return null;

  const memory = metrics.memory || {};
  const cpu = metrics.cpu || {};

  const heapPercentage = memory.heapTotalMb
    ? Math.round((Number(memory.heapUsedMb) / Number(memory.heapTotalMb)) * 100)
    : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-base font-extrabold text-slate-900">Server Resource Usage</h3>

      <div className="space-y-4">
        {/* Heap Memory */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <HardDrive className="h-4 w-4 text-emerald-600" />
              Node.js Heap Memory
            </span>
            <span>{memory.heapUsedMb || '0'} MB / {memory.heapTotalMb || '0'} MB ({heapPercentage}%)</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full transition-all duration-500 ${
                heapPercentage > 85 ? 'bg-red-500' : heapPercentage > 65 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, heapPercentage)}%` }}
            />
          </div>
        </div>

        {/* CPU & Sockets grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Cpu className="h-3.5 w-3.5 text-blue-500" />
              CPU Cores
            </div>
            <p className="mt-1 text-lg font-extrabold text-slate-800">{cpu.cores || 1} Cores</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Radio className="h-3.5 w-3.5 text-purple-500" />
              Active Socket.io
            </div>
            <p className="mt-1 text-lg font-extrabold text-slate-800">
              {socket?.connectedClients ?? 0} Connected
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
