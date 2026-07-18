import { useState, useEffect, useCallback } from 'react';
import { FileText, Search, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import LogTable from '../../components/system/LogTable.jsx';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [level, setLevel] = useState('');
  const [module, setModule] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 25 };
      if (level) params.level = level;
      if (module) params.module = module;
      if (search) params.search = search;

      const res = await api.get('/system/logs', { params });
      setLogs(res.data.data.logs);
      setPagination(res.data.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch system logs');
    } finally {
      setLoading(false);
    }
  }, [page, level, module, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-600 p-3 text-white shadow-lg shadow-emerald-200">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Centralized System Logs</h1>
            <p className="text-sm text-slate-500">Audit trail of authentication, payments, rides, bookings, and system events</p>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 border border-slate-200 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
          Refresh Logs
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search log messages or IP address..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-200 transition hover:bg-emerald-700"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-3">
            {/* Level Select */}
            <select
              value={level}
              onChange={(e) => { setLevel(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 outline-none transition focus:border-emerald-500"
            >
              <option value="">All Levels</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
            </select>

            {/* Module Select */}
            <select
              value={module}
              onChange={(e) => { setModule(e.target.value); setPage(1); }}
              className="rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 outline-none transition focus:border-emerald-500"
            >
              <option value="">All Modules</option>
              <option value="AUTH">AUTH</option>
              <option value="PAYMENT">PAYMENT</option>
              <option value="RIDE">RIDE</option>
              <option value="BOOKING">BOOKING</option>
              <option value="NOTIFICATION">NOTIFICATION</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SYSTEM">SYSTEM</option>
            </select>
          </div>
        </div>
      </div>

      {/* Log Table */}
      <LogTable logs={logs} loading={loading} />

      {/* Pagination Bar */}
      {pagination && (
        <div className="mt-6 flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-slate-500">
            Showing Page <span className="font-bold text-slate-800">{pagination.page}</span> of{' '}
            <span className="font-bold text-slate-800">{pagination.totalPages || 1}</span> ({pagination.total} total logs)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= pagination.totalPages}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
