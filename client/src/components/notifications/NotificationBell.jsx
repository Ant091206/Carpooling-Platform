import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext.jsx';
import NotificationBadge from './NotificationBadge.jsx';
import NotificationCard from './NotificationCard.jsx';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const latestNotifications = (notifications || []).slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative rounded-full bg-white p-2.5 text-slate-600 shadow-sm transition-all hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        <NotificationBadge count={unreadCount} />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[380px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-100"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[360px] overflow-y-auto">
            {latestNotifications.length > 0 ? (
              <div className="space-y-1 p-2">
                {latestNotifications.map(notif => (
                  <NotificationCard
                    key={notif.id}
                    notification={notif}
                    onMarkRead={(id) => { markAsRead(id); }}
                    compact
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="mb-2 h-10 w-10 text-slate-200" />
                <p className="text-sm font-semibold text-slate-400">No notifications yet</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 p-3">
            <button
              onClick={() => { setOpen(false); navigate('/notifications'); }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 text-xs font-bold text-emerald-600 transition hover:bg-emerald-100"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
