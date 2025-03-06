import { useState, useEffect, useCallback } from 'react';
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
import { Plane } from 'lucide-react';
import { DateSelector } from '@/components/forms/booking/DateSelector';
import { isBefore } from 'date-fns';
import { useEdit } from '@/contexts/EditContext';
import { NavigationButtons } from '@/components/booking/NavigationButtons';
import { debounce } from 'lodash';

const parseNetherlandsAddress = (address: string) => {
  const result = {
    businessName: '',
    streetName: '',
    houseNumber: '',
    postalCode: '',
    city: ''
  };

  // Remove ", Netherlands" at the end (if present)
  address = address.replace(/,?\s*Netherlands$/i, '').trim();

  // Split remaining address by comma
  const parts = address.split(',').map(part => part.trim()).filter(Boolean);

  // Early return if no parts
  if (parts.length === 0) return result;

  // Extract postal code if present in any part
  const postalCodeRegex = /\b(\d{4}\s?[A-Z]{2})\b/;
  parts.forEach((part, index) => {
    const match = part.match(postalCodeRegex);
    if (match) {
      result.postalCode = match[1];
      parts[index] = part.replace(postalCodeRegex, '').trim();
    }
  });

  // Business location patterns
  const isBusinessLocation = (
    // Check if first part contains business indicators
    parts[0].includes('Airport') ||
    parts[0].includes('(AMS)') ||
    parts[0].includes('Station') ||
    parts[0].includes('Hotel') ||
    parts[0].includes('Terminal') ||
    parts[0].includes('Sports') ||
    parts[0].includes('Mall') ||
    parts[0].includes('Center') ||
    parts[0].includes('Centre') ||
    // Check if parts follow business pattern (no house number in second part)
    (parts.length >= 3 && !parts[1].match(/\d+/))
  );

  if (isBusinessLocation) {
    // Business address format: [Business Name], [Street], [City]
    result.businessName = parts[0];
    if (parts.length >= 2) result.streetName = parts[1];
    if (parts.length >= 3) result.city = parts[parts.length - 1];

    // Clean up city from postal code if present
    if (result.city) {
      result.city = result.city.replace(postalCodeRegex, '').trim();
    }

    return result;
  }

  // Regular address handling
  // Last part is always city
  if (parts.length >= 1) {
    result.city = parts[parts.length - 1].replace(postalCodeRegex, '').trim();
    parts.pop();
  }

  // First part should contain street name and house number
  if (parts.length > 0) {
    const firstPart = parts[0];
    const streetMatch = firstPart.match(/^(.*?)(?:\s+(\d+[a-zA-Z]{0,2}))$/);

    if (streetMatch) {
      result.streetName = streetMatch[1].trim();
      result.houseNumber = streetMatch[2];
    } else {
      result.streetName = firstPart.trim();
    }
  }

  return result;
};

