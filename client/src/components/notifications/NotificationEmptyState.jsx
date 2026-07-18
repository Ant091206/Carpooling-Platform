import { Bell, BellOff } from 'lucide-react';

export default function NotificationEmptyState({ filter = 'all' }) {
  const messages = {
    all: { title: 'All caught up!', subtitle: 'You have no notifications right now.' },
    unread: { title: 'No unread notifications', subtitle: 'Everything has been read.' },
    BOOKING: { title: 'No booking notifications', subtitle: 'Booking updates will appear here.' },
    PAYMENT: { title: 'No payment notifications', subtitle: 'Payment updates will appear here.' },
    RIDE: { title: 'No ride notifications', subtitle: 'Ride updates will appear here.' },
    SYSTEM: { title: 'No system notifications', subtitle: 'System messages will appear here.' },
  };

  const msg = messages[filter] || messages.all;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-3xl bg-emerald-50 p-6">
        {filter === 'all' ? (
          <Bell className="h-12 w-12 text-emerald-300" />
        ) : (
          <BellOff className="h-12 w-12 text-slate-300" />
        )}
      </div>
      <h3 className="text-lg font-bold text-slate-700">{msg.title}</h3>
      <p className="mt-1 text-sm text-slate-400">{msg.subtitle}</p>
    </div>
  );
}
