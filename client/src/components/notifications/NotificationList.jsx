import NotificationCard from './NotificationCard.jsx';

export default function NotificationList({ notifications, onMarkRead, onDelete, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded bg-slate-200" />
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-1/4 rounded bg-slate-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {notifications.map(notif => (
        <NotificationCard
          key={notif.id}
          notification={notif}
          onMarkRead={onMarkRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
