import { useState, useEffect } from 'react';
import { Settings, Mail, Smartphone, Bell, Calendar, CreditCard, Car, Megaphone, Shield, Loader2 } from 'lucide-react';
import NotificationSettingsCard from '../components/notifications/NotificationSettingsCard.jsx';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications/preferences');
      setPrefs(res.data.data);
    } catch (error) {
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const togglePref = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      await api.put('/notifications/preferences', prefs);
      toast.success('Notification preferences saved!');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-white p-5">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-slate-200" />
                  <div className="h-3 w-2/3 rounded bg-slate-100" />
                </div>
                <div className="h-7 w-12 rounded-full bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!prefs) return null;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-2xl bg-emerald-600 p-3 text-white shadow-lg shadow-emerald-200">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Notification Settings</h1>
          <p className="text-sm text-slate-500">Control how and when you receive notifications</p>
        </div>
      </div>

      {/* Delivery Channels */}
      <div className="mb-6">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Delivery Channels</h2>
        <div className="space-y-2">
          <NotificationSettingsCard
            icon={Mail}
            title="Email Notifications"
            description="Receive notifications via email"
            enabled={prefs.emailEnabled}
            onToggle={() => togglePref('emailEnabled')}
          />
          <NotificationSettingsCard
            icon={Smartphone}
            title="Push Notifications"
            description="Receive push notifications on your device"
            enabled={prefs.pushEnabled}
            onToggle={() => togglePref('pushEnabled')}
          />
          <NotificationSettingsCard
            icon={Bell}
            title="In-App Notifications"
            description="Show notifications inside the app"
            enabled={prefs.inAppEnabled}
            onToggle={() => togglePref('inAppEnabled')}
          />
        </div>
      </div>

      {/* Notification Categories */}
      <div className="mb-6">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Notification Categories</h2>
        <div className="space-y-2">
          <NotificationSettingsCard
            icon={Car}
            title="Booking Alerts"
            description="New bookings, acceptances, and cancellations"
            enabled={prefs.bookingNotifications}
            onToggle={() => togglePref('bookingNotifications')}
          />
          <NotificationSettingsCard
            icon={CreditCard}
            title="Payment Alerts"
            description="Payment confirmations, failures, and refunds"
            enabled={prefs.paymentNotifications}
            onToggle={() => togglePref('paymentNotifications')}
          />
          <NotificationSettingsCard
            icon={Calendar}
            title="Ride Reminders"
            description="Departure reminders 5, 15, and 30 minutes before"
            enabled={prefs.rideReminderNotifications}
            onToggle={() => togglePref('rideReminderNotifications')}
          />
          <NotificationSettingsCard
            icon={Shield}
            title="System Notifications"
            description="Important system updates and announcements"
            enabled={prefs.systemNotifications}
            onToggle={() => togglePref('systemNotifications')}
          />
          <NotificationSettingsCard
            icon={Megaphone}
            title="Marketing Emails"
            description="Promotions, tips, and special offers"
            enabled={prefs.marketingNotifications}
            onToggle={() => togglePref('marketingNotifications')}
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={savePreferences}
        disabled={saving}
        className="w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:opacity-50"
      >
        {saving ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </span>
        ) : (
          'Save Preferences'
        )}
      </button>
    </div>
  );
}
