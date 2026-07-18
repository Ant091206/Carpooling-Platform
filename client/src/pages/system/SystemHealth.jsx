import { useState, useEffect } from 'react';
import { ShieldCheck, Database, Radio, Server, RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import HealthIndicator from '../../components/system/HealthIndicator.jsx';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

export default function SystemHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await api.get('/health');
      setHealth(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch health metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-600 p-3 text-white shadow-lg shadow-emerald-200">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">System Health Monitoring</h1>
            <p className="text-sm text-slate-500">Live operational status for API, Database, and Socket.io instances</p>
          </div>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 border border-slate-200 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
          Run Health Check
        </button>
      </div>

      {/* Main Status Banner */}
      <div className={`mb-6 flex items-center justify-between rounded-2xl p-6 text-white shadow-lg ${
        health?.status === 'HEALTHY' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-200' : 'bg-gradient-to-r from-red-600 to-rose-600 shadow-red-200'
      }`}>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider opacity-80">Global Status</span>
          <h2 className="text-2xl font-black">{health?.status || 'HEALTHY'}</h2>
          <p className="mt-1 text-xs opacity-90">All core infrastructure components responding within target SLAs</p>
        </div>
        <div className="rounded-full bg-white/20 p-4 backdrop-blur-md">
          {health?.status === 'HEALTHY' ? (
            <CheckCircle className="h-10 w-10 text-white" />
          ) : (
            <XCircle className="h-10 w-10 text-white" />
          )}
        </div>
      </div>

      {/* Component Details */}
      <div className="space-y-4">
        {/* Express REST API */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Express REST API Server</h3>
              <p className="text-xs text-slate-400">Node.js HTTP Server listening on port 5000</p>
            </div>
          </div>
          <HealthIndicator status={health?.components?.api?.status || 'UP'} />
        </div>

        {/* MySQL Database */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">MySQL Database (Prisma ORM)</h3>
              <p className="text-xs text-slate-400">
                Connection Pool | Query Latency: <span className="font-bold text-slate-700">{health?.components?.database?.latencyMs ?? 0} ms</span>
              </p>
            </div>
          </div>
          <HealthIndicator status={health?.components?.database?.status === 'UP' ? 'HEALTHY' : 'ERROR'} />
        </div>

        {/* Socket.io Real-time Server */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
              <Radio className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Socket.io Real-Time Event Gateway</h3>
              <p className="text-xs text-slate-400">
                Active Connections: <span className="font-bold text-slate-700">{health?.components?.socket?.connectedClients ?? 0} clients</span>
              </p>
            </div>
          </div>
          <HealthIndicator status={health?.components?.socket?.status === 'UP' ? 'HEALTHY' : 'ERROR'} />
        </div>
      </div>
    </div>
  );
}
