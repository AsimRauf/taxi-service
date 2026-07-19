import { FC, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { Loader } from 'react-feather';
import { ArrowLeft, Calculator, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import { withAdminAuth } from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import { LocationInput } from '@/components/forms/booking/LocationInput';
import { Booking, Location } from '@/types/booking';
import { calculateSegmentDistances } from '@/utils/distanceCalculations';
import {
  calculatePrice,
  calculateBookingTotal,
  hasCustomReturnDestination
} from '@/utils/pricingCalculator';
import { createTranslationsObject } from '@/utils/translations';

const STATUSES = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'];

// Fields sent in the PATCH when changed
type EditableBooking = Pick<Booking,
  'pickup' | 'destination' | 'stopovers' | 'returnDestination' |
  'sourceAddress' | 'destinationAddress' |
  'pickupDateTime' | 'returnDateTime' | 'isReturn' |
  'passengers' | 'vehicle' | 'price' | 'returnPrice' | 'isFixedPrice' |
  'directDistance' | 'extraDistance' | 'returnDistance' |
  'flightNumber' | 'incomingFlightNumber' | 'remarks' | 'status'
>;

const toLocalInput = (value?: string | null) =>
  value ? value.replace(' ', 'T').slice(0, 16) : '';
const fromLocalInput = (value: string) =>
  value ? value.replace('T', ' ') : '';

const toExact = (loc?: Location | null) =>
  loc?.exactAddress
    ? { businessName: loc.exactAddress.businessName || '', city: loc.exactAddress.city || '' }
    : undefined;

const AdminBookingDetailPage: FC = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { token } = useAuth();
  const id = router.query.id as string;
  const translations = createTranslationsObject(t, router.locale || 'en');

  const [booking, setBooking] = useState<Booking | null>(null);
  const [form, setForm] = useState<EditableBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [repricing, setRepricing] = useState(false);
  const [priceStale, setPriceStale] = useState(false);
  const [decisionResponse, setDecisionResponse] = useState('');
  const [deciding, setDeciding] = useState(false);

  const load = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load booking');
      const data = await res.json();
      setBooking(data.booking);
      setForm({ ...data.booking });
      setPriceStale(false);
    } catch (err) {
      console.error(err);
      toast.error('Could not load booking');
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => { load(); }, [load]);

  const setField = <K extends keyof EditableBooking>(key: K, value: EditableBooking[K]) => {
    setForm(f => (f ? { ...f, [key]: value } : f));
  };

  // Same address rules as the booking flow's travel-info step: a Google
  // Places selection becomes a Location whose mainAddress drives pricing
  const handleAddressChange = (place: { label: string; value: Location['value'] } | null, type: 'pickup' | 'destination') => {
    if (!place || !form) return;
    const location: Location = {
      description: place.value.description,
      label: place.label,
      value: place.value,
      mainAddress: place.value.description,
      secondaryAddress: place.value.structured_formatting?.secondary_text || '',
      exactAddress: {
        streetName: '',
        houseNumber: '',
        postalCode: '',
        city: place.value.structured_formatting?.secondary_text || '',
        businessName: ''
      }
    };
    if (type === 'pickup') {
      setForm({ ...form, pickup: location, sourceAddress: location.mainAddress || '' });
    } else {
      setForm({ ...form, destination: location, destinationAddress: location.mainAddress || '' });
    }
    setPriceStale(true);
  };

  // Reprice with the real calculator — identical pipeline to travel-info:
  // Google distance → fixed-route/per-km pricing → return-leg-aware total
  const handleReprice = async () => {
    if (!form?.pickup?.mainAddress || !form?.destination?.mainAddress) {
      toast.error('Pickup and destination are required');
      return;
    }
    if (form.pickup.value?.place_id && form.pickup.value.place_id === form.destination.value?.place_id) {
      toast.error('Pickup and destination cannot be the same');
      return;
    }
    setRepricing(true);
    try {
      const validStopovers = (form.stopovers || []).filter(s => s?.mainAddress);
      const segments = await calculateSegmentDistances(form.pickup, form.destination, validStopovers);

      const prices = calculatePrice(
        form.pickup.mainAddress,
        form.destination.mainAddress,
        segments[0].distance,
        segments[1]?.distance || '0 km',
        toExact(form.pickup),
        toExact(form.destination)
      );

      let returnDistance = form.returnDistance || '';
      if (hasCustomReturnDestination(form)) {
        const returnSegments = await calculateSegmentDistances(form.destination, form.returnDestination!, []);
        returnDistance = returnSegments[0]?.distance || '0 km';
      }

      const totals = calculateBookingTotal(
        { ...form, returnDistance },
        prices,
        form.vehicle
      );

      setForm({
        ...form,
        price: Math.round(totals.total * 100) / 100,
        returnPrice: Math.round(totals.returnLeg * 100) / 100,
        directDistance: segments[0].distance,
        extraDistance: segments[1]?.distance || '0 km',
        returnDistance,
        isFixedPrice: prices.isFixedPrice
      });
      setPriceStale(false);
      toast.success(`Recalculated: €${totals.total.toFixed(2)} (${prices.isFixedPrice ? 'fixed route' : 'distance-based'})`);
    } catch (err) {
      console.error('Reprice error:', err);
      toast.error('Could not calculate the route. Check the addresses.');
    } finally {
      setRepricing(false);
    }
  };

  const handleSave = async () => {
    if (!form || !booking) return;
    if (priceStale) {
      toast.error('Addresses changed — recalculate the price (or adjust it manually) before saving');
      return;
    }

    // Only send fields that actually changed
    const patch: Record<string, unknown> = {};
    (Object.keys(form) as (keyof EditableBooking)[]).forEach(key => {
      if (JSON.stringify(form[key]) !== JSON.stringify(booking[key])) {
        patch[key] = form[key];
      }
    });

    if (Object.keys(patch).length === 0) {
      toast('No changes to save');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/bookings/${booking._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(patch)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');

      if (data.changes?.length > 0) {
        toast.success(data.emailSent
          ? 'Booking updated — customer notified by email'
          : 'Booking updated — email could NOT be sent, contact the customer manually');
      } else {
        toast.success('Booking updated');
      }
      setBooking(data.booking);
      setForm({ ...data.booking });
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCancellationDecision = async (action: 'approve' | 'reject') => {
    if (!booking) return;
    setDeciding(true);
    try {
      const res = await fetch(`/api/admin/bookings/${booking._id}/cancellation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, response: decisionResponse })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Decision failed');
      toast.success(`Cancellation ${action}d — customer notified${data.emailSent ? ' by email' : ' (email failed)'}`);
      await load();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Decision failed');
    } finally {
      setDeciding(false);
    }
  };

  if (loading || !form || !booking) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12"><Loader className="w-8 h-8 animate-spin text-secondary" /></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <button onClick={() => router.push('/admin/bookings')} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> All bookings
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Booking #{booking.clientBookingId}</h1>
          <p className="text-sm text-gray-500">Created {new Date(booking.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${booking.payment?.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            payment: {booking.payment?.status || 'none'}
          </span>
        </div>
      </div>

      {/* Cancellation request panel */}
      {booking.cancellation?.status === 'requested' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <h2 className="font-semibold text-amber-800 mb-1">Cancellation requested</h2>
          <p className="text-sm text-amber-700 mb-3">Reason: “{booking.cancellation.reason}”</p>
          <input
            value={decisionResponse}
            onChange={e => setDecisionResponse(e.target.value)}
            placeholder="Optional note to the customer…"
            className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm mb-3 bg-white"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleCancellationDecision('approve')}
              disabled={deciding}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> Approve (cancel ride)
            </button>
            <button
              onClick={() => handleCancellationDecision('reject')}
              disabled={deciding}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <X className="w-4 h-4" /> Reject (keep ride)
            </button>
          </div>
        </div>
      )}
      {booking.cancellation && booking.cancellation.status !== 'requested' && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-sm text-gray-700">
          Cancellation request was <strong>{booking.cancellation.status}</strong>
          {booking.cancellation.adminResponse && <> — “{booking.cancellation.adminResponse}”</>}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: editable booking */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Route</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Pickup address</label>
                <LocationInput
                  value={form.pickup || null}
                  onChange={place => handleAddressChange(place, 'pickup')}
                  placeholder="Pickup address"
                  translations={translations}
                  onClear={() => setPriceStale(true)}
                />
              </div>
              {(form.stopovers || []).filter(s => s?.mainAddress).map((stop, i) => (
                <p key={i} className="text-sm text-gray-600 pl-2 border-l-2 border-gray-200">Via: {stop.mainAddress}</p>
              ))}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Destination address</label>
                <LocationInput
                  value={form.destination || null}
                  onChange={place => handleAddressChange(place, 'destination')}
                  placeholder="Destination address"
                  translations={translations}
                  onClear={() => setPriceStale(true)}
                />
              </div>
              {form.isReturn && (
                <p className="text-sm text-gray-600">
                  Return: {form.destinationAddress} → {form.returnDestination?.mainAddress || form.sourceAddress}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Distance: {form.directDistance || '—'}
                {form.extraDistance && form.extraDistance !== '0 km' ? ` (+${form.extraDistance} via stopovers)` : ''}
                {form.isReturn && form.returnDistance ? ` · return leg ${form.returnDistance}` : ''}
              </p>
            </div>
          </section>

          {/* Schedule & details */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Trip details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Pickup date &amp; time</label>
                <input
                  type="datetime-local"
                  value={toLocalInput(form.pickupDateTime)}
                  onChange={e => setField('pickupDateTime', fromLocalInput(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              {form.isReturn && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Return date &amp; time</label>
                  <input
                    type="datetime-local"
                    value={toLocalInput(form.returnDateTime)}
                    onChange={e => setField('returnDateTime', fromLocalInput(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Passengers</label>
                <input
                  type="number" min={1} max={8}
                  value={form.passengers}
                  onChange={e => setField('passengers', Math.max(parseInt(e.target.value) || 1, 1))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Vehicle</label>
                <select
                  value={form.vehicle}
                  onChange={e => { setField('vehicle', e.target.value as 'stationWagon' | 'bus'); setPriceStale(true); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="stationWagon">Station wagon</option>
                  <option value="bus">Bus</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Flight number</label>
                <input
                  value={form.flightNumber || ''}
                  onChange={e => setField('flightNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Incoming flight number</label>
                <input
                  value={form.incomingFlightNumber || ''}
                  onChange={e => setField('incomingFlightNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Remarks</label>
                <textarea
                  value={form.remarks || ''}
                  onChange={e => setField('remarks', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                />
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className={`bg-white rounded-xl shadow-sm border p-4 sm:p-6 ${priceStale ? 'border-amber-300' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Fare</h2>
              <button
                onClick={handleReprice}
                disabled={repricing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-secondary bg-primary/10 rounded-lg hover:bg-primary/20 disabled:opacity-50"
              >
                <Calculator className="w-4 h-4" />
                {repricing ? 'Calculating…' : 'Recalculate price'}
              </button>
            </div>
            {priceStale && (
              <p className="text-xs text-amber-600 mb-3">Route changed — recalculate, or set the price manually below.</p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Total price (€)</label>
                <input
                  type="number" min={0} step={0.01}
                  value={form.price}
                  onChange={e => { setField('price', parseFloat(e.target.value) || 0); setPriceStale(false); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold"
                />
              </div>
              <div className="text-sm text-gray-600 self-end pb-2">
                {form.isFixedPrice ? 'Fixed route price' : 'Distance-based price'}
                {form.isReturn && typeof form.returnPrice === 'number' && form.returnPrice > 0 && (
                  <> · return leg €{form.returnPrice.toFixed(2)}</>
                )}
              </div>
            </div>
          </section>

          {/* Status + save */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Booking status</label>
                <select
                  value={form.status}
                  onChange={e => setField('status', e.target.value as Booking['status'])}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save changes & notify customer'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Saving emails the customer a summary of the changes and adds a notification to their account.
            </p>
          </section>
        </div>

        {/* Right: customer & payment (read-only) */}
        <div className="space-y-6">
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Customer</h2>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-gray-500">Name</dt><dd className="text-gray-900 font-medium">{booking.contactInfo?.fullName || '—'}</dd></div>
              <div><dt className="text-gray-500">Email</dt><dd className="text-gray-900 break-all">{booking.contactInfo?.email || '—'}</dd></div>
              <div><dt className="text-gray-500">Phone</dt><dd className="text-gray-900">{booking.contactInfo?.phoneNumber || '—'}</dd></div>
              {booking.bookingForOther?.fullName && (
                <div><dt className="text-gray-500">Riding passenger</dt><dd className="text-gray-900">{booking.bookingForOther.fullName} ({booking.bookingForOther.phoneNumber})</dd></div>
              )}
              <div><dt className="text-gray-500">Type</dt><dd className="text-gray-900 capitalize">{booking.bookingType}</dd></div>
              {booking.businessInfo?.companyName && (
                <div><dt className="text-gray-500">Company</dt><dd className="text-gray-900">{booking.businessInfo.companyName}</dd></div>
              )}
            </dl>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Payment</h2>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-gray-500">Status</dt><dd className="text-gray-900 font-medium">{booking.payment?.status || 'none'}</dd></div>
              <div><dt className="text-gray-500">Method</dt><dd className="text-gray-900">{booking.payment?.paymentMethod || '—'}</dd></div>
              <div><dt className="text-gray-500">Paid at</dt><dd className="text-gray-900">{booking.payment?.paidAt ? new Date(booking.payment.paidAt).toLocaleString() : '—'}</dd></div>
              <div><dt className="text-gray-500">Amount</dt><dd className="text-gray-900 font-semibold">€{(booking.price || 0).toFixed(2)}</dd></div>
            </dl>
            <p className="text-xs text-gray-400 mt-3">
              Changing the fare here does not charge or refund automatically — settle differences with the customer directly.
            </p>
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Luggage</h2>
            {booking.hasLuggage && booking.luggage ? (
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Large: {booking.luggage.regularLuggage?.large ?? 0}</li>
                <li>Small: {booking.luggage.regularLuggage?.small ?? 0}</li>
                <li>Hand luggage: {booking.luggage.regularLuggage?.handLuggage ?? 0}</li>
                {Object.entries(booking.luggage.specialLuggage || {})
                  .filter(([, count]) => (count as number) > 0)
                  .map(([key, count]) => <li key={key}>{key}: {count as number}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No luggage</p>
            )}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) }
});

export default withAdminAuth(AdminBookingDetailPage);
