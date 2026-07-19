import { FC, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Loader, Search } from 'react-feather';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { withAdminAuth } from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { Booking } from '@/types/booking';

const STATUS_OPTIONS = ['all', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'];
const PAYMENT_OPTIONS = ['all', 'completed', 'pending', 'failed', 'expired', 'refunded'];

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  'in-progress': 'bg-sky-100 text-sky-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  'no-show': 'bg-gray-200 text-gray-700'
};

const AdminBookingsPage: FC = () => {
  const { token } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('all');
  const [payment, setPayment] = useState('all');
  const [cancellationsOnly, setCancellationsOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Allow deep links from the dashboard cards
  useEffect(() => {
    if (!router.isReady) return;
    if (typeof router.query.status === 'string') setStatus(router.query.status);
    if (typeof router.query.payment === 'string') setPayment(router.query.payment);
    if (router.query.cancellations === 'true') setCancellationsOnly(true);
  }, [router.isReady, router.query]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (status !== 'all') params.set('status', status);
      if (payment !== 'all') params.set('paymentStatus', payment);
      if (cancellationsOnly) params.set('cancellationRequested', 'true');
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/bookings?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load bookings');
      const data = await res.json();
      setBookings(data.bookings || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Bookings load error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [token, page, status, payment, cancellationsOnly, search]);

  useEffect(() => { load(); }, [load]);

  const applyFilter = (setter: () => void) => {
    setter();
    setPage(1);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Bookings <span className="text-sm font-normal text-gray-500">({total})</span></h1>
        <form
          onSubmit={e => { e.preventDefault(); applyFilter(() => setSearch(searchInput.trim())); }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search id, customer, address…"
            className="pl-9 pr-3 py-2 w-full sm:w-72 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </form>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select
          value={status}
          onChange={e => applyFilter(() => setStatus(e.target.value))}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s}</option>)}
        </select>
        <select
          value={payment}
          onChange={e => applyFilter(() => setPayment(e.target.value))}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
        >
          {PAYMENT_OPTIONS.map(p => <option key={p} value={p}>{p === 'all' ? 'All payments' : `payment: ${p}`}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-700 px-3 py-1.5 border border-gray-300 rounded-lg bg-white cursor-pointer">
          <input
            type="checkbox"
            checked={cancellationsOnly}
            onChange={e => applyFilter(() => setCancellationsOnly(e.target.checked))}
            className="rounded"
          />
          Cancellation requests
        </label>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-secondary" /></div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Could not load bookings.</p>
          <button onClick={load} className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary/90">Try again</button>
        </div>
      ) : bookings.length === 0 ? (
        <p className="text-center py-12 text-gray-500">No bookings match these filters.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">Booking</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Pickup</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map(b => (
                <tr
                  key={b._id}
                  onClick={() => router.push(`/admin/bookings/${b._id}`)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-secondary whitespace-nowrap">
                    #{b.clientBookingId}
                    {b.cancellation?.status === 'requested' && (
                      <AlertTriangle className="inline w-4 h-4 text-amber-500 ml-1.5" aria-label="Cancellation requested" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900">{b.contactInfo?.fullName || '—'}</p>
                    <p className="text-xs text-gray-500">{b.contactInfo?.phoneNumber || b.contactInfo?.email || ''}</p>
                  </td>
                  <td className="px-4 py-3 max-w-[220px]">
                    <p className="truncate text-gray-700">{b.sourceAddress}</p>
                    <p className="truncate text-xs text-gray-500">→ {b.destinationAddress}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">{b.pickupDateTime}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">€{(b.price || 0).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.payment?.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {b.payment?.status || 'none'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[b.status] || 'bg-gray-100 text-gray-600'}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-gray-300 bg-white disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">Page {page} of {pages}</span>
          <button
            onClick={() => setPage(p => Math.min(p + 1, pages))}
            disabled={page >= pages}
            className="p-2 rounded-lg border border-gray-300 bg-white disabled:opacity-40"
          >
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

export default withAdminAuth(AdminBookingsPage);
