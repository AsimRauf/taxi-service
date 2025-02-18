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

export const TravelInfoPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
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
    if (!bookingData?.pickup || !bookingData?.destination) {
      alert(t('errors.requiredLocations'));
      return;
    }

    if (!bookingData.pickupDateTime) {
      alert(t('errors.pickupDateRequired'));
      return;
    }

    if (bookingData.returnDateTime === '') {
      alert(t('errors.returnDateRequired'));
      return;
    }

    if (!validateDates(bookingData.pickupDateTime, bookingData.returnDateTime)) {
      alert(t('errors.invalidDates'));
      return;
    }

    if (bookingData.price <= 0) {
      alert(t('errors.invalidPrice'));
      return;
    }

    console.log('Booking Data:', bookingData);

    router.push('/booking/personal-info');
  };

  const updateBookingData = async (updatedData: BookingData) => {
    setBookingData(updatedData);
    localStorage.setItem('bookingData', JSON.stringify(updatedData));

    if (!updatedData.pickup?.mainAddress || !updatedData.destination?.mainAddress) return;

    try {
      const segments = await calculateSegmentDistances(
        updatedData.pickup,
        updatedData.destination,
        updatedData.stopovers.filter(Boolean)
      );

      const calculatedPrices = calculatePrice(
        updatedData.pickup.mainAddress,
        updatedData.destination.mainAddress,
        segments[0].distance,
        segments[1]?.distance || '0 km'
      );

      const finalData: BookingData = {
        ...updatedData,
        directDistance: segments[0].distance || '0 km',
        extraDistance: segments[1]?.distance || '0 km',
        price: calculatedPrices[updatedData.vehicle] || 0,
        isFixedPrice: calculatedPrices.isFixedPrice,
      };

      setBookingData(finalData);
      localStorage.setItem('bookingData', JSON.stringify(finalData));
    } catch (error) {
      console.error('Error updating route:', error);
    }
  };

  const handleLocationUpdate = (newLocation: Location | null, type: 'pickup' | 'destination' | 'stopover', index?: number) => {
    if (!bookingData) return;

    const updatedData = { ...bookingData };

    if (type === 'stopover' && typeof index !== 'undefined') {
      updatedData.stopovers[index] = newLocation || {} as Location;
    } else if (type === 'pickup') {
      updatedData.pickup = newLocation || {} as Location;
      updatedData.sourceAddress = newLocation?.mainAddress || '';
    } else if (type === 'destination') {
      updatedData.destination = newLocation || {} as Location;
      updatedData.destinationAddress = newLocation?.mainAddress || '';
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
    const updatedData: BookingData = {
      ...bookingData,
      stopovers: [...bookingData.stopovers, {
        description: '',
        label: '',
        value: {
          place_id: '',
          description: '',
          structured_formatting: {
            main_text: '',
            secondary_text: ''
          }
        },
        mainAddress: '',
        secondaryAddress: ''
      }]
    };
    updateBookingData(updatedData);
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
        <span className="block text-sm font-medium text-gray-600">From</span>
        <LocationInput
          value={bookingData?.pickup || null}
          onChange={(place) => {
            if (!place) return;
            const location: Location = {
              ...place.value,
              label: place.label,
              mainAddress: place.value.description,
              description: place.value.description,
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
            <span className="block text-sm font-medium text-gray-600">Via</span>
            <LocationInput
              value={stopover}
              onChange={(place) => {
                if (!place) return;
                const location: Location = {
                  ...place.value,
                  label: place.label,
                  mainAddress: place.value.description,
                  description: place.value.description,
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
              onClear={() => {
                handleLocationUpdate(null, 'stopover', index);
              }}
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
        <span className="block text-sm font-medium text-gray-600">To</span>
        <LocationInput
          value={bookingData?.destination || null}
          onChange={(place) => {
            if (!place) return;
            const location: Location = {
              ...place.value,
              label: place.label,
              mainAddress: place.value.description,
              description: place.value.description,
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
        <Stepper currentStep="travel-info" />

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
              checked={Boolean(bookingData?.returnDateTime)}
              onChange={(e) => {
                if (!bookingData) return;
                setBookingData({
                  ...bookingData,
                  returnDateTime: e.target.checked ? '' : null
                });
              }}
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
              <div className="text-xl sm:text-2xl font-bold text-primary">
                €{bookingData?.price.toFixed(2)}
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
              {/* Date Selectors before location inputs */}
              <div className="space-y-4">
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

                {bookingData?.returnDateTime !== null && (
                  <DateSelector
                    label={t('hero.returnDateTime')}
                    value={bookingData?.returnDateTime ? new Date(bookingData.returnDateTime.replace(' ', 'T')) : null}
                    onChange={(date) => {
                      if (!bookingData) return;
                      const dateString = date ? date.toISOString().slice(0, 16).replace('T', ' ') : '';

                      if (!validateDates(bookingData.pickupDateTime, dateString)) {
                        alert(t('errors.invalidReturnTime'));
                        return;
                      }

                      setBookingData({
                        ...bookingData,
                        returnDateTime: dateString
                      });
                    }}
                    placeholder={t('hero.returnPlaceholder')}
                  />
                )}
              </div>

              <div className="hidden md:block h-px bg-gray-200 my-6" />

              {/* Original location inputs with preserved styling */}
              <div className="space-y-4 sm:space-y-6 relative">
                <div className="absolute left-[12px] xs:left-[14px] sm:left-[24px] top-10 bottom-8 w-0.5 bg-gradient-to-b from-primary/80 to-green-500/80" />
                {renderPickupLocation()}
                {renderStopovers()}
                {renderAddStopoverButton()}
                {renderDestination()}
              </div>
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
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleContinue}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full hover:bg-primary/90 transition-colors"
            >
              {t('travelInfo.continue')}
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