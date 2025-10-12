import { useState, useEffect, Fragment } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { NextSeo } from 'next-seo';
import { useEdit } from '@/contexts/EditContext';
import { Popover, Transition } from '@headlessui/react';
import { useAuth } from '@/contexts/AuthContext';
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
import { Snackbar } from '@/components/ui/Snackbar';
import { determineVehicleAvailability } from '@/utils/pricingCalculator';
import { calculatePrice } from '@/utils/pricingCalculator';

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
  onBookingSuccess: (id: string) => void;
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

// Define a type for the vehicle info object
type VehicleInfo = {
  name: string;
  icon: string;
  bgColor: string;
  textColor: string;
};

// Define a type for the vehicle info map with an index signature
type VehicleInfoMap = {
  [key: string]: VehicleInfo;
  stationWagon: VehicleInfo;
  bus: VehicleInfo;
  sedan: VehicleInfo;
  default: VehicleInfo;
};

const getVehicleInfo = (vehicleType: 'stationWagon' | 'bus' | string | null | undefined, t: (key: string) => string) => {
  const info: VehicleInfoMap = {
    stationWagon: {
      name: t('offers.stationWagonTaxi.name'),
      icon: '🚙',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700'
    },
    bus: {
      name: t('offers.busTaxi.name'),
      icon: '🚐',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    // Add a fallback for 'sedan' that maps to stationWagon
    sedan: {
      name: t('offers.stationWagonTaxi.name'),
      icon: '🚙',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700'
    },
    // Add a default fallback
    default: {
      name: t('offers.stationWagonTaxi.name'),
      icon: '🚙',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700'
    }
  };

  // If vehicleType is undefined, null, or not in our info object, return the default
  if (!vehicleType || !(vehicleType in info)) {
    return info.default;
  }

  return info[vehicleType];
};

const BookingCard = ({ booking, onDelete, onDuplicate, onEdit }: BookingCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDuplicateSnackbar, setShowDuplicateSnackbar] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuth();


  const handleBookNow = async () => {
    setIsBooking(true);
    try {
      const bookingId = booking.id || booking.clientBookingId;
      
      // Create temporary booking data without saving to database
      const finalBookingData = {
        ...booking,
        userId: user?.id || null,
        clientBookingId: bookingId,
        status: 'pending'
      };

      // Create payment first
      const paymentResponse = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          bookingData: finalBookingData // Send full booking data
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        console.error('Payment creation failed:', errorData);
        throw new Error(`Failed to create payment: ${errorData.error || 'Unknown error'}`);
      }

      const paymentData = await paymentResponse.json();
      
      if (paymentData && paymentData.paymentUrl) {
        window.location.href = paymentData.paymentUrl;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (error) {
      console.error('Booking error:', error);
      setIsBooking(false);
      alert(t('booking.errors.createFailed'));
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg mb-4"
      >
        <div className="p-3 xs:p-4 sm:p-6">
          {/* Top Row - Booking ID and Actions */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs xs:text-sm">
              {booking.id}
            </span>

            <Popover className="relative">
              <Popover.Button className="flex items-center justify-center gap-1 px-2 py-1.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <span className="text-xs xs:text-sm font-medium whitespace-nowrap">{t('overview.actions')}</span>
                <MoreVertical className="w-3 h-3 xs:w-4 xs:h-4" />
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
            </Popover>
          </div>

          {/* Middle Row - Vehicle Type */}
          <div className="flex items-center gap-2 mb-3">
            {booking.vehicle && (
              <div className={`flex items-center gap-2 ${getVehicleInfo(booking.vehicle, t).bgColor} ${getVehicleInfo(booking.vehicle, t).textColor} px-2 py-1 rounded-lg text-xs xs:text-sm`}>
                <Car className={`w-3 h-3 xs:w-4 xs:h-4 ${getVehicleInfo(booking.vehicle, t).textColor}`} />
                <span className="whitespace-nowrap">
                  {getVehicleInfo(booking.vehicle, t).name}
                </span>
              </div>
            )}
          </div>

          {/* Price and Actions - Reorganized for mobile */}
          <div className="space-y-3">
            {/* Price Row */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full ${booking.isFixedPrice ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
              }`}>
              <span className="text-lg font-semibold">€{booking.price.toFixed(2)}</span>
              <span className="text-xs">{booking.isFixedPrice ? t('overview.fixedPrice') : t('overview.estimatedPrice')}</span>
            </div>

            {/* Actions Row */}
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex-1 flex items-center justify-center gap-1 px-2 xs:px-3 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <span className="text-xs xs:text-sm font-medium whitespace-nowrap">
                  {isExpanded ? t('overview.hideDetails') : t('overview.showDetails')}
                </span>
                <ChevronDown
                  className={`w-3 h-3 xs:w-4 xs:h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''
                    }`}
                />
              </button>

              <button
                onClick={handleBookNow}
                disabled={isBooking}
                className="flex-1 flex items-center justify-center gap-1 px-2 xs:px-3 py-2 text-white bg-primary hover:bg-primary/90 disabled:bg-gray-400 rounded-lg transition-colors"
              >
                {isBooking ? (
                  <>
                    <div className="w-3 h-3 xs:w-4 xs:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs xs:text-sm font-medium whitespace-nowrap">
                      {t('overview.booking')}
                    </span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-3 h-3 xs:w-4 xs:h-4" />
                    <span className="text-xs xs:text-sm font-medium whitespace-nowrap">
                      {t('overview.bookNow')}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Expanded content */}
          {isExpanded && (
            <div className="mt-4 text-sm border-t pt-4">
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

      <Snackbar
        isOpen={showDuplicateSnackbar}
        onClose={() => setShowDuplicateSnackbar(false)}
        message={t('booking.errors.duplicateBooking')}
        action={{
          label: t('overview.duplicate'),
          onClick: () => {
            onDuplicate(booking.id);
            setShowDuplicateSnackbar(false);
          }
        }}
      />
    </>
  );
};

export const OverviewPage = () => {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const router = useRouter();
  const { setEditMode } = useEdit();
  const { t } = useTranslation();
  const [showVehicleUpdateSnackbar, setShowVehicleUpdateSnackbar] = useState(false);

  // Continuously validate all bookings
  useEffect(() => {
    const validateAllBookings = () => {
      const updatedBookingIds: string[] = [];

      const updatedBookings = bookings.map(booking => {
        if (!booking.luggage || !booking.passengers) return booking;

        const vehicleAvailability = determineVehicleAvailability(
          booking.passengers,
          booking.luggage
        );

        // Check vehicle availability and upgrade if necessary
        if (booking.vehicle && !vehicleAvailability[booking.vehicle]) {
          updatedBookingIds.push(booking.id);

          // Determine the most suitable vehicle
          let newVehicle: 'stationWagon' | 'bus';
          if (vehicleAvailability.bus) {
            newVehicle = 'bus';
          } else {
            newVehicle = 'stationWagon';
          }

          const calculatedPrices = calculatePrice(
            booking.sourceAddress,
            booking.destinationAddress,
            booking.directDistance,
            booking.extraDistance,
            booking.pickup?.exactAddress ? {
              businessName: booking.pickup.exactAddress.businessName || '',
              city: booking.pickup.exactAddress.city || ''
            } : undefined,
            booking.destination?.exactAddress ? {
              businessName: booking.destination.exactAddress.businessName || '',
              city: booking.destination.exactAddress.city || ''
            } : undefined
          );

          // Calculate new price based on vehicle type
          const basePrice = calculatedPrices[newVehicle];
          const finalPrice = booking.isReturn ? basePrice * 2 : basePrice;

          return {
            ...booking,
            vehicle: newVehicle,
            price: finalPrice,
            isFixedPrice: calculatedPrices.isFixedPrice
          };
        }

        return booking;
      });

      if (updatedBookingIds.length > 0) {
        setBookings(updatedBookings);
        localStorage.setItem('allBookings', JSON.stringify(updatedBookings));
        setShowVehicleUpdateSnackbar(true);
      }
    };

    validateAllBookings();
  }, [bookings]);

  // Remove the old validation effect since we're now checking continuously
  useEffect(() => {
    const savedBookings = localStorage.getItem('allBookings');
    if (savedBookings) {
      const bookings = JSON.parse(savedBookings);
      const now = Date.now();
      const twoDays = 2 * 24 * 60 * 60 * 1000;
      const recentBookings = bookings.filter((booking: BookingData) => now - booking.createdAt < twoDays);
      setBookings(recentBookings);
      localStorage.setItem('allBookings', JSON.stringify(recentBookings));
    }
  }, []);

  // Update handleEdit to store additional info
  const handleEdit = (id: string, section: string) => {
    const bookingToEdit = bookings.find(booking => booking.id === id);
    if (bookingToEdit) {
      setEditMode(id);
      localStorage.setItem('editingBookingId', id);
      localStorage.setItem('previousSection', section);
      localStorage.setItem('bookingData', JSON.stringify(bookingToEdit));
      router.push(`/booking/${section}`);
    }
  };

  const handleDelete = (id: string) => {
    const updatedBookings = bookings.filter(booking => booking.id !== id);
    setBookings(updatedBookings);
    localStorage.setItem('allBookings', JSON.stringify(updatedBookings));
  };

  const handleDuplicate = async (id: string) => {
    const bookingToDuplicate = bookings.find(booking => booking.id === id);
    if (bookingToDuplicate) {
      // Generate booking ID from server
      const idResponse = await fetch('/api/bookings/generate-id');
      const idData = await idResponse.json();
      const newId = idData.bookingId;
      
      const newBooking = {
        ...bookingToDuplicate,
        id: newId, // Use the same ID
        clientBookingId: newId, // Use the same ID
        createdAt: Date.now(),
      };
      const updatedBookings = [...bookings, newBooking];
      setBookings(updatedBookings);
      localStorage.setItem('allBookings', JSON.stringify(updatedBookings));
    }
  };

  const handleBookingSuccess = (id: string) => {
    // Remove booking from local storage
    const updatedBookings = bookings.filter(b => b.id !== id);
    setBookings(updatedBookings);
    localStorage.setItem('allBookings', JSON.stringify(updatedBookings));
  };

  return (
    <>
      <NextSeo
        title={t('overview.title')}
        description={t('overview.noBookings')}
      />
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
                onBookingSuccess={handleBookingSuccess}
              />
            ))
          )}
        </div>

        {/* Add Snackbar for vehicle update notification */}
        <Snackbar
          isOpen={showVehicleUpdateSnackbar}
          onClose={() => setShowVehicleUpdateSnackbar(false)}
          message={
            <div className="space-y-1">
              <p className="font-semibold">{t('booking.vehicleUpdated.title')}</p>
              <p>{t('booking.vehicleUpdated.message')}</p>
              <p className="text-sm text-gray-200">
                {t('booking.vehicleUpdated.detailedMessage')}
              </p>
            </div>
          }
          duration={20000} 
        />
        </div>
      </div>
    </>
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
