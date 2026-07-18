import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Server, Database, Radio, Clock, ShieldAlert, FileText, Settings as SettingsIcon, RefreshCw } from 'lucide-react';
import StatusCard from '../../components/system/StatusCard.jsx';
import SystemInfoCard from '../../components/system/SystemInfoCard.jsx';
import ServerStatusCard from '../../components/system/ServerStatusCard.jsx';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

export default function SystemDashboard() {
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSystemData = async () => {
    try {
      setLoading(true);
      const [healthRes, infoRes] = await Promise.all([
        api.get('/health'),
        api.get('/system/info')
      ]);
      setHealth(healthRes.data.data);
      setInfo(infoRes.data.data);
    } catch (error) {
      toast.error('Failed to load system metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemData();
    const interval = setInterval(loadSystemData, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-600 p-3 text-white shadow-lg shadow-emerald-200">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">System & DevOps Dashboard</h1>
            <p className="text-sm text-slate-500">Real-time health monitoring, infrastructure metrics, and administration</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadSystemData}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 border border-slate-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* KPI Status Cards Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          icon={Activity}
          title="Overall System"
          value={health?.status || 'HEALTHY'}
          subtitle={`Uptime: ${health?.uptime || '-'}`}
          status={health?.status || 'HEALTHY'}
          onClick={() => navigate('/system/health')}
        />
        <StatusCard
          icon={Database}
          title="Database Status"
          value={health?.components?.database?.status || 'UP'}
          subtitle={`Latency: ${health?.components?.database?.latencyMs ?? 0} ms`}
          status={health?.components?.database?.status === 'UP' ? 'HEALTHY' : 'ERROR'}
          onClick={() => navigate('/system/health')}
        />
        <StatusCard
          icon={Radio}
          title="Socket.io Server"
          value={health?.components?.socket?.status || 'UP'}
          subtitle={`${health?.components?.socket?.connectedClients ?? 0} connected clients`}
          status={health?.components?.socket?.status === 'UP' ? 'HEALTHY' : 'ERROR'}
        />
        <StatusCard
          icon={Clock}
          title="Application Uptime"
          value={health?.uptime || '0s'}
          subtitle={`Version v${health?.version || '1.0.0'}`}
          status="HEALTHY"
        />
      </div>

      {/* Main Grid — Resource Usage & Environment Details */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ServerStatusCard metrics={health?.metrics} socket={health?.components?.socket} />
        <SystemInfoCard info={info} />
      </div>

      {/* Administration Shortcuts */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-extrabold text-slate-900">DevOps & System Shortcuts</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button
            onClick={() => navigate('/system/health')}
            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/50"
          >
            <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">Health Checks</p>
              <p className="text-xs text-slate-400">View components response times</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/system/logs')}
            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/50"
          >
            <div className="rounded-lg bg-blue-100 p-2.5 text-blue-700">
              <FileText className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">System Logs</p>
              <p className="text-xs text-slate-400">Search DB and file logs</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/system/settings')}
            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/50"
          >
            <div className="rounded-lg bg-purple-100 p-2.5 text-purple-700">
              <SettingsIcon className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">System Settings</p>
              <p className="text-xs text-slate-400">Maintenance mode & metadata</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
