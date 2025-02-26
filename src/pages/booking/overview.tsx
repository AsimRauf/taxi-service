import { useState, useEffect, Fragment } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { Popover, Transition } from '@headlessui/react';
import {
  MoreVertical,
  Trash2,
  Copy,
  Car,
  ChevronDown,
  ArrowRight,
  Calendar,
  Phone,
  Mail,
  Luggage,
  Briefcase,
  Package,
  Accessibility,
  Footprints,
  Dog,
  Bike,
  Snowflake,
  Baby,
  Flag,
  Waves,
  User
} from 'lucide-react';
import { BookingData } from '@/types/booking';

const LuggageIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'large': return <Luggage className="w-6 h-6 text-primary" />;
    case 'small': return <Package className="w-6 h-6 text-primary" />;
    case 'handLuggage': return <Briefcase className="w-6 h-6 text-primary" />;
    default: return null;
  }
};

const SpecialLuggageIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'foldableWheelchair': return <Accessibility className="w-6 h-6 text-secondary" />;
    case 'rollator': return <Footprints className="w-6 h-6 text-secondary" />;
    case 'pets': return <Dog className="w-6 h-6 text-secondary" />;
    case 'bicycle': return <Bike className="w-6 h-6 text-secondary" />;
    case 'winterSports': return <Snowflake className="w-6 h-6 text-secondary" />;
    case 'stroller': return <Baby className="w-6 h-6 text-secondary" />;
    case 'golfBag': return <Flag className="w-6 h-6 text-secondary" />;
    case 'waterSports': return <Waves className="w-6 h-6 text-secondary" />;
    default: return null;
  }
};

interface BookingCardProps {
  booking: BookingData;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onEdit: (id: string, section: string) => void;
}

interface Address {
  mainAddress?: string;
}

interface RouteDisplayProps {
  pickup: Address;
  destination: Address;
  stopovers: Address[];
  isReturn: boolean;
}

const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleString();
};


const RouteDisplay = ({ pickup, destination, stopovers, isReturn }: RouteDisplayProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <div className="mt-2">
        <span className="text-sm font-medium text-gray-600">{t('overview.outbound')}</span>
      </div>
      <div className="flex items-center mt-1">
        <ArrowRight className="text-primary flex-shrink-0 w-4 h-4" />
        <span className="font-medium break-words">{pickup.mainAddress}</span>
      </div>
      {stopovers.map((stop: Address, index: number) => (
        <div key={index} className="flex items-center mt-2">
          <ArrowRight className="text-secondary flex-shrink-0 w-4 h-4" />
          <span className="text-gray-600 break-words">{stop.mainAddress}</span>
        </div>
      ))}
      <div className="flex items-center mt-2">
        <ArrowRight className="text-green-500 flex-shrink-0 w-4 h-4" />
        <span className="font-medium">{destination.mainAddress}</span>
      </div>

      {isReturn && (
        <div className="mt-6">
          <span className="text-sm font-medium text-gray-600">{t('overview.return')}</span>
          <div className="flex items-center mt-1">
            <ArrowRight className="text-primary flex-shrink-0 w-4 h-4" />
            <span className="font-medium">{destination.mainAddress}</span>
          </div>
          {stopovers.slice().reverse().map((stop: Address, index: number) => (
            <div key={index} className="flex items-center mt-2">
              <ArrowRight className="text-secondary flex-shrink-0 w-4 h-4" />
              <span className="text-gray-600">{stop.mainAddress}</span>
            </div>
          ))}
          <div className="flex items-center mt-2">
            <ArrowRight className="text-green-500 flex-shrink-0 w-4 h-4" />
            <span className="font-medium">{pickup.mainAddress}</span>
          </div>
        </div>
      )}
    </div>
  );
};


