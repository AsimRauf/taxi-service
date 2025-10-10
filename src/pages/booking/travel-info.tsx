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
import { Plane } from 'lucide-react';
import { DateSelector } from '@/components/forms/booking/DateSelector';
import { isBefore } from 'date-fns';
import { useEdit } from '@/contexts/EditContext';
import { NavigationButtons } from '@/components/booking/NavigationButtons';

interface ParsedAddress {
  businessName: string;
  streetName: string;
  houseNumber: string;
  postalCode: string;
  city: string;
}

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

// First, add a new ExactLocationModal component at the top of the file
const ExactLocationModal = ({
  isOpen,
  onClose,
  location,
  type,
  index,
  parsedAddress,
  bookingData,
  updateBookingData,
  t
}: {
  isOpen: boolean;
  onClose: () => void;
  location: Location;
  type: 'pickup' | 'stopover' | 'destination';
  index?: number;
  parsedAddress: ParsedAddress;
  bookingData: BookingData | null;
  updateBookingData: (data: BookingData) => void;
  t: (key: string) => string;
}) => {
  const [localStreetName, setLocalStreetName] = useState('');
  const [localHouseNumber, setLocalHouseNumber] = useState('');
  const [errors, setErrors] = useState({ streetName: '', houseNumber: '' });

  useEffect(() => {
    setLocalStreetName(location.exactAddress?.streetName || parsedAddress.streetName || '');
    setLocalHouseNumber(location.exactAddress?.houseNumber || parsedAddress.houseNumber || '');
  }, [
    location.value.place_id,
    parsedAddress,
    location.exactAddress?.streetName,
    location.exactAddress?.houseNumber
  ]);

  const handleSave = () => {
    // Modified validation logic
    const newErrors = {
      streetName: !localStreetName.trim() ? t('errors.required') : '',
      // Only require house number if there's no business name
      houseNumber: !parsedAddress.businessName && !localHouseNumber.trim() ? t('errors.required') : ''
    };

    setErrors(newErrors);

    if (newErrors.streetName || (!parsedAddress.businessName && newErrors.houseNumber)) {
      return;
    }

    if (!bookingData) return;

    const exactAddress = {
      streetName: localStreetName,
      houseNumber: localHouseNumber || '', // Allow empty house number for business locations
      postalCode: parsedAddress.postalCode || '',
      city: parsedAddress.city || '',
      businessName: parsedAddress.businessName || location.exactAddress?.businessName || ''
    };

    const updatedLocation: Location = {
      ...location,
      exactAddress,
      // Update mainAddress format based on whether it's a business location
      mainAddress: exactAddress.businessName
        ? `${exactAddress.businessName}, ${exactAddress.streetName}${localHouseNumber ? ` ${localHouseNumber}` : ''}, ${exactAddress.city}, Netherlands`
        : `${exactAddress.streetName} ${localHouseNumber}, ${exactAddress.city}, Netherlands`
    };

    let updatedData: BookingData;
    if (type === 'pickup') {
      updatedData = {
        ...bookingData,
        pickup: updatedLocation,
        sourceAddress: updatedLocation.mainAddress || ''
      };
    } else if (type === 'destination') {
      updatedData = {
        ...bookingData,
        destination: updatedLocation,
        destinationAddress: updatedLocation.mainAddress || ''
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
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container - Updated positioning and scroll handling */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            {/* Header - Make sticky */}
            <div className="sticky top-0 z-20 bg-white px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {t('booking.exactLocation')}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content - Updated max height and scroll */}
            <div className="px-6 py-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
              <div className="space-y-4">
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
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
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
                    onChange={(e) => setLocalStreetName(e.target.value)}
                    className={`w-full px-3 py-2.5 border ${errors.streetName ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors`}
                    placeholder={t('booking.enterStreetName')}
                  />
                  {errors.streetName && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.streetName}
                    </span>
                  )}
                </div>

                {/* House Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600">
                    {t('booking.houseNumber')}
                    {!parsedAddress.businessName && <span className="text-red-500">*</span>}
                    {parsedAddress.businessName && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({t('booking.optional')})
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={localHouseNumber}
                    onChange={(e) => setLocalHouseNumber(e.target.value)}
                    placeholder={parsedAddress.businessName
                      ? t('booking.enterHouseNumberOptional')
                      : t('booking.enterHouseNumber')
                    }
                    className={`w-full px-3 py-2.5 border ${errors.houseNumber ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${parsedAddress.businessName ? 'bg-gray-50' : 'bg-white'
                      }`}
                  />
                  {errors.houseNumber && (
                    <span className="text-red-500 text-xs mt-1">{errors.houseNumber}</span>
                  )}
                  {parsedAddress.businessName && (
                    <p className="text-xs text-gray-500 mt-1">
                      {t('booking.houseNumberOptionalForBusiness')}
                    </p>
                  )}
                </div>

                {/* Read-only Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">
                      {t('booking.postalCode')}
                    </label>
                    <input
                      type="text"
                      value={parsedAddress.postalCode}
                      readOnly
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">
                      {t('booking.city')}
                    </label>
                    <input
                      type="text"
                      value={parsedAddress.city || location.value.structured_formatting.secondary_text}
                      readOnly
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">
                      {t('booking.country')}
                    </label>
                    <input
                      type="text"
                      value="Netherlands"
                      readOnly
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Make sticky */}
            <div className="sticky bottom-0 z-20 bg-white px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                >
                  {t('common.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TravelInfoPage = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { isEditing, editingBookingId, setEditMode } = useEdit();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const translations = createTranslationsObject(t, router.locale || 'en');
  const [showExactLocationModal, setShowExactLocationModal] = useState<{
    isOpen: boolean;
    location?: Location;
    type?: 'pickup' | 'stopover' | 'destination';
    index?: number;
  }>({ isOpen: false });

  const validateExactLocation = (location: Location) => {
    // If it's a business location (like an airport), validate differently
    if (location.mainAddress?.toLowerCase().includes('airport') ||
      location.exactAddress?.businessName) {
      return true;
    }

    // For non-business addresses, check for street name and house number
    if (!location || !location.mainAddress || !location.exactAddress) return false;

    const { streetName, houseNumber } = location.exactAddress;

    return Boolean(streetName?.trim() && houseNumber?.trim());
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

    // Check pickup location
    if (!bookingData.pickup?.mainAddress) {
      errors.pickup = t('travelInfo.errors.requiredLocations');
    } else if (!validateExactLocation(bookingData.pickup)) {
      errors.pickup = t('errors.exactAddressRequired');
    }

    // Check destination location
    if (!bookingData.destination?.mainAddress) {
      errors.destination = t('travelInfo.errors.requiredLocations');
    } else if (!validateExactLocation(bookingData.destination)) {
      errors.destination = t('errors.exactAddressRequired');
    }

    // Check stopovers
    bookingData.stopovers.forEach((stopover, index) => {
      if (stopover.mainAddress && !validateExactLocation(stopover)) {
        errors[`stopover_${index}`] = t('errors.exactAddressRequired');
      }
    });

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

    // Flight number validation - outgoing is optional, incoming mandatory for airport pickups on returns
    if (bookingData.isReturn && isAirportPickup && !bookingData.incomingFlightNumber?.trim()) {
      errors.incomingFlightNumber = t('travelInfo.errors.incomingFlightNumberRequired');
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    // Save flight info and remarks
    const updatedData: BookingData = {
      ...bookingData,
      flightNumber: bookingData.flightNumber || '',
      incomingFlightNumber: bookingData.incomingFlightNumber || '',
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
        segments[1]?.distance || '0 km',
        updatedData.pickup.exactAddress ? {
          businessName: updatedData.pickup.exactAddress.businessName || '',
          city: updatedData.pickup.exactAddress.city || '',
        } : undefined,
        updatedData.destination.exactAddress ? {
          businessName: updatedData.destination.exactAddress.businessName || '',
          city: updatedData.destination.exactAddress.city || '',
        } : undefined
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
        segments[1]?.distance || '0 km',
        updatedData.pickup.exactAddress ? {
          businessName: updatedData.pickup.exactAddress.businessName || '',
          city: updatedData.pickup.exactAddress.city || '' // Add default empty string
        } : undefined,
        updatedData.destination.exactAddress ? {
          businessName: updatedData.destination.exactAddress.businessName || '',
          city: updatedData.destination.exactAddress.city || '' // Add default empty string
        } : undefined
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

      // Update the appropriate location
      if (type === 'pickup') {
        updatedData.pickup = locationWithAddress;
        updatedData.sourceAddress = locationWithAddress.mainAddress || '';
      } else if (type === 'destination') {
        updatedData.destination = locationWithAddress;
        updatedData.destinationAddress = locationWithAddress.mainAddress || '';
      } else if (type === 'stopover' && typeof index !== 'undefined') {
        updatedData.stopovers[index] = locationWithAddress;
      }

      // Clear validation error for this location
      const newValidationErrors = { ...validationErrors };
      if (type === 'pickup') delete newValidationErrors.pickup;
      else if (type === 'destination') delete newValidationErrors.destination;
      else if (type === 'stopover') delete newValidationErrors[`stopover_${index}`];
      setValidationErrors(newValidationErrors);

      // Show exact location modal with parsed address
      setShowExactLocationModal({
        isOpen: true,
        location: locationWithAddress,
        type,
        index
      });
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

  const handleAddExactLocation = (type: 'pickup' | 'stopover' | 'destination', index?: number) => {
    const location = type === 'pickup'
      ? bookingData?.pickup
      : type === 'destination'
        ? bookingData?.destination
        : bookingData?.stopovers[index!];

    if (!location?.value?.structured_formatting) {
      alert(t('errors.selectLocationFirst'));
      return;
    }

    setShowExactLocationModal({
      isOpen: true,
      location,
      type,
      index
    });
  };

  const getVehicleInfo = (vehicleType: 'sedan' | 'stationWagon' | 'bus') => {
    const info = {
      sedan: {
        name: t('offers.sedanTaxi.name'),
        capacity: t('offers.sedanTaxi.features.passengers'),
        icon: '🚗'
      },
      stationWagon: {
        name: t('offers.stationWagonTaxi.name'),
        capacity: t('offers.stationWagonTaxi.features.passengers'),
        icon: '🚙'
      },
      bus: {
        name: t('offers.busTaxi.name'),
        capacity: t('offers.busTaxi.features.passengers'),
        icon: '🚐'
      }
    };

    return info[vehicleType];
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
    <div className="space-y-4">
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
  const isAirportPickup = bookingData?.pickup?.mainAddress?.toLowerCase().includes('airport');

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



          <div className="flex flex-col md:flex-row items-center justify-between rounded-lg p-4 mb-6 text-center md:text-left border border-white/20 bg-gradient-to-br from-primary/10 to-primary/20 shadow-lg backdrop-blur-md">
            <div className="space-y-1 mb-4 md:mb-0">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                {bookingData?.vehicle && getVehicleInfo(bookingData.vehicle).name}
              </h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  {bookingData?.vehicle && getVehicleInfo(bookingData.vehicle).capacity}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl">
                {bookingData?.vehicle && getVehicleInfo(bookingData.vehicle).icon}
              </div>
              <div className="mt-1 text-sm text-gray-600">
                {bookingData?.isReturn ? t('offers.returnTotalPrice', { 
                  price: (bookingData.price || 0).toFixed(2) 
                }) : `€${(bookingData?.price || 0).toFixed(2)}`}
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
                {bookingData?.destination && (
                  <div className="ml-[24px] xs:ml-[32px] sm:ml-[48px]">
                    <button
                      type="button"
                      onClick={() => handleAddExactLocation('destination')}
                      className="text-sm text-secondary hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <Plus size={16} />
                      {t('booking.addExactLocation')}
                    </button>

                    {validationErrors.destination && (
                      <span className="text-red-500 text-sm mt-1">{validationErrors.destination}</span>
                    )}
                  </div>
                )}
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
                    {t('travelInfo.outgoingFlightNumber')}
                  </label>
                  <input
                    type="text"
                    className={`w-full p-3 border rounded-lg focus:ring-primary focus:border-primary ${validationErrors.flightNumber ? 'border-red-300' : 'border-gray-300'}`}
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
                  {validationErrors.flightNumber && (
                    <span className="text-red-500 text-xs mt-1">
                      {validationErrors.flightNumber}
                    </span>
                  )}
                </div>
              )}
              {bookingData?.isReturn && isAirportPickup && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Plane size={18} className="text-secondary" />
                    {t('travelInfo.incomingFlightNumber')}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full p-3 border rounded-lg focus:ring-primary focus:border-primary ${validationErrors.incomingFlightNumber ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder={t('travelInfo.flightNumberPlaceholder')}
                    value={bookingData?.incomingFlightNumber || ''}
                    onChange={(e) => {
                      if (!bookingData) return;
                      setBookingData({
                        ...bookingData,
                        incomingFlightNumber: e.target.value
                      });
                    }}
                  />
                  {validationErrors.incomingFlightNumber && (
                    <span className="text-red-500 text-xs mt-1">
                      {validationErrors.incomingFlightNumber}
                    </span>
                  )}
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
          {showExactLocationModal.isOpen && showExactLocationModal.location && (
            <ExactLocationModal
              isOpen={showExactLocationModal.isOpen}
              onClose={() => setShowExactLocationModal({ isOpen: false })}
              location={showExactLocationModal.location}
              type={showExactLocationModal.type!}
              index={showExactLocationModal.index}
              parsedAddress={parseNetherlandsAddress(
                showExactLocationModal.location.mainAddress ||
                showExactLocationModal.location.value.description
              )}
              bookingData={bookingData}
              updateBookingData={updateBookingData}
              t={t}
            />
          )}
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
