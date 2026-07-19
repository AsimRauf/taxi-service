import { FC, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Loader } from 'react-feather';
import { BookOpen, CalendarClock, Euro, AlertTriangle, Bell, CheckCircle2 } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { withAdminAuth } from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { Booking } from '@/types/booking';

interface Stats {
  totalBookings: number;
  upcomingRides: number;
  todayRides: number;
  pendingCancellations: number;
  unreadNotifications: number;
  paidBookings: number;
  totalRevenue: number;
}

const AdminDashboard: FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(false);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, recentRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/bookings?limit=5', { headers })
      ]);
      if (!statsRes.ok || !recentRes.ok) throw new Error('Failed to load dashboard');
      const statsData = await statsRes.json();
      const recentData = await recentRes.json();
      setStats(statsData.stats);
      setRecent(recentData.bookings || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const cards = stats ? [
    { label: 'Total bookings', value: stats.totalBookings, icon: <BookOpen className="w-5 h-5" />, href: '/admin/bookings' },
    { label: 'Rides today', value: stats.todayRides, icon: <CalendarClock className="w-5 h-5" />, href: '/admin/bookings?status=confirmed' },
    { label: 'Upcoming rides', value: stats.upcomingRides, icon: <CheckCircle2 className="w-5 h-5" />, href: '/admin/bookings?status=confirmed' },
    { label: 'Revenue (paid)', value: `€${stats.totalRevenue.toFixed(2)}`, icon: <Euro className="w-5 h-5" />, href: '/admin/bookings?payment=completed' },
    { label: 'Cancellation requests', value: stats.pendingCancellations, icon: <AlertTriangle className="w-5 h-5" />, href: '/admin/bookings?cancellations=true', highlight: stats.pendingCancellations > 0 },
    { label: 'Unread notifications', value: stats.unreadNotifications, icon: <Bell className="w-5 h-5" />, href: '/admin/notifications', highlight: stats.unreadNotifications > 0 }
  ] : [];

  return (
    <AdminLayout>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {loading ? (
        <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-secondary" /></div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Could not load the dashboard.</p>
          <button onClick={load} className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary/90">Try again</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
            {cards.map(card => (
              <Link
                key={card.label}
                href={card.href}
                className={`bg-white rounded-xl p-4 sm:p-5 shadow-sm border transition-shadow hover:shadow-md ${card.highlight ? 'border-amber-300' : 'border-gray-100'}`}
              >
                <div className={`inline-flex p-2 rounded-lg mb-3 ${card.highlight ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-secondary'}`}>
                  {card.icon}
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{card.label}</p>
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Latest bookings</h2>
            <Link href="/admin/bookings" className="text-sm text-secondary hover:underline">View all →</Link>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            {recent.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No bookings yet.</p>
            ) : recent.map(b => (
              <Link key={b._id} href={`/admin/bookings/${b._id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-gray-50 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">#{b.clientBookingId} — {b.contactInfo?.fullName || 'Unknown'}</p>
                  <p className="text-xs text-gray-500 truncate">{b.sourceAddress} → {b.destinationAddress}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-secondary">€{(b.price || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{b.pickupDateTime}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) }
});

export default withAdminAuth(AdminDashboard);
