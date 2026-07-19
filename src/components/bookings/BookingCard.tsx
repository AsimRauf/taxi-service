import { FC, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { Users, Clock, Calendar, Briefcase } from 'react-feather';
import { Car, Plane, AlertCircle, RotateCcw, Map, CreditCard } from 'lucide-react';
import { Booking, BookingStatus } from '@/types/booking';
import Modal from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';

interface BookingCardProps {
  booking: Booking;
  onRefresh?: () => void;
}

// Customers can cancel free of charge up to this long before pickup —
// must match the server-side rule in /api/bookings/cancel/[id].ts
const CANCELLATION_WINDOW_HOURS = 3;

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border border-amber-200',
  confirmed: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  'in-progress': 'bg-sky-100 text-sky-800 border border-sky-200',
  completed: 'bg-blue-100 text-blue-800 border border-blue-200',
  cancelled: 'bg-red-100 text-red-800 border border-red-200',
  'no-show': 'bg-gray-200 text-gray-700 border border-gray-300'
};

const BookingCard: FC<BookingCardProps> = ({ booking, onRefresh }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const locale = router.locale === 'nl' ? 'nl-NL' : 'en-GB';

  const formatDateTime = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
    if (isNaN(date.getTime())) return { date: value, time: '' };
    return {
      date: date.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false })
    };
  };

  const pickup = formatDateTime(booking.pickupDateTime);
  const returnTrip = booking.isReturn ? formatDateTime(booking.returnDateTime) : null;
  const returnDropoffAddress = booking.returnDestination?.mainAddress || booking.sourceAddress;

  const status: BookingStatus = (booking.status in STATUS_STYLES ? booking.status : 'pending') as BookingStatus;
  const isPaid = booking.payment?.status === 'completed';

  const isCancellable = () => {
    const pickupTime = new Date(booking.pickupDateTime.replace(' ', 'T'));
    const windowMs = CANCELLATION_WINDOW_HOURS * 60 * 60 * 1000;
    return pickupTime.getTime() - Date.now() > windowMs &&
      (booking.status === 'pending' || booking.status === 'confirmed') &&
      !booking.cancellation;
  };

  const handleCancelRequest = async () => {
    if (!cancellationReason.trim()) {
      toast.error(t('booking.provideCancellationReason'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/bookings/cancel/${booking._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason: cancellationReason })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('booking.cancellationError'));
      }

      toast.success(t('booking.cancellationRequestSubmitted'));
      setShowCancelModal(false);
      setCancellationReason('');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Cancellation request failed:', error);
      toast.error(error instanceof Error ? error.message : t('booking.cancellationError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTotalDistance = () => {
    const direct = parseFloat(booking.directDistance?.replace(' km', '') || '0') || 0;
    const extra = booking.extraDistance ? parseFloat(booking.extraDistance.replace(' km', '')) || 0 : 0;
    return (direct + extra).toFixed(1) + ' km';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-secondary/20 hover:shadow-md transition-shadow duration-200">
      <div className="p-3 xs:p-4 sm:p-6 space-y-4 xs:space-y-5">

        {/* Header: reference + status badges */}
        <div className="flex flex-col xs:flex-row justify-between items-start gap-3">
          <div className="flex flex-col">
            <span className="text-xs xs:text-sm text-gray-500">{t('booking.title')}</span>
            <h3 className="text-base xs:text-lg font-semibold text-secondary">#{booking.clientBookingId}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs xs:text-sm font-medium ${STATUS_STYLES[status]}`}>
              {t(`booking.status.${status}`)}
            </span>
            <span className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${isPaid
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
              <CreditCard className="w-3.5 h-3.5" />
              {isPaid ? t('payment.statusCompleted') : t('payment.statusPending')}
            </span>
          </div>
        </div>

        {/* Cancellation status banner */}
        {booking.cancellation && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
            <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />
            <p className="text-sm text-yellow-700">
              {t(`booking.cancellationStatus.${booking.cancellation.status}`)}
            </p>
          </div>
        )}

        {/* Route */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center self-stretch">
              <div className="w-3 h-3 rounded-full bg-secondary mt-1.5" />
              <div className="w-0.5 flex-1 bg-gray-300" />
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <p className="text-xs text-gray-500">{t('booking.from')}</p>
              <p className="text-sm xs:text-base font-medium text-gray-900 break-words">{booking.sourceAddress}</p>
            </div>
          </div>

          {booking.stopovers?.map((stop, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex flex-col items-center self-stretch">
                <div className="w-3 h-3 rounded-full border-2 border-secondary bg-white mt-1.5" />
                <div className="w-0.5 flex-1 bg-gray-300" />
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <p className="text-xs text-gray-500">{t('travelInfo.via')}</p>
                <p className="text-sm xs:text-base font-medium text-gray-900 break-words">{stop.mainAddress}</p>
              </div>
            </div>
          ))}

          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-primary mt-1.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">{t('booking.to')}</p>
              <p className="text-sm xs:text-base font-medium text-gray-900 break-words">{booking.destinationAddress}</p>
            </div>
          </div>
        </div>

        {/* Return leg */}
        {booking.isReturn && (
          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
            <RotateCcw size={16} className="text-secondary mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="font-medium">
                {t('booking.returnTrip')}
                {returnTrip && `: ${returnTrip.date} ${returnTrip.time}`}
              </p>
              <p className="text-gray-500 break-words">
                {booking.destinationAddress} → {returnDropoffAddress}
              </p>
            </div>
          </div>
        )}

        {/* Key facts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 xs:gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-secondary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">{t('booking.pickupDate')}</p>
              <p className="text-sm font-medium text-gray-900">{pickup ? pickup.date : '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-secondary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">{t('booking.pickupTime')}</p>
              <p className="text-sm font-medium text-gray-900">{pickup ? pickup.time : '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-secondary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">{t('booking.passengers')}</p>
              <p className="text-sm font-medium text-gray-900">{booking.passengers}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-secondary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">{t('booking.vehicleType')}</p>
              <p className="text-sm font-medium text-gray-900">
                {booking.vehicle === 'bus' ? t('offers.busTaxi.name') : t('offers.stationWagonTaxi.name')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-secondary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">{t('luggage.title')}</p>
              <p className="text-sm font-medium text-gray-900">{booking.hasLuggage ? t('booking.yes') : t('booking.no')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-secondary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">{t('booking.distance')}</p>
              <p className="text-sm font-medium text-gray-900">{getTotalDistance()}</p>
            </div>
          </div>
          {(booking.flightNumber || booking.incomingFlightNumber) && (
            <div className="flex items-center gap-2 col-span-2 sm:col-span-3">
              <Plane className="w-4 h-4 text-secondary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">{t('booking.flightNumber')}</p>
                <p className="text-sm font-medium text-gray-900">
                  {[booking.flightNumber, booking.incomingFlightNumber].filter(Boolean).join(' / ')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Remarks */}
        {booking.remarks && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">{t('booking.remarks')}</p>
            <p className="text-sm text-gray-900">{booking.remarks}</p>
          </div>
        )}

        {/* Price */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <span className="text-xs xs:text-sm text-gray-500">
            {booking.isFixedPrice ? t('booking.fixedPrice') : t('booking.estimatedPrice')}
          </span>
          <span className="text-base xs:text-lg font-semibold text-secondary">
            €{(booking.price || 0).toFixed(2)}
          </span>
        </div>

        {/* Cancel */}
        {isCancellable() && (
          <div className="pt-1">
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50
              border border-red-100 rounded-lg hover:bg-red-100
              transition-colors duration-200"
            >
              {t('booking.cancelBooking')}
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              {t('booking.cancellationPolicy', { hours: CANCELLATION_WINDOW_HOURS })}
            </p>
          </div>
        )}

        {/* Cancellation Modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            setCancellationReason('');
          }}
          title={t('booking.cancelBookingTitle')}
        >
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-2">
              {t('booking.cancelBookingDescription')}
            </p>
            <p className="text-xs text-gray-400 mb-4">
              {t('booking.cancellationPolicy', { hours: CANCELLATION_WINDOW_HOURS })}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('booking.cancellationReason')} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2
                focus:ring-primary/20 focus:border-primary resize-none"
                placeholder={t('booking.cancellationReasonPlaceholder')}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancellationReason('');
                }}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white
                border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>

              <button
                type="button"
                onClick={handleCancelRequest}
                disabled={isSubmitting || !cancellationReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600
                rounded-lg hover:bg-red-700 disabled:opacity-50
                disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('common.processing') : t('booking.confirmCancellation')}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default BookingCard;
