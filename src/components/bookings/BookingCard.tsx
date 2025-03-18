import { FC, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { MapPin, Users, Clock, Calendar, Briefcase, Tag } from 'react-feather';
import { Car, Plane, AlertCircle, RotateCcw, ArrowRight, Milestone, Map } from 'lucide-react';
import { Booking } from '@/types/booking';
import Modal from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';

interface BookingCardProps {
  booking: Booking;
  onRefresh?: () => void;
}

const BookingCard: FC<BookingCardProps> = ({ booking, onRefresh }) => {
  const { t } = useTranslation('common');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const date = new Date(booking.pickupDateTime);
  const formattedDate = date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const statusColors = {
    pending: 'bg-amber-100 text-amber-800 border border-amber-200',
    confirmed: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    completed: 'bg-blue-100 text-blue-800 border border-blue-200',
    cancelled: 'bg-red-100 text-red-800 border border-red-200'
  };

  const isCancellable = () => {
    const now = new Date();
    const pickupTime = new Date(booking.pickupDateTime);
    const threeHoursInMs = 3 * 60 * 60 * 1000;
    return pickupTime.getTime() - now.getTime() > threeHoursInMs && 
           booking.status !== 'cancelled' && 
           booking.status !== 'completed' &&
           !booking.cancellation;
  };

  const handleCancelRequest = async () => {
    if (!cancellationReason.trim()) {
      toast.error(t('booking.provideCancellationReason'));
      return;
    }

    setIsSubmitting(true);
    try {
      // Add logging to verify the booking ID being sent
      console.log('Attempting to cancel booking:', {
        bookingId: booking._id,
        clientBookingId: booking.clientBookingId
      });

      const response = await fetch(`/api/bookings/cancel/${booking._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure token is sent
        },
        body: JSON.stringify({ 
          reason: cancellationReason,
          bookingId: booking._id // Add explicit bookingId in body as backup
        })
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
    const direct = parseFloat(booking.directDistance.replace(' km', ''));
    const extra = booking.extraDistance ? parseFloat(booking.extraDistance.replace(' km', '')) : 0;
    return (direct + extra).toFixed(1) + ' km';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-secondary/20 hover:shadow-md transition-shadow duration-200">
      <div className="p-3 xs:p-4 sm:p-6">
        <div className="flex flex-col xs:flex-row justify-between items-start gap-3 mb-4 xs:mb-6">
          <div className="flex flex-col">
            <span className="text-xs xs:text-sm text-gray-500">{t('booking.title')}</span>
            <h3 className="text-base xs:text-lg font-semibold text-secondary">#{booking.clientBookingId}</h3>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs xs:text-sm font-medium ${statusColors[booking.status as keyof typeof statusColors]}`}>
            {t(`booking.status.${booking.status}`)}
          </span>
        </div>

        <div className="space-y-4 xs:space-y-6">
          <div className="grid grid-cols-1 gap-3 xs:gap-4">
            <div className="flex items-start gap-2 xs:gap-3">
              <div className="bg-primary/10 p-1.5 xs:p-2 rounded-lg">
                <MapPin className="w-4 h-4 xs:w-5 xs:h-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs xs:text-sm text-gray-500">{t('booking.from')}</p>
                <p className="text-sm xs:text-base font-medium text-gray-900 break-words">{booking.sourceAddress}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 xs:gap-3">
              <div className="bg-primary/10 p-1.5 xs:p-2 rounded-lg">
                <MapPin className="w-4 h-4 xs:w-5 xs:h-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs xs:text-sm text-gray-500">{t('booking.to')}</p>
                <p className="text-sm xs:text-base font-medium text-gray-900 break-words">{booking.destinationAddress}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Pickup Date/Time */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-secondary" />
                <span>Pickup: {formattedDate} {formattedTime}</span>
              </div>
              {booking.isReturn && booking.returnDateTime && (
                <div className="flex items-center gap-2">
                  <RotateCcw size={16} className="text-secondary" />
                  <span>Return: {formattedDate} {formattedTime}</span>
                </div>
              )}
            </div>

            {/* Journey Path */}
            <div className="space-y-2">
              {/* Source */}
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-secondary mt-1" />
                  <div className="w-0.5 flex-1 bg-gray-300" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{booking.sourceAddress}</p>
                </div>
              </div>

              {/* Stopovers */}
              {booking.stopovers?.map((stop, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-3 h-3 rounded-full border-2 border-secondary bg-white mt-1" />
                    <div className="w-0.5 flex-1 bg-gray-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{stop.mainAddress}</p>
                    {stop.secondaryAddress && (
                      <p className="text-sm text-gray-500">{stop.secondaryAddress}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Destination */}
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-primary mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{booking.destinationAddress}</p>
                </div>
              </div>
            </div>

            {/* Distance Details */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <ArrowRight size={16} />
                <span>Direct: {booking.directDistance}</span>
              </div>
              {booking.extraDistance && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Milestone size={16} />
                  <span>Via stopovers: +{booking.extraDistance}</span>
                </div>
              )}
              <div className="flex items-center gap-2 font-medium text-secondary">
                <Map size={16} />
                <span>Total: {getTotalDistance()}</span>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 xs:gap-3">
              <div className="bg-primary/10 p-1.5 xs:p-2 rounded-lg">
                <Calendar className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-secondary" />
              </div>
              <div>
                <p className="text-xs xs:text-sm text-gray-500">{t('booking.pickupTime')}</p>
                <p className="text-sm xs:text-base font-medium text-gray-900">{formattedDate}</p>
              </div>
            </div>
            {/* Time */}
            <div className="flex items-center gap-2 xs:gap-3">
              <div className="bg-primary/10 p-1.5 xs:p-2 rounded-lg">
                <Clock className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-secondary" />
              </div>
              <div>
                <p className="text-xs xs:text-sm text-gray-500">{t('booking.pickupTime')}</p>
                <p className="text-sm xs:text-base font-medium text-gray-900">{formattedTime}</p>
              </div>
            </div>
            {/* Passengers */}
            <div className="flex items-center gap-2 xs:gap-3">
              <div className="bg-primary/10 p-1.5 xs:p-2 rounded-lg">
                <Users className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-secondary" />
              </div>
              <div>
                <p className="text-xs xs:text-sm text-gray-500">{t('booking.passengers')}</p>
                <p className="text-sm xs:text-base font-medium text-gray-900">{booking.passengers}</p>
              </div>
            </div>
            {/* Luggage */}
            <div className="flex items-center gap-2 xs:gap-3">
              <div className="bg-primary/10 p-1.5 xs:p-2 rounded-lg">
                <Briefcase className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-secondary" />
              </div>
              <div>
                <p className="text-xs xs:text-sm text-gray-500">{t('luggage.title')}</p>
                <p className="text-sm xs:text-base font-medium text-gray-900">{booking.hasLuggage ? t('booking.yes') : t('booking.no')}</p>
              </div>
            </div>

            {/* Vehicle Type */}
            <div className="flex items-center gap-2 xs:gap-3">
              <div className="bg-primary/10 p-1.5 xs:p-2 rounded-lg">
                <Car className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-secondary" />
              </div>
              <div>
                <p className="text-xs xs:text-sm text-gray-500">{t('booking.vehicleType')}</p>
                <p className="text-sm xs:text-base font-medium text-gray-900 capitalize">{booking.vehicle}</p>
              </div>
            </div>

            {/* Booking Type */}
            <div className="flex items-center gap-2 xs:gap-3">
              <div className="bg-primary/10 p-1.5 xs:p-2 rounded-lg">
                <Tag className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-secondary" />
              </div>
              <div>
                <p className="text-xs xs:text-sm text-gray-500">{t('booking.type')}</p>
                <p className="text-sm xs:text-base font-medium text-gray-900 capitalize">{booking.bookingType}</p>
              </div>
            </div>

            {/* Flight Number (if exists) */}
            {booking.flightNumber && (
              <div className="flex items-center gap-2 xs:gap-3">
                <div className="bg-primary/10 p-1.5 xs:p-2 rounded-lg">
                  <Plane className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-secondary" />
                </div>
                <div>
                  <p className="text-xs xs:text-sm text-gray-500">{t('booking.flightNumber')}</p>
                  <p className="text-sm xs:text-base font-medium text-gray-900">{booking.flightNumber}</p>
                </div>
              </div>
            )}

            {/* Return Trip Badge (if applicable) */}
            {booking.isReturn && (
              <div className="flex items-center">
                <span className="px-2.5 py-1 bg-primary/10 text-secondary text-xs xs:text-sm rounded-lg">
                  {t('booking.returnTrip')}
                </span>
              </div>
            )}
          </div>

          {/* Remarks (if exists) */}
          {booking.remarks && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs xs:text-sm text-gray-500 mb-1">{t('booking.remarks')}</p>
              <p className="text-sm xs:text-base text-gray-900">{booking.remarks}</p>
            </div>
          )}

          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 pt-3 xs:pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs xs:text-sm text-gray-500">{t('booking.distance')}:</span>
              <span className="text-sm xs:text-base font-medium text-gray-900">{booking.directDistance}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs xs:text-sm text-gray-500">
                {booking.isFixedPrice ? t('booking.fixedPrice') : t('booking.estimatedPrice')}:
              </span>
              <span className="text-base xs:text-lg sm:text-xl font-semibold text-secondary">
                €{booking.price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Add Cancel Button */}
        {isCancellable() && (
          <div className="px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-6 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 
                border border-red-100 rounded-lg hover:bg-red-100 
                transition-colors duration-200"
            >
              {t('booking.cancelBooking')}
            </button>
          </div>
        )}

        {/* Cancellation Status */}
        {booking.cancellation && (
          <div className="px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-6">
            <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <p className="text-sm text-yellow-700">
                {t(`booking.cancellationStatus.${booking.cancellation.status}`)}
              </p>
            </div>
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
            <p className="text-sm text-gray-600 mb-4">
              {t('booking.cancelBookingDescription')}
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