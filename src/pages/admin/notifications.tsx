import { FC, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Loader } from 'react-feather';
import { Bell, CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { withAdminAuth } from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';

interface AdminNotification {
  _id: string;
  type: string;
  message: string;
  status: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  bookingId?: string;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  new_booking: 'New booking',
  payment_received: 'Payment received',
  booking_update: 'Booking update',
  booking_cancelled: 'Booking cancelled',
  booking_cancellation_request: 'Cancellation request',
  booking_confirmed: 'Booking confirmed',
  cancellation_request_approved: 'Cancellation approved',
  cancellation_request_rejected: 'Cancellation rejected'
};

const STATUS_DOT: Record<string, string> = {
  info: 'bg-sky-400',
  success: 'bg-green-500',
  warning: 'bg-amber-400',
  error: 'bg-red-500'
};

const AdminNotificationsPage: FC = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (unreadOnly) params.set('unread', 'true');
      const res = await fetch(`/api/admin/notifications?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
      setPages(data.pages || 1);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, page, unreadOnly]);

  useEffect(() => { load(); }, [load]);

  const markRead = async (ids?: string[]) => {
    if (!token) return;
    try {
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(ids ? { ids } : { all: true })
      });
      load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Notifications {unreadCount > 0 && <span className="text-sm font-normal text-gray-500">({unreadCount} unread)</span>}
        </h1>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 px-3 py-1.5 border border-gray-300 rounded-lg bg-white cursor-pointer">
            <input type="checkbox" checked={unreadOnly} onChange={e => { setUnreadOnly(e.target.checked); setPage(1); }} className="rounded" />
            Unread only
          </label>
          <button
            onClick={() => markRead()}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-secondary bg-primary/10 rounded-lg hover:bg-primary/20 disabled:opacity-40"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-secondary" /></div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Bell className="w-8 h-8 mx-auto mb-3 text-gray-300" />
          <p>No notifications{unreadOnly ? ' unread' : ''}.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {notifications.map(n => (
            <div key={n._id} className={`flex items-start gap-3 p-4 ${n.read ? 'opacity-60' : ''}`}>
              <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${STATUS_DOT[n.status] || 'bg-gray-300'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">{TYPE_LABELS[n.type] || n.type} · {new Date(n.createdAt).toLocaleString()}</p>
                <p className="text-sm text-gray-900 mt-0.5">{n.message}</p>
                <div className="flex gap-3 mt-1.5">
                  {n.bookingId && (
                    <Link href={`/admin/bookings/${n.bookingId}`} className="text-xs text-secondary hover:underline">
                      Open booking →
                    </Link>
                  )}
                  {!n.read && (
                    <button onClick={() => markRead([n._id])} className="text-xs text-gray-500 hover:text-gray-800">
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page <= 1} className="p-2 rounded-lg border border-gray-300 bg-white disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">Page {page} of {pages}</span>
          <button onClick={() => setPage(p => Math.min(p + 1, pages))} disabled={page >= pages} className="p-2 rounded-lg border border-gray-300 bg-white disabled:opacity-40">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </AdminLayout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) }
});

export default withAdminAuth(AdminNotificationsPage);
