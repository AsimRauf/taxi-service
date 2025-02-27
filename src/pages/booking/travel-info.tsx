import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { MapPin, Plus, Minus, ArrowUpDown } from 'lucide-react';
import { Stepper } from '@/components/booking/Stepper';
import { LocationInput } from '@/components/forms/booking/LocationInput';
import { Location, BookingData } from '@/types/booking';
import { calculateSegmentDistances } from '@/utils/distanceCalculations';
import { createTranslationsObject } from '@/utils/translations';
import { calculatePrice } from '@/utils/pricingCalculator';
import { Plane, ArrowRight } from 'lucide-react';
import { DateSelector } from '@/components/forms/booking/DateSelector';
import { isBefore, addHours } from 'date-fns';
import { useEdit } from '@/contexts/EditContext';


export const TravelInfoPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { isEditing, editingBookingId, setEditMode } = useEdit();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const translations = createTranslationsObject(t, router.locale || 'en');

  useEffect(() => {
    const savedData = localStorage.getItem('bookingData');
    if (!savedData) {
      router.push('/booking/offers');
      return;
    }
    const parsedData: BookingData = JSON.parse(savedData);
    if (!parsedData.vehicle) {
      router.push('/booking/offers');
      return;
    }
    // Ensure stopovers array is initialized
    if (!parsedData.stopovers) {
      parsedData.stopovers = [];
    }
    setBookingData(parsedData);
  }, [router]);

  const validateDates = (pickup: string | null, returnDate: string | null): boolean => {
    if (!pickup) return false;

    const pickupDate = new Date(pickup.replace(' ', 'T'));
    const minimumDate = addHours(new Date(), 2); // Minimum 2 hours from now

    if (isBefore(pickupDate, minimumDate)) return false;

    if (returnDate) {
      const returnDateTime = new Date(returnDate.replace(' ', 'T'));
      if (isBefore(returnDateTime, pickupDate)) return false;
    }

    return true;
  };

  const handleContinue = () => {
    if (!bookingData) {
      return;
    }

    const errors: Record<string, string> = {};

    if (!bookingData.pickup) {
      errors.pickup = t('travelInfo.errors.requiredLocations');
    }
    if (!bookingData.destination) {
      errors.destination = t('travelInfo.errors.requiredLocations');
    }

    if (!bookingData.pickupDateTime) {
      errors.pickupDate = t('travelInfo.errors.pickupDateRequired');
    } else {
      const now = new Date();
      if (isBefore(bookingData.pickupDateTime, now)) {
        errors.pickupDate = t('travelInfo.errors.invalidPickupTime');
      }
    }

    if (bookingData.isReturn) {
      if (!bookingData.returnDateTime) {
        errors.returnDate = t('travelInfo.errors.returnDateRequired');
      } else if (isBefore(bookingData.returnDateTime, bookingData.pickupDateTime!)) {
        errors.returnDate = t('travelInfo.errors.invalidReturnTime');
      }
    }

    if (bookingData.pickup && bookingData.destination &&
      bookingData.pickup.value.place_id === bookingData.destination.value.place_id) {
      errors.destination = t('travelInfo.errors.invalidRoute');
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    // Save flight info and remarks
    const updatedData: BookingData = {
      ...bookingData,
      flightNumber: bookingData.flightNumber || '',
      remarks: bookingData.remarks || ''
    };

    if (isEditing && editingBookingId) {
      const allBookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
      const updatedBookings = allBookings.map((booking: BookingData) => {
        if (booking.id === editingBookingId) {
          return updatedData;
        }
        return booking;
      });
      localStorage.setItem('allBookings', JSON.stringify(updatedBookings));
      setEditMode(null);
      router.push('/booking/overview');
    } else {
      localStorage.setItem('bookingData', JSON.stringify(updatedData));
      router.push('/booking/personal-info');
    }
  };

  const handleReturnTripChange = async (checked: boolean) => {
    if (!bookingData) return;

    const updatedData = {
      ...bookingData,
      returnDateTime: checked ? '' : null,
      isReturn: checked
    };

    // Update state first to ensure UI consistency
    setBookingData(updatedData);

    // Then recalculate price if we have the necessary data
    if (updatedData.pickup?.mainAddress && updatedData.destination?.mainAddress) {
      const segments = await calculateSegmentDistances(
        updatedData.pickup,
        updatedData.destination,
        (updatedData.stopovers || []).filter(stopover =>
          stopover &&
          stopover.mainAddress &&
          stopover.mainAddress.length > 0
        )
      );

      const calculatedPrices = calculatePrice(
        updatedData.pickup.mainAddress,
        updatedData.destination.mainAddress,
        segments[0].distance,
        segments[1]?.distance || '0 km'
      );

      const basePrice = updatedData.vehicle ? calculatedPrices[updatedData.vehicle] : 0;
      const finalPrice = checked ? basePrice * 2 : basePrice;

      const finalData = {
        ...updatedData,
        price: finalPrice,
        isFixedPrice: calculatedPrices.isFixedPrice,
        directDistance: segments[0].distance || '0 km',
        extraDistance: segments[1]?.distance || '0 km'
      };

      setBookingData(finalData);
      localStorage.setItem('bookingData', JSON.stringify(finalData));
    } else {
      localStorage.setItem('bookingData', JSON.stringify(updatedData));
    }
  };

  const updateBookingData = async (updatedData: BookingData) => {
    setBookingData(updatedData);
    localStorage.setItem('bookingData', JSON.stringify(updatedData));

    if (!updatedData.pickup?.mainAddress || !updatedData.destination?.mainAddress) return;

    try {
      const validStopovers = (updatedData.stopovers || []).filter(stopover =>
        stopover &&
        stopover.mainAddress &&
        stopover.mainAddress.length > 0
      );

      const segments = await calculateSegmentDistances(
        updatedData.pickup,
        updatedData.destination,
        validStopovers
      );

      const calculatedPrices = calculatePrice(
        updatedData.pickup.mainAddress,
        updatedData.destination.mainAddress,
        segments[0].distance,
        segments[1]?.distance || '0 km'
      );

      // Calculate base price first
      const basePrice = updatedData.vehicle ? calculatedPrices[updatedData.vehicle] : 0;

      // Double the price if it's a return trip using isReturn flag
      const finalPrice = updatedData.isReturn ? basePrice * 2 : basePrice;

      const finalData: BookingData = {
        ...updatedData,
        directDistance: segments[0].distance || '0 km',
        extraDistance: segments[1]?.distance || '0 km',
        price: finalPrice,
        isFixedPrice: calculatedPrices.isFixedPrice,
      };

      setBookingData(finalData);
      localStorage.setItem('bookingData', JSON.stringify(finalData));
    } catch (error) {
      console.error('Error updating route:', error);
    }
  };

  const handleBack = () => {
    if (isEditing) {
      setEditMode(null);
      router.push('/booking/overview');
    } else {
      router.back();
    }
  };

  const handleLocationUpdate = (newLocation: Location | null, type: 'pickup' | 'destination' | 'stopover', index?: number) => {
    if (!bookingData) return;

    const updatedData = { ...bookingData };

    if (type === 'stopover' && typeof index !== 'undefined') {
      if (!newLocation?.mainAddress) {
        alert(t('errors.invalidStopover'));
        return;
      }
      updatedData.stopovers[index] = newLocation;
    } else if (type === 'pickup') {
      updatedData.pickup = newLocation || {} as Location;
      updatedData.sourceAddress = newLocation?.mainAddress || '';

      // Check if pickup and destination are the same
      if (newLocation?.mainAddress && newLocation.mainAddress === updatedData.destination?.mainAddress) {
        alert(t('errors.duplicateLocation'));
        return;
      }
    } else if (type === 'destination') {
      updatedData.destination = newLocation || {} as Location;
      updatedData.destinationAddress = newLocation?.mainAddress || '';

      // Clear flight number if destination is not an airport
      if (!newLocation?.mainAddress?.toLowerCase().includes('airport')) {
        updatedData.flightNumber = '';
      }

      // Check if pickup and destination are the same
      if (newLocation?.mainAddress && newLocation.mainAddress === updatedData.pickup?.mainAddress) {
        alert(t('errors.duplicateLocation'));
        return;
      }
    }

    updateBookingData(updatedData);
  };

  const swapLocations = () => {
    if (!bookingData?.pickup || !bookingData?.destination) return;

    const newPickup = { ...bookingData.destination };
    const newDestination = { ...bookingData.pickup };

    const updatedData = {
      ...bookingData,
      pickup: newPickup,
      destination: newDestination,
      sourceAddress: newPickup.mainAddress || '',
      destinationAddress: newDestination.mainAddress || '',
    };

    updateBookingData(updatedData);
  };

  const addStopover = () => {
    if (!bookingData) return;

    // Initialize stopovers array if it doesn't exist
    const currentStopovers = bookingData.stopovers || [];

    // Check maximum stopovers
    if (currentStopovers.length >= 3) {
      alert(t('errors.maxStopovers'));
      return;
    }

    const updatedData: BookingData = {
      ...bookingData,
      stopovers: [
        ...currentStopovers,
        {
          description: '',
          label: '',
          value: {
            place_id: '',
            description: '',
            structured_formatting: {
              main_text: '',
              secondary_text: '',
              place_id: '',
            }
          },
          mainAddress: '',
          secondaryAddress: ''
        }
      ]
    };

    // Don't recalculate distances for empty stopovers
    setBookingData(updatedData);
    localStorage.setItem('bookingData', JSON.stringify(updatedData));
  };

  const removeStopover = async (index: number) => {
    if (!bookingData) return;

    const updatedStopovers = [...bookingData.stopovers];
    updatedStopovers.splice(index, 1);

    const updatedData: BookingData = {
      ...bookingData,
      stopovers: updatedStopovers,
    };

    updateBookingData(updatedData);
  };

  const renderPickupLocation = () => (
    <div className="grid grid-cols-[24px_1fr_24px] xs:grid-cols-[32px_1fr_32px] sm:grid-cols-[48px_1fr_48px] items-start gap-1 sm:gap-2">
      <div className="flex justify-center pt-8">
        <div className="w-6 h-6 rounded-full mt-2 bg-primary flex items-center justify-center relative z-10">
          <MapPin className="text-white" size={16} />
        </div>
      </div>
      <div className="w-full space-y-1">
        <span className="block text-sm font-medium text-gray-600">{t('booking.from')}</span>
        <LocationInput
          value={bookingData?.pickup || null}
          onChange={(place) => {
            if (!place) return;
            const location: Location = {
              ...place.value,
              label: place.label,
              mainAddress: place.value.description,
              description: place.value.description,
              secondaryAddress: place.value.structured_formatting?.secondary_text || '',
              value: {
                place_id: place.value.place_id,
                description: place.value.description,
                structured_formatting: place.value.structured_formatting
              }
            };
            handleLocationUpdate(location, 'pickup');
          }}
          placeholder={t('hero.pickupPlaceholder')}
          translations={translations}
          onClear={() => handleLocationUpdate(null, 'pickup')}
        />
      </div>
      <div className="flex justify-center pt-7">
        <button
          type="button"
          onClick={swapLocations}
          className="p-2 mt-2 rounded-full hover:bg-gray-100 transition-colors"
          title={t('hero.swapLocations')}
        >
          <ArrowUpDown size={20} className="text-secondary" />
        </button>
      </div>
    </div>
  );

  const renderStopovers = () => (
    <>
      {bookingData?.stopovers.map((stopover, index) => (
        <div key={index} className="grid grid-cols-[24px_1fr_24px] xs:grid-cols-[32px_1fr_32px] sm:grid-cols-[48px_1fr_48px] items-start gap-1 sm:gap-2">
          <div className="flex justify-center pt-8">
            <div className="w-4 h-4 rounded-full bg-secondary mt-4 flex items-center justify-center relative z-10">
              <MapPin className="text-white" size={12} />
            </div>
          </div>
          <div className="w-full space-y-1">
            <span className="block text-sm font-medium text-gray-600">{t('travelInfo.via')}</span>
            <LocationInput
              value={stopover}
              onChange={(place) => {
                if (!place) return;
                const location: Location = {
                  ...place.value,
                  label: place.label,
                  mainAddress: place.value.description,
                  description: place.value.description,
                  secondaryAddress: place.value.structured_formatting?.secondary_text || '',
                  value: {
                    place_id: place.value.place_id,
                    description: place.value.description,
                    structured_formatting: place.value.structured_formatting
                  }
                };
                handleLocationUpdate(location, 'stopover', index);
              }}
              placeholder={`${t('hero.stopover')} ${index + 1}`}
              translations={translations}
              onClear={() => handleLocationUpdate(null, 'stopover', index)}
            />
          </div>
          <div className="flex justify-center pt-8">
            <button
              type="button"
              onClick={() => removeStopover(index)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Minus size={16} className="text-red-500" />
            </button>
          </div>
        </div>
      ))}
    </>
  );

  const renderDestination = () => (
    <div className="grid grid-cols-[24px_1fr_24px] xs:grid-cols-[32px_1fr_32px] sm:grid-cols-[48px_1fr_48px] items-start gap-1 sm:gap-2">
      <div className="flex justify-center pt-8">
        <div className="w-6 h-6 rounded-full mt-2 bg-green-500 flex items-center justify-center relative z-10">
          <MapPin className="text-white" size={16} />
        </div>
      </div>
      <div className="w-full space-y-1">
        <span className="block text-sm font-medium text-gray-600">{t('booking.to')}</span>
        <LocationInput
          value={bookingData?.destination || null}
          onChange={(place) => {
            if (!place) return;
            const location: Location = {
              ...place.value,
              label: place.label,
              mainAddress: place.value.description,
              description: place.value.description,
              secondaryAddress: place.value.structured_formatting?.secondary_text || '',
              value: {
                place_id: place.value.place_id,
                description: place.value.description,
                structured_formatting: place.value.structured_formatting
              }
            };
            handleLocationUpdate(location, 'destination');
          }}
          placeholder={t('hero.destinationPlaceholder')}
          translations={translations}
          onClear={() => handleLocationUpdate(null, 'destination')}
        />
      </div>
    </div>
  );

  const renderAddStopoverButton = () => (
    <div className="grid grid-cols-[24px_1fr_24px] xs:grid-cols-[32px_1fr_32px] sm:grid-cols-[48px_1fr_48px] items-center gap-1 sm:gap-2">
      <div className="flex justify-center">
        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center relative z-10">
          <Plus size={14} className="text-gray-600" />
        </div>
      </div>
      <button
        type="button"
        onClick={addStopover}
        className="w-full flex items-center gap-2 text-sm text-secondary hover:text-primary-dark text-left bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors h-[60px]"
      >
        <Plus size={16} />
        <span className="font-medium">{t('hero.addStopover')}</span>
      </button>
      <div></div>
    </div>
  );

  const isAirportDestination = bookingData?.destination?.mainAddress?.toLowerCase().includes('airport');

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/80 to-secondary pt-8 sm:pt-16 pb-8 sm:pb-16">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 mt-14">
        {isEditing ? (
          <button
            onClick={handleBack}
            className="text-white hover:text-gray-200 transition-colors mb-6"
          >
            ← {t('common.backToOverview')}
          </button>
        ) : (
          <Stepper currentStep="travel-info" />
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-xl mt-[130px] lg:mt-[165px]"
        >
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            {t('travelInfo.title')}
          </h2>

          <div className="flex items-center space-x-2 mb-6">
            <input
              type="checkbox"
              id="return"
              className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
              checked={Boolean(bookingData?.isReturn)}
              onChange={(e) => handleReturnTripChange(e.target.checked)}
            />
            <label htmlFor="return" className="text-sm font-medium text-gray-700 cursor-pointer">
              {t('hero.returnTrip')}
            </label>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-700">
              {t('travelInfo.airportCaution')}
            </p>
          </div>

          <div className="flex items-start justify-between bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                {t('travelInfo.rideDetails')}
              </h3>
              <div className="space-y-1">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  €{bookingData?.price?.toFixed(2) || '0.00'}
                  {bookingData?.returnDateTime !== null && bookingData?.price && (
                    <span className="text-sm text-gray-500 ml-2">
                      (€{(bookingData.price / 2).toFixed(2)} {t('offers.oneWayPrice')})
                    </span>
                  )}
                </div>
                {bookingData?.returnDateTime !== null && (
                  <div className="text-sm text-gray-600">
                    {t('offers.returnTripNote')}
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block bg-primary/10 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-primary text-sm sm:text-base font-medium">
                {bookingData?.vehicle === 'regular' ? t('offers.regularTaxi.name') : t('offers.vanTaxi.name')}
              </div>
              <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
                {t('travelInfo.totalPassengers', { count: bookingData?.passengers })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            <div className="space-y-6">
              {/* Pickup Section */}
              <div className="space-y-6">
                <div className="space-y-4 border-b border-gray-200 pb-6">
                  <h3 className="text-base font-medium text-gray-900">{t('travelInfo.pickupSection')}</h3>
                  <DateSelector
                    label={t('hero.pickupDateTime')}
                    value={bookingData?.pickupDateTime ? new Date(bookingData.pickupDateTime.replace(' ', 'T')) : null}
                    onChange={(date) => {
                      if (!bookingData) return;
                      const dateString = date ? date.toISOString().slice(0, 16).replace('T', ' ') : '';

                      if (!validateDates(dateString, bookingData.returnDateTime)) {
                        alert(t('errors.invalidPickupTime'));
                        return;
                      }

                      setBookingData({
                        ...bookingData,
                        pickupDateTime: dateString
                      });
                    }}
                    placeholder={t('hero.pickupDateTime')}
                  />
                  {validationErrors.pickupDate && (
                    <span className="text-red-500 text-sm mt-1">{validationErrors.pickupDate}</span>
                  )}
                </div>

                <div className="space-y-4 sm:space-y-6 relative">
                  <div className="absolute left-[12px] xs:left-[14px] sm:left-[24px] top-10 bottom-8 w-0.5 bg-gradient-to-b from-primary/80 to-green-500/80" />
                  {renderPickupLocation()}
                  {validationErrors.locations && (
                    <span className="text-red-500 text-sm mt-1">{validationErrors.locations}</span>
                  )}
                  {renderStopovers()}
                  {renderAddStopoverButton()}
                  {renderDestination()}
                  {validationErrors.dates && (
                    <span className="text-red-500 text-sm mt-1">{validationErrors.dates}</span>
                  )}
                </div>
              </div>

              {/* Return Section */}
              {bookingData?.isReturn && (
                <>
                  <div className="hidden md:block h-px bg-gray-200 my-6" />
                  <div className="space-y-6">
                    <div className="space-y-4 border-b border-gray-200 pb-6">
                      <h3 className="text-base font-medium text-gray-900">{t('travelInfo.returnSection')}</h3>
                      <DateSelector
                        label={t('hero.returnDateTime')}
                        value={bookingData?.returnDateTime ? new Date(bookingData.returnDateTime.replace(' ', 'T')) : null}
                        onChange={(date) => {
                          if (!bookingData) return;
                          const dateString = date ? date.toISOString().slice(0, 16).replace('T', ' ') : '';

                          setBookingData({
                            ...bookingData,
                            returnDateTime: dateString
                          });
                        }}
                        placeholder={t('hero.returnPlaceholder')}
                      />
                      {validationErrors.returnDate && (
                        <span className="text-red-500 text-sm mt-1">{validationErrors.returnDate}</span>
                      )}
                    </div>

                    <div className="space-y-4 sm:space-y-6 relative">
                      <div className="absolute left-[12px] xs:left-[14px] sm:left-[24px] top-10 bottom-8 w-0.5 bg-gradient-to-b from-green-500/80 to-primary/80" />
                      {renderPickupLocation()}
                      {renderStopovers()}
                      {renderAddStopoverButton()}
                      {renderDestination()}
                    </div>
                  </div>
                </>
              )}

            </div>

            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200" />

            {/* Right Column - Additional Details */}
            <div className="space-y-4 lg:mt-8">
              {isAirportDestination && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Plane size={18} className="text-secondary" />
                    {t('travelInfo.flightNumber')}
                    <span className="text-xs text-gray-500">({t('travelInfo.optional')})</span>
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder={t('travelInfo.flightNumberPlaceholder')}
                    value={bookingData?.flightNumber || ''}
                    onChange={(e) => {
                      if (!bookingData) return;
                      setBookingData({
                        ...bookingData,
                        flightNumber: e.target.value
                      });
                    }}
                  />
                </div>
              )}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('travelInfo.remarks')}
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary min-h-[100px]"
                  placeholder={t('travelInfo.remarksPlaceholder')}
                  value={bookingData?.remarks || ''}
                  onChange={(e) => {
                    if (!bookingData) return;
                    setBookingData({
                      ...bookingData,
                      remarks: e.target.value
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-between">
            <button
              onClick={handleBack}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isEditing ? t('common.backToOverview') : t('travelInfo.back')}
            </button>
            <button
              onClick={handleContinue}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full hover:bg-primary/90 transition-colors"
            >
              {isEditing ? t('common.update') : t('travelInfo.continue')}
              <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
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

export default TravelInfoPage;
