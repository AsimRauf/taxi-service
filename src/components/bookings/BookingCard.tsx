import { FC } from 'react';
import { useTranslation } from 'next-i18next';
import { MapPin, Users, Clock, Calendar, Briefcase, Tag } from 'react-feather';
import { Car, Plane } from 'lucide-react';
import { Booking } from '@/types/booking';


interface BookingCardProps {
  booking: Booking;
}

const BookingCard: FC<BookingCardProps> = ({ booking }) => {
  const { t } = useTranslation('common');
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

          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 gap-3 xs:gap-4">
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
      </div>
    </div>
  );
};

export default BookingCard;