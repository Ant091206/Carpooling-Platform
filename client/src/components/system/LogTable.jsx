import { useState } from 'react';
import { Info, AlertTriangle, XCircle, User, Code, Eye, X } from 'lucide-react';

const levelBadges = {
  INFO: <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200"><Info className="h-3 w-3"/> INFO</span>,
  WARN: <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200"><AlertTriangle className="h-3 w-3"/> WARN</span>,
  ERROR: <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700 border border-red-200"><XCircle className="h-3 w-3"/> ERROR</span>,
};

const moduleBadges = {
  AUTH: 'bg-purple-100 text-purple-700',
  PAYMENT: 'bg-emerald-100 text-emerald-700',
  RIDE: 'bg-blue-100 text-blue-700',
  BOOKING: 'bg-indigo-100 text-indigo-700',
  NOTIFICATION: 'bg-amber-100 text-amber-700',
  ADMIN: 'bg-rose-100 text-rose-700',
  SYSTEM: 'bg-slate-100 text-slate-700',
};

export default function LogTable({ logs = [], loading = false }) {
  const [selectedLog, setSelectedLog] = useState(null);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4">
            <div className="h-4 w-1/4 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-3/4 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
        No logs found matching your criteria.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Module</th>
                <th className="px-6 py-4">Message</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {logs.map((log) => (
                <tr key={log.id} className="transition hover:bg-slate-50/80">
                  <td className="whitespace-nowrap px-6 py-4">
                    {levelBadges[log.level] || log.level}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${moduleBadges[log.module] || 'bg-slate-100 text-slate-700'}`}>
                      {log.module}
                    </span>
                  </td>
                  <td className="max-w-xs truncate px-6 py-4 text-slate-900 font-semibold" title={log.message}>
                    {log.message}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500">
                    {log.user ? (
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {log.user.name || log.user.email}
                      </div>
                    ) : (
                      <span className="italic text-slate-400">System</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-slate-500">
                    {log.ip || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 transition hover:bg-emerald-100"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                {levelBadges[selectedLog.level]}
                <h3 className="text-base font-bold text-slate-900">Log #{selectedLog.id} Details</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-400">Message</label>
                <p className="mt-1 text-sm font-semibold text-slate-800">{selectedLog.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400">Module</label>
                  <p className="mt-1 text-sm font-bold text-slate-700">{selectedLog.module}</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400">Timestamp</label>
                  <p className="mt-1 text-sm font-semibold text-slate-700">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400">IP Address</label>
                  <p className="mt-1 font-mono text-sm text-slate-700">{selectedLog.ip || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400">User Agent</label>
                  <p className="mt-1 text-xs text-slate-600 truncate">{selectedLog.userAgent || 'N/A'}</p>
                </div>
              </div>

              {selectedLog.details && (
                <div>
                  <label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Code className="h-3.5 w-3.5" /> Structured Details / JSON
                  </label>
                  <pre className="mt-2 max-h-60 overflow-x-auto rounded-2xl bg-slate-900 p-4 font-mono text-xs text-emerald-400">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-right">
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-xl bg-slate-200 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