const BookingCard = ({ booking, onDelete, onDuplicate, onEdit }: BookingCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg mb-4"
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-sm">
                #{booking.id.slice(0, 8)}
              </span>
              <span className={`px-3 py-1 rounded-full ${booking.isFixedPrice ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                €{booking.price.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg inline-block">
              <Car className="w-4 h-4 text-blue-700" />
              {booking.vehicle === 'regular' ? t('overview.regularTaxi') : t('overview.vanTaxi')}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center gap-2 px-3 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors w-full sm:w-auto"
            >
              <span className="text-sm font-medium">{isExpanded ? t('overview.hideDetails') : t('overview.showDetails')}</span>
              <ChevronDown className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            <Popover className="relative w-full sm:w-auto">
              {() => (
                <>
                  <Popover.Button className="flex items-center justify-center gap-2 px-3 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors w-full">
                    <span className="text-sm font-medium">{t('overview.actions')}</span>
                    <MoreVertical className="w-4 h-4" />
                  </Popover.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute right-0 z-50 mt-2 w-56 transform">
                      <div className="overflow-hidden rounded-xl shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="relative bg-white p-2 space-y-1">
                          <button
                            onClick={() => onEdit(booking.id, 'travel-info')}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/10 rounded-lg"
                          >
                            <ArrowRight className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">{t('overview.editRoute')}</span>
                          </button>
                          <button
                            onClick={() => onEdit(booking.id, 'luggage')}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/10 rounded-lg"
                          >
                            <Luggage className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">{t('overview.editLuggage')}</span>
                          </button>
                          <button
                            onClick={() => onEdit(booking.id, 'offers')}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/10 rounded-lg"
                          >
                            <Car className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">{t('overview.editVehicle')}</span>
                          </button>
                          <button
                            onClick={() => onEdit(booking.id, 'personal-info')}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/10 rounded-lg"
                          >
                            <User className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">{t('overview.editPersonalInfo')}</span>
                          </button>
                          <div className="h-px bg-gray-200 my-1" />
                          <button
                            onClick={() => onDuplicate(booking.id)}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/10 rounded-lg"
                          >
                            <Copy className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">{t('overview.duplicate')}</span>
                          </button>
                          <button
                            onClick={() => onDelete(booking.id)}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">{t('overview.delete')}</span>
                          </button>
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4">
            <RouteDisplay
              pickup={booking.pickup}
              destination={booking.destination}
              stopovers={booking.stopovers}
              isReturn={booking.isReturn}
            />
            <div className="mt-4">
              <h4 className="font-medium text-gray-700">{t('overview.schedule')}</h4>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p>{t('overview.pickup')}: {formatDateTime(booking.pickupDateTime)}</p>
                  {booking.isReturn && (
                    <p className="text-gray-600">{t('overview.return')}: {formatDateTime(booking.returnDateTime)}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium text-gray-700">{t('overview.passengerDetails')}</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                {booking.bookingForOther ? (
                  <>
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">{t('overview.bookedBy')}:</p>
                      <div className="space-y-1">
                        <p className="font-medium">{booking.contactInfo?.fullName}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {booking.contactInfo?.phoneNumber}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {booking.contactInfo?.email}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('overview.passenger')}:</p>
                      <div className="space-y-1">
                        <p className="font-medium">{booking.bookingForOther.fullName}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {booking.bookingForOther.phoneNumber}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <p className="font-medium">{booking.contactInfo?.fullName}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {booking.contactInfo?.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      {booking.contactInfo?.phoneNumber}
                    </div>
                    {booking.contactInfo?.additionalPhoneNumber && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {booking.contactInfo.additionalPhoneNumber}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium text-gray-700">{t('overview.luggage')}</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  {Object.entries(booking.luggage.regularLuggage)
                    .filter(([, count]) => count > 0)
                    .map(([luggageType, count]) => (
                      <div key={luggageType} className="flex items-center gap-3">
                        <LuggageIcon type={luggageType} />
                        <span className="text-sm font-medium">
                          {count}x {t(`luggage.${luggageType}.title`)}
                        </span>
                      </div>
                    ))}

                  {Object.entries(booking.luggage.specialLuggage)
                    .filter(([, count]) => count > 0)
                    .map(([luggageType, count]) => (
                      <div key={luggageType} className="flex items-center gap-3">
                        <SpecialLuggageIcon type={luggageType} />
                        <span className="text-sm font-medium">
                          {count}x {t(`luggage.special.${luggageType}.title`)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {(booking.flightNumber || booking.remarks) && (
              <div className="mt-4 border-t pt-4">
                {booking.flightNumber && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700">{t('overview.flightNumber')}</h4>
                    <p className="text-sm mt-1">{booking.flightNumber}</p>
                  </div>
                )}
                {booking.remarks && (
                  <div>
                    <h4 className="font-medium text-gray-700">{t('overview.additionalNotes')}</h4>
                    <p className="text-sm mt-1">{booking.remarks}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const OverviewPage = () => {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const savedBookings = localStorage.getItem('allBookings');
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    }
  }, []);

  const handleDelete = (id: string) => {
    const updatedBookings = bookings.filter(booking => booking.id !== id);
    setBookings(updatedBookings);
    localStorage.setItem('allBookings', JSON.stringify(updatedBookings));
  };

  const handleDuplicate = (id: string) => {
    const bookingToDuplicate = bookings.find(booking => booking.id === id);
    if (bookingToDuplicate) {
      const newBooking = {
        ...bookingToDuplicate,
        id: uuidv4()
      };
      const updatedBookings = [...bookings, newBooking];
      setBookings(updatedBookings);
      localStorage.setItem('allBookings', JSON.stringify(updatedBookings));
    }
  };

  const handleEdit = (id: string, section: string) => {
    const bookingToEdit = bookings.find(booking => booking.id === id);
    if (bookingToEdit) {
      localStorage.setItem('bookingData', JSON.stringify(bookingToEdit));
      localStorage.setItem('editingBookingId', id);
      router.push(`/booking/${section}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/80 to-secondary pt-8 sm:pt-16 pb-8 sm:pb-16">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 mt-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {t('overview.title')}
          </h1>
        </div>

        <div className="space-y-4">
          {bookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl p-8 text-center"
            >
              <p className="text-gray-600">{t('overview.noBookings')}</p>
            </motion.div>
          ) : (
            bookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onEdit={handleEdit}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  }
};

export default OverviewPage;