// Modify the ExactLocationForm component:
const ExactLocationForm = ({
  location,
  type,
  index,
  parsedAddress,
  bookingData,
  updateBookingData,
  t
}: {
  location: Location;
  type: 'pickup' | 'stopover';
  index?: number;
  parsedAddress: any;
  bookingData: BookingData | null;
  updateBookingData: (data: BookingData) => void;
  t: (key: string) => string;
}) => {
  const [localStreetName, setLocalStreetName] = useState('');
  const [localHouseNumber, setLocalHouseNumber] = useState('');

  useEffect(() => {
    setLocalStreetName(location.exactAddress?.streetName || parsedAddress.streetName || '');
    setLocalHouseNumber(location.exactAddress?.houseNumber || parsedAddress.houseNumber || '');
  }, [location.value.place_id, parsedAddress]); // Changed dependency to be more specific

  const debouncedUpdate = useCallback(
    debounce((field: string, value: string) => {
      if (!bookingData) return;

      const exactAddress = {
        streetName: field === 'streetName' ? value : localStreetName,
        houseNumber: field === 'houseNumber' ? value : localHouseNumber,
        postalCode: parsedAddress.postalCode || '',
        city: parsedAddress.city || '',
        businessName: parsedAddress.businessName || ''
      };

      const updatedLocation: Location = {
        ...location,
        exactAddress,
        mainAddress: `${exactAddress.streetName} ${exactAddress.houseNumber}, ${exactAddress.city}, Netherlands`
      };

      let updatedData: BookingData;
      if (type === 'pickup') {
        updatedData = {
          ...bookingData,
          pickup: updatedLocation,
          sourceAddress: updatedLocation.mainAddress || ''
        };
      } else {
        const stopovers = [...bookingData.stopovers];
        stopovers[index!] = updatedLocation;
        updatedData = {
          ...bookingData,
          stopovers
        };
      }

      updateBookingData(updatedData);
    }, 100), // Reduced debounce delay from 300ms to 100ms
    [bookingData, location, type, index, parsedAddress, localStreetName, localHouseNumber]
  );

  const handleInputChange = (field: string, value: string) => {
    if (field === 'streetName') {
      setLocalStreetName(value);
    } else {
      setLocalHouseNumber(value);
    }
    debouncedUpdate(field, value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg"
    >
      {/* Business Name */}
      {parsedAddress.businessName && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">
            {t('booking.businessName')}
          </label>
          <input
            type="text"
            value={parsedAddress.businessName}
            readOnly
            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600"
          />
        </div>
      )}

      {/* Street Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-600">
          {t('booking.streetName')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={localStreetName}
          onChange={(e) => handleInputChange('streetName', e.target.value)}
          className={`w-full px-3 py-2 border ${!localStreetName.trim() ? 'border-red-300' : 'border-gray-300'
            } rounded-md focus:ring-primary focus:border-primary`}
          placeholder={t('booking.enterStreetName')}
        />
        {!localStreetName.trim() && (
          <span className="text-red-500 text-xs mt-1">
            {t('booking.streetName')} {t('errors.required')}
          </span>
        )}
      </div>

      {/* House Number */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-600">
          {t('booking.houseNumber')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={localHouseNumber}
          onChange={(e) => handleInputChange('houseNumber', e.target.value)}
          placeholder={t('booking.enterHouseNumber')}
          className={`w-full px-3 py-2 border ${!localHouseNumber.trim() ? 'border-red-300' : 'border-gray-300'
            } rounded-md focus:ring-primary focus:border-primary`}
        />
        {!localHouseNumber.trim() && (
          <span className="text-red-500 text-xs mt-1">
            {t('booking.houseNumber')} {t('errors.required')}
          </span>
        )}
      </div>

      {/* Postal Code */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-600">
          {t('booking.postalCode')}
        </label>
        <input
          type="text"
          value={parsedAddress.postalCode}
          readOnly
          className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600"
        />
      </div>

      {/* City */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-600">
          {t('booking.city')}
        </label>
        <input
          type="text"
          value={parsedAddress.city || location.value.structured_formatting.secondary_text}
          readOnly
          className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600"
        />
      </div>

      {/* Country */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-600">
          {t('booking.country')}
        </label>
        <input
          type="text"
          value="Netherlands"
          readOnly
          className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600"
        />
      </div>
    </motion.div>
  );
};

export const TravelInfoPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { isEditing, editingBookingId, setEditMode } = useEdit();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const translations = createTranslationsObject(t, router.locale || 'en');
  const [showExactLocation, setShowExactLocation] = useState(false);
  const [showExactLocations, setShowExactLocations] = useState<{ [key: string]: boolean }>({});

  const validateExactLocation = (location: Location) => {
    if (!location?.exactAddress) return false;

    const { streetName, houseNumber } = location.exactAddress;

    // Check if both street name and house number are present and not empty
    if (!streetName?.trim() || !houseNumber?.trim()) {
      return false;
    }

    return true;
  };

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

    if (!validateExactLocation(bookingData.pickup)) {
      errors.pickup = t('errors.exactAddressRequired');
    }

    bookingData.stopovers.forEach((stopover, index) => {
      if (!validateExactLocation(stopover)) {
        errors[`stopover_${index}`] = t('errors.exactAddressRequired');
      }
    });

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

    // Add detailed console logging
    console.group('Final Booking Data');
    console.log('Basic Info:', {
      id: updatedData.id,
      vehicle: updatedData.vehicle,
      passengers: updatedData.passengers,
      price: updatedData.price,
      isReturn: updatedData.isReturn
    });

    console.log('Pickup Details:', {
      location: updatedData.pickup?.mainAddress,
      exactAddress: updatedData.pickup?.exactAddress,
      dateTime: updatedData.pickupDateTime
    });

    console.log('Destination Details:', {
      location: updatedData.destination?.mainAddress,
      exactAddress: updatedData.destination?.exactAddress
    });

    console.log('Stopovers:', updatedData.stopovers.map(stop => ({
      location: stop.mainAddress,
      exactAddress: stop.exactAddress
    })));

    if (updatedData.isReturn) {
      console.log('Return Trip:', {
        dateTime: updatedData.returnDateTime
      });
    }

    if (updatedData.flightNumber) {
      console.log('Flight Details:', {
        flightNumber: updatedData.flightNumber
      });
    }

    console.log('Additional Info:', {
      remarks: updatedData.remarks,
      directDistance: updatedData.directDistance,
      extraDistance: updatedData.extraDistance,
      isFixedPrice: updatedData.isFixedPrice
    });

    console.dir(updatedData, { depth: null });
    console.groupEnd();

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

    if (newLocation) {
      // Parse address immediately when location is selected
      const parsedAddress = parseNetherlandsAddress(
        newLocation.value.description || newLocation.mainAddress || ''
      );

      // Create location with parsed address details
      const locationWithAddress: Location = {
        ...newLocation,
        exactAddress: {
          streetName: parsedAddress.streetName || '',
          houseNumber: parsedAddress.houseNumber || '',
          postalCode: parsedAddress.postalCode || '',
          city: parsedAddress.city || newLocation.value.structured_formatting?.secondary_text || '',
          businessName: parsedAddress.businessName || ''
        },
        mainAddress: newLocation.value.description,
        description: newLocation.value.description,
        secondaryAddress: newLocation.value.structured_formatting?.secondary_text || '',
      };

      if (type === 'stopover' && typeof index !== 'undefined') {
        if (!locationWithAddress.mainAddress) {
          alert(t('errors.invalidStopover'));
          return;
        }
        updatedData.stopovers[index] = locationWithAddress;
      } else if (type === 'pickup') {
        updatedData.pickup = locationWithAddress;
        updatedData.sourceAddress = locationWithAddress.mainAddress || '';

        if (locationWithAddress.mainAddress === updatedData.destination?.mainAddress) {
          alert(t('errors.duplicateLocation'));
          return;
        }
      } else if (type === 'destination') {
        updatedData.destination = locationWithAddress;
        updatedData.destinationAddress = locationWithAddress.mainAddress || '';

        if (!locationWithAddress.mainAddress?.toLowerCase().includes('airport')) {
          updatedData.flightNumber = '';
        }

        if (locationWithAddress.mainAddress === updatedData.pickup?.mainAddress) {
          alert(t('errors.duplicateLocation'));
          return;
        }
      }
    } else {
      // Handle clearing the location
      if (type === 'stopover' && typeof index !== 'undefined') {
        updatedData.stopovers[index] = {
          ...({} as Location),
          exactAddress: {
            streetName: '',
            houseNumber: '',
            postalCode: '',
            city: '',
            businessName: ''
          }
        };
      } else if (type === 'pickup') {
        updatedData.pickup = {
          ...({} as Location),
          exactAddress: {
            streetName: '',
            houseNumber: '',
            postalCode: '',
            city: '',
            businessName: ''
          }
        };
        updatedData.sourceAddress = '';
      } else if (type === 'destination') {
        updatedData.destination = {
          ...({} as Location),
          exactAddress: {
            streetName: '',
            houseNumber: '',
            postalCode: '',
            city: '',
            businessName: ''
          }
        };
        updatedData.destinationAddress = '';
        updatedData.flightNumber = '';
      }
    }

    // Automatically show exact location form when location is selected
    if (newLocation) {
      setShowExactLocations(prev => ({
        ...prev,
        [`${type}_${index || 0}`]: true
      }));
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

  const handleAddExactLocation = (type: 'pickup' | 'stopover', index?: number) => {
    const location = type === 'pickup' ? bookingData?.pickup : bookingData?.stopovers[index!];

    if (!location?.value?.structured_formatting) {
      alert(t('errors.selectLocationFirst'));
      return;
    }

    setShowExactLocations(prev => ({
      ...prev,
      [`${type}_${index || 0}`]: true
    }));
  };

  const validateField = (location: Location, field: 'streetName' | 'houseNumber') => {
    if (!location?.exactAddress?.[field]?.trim()) {
      return `${t(`booking.${field}`)} ${t('errors.required')}`;
    }
    return '';
  };

  const renderExactLocationForm = (location: Location, type: 'pickup' | 'stopover', index?: number) => {
    const parsedAddress = parseNetherlandsAddress(
      location.mainAddress ||
      location.value.description
    );

    return (
      <ExactLocationForm
        location={location}
        type={type}
        index={index}
        parsedAddress={parsedAddress}
        bookingData={bookingData}
        updateBookingData={updateBookingData}
        t={t}
      />
    );
  };

  const renderPickupLocation = () => (
    <div className="space-y-4">
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
                },
                exactAddress: {
                  streetName: '',
                  houseNumber: '',
                  postalCode: '',
                  city: place.value.structured_formatting?.secondary_text || '',
                  businessName: ''
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

      {bookingData?.pickup && (
        <div className="ml-[24px] xs:ml-[32px] sm:ml-[48px]">
          <button
            type="button"
            onClick={() => handleAddExactLocation('pickup')}
            className="text-sm text-secondary hover:text-primary transition-colors flex items-center gap-1"
          >
            <Plus size={16} />
            {t('booking.addExactLocation')}
          </button>

          {showExactLocations['pickup_0'] && renderExactLocationForm(bookingData.pickup, 'pickup')}

          {validationErrors.pickup && (
            <span className="text-red-500 text-sm mt-1">{validationErrors.pickup}</span>
          )}
        </div>
      )}
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
                  },
                  exactAddress: {
                    streetName: '',
                    houseNumber: '',
                    postalCode: '',
                    city: place.value.structured_formatting?.secondary_text || '',
                    businessName: ''
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
          <div className="col-span-3">
            <div className="ml-[24px] xs:ml-[32px] sm:ml-[48px]">
              <button
                type="button"
                onClick={() => handleAddExactLocation('stopover', index)}
                className="text-sm text-secondary hover:text-primary transition-colors flex items-center gap-1"
              >
                <Plus size={16} />
                {t('booking.addExactLocation')}
              </button>

              {showExactLocations[`stopover_${index}`] && renderExactLocationForm(stopover, 'stopover', index)}

              {validationErrors[`stopover_${index}`] && (
                <span className="text-red-500 text-sm mt-1">{validationErrors[`stopover_${index}`]}</span>
              )}
            </div>
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
              },
              exactAddress: {
                streetName: '',
                houseNumber: '',
                postalCode: '',
                city: place.value.structured_formatting?.secondary_text || '',
                businessName: ''
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
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/80 to-secondary pt-24 pb-8">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center mt-8">
        {isEditing ? (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleBack}
            className="text-white hover:text-gray-200 transition-colors lg:mb-[-70px] lg:mt-[-20px] mt-[-40px] flex items-center gap-2"
          >
            ← <span>{t('common.backToOverview')}</span>
          </motion.button>
        ) : (
          <Stepper currentStep="travel-info" />
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="w-full bg-white rounded-2xl p-4 md:p-6 shadow-xl mt-8 lg:mt-[100px]"
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
                      if (!bookingData || !date) return;

                      // Adjust for timezone offset
                      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                      const dateString = localDate.toISOString().slice(0, 16).replace('T', ' ');

                      const updatedData = {
                        ...bookingData,
                        pickupDateTime: dateString
                      };

                      setBookingData(updatedData);
                      localStorage.setItem('bookingData', JSON.stringify(updatedData));
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
                      {bookingData?.isReturn && (
                        <>
                          <div className="hidden md:block h-px bg-gray-200 my-6" />
                          <div className="space-y-6">

                            <span className="block mb-[-20px] lg:ms-[60px] ms-[35px] text-sm font-medium text-gray-600">{t('booking.from')}</span>

                            <div className="space-y-4 sm:space-y-6 relative">
                              <div className="absolute left-[12px] xs:left-[14px] sm:left-[24px] top-10 bottom-8 w-0.5 bg-gradient-to-b from-green-500/80 to-primary/80" />

                              {/* Return route display */}
                              <div className="space-y-4">
                                {/* From (original destination) */}
                                <div className="grid grid-cols-[24px_1fr_24px] xs:grid-cols-[32px_1fr_32px] sm:grid-cols-[48px_1fr_48px] items-start gap-1 sm:gap-2">
                                  <div className="flex justify-center pt-8">
                                    <div className="w-6 h-6 rounded-full mt-2 bg-primary flex items-center justify-center relative z-10">
                                      <MapPin className="text-white" size={16} />
                                    </div>
                                  </div>
                                  <div className="w-full space-y-1">
                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                                      {bookingData?.destination?.mainAddress || t('common.notSpecified')}
                                    </div>
                                  </div>
                                  <div className="w-[24px]" />
                                </div>

                                {/* Stopovers in reverse */}
                                {bookingData?.stopovers.slice().reverse().map((stopover, index) => (
                                  <div key={index} className="grid grid-cols-[24px_1fr_24px] xs:grid-cols-[32px_1fr_32px] sm:grid-cols-[48px_1fr_48px] items-start gap-1 sm:gap-2">
                                    <div className="flex justify-center pt-8">
                                      <div className="w-4 h-4 rounded-full bg-secondary mt-4 flex items-center justify-center relative z-10">
                                        <MapPin className="text-white" size={12} />
                                      </div>
                                    </div>
                                    <div className="w-full space-y-1">
                                      <span className="block text-sm font-medium text-gray-600">{t('travelInfo.via')}</span>
                                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                                        {stopover.mainAddress || t('common.notSpecified')}
                                      </div>
                                    </div>
                                    <div className="w-[24px]" />
                                  </div>
                                ))}

                                {/* To (original pickup) */}
                                <div className="grid grid-cols-[24px_1fr_24px] xs:grid-cols-[32px_1fr_32px] sm:grid-cols-[48px_1fr_48px] items-start gap-1 sm:gap-2">
                                  <div className="flex justify-center pt-8">
                                    <div className="w-6 h-6 rounded-full mt-2 bg-green-500 flex items-center justify-center relative z-10">
                                      <MapPin className="text-white" size={16} />
                                    </div>
                                  </div>
                                  <div className="w-full space-y-1">
                                    <span className="block text-sm font-medium text-gray-600">{t('booking.to')}</span>
                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                                      {bookingData?.pickup?.mainAddress || t('common.notSpecified')}
                                    </div>
                                  </div>
                                  <div className="w-[24px]" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
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
          <div className="mt-8">
            <NavigationButtons
              onBack={handleBack}
              onContinue={handleContinue}
              continueText={isEditing ? t('common.update') : t('travelInfo.continue')}
              backText={isEditing ? t('common.backToOverview') : t('travelInfo.back')}
            />
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
