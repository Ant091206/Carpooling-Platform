import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle, AlertTriangle, Info, XCircle, Clock } from 'lucide-react';

const typeIcons = {
  INFO: <Info className="h-5 w-5 text-blue-500" />,
  SUCCESS: <CheckCircle className="h-5 w-5 text-emerald-500" />,
  WARNING: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  ERROR: <XCircle className="h-5 w-5 text-red-500" />,
};

const categoryColors = {
  BOOKING: 'bg-indigo-50 border-indigo-200',
  PAYMENT: 'bg-emerald-50 border-emerald-200',
  RIDE: 'bg-blue-50 border-blue-200',
  SYSTEM: 'bg-slate-50 border-slate-200',
  PROFILE: 'bg-purple-50 border-purple-200',
  REMINDER: 'bg-amber-50 border-amber-200',
};

const priorityBadges = {
  LOW: null,
  MEDIUM: null,
  HIGH: <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">HIGH</span>,
  URGENT: <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 animate-pulse">URGENT</span>,
};

function timeAgo(dateString) {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationCard({ notification, onMarkRead, onDelete, compact = false }) {
  const navigate = useNavigate();
  const { id, title, message, type, category, priority, isRead, actionUrl, createdAt } = notification;

  const handleClick = () => {
    if (!isRead && onMarkRead) onMarkRead(id);
    if (actionUrl) navigate(actionUrl);
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all duration-200 hover:shadow-md ${
        isRead
          ? 'border-slate-100 bg-white/60'
          : `${categoryColors[category] || 'bg-white border-slate-200'} shadow-sm`
      } ${compact ? 'p-3' : 'p-4'}`}
    >
      {/* Unread indicator */}
      {!isRead && (
        <span className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-emerald-500" />
      )}

      {/* Icon */}
      <div className={`mt-0.5 flex-shrink-0 ${!isRead ? 'ml-2' : ''}`}>
        {typeIcons[type] || <Bell className="h-5 w-5 text-slate-400" />}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className={`text-sm font-semibold ${isRead ? 'text-slate-500' : 'text-slate-800'}`}>
            {title}
          </h4>
          {priorityBadges[priority]}
        </div>
        <p className={`mt-0.5 text-xs leading-relaxed ${isRead ? 'text-slate-400' : 'text-slate-600'} ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}>
          {message}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <Clock className="h-3 w-3 text-slate-300" />
          <span className="text-[11px] text-slate-400">{timeAgo(createdAt)}</span>
          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
            {category}
          </span>
        </div>
      </div>

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(id); }}
          className="flex-shrink-0 rounded-full p-1 text-slate-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
          title="Delete notification"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
