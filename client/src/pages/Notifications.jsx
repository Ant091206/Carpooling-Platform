import { useState, useEffect, useCallback } from 'react';
import { Bell, Trash2, CheckCheck } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext.jsx';
import NotificationList from '../components/notifications/NotificationList.jsx';
import NotificationFilter from '../components/notifications/NotificationFilter.jsx';
import NotificationEmptyState from '../components/notifications/NotificationEmptyState.jsx';
import toast from 'react-hot-toast';

export default function Notifications() {
  const { notifications, unreadCount, loading, pagination, markAsRead, markAllRead, deleteNotification, deleteAllNotifications, fetchNotifications } = useNotifications();
  const [filter, setFilter] = useState('all');

  const loadNotifications = useCallback(() => {
    const params = {};
    if (filter === 'unread') {
      params.isRead = 'false';
    } else if (['BOOKING', 'PAYMENT', 'RIDE', 'SYSTEM'].includes(filter)) {
      params.category = filter;
    }
    fetchNotifications(params);
  }, [filter, fetchNotifications]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    await markAllRead();
    toast.success('All notifications marked as read');
  };

  const handleDeleteAll = async () => {
    await deleteAllNotifications();
    toast.success('All notifications deleted');
  };

  const handleLoadMore = () => {
    if (pagination && pagination.page < pagination.totalPages) {
      const params = { page: pagination.page + 1 };
      if (filter === 'unread') params.isRead = 'false';
      else if (['BOOKING', 'PAYMENT', 'RIDE', 'SYSTEM'].includes(filter)) params.category = filter;
      fetchNotifications(params, true);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-600 p-3 text-white shadow-lg shadow-emerald-200">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Notifications</h1>
            <p className="text-sm text-slate-500">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-600 transition hover:bg-emerald-100"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-1.5 rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-5">
        <NotificationFilter active={filter} onChange={setFilter} />
      </div>

      {/* Notification List */}
      <NotificationList
        notifications={notifications}
        onMarkRead={markAsRead}
        onDelete={deleteNotification}
        loading={loading}
      />

      {/* Empty State */}
      {!loading && notifications.length === 0 && (
        <NotificationEmptyState filter={filter} />
      )}

      {/* Load More */}
      {pagination && pagination.page < pagination.totalPages && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            className="rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-emerald-600 shadow-sm transition hover:shadow-md border border-emerald-200"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
