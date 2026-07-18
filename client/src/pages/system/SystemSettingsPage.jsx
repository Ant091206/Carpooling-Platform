import { useState, useEffect } from 'react';
import { Settings, ShieldAlert, Download, Upload, Loader2, Save } from 'lucide-react';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState({
    maintenance_mode: 'false',
    allow_registrations: 'true',
    max_ride_seats: '6',
    system_announcement: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/system/settings');
      if (res.data.data?.settings) {
        setSettings(prev => ({ ...prev, ...res.data.data.settings }));
      }
    } catch (error) {
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: prev[key] === 'true' ? 'false' : 'true'
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/system/settings', settings);
      toast.success('System settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save system settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      setBackingUp(true);
      const res = await api.get('/system/backup');
      const backupData = JSON.stringify(res.data.data, null, 2);

      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Backup metadata exported!');
    } catch (error) {
      toast.error('Failed to export backup');
    } finally {
      setBackingUp(false);
    }
  };

  const handleRestoreFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backupObj = JSON.parse(text);
      await api.post('/system/restore', backupObj);
      toast.success('Backup metadata restored successfully!');
      loadSettings();
    } catch (error) {
      toast.error('Failed to restore backup: Invalid file format');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-white p-6 h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-2xl bg-emerald-600 p-3 text-white shadow-lg shadow-emerald-200">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">System Administration Settings</h1>
          <p className="text-sm text-slate-500">Configure global platform behavior, maintenance status, and backup data</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Maintenance Mode Card */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-amber-100 p-3 text-amber-700">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Maintenance Mode</h3>
                <p className="mt-1 text-xs text-slate-600">
                  When enabled, non-admin users will be blocked from accessing application endpoints and shown a scheduled maintenance screen.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleToggle('maintenance_mode')}
              className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-all duration-300 ${
                settings.maintenance_mode === 'true' ? 'bg-amber-500' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={settings.maintenance_mode === 'true'}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                  settings.maintenance_mode === 'true' ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Global Configuration Options */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Global App Configuration
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Allow User Registration</h4>
              <p className="text-xs text-slate-400">Control if new employee accounts can be created</p>
            </div>
            <button
              onClick={() => handleToggle('allow_registrations')}
              className={`relative h-7 w-12 rounded-full transition-all duration-300 ${
                settings.allow_registrations === 'true' ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
                  settings.allow_registrations === 'true' ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-500">Max Ride Capacity (Seats)</label>
            <input
              type="number"
              value={settings.max_ride_seats || 6}
              onChange={(e) => setSettings(prev => ({ ...prev, max_ride_seats: e.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-500">Global System Announcement Banner</label>
            <input
              type="text"
              value={settings.system_announcement || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, system_announcement: e.target.value }))}
              placeholder="e.g. Scheduled platform maintenance on Sunday at 2 AM UTC"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save System Settings
          </button>
        </div>

        {/* Backup & Restore Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Backup & Metadata Management
          </h3>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleDownloadBackup}
              disabled={backingUp}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export Backup Metadata (JSON)
            </button>

            <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50">
              <Upload className="h-4 w-4 text-emerald-600" />
              Restore Metadata File
              <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
