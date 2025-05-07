import { useState } from 'react';
import { MapPin, Plus, Minus, ArrowUpDown } from 'lucide-react';
import { SingleValue } from 'react-select';
type SelectOption = {
    label: string;
    value: {
        description: string;
        place_id: string;
        structured_formatting?: {
            secondary_text?: string;
        };
    };
};
import { LocationInput } from './booking/LocationInput';
import { Location, BookingFormData, BookingData } from '@/types/booking';
import { LuggageCheckbox } from './booking/LuggageCheckbox';
import { DateSelector } from './booking/DateSelector';
import { PassengerSelector } from './booking/PassengerSelector';
import { format } from 'date-fns';
import { validateBookingForm, ValidationErrors } from '@/utils/bookingValidation';
import { calculateSegmentDistances } from '@/utils/distanceCalculations';
import { useRouter } from 'next/router';
import { createTranslationsObject } from '@/utils/translations';
import { useTranslation } from 'next-i18next';

interface BookingFormProps {
    defaultDestination?: Location;
}

// Add the address parser function
const parseNetherlandsAddress = (address: string) => {
    const result = {
        businessName: '',
        streetName: '',
        houseNumber: '',
        postalCode: '',
        city: ''
    };

    // Enhanced country name normalization
    address = address.replace(/,?\s*(Nederland|Nederlands|Netherlands|Nethelands)s?$/gi, '').trim();
    const parts = address.split(',').map(part => part.trim()).filter(Boolean);

    if (parts.length === 0) return result;

    // Enhanced business location detection
    const isBusinessLocation = (
        parts[0].includes('Airport') ||
        parts[0].includes('(AMS)') ||
        parts[0].includes('Station') ||
        parts[0].includes('Hotel') ||
        parts[0].includes('Terminal') ||
        parts[0].includes('Sports') ||
        parts[0].includes('Mall') ||
        parts[0].includes('Center') ||
        parts[0].includes('Centre') ||
        parts[0].includes('B.V.') ||
        parts[0].includes('BV') ||
        parts[0].includes('N.V.') ||
        parts[0].includes('Bank') ||
        parts[0].includes('Grondbank') ||
        (parts.length >= 3 && !parts[1].match(/\d+/))
    );

    if (isBusinessLocation) {
        result.businessName = parts[0];
        if (parts.length >= 2) result.streetName = parts[1];
        if (parts.length >= 3) result.city = parts[parts.length - 1];
        return result;
    }

    // Check if first part contains street and house number
    const streetMatch = parts[0].match(/^(.*?)(?:\s+(\d+[a-zA-Z]{0,2}))$/);
    if (streetMatch) {
        result.streetName = streetMatch[1].trim();
        result.houseNumber = streetMatch[2];
    } else {
        result.streetName = parts[0].trim();
    }

    // Set city from last part
    if (parts.length > 1) {
        const cityPart = parts[parts.length - 1];
        // Check if city part contains house number
        const cityMatch = cityPart.match(/^(.*?)(?:\s+(\d+[a-zA-Z]{0,2}))$/);
        if (cityMatch && !result.houseNumber) {
            result.city = cityMatch[1].trim();
            result.houseNumber = cityMatch[2];
        } else {
            result.city = cityPart.trim();
        }
    }

    return result;
};

const validateExactLocation = (location: Location) => {
    // If it's an airport or business location, it's valid
    if (location.mainAddress?.toLowerCase().includes('airport') ||
        location.mainAddress?.toLowerCase().includes('station') ||
        location.mainAddress?.toLowerCase().includes('hotel') ||
        location.mainAddress?.toLowerCase().includes('terminal')) {
        return true;
    }

    // Parse the address if exactAddress is not already set
    if (!location.exactAddress) {
        const parsedAddress = parseNetherlandsAddress(
            location.mainAddress || location.value.description
        );
        
        // If it's a business location from parsed address
        if (parsedAddress.businessName) {
            return true;
        }

        // If it has valid street name and house number from parsed address
        if (parsedAddress.streetName && parsedAddress.houseNumber) {
            return true;
        }

        return false;
    }

    // Check existing exactAddress if it exists
    const { streetName, houseNumber, businessName } = location.exactAddress;
    return Boolean(businessName || (streetName?.trim() && houseNumber?.trim()));
};

export const BookingForm = ({ defaultDestination }: BookingFormProps) => {
    const { t } = useTranslation();
    const router = useRouter();
    const translations = createTranslationsObject(t, router.locale || 'en');
    const [formData, setFormData] = useState<BookingFormData>({
        pickup: null,
        stopovers: [],
        destination: defaultDestination || null,
        hasLuggage: false,
        travelers: 1,
        pickupDate: undefined,
        bookingType: 'individual', // Default value for booking type
        isReturn: false,
        returnDate: undefined,
    });
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [pickupHouseNumberError, setPickupHouseNumberError] = useState<string | null>(null);
    const [destinationHouseNumberError, setDestinationHouseNumberError] = useState<string | null>(null);

    // Update the handleLocationUpdate function
    const handleLocationUpdate = (place: SingleValue<SelectOption>, type: 'pickup' | 'destination' | 'stopover', index?: number) => {
        setValidationErrors(prev => ({
            ...prev,
            [type]: undefined
        }));

        // Clear house number errors when location changes
        if (type === 'pickup') {
            setPickupHouseNumberError(null);
        } else if (type === 'destination') {
            setDestinationHouseNumberError(null);
        }

        if (!place) {
            if (type === 'stopover' && typeof index === 'number') {
                const newStopovers = [...formData.stopovers];
                newStopovers[index] = null as unknown as Location;
                setFormData(prev => ({ ...prev, stopovers: newStopovers }));
            } else {
                setFormData(prev => ({ ...prev, [type]: null }));
            }
            return;
        }

        const parsedAddress = parseNetherlandsAddress(place.value.description);
        
        const location: Location = {
            label: place.label,
            mainAddress: place.value.description,
            secondaryAddress: place.value.structured_formatting?.secondary_text || '',
            description: place.value.description,
            value: {
                place_id: place.value.place_id,
                description: place.value.description,
                structured_formatting: {
                    main_text: place.value.description,
                    secondary_text: place.value.structured_formatting?.secondary_text || '',
                    place_id: place.value.place_id
                }
            },
            exactAddress: {
                streetName: parsedAddress.streetName,
                houseNumber: parsedAddress.houseNumber,
                postalCode: parsedAddress.postalCode,
                city: parsedAddress.city,
                businessName: parsedAddress.businessName
            }
        };

        // Update mainAddress with house number if available
        if (location.exactAddress?.houseNumber) {
            location.mainAddress = `${parsedAddress.streetName} ${parsedAddress.houseNumber}, ${parsedAddress.city}`;
        }

        if (type === 'stopover' && typeof index === 'number') {
            const newStopovers = [...formData.stopovers];
            newStopovers[index] = location;
            setFormData(prev => ({ ...prev, stopovers: newStopovers }));
        } else {
            setFormData(prev => ({ ...prev, [type]: location }));
        }
    };

    const handleCalculate = async () => {
        setIsLoading(true);
        try {
            // Clear all validation errors first
            setValidationErrors({});
            setPickupHouseNumberError(null);
            setDestinationHouseNumberError(null);

            const { errors } = validateBookingForm(formData, translations);
            
            const hasErrors = Object.keys(errors).length > 0;
            let exactAddressErrors = false;

            // Check exact address for pickup
            if (formData.pickup && !validateExactLocation(formData.pickup)) {
                setPickupHouseNumberError(translations.booking.errors.exactAddressRequired);
                exactAddressErrors = true;
            }

            // Check exact address for destination
            if (formData.destination && !validateExactLocation(formData.destination)) {
                setDestinationHouseNumberError(translations.booking.errors.exactAddressRequired);
                exactAddressErrors = true;
            }

            // If there are only exact address errors, don't show other validation errors
            if (exactAddressErrors) {
                setIsLoading(false);
                return;
            }

            // If there are other validation errors, show them
            if (hasErrors) {
                setValidationErrors(errors);
                setIsLoading(false);
                return;
            }

            const segments = await calculateSegmentDistances(
                formData.pickup,
                formData.destination,
                formData.stopovers
            );

            if (!formData.pickup || !formData.destination) {
                throw new Error(translations.travelInfo.errors.requiredLocations);
            }

            const bookingData: BookingData = {
                clientBookingId: new Date().getTime().toString(),
                id: new Date().getTime().toString(),
                pickup: formData.pickup,
                destination: formData.destination,
                stopovers: formData.stopovers,
                sourceAddress: formData.pickup.mainAddress || '',
                destinationAddress: formData.destination.mainAddress || '',
                directDistance: segments[0].distance,
                extraDistance: segments[1]?.distance || `0 ${translations.units.km}`,
                pickupDateTime: formData.pickupDate ? format(formData.pickupDate, 'yyyy-MM-dd HH:mm') : '',
                returnDateTime: formData.isReturn && formData.returnDate ?
                    format(formData.returnDate, 'yyyy-MM-dd HH:mm') : null,
                hasLuggage: formData.hasLuggage,
                passengers: formData.travelers,
                luggage: {
                    regularLuggage: { large: 0, small: 0, handLuggage: 0 },
                    specialLuggage: {
                        foldableWheelchair: 0, rollator: 0, pets: 0,
                        bicycle: 0, winterSports: 0, stroller: 0,
                        golfBag: 0, waterSports: 0
                    }
                },
                vehicle: null,
                isReturn: formData.isReturn,
                price: 0,
                bookingType: formData.bookingType, // Include bookingType in booking data
                isFixedPrice: false
            };

            localStorage.setItem('bookingData', JSON.stringify(bookingData));

            // Keep loading state active while routing
            router.push(formData.hasLuggage ? '/booking/luggage' : '/booking/offers');
        } catch (error) {
            console.error('Booking calculation error:', error);
            setValidationErrors(prev => ({
                ...prev,
                general: 'translations.travelInfo.errors.generalError'
            }));
            setIsLoading(false);
        }
    };

    const swapLocations = () => {
        setFormData(prev => ({
            ...prev,
            pickup: prev.destination,
            destination: prev.pickup
        }));
        // Clear house number errors when swapping
        setPickupHouseNumberError(null);
        setDestinationHouseNumberError(null);
    };

    const addStopover = () => {
        if (formData.stopovers.length >= 3) {
            setValidationErrors(prev => ({
                ...prev,
                stopovers: translations.travelInfo.errors.maxStopovers
            }));
            return;
        }
        setFormData(prev => ({
            ...prev,
            stopovers: [...prev.stopovers, null] as Location[]
        }));
        setValidationErrors(prev => ({
            ...prev,
            stopovers: undefined
        }));
    };

    const removeStopover = (index: number) => {
        setFormData(prev => ({
            ...prev,
            stopovers: prev.stopovers.filter((_, i) => i !== index)
        }));
    };

    // For pickup location
    const handlePickupHouseNumber = (value: string) => {
        if (!formData.pickup) return;
        
        // Clear error when user starts typing
        setPickupHouseNumberError(null);
        
        const newPickup = {
            ...formData.pickup,
            exactAddress: {
                ...(formData.pickup.exactAddress || {}),
                houseNumber: value,
                streetName: formData.pickup.exactAddress?.streetName || ''
            },
            mainAddress: `${formData.pickup.exactAddress?.streetName || ''} ${value}, ${formData.pickup.exactAddress?.city || ''}, Netherlands`
        };
        
        setFormData(prev => ({
            ...prev,
            pickup: newPickup
        }));
    };

    // For destination location
    const handleDestinationHouseNumber = (value: string) => {
        if (!formData.destination) return;
        
        // Clear error when user starts typing
        setDestinationHouseNumberError(null);
        
        const newDestination = {
            ...formData.destination,
            exactAddress: {
                ...(formData.destination.exactAddress || {}),
                houseNumber: value,
                streetName: formData.destination.exactAddress?.streetName || ''
            },
            mainAddress: `${formData.destination.exactAddress?.streetName || ''} ${value}, ${formData.destination.exactAddress?.city || ''}, Netherlands`
        };
        
        setFormData(prev => ({
            ...prev,
            destination: newDestination
        }));
    };

    const renderPickupLocation = () => (
        <div>
            <div className="grid grid-cols-[24px_1fr_24px] xs:grid-cols-[32px_1fr_32px] sm:grid-cols-[48px_1fr_48px] items-start gap-1 sm:gap-2">
                <div className="flex justify-center pt-8">
                    <div className="w-6 h-6 rounded-full mt-2 bg-primary flex items-center justify-center relative z-20">
                        <MapPin className="text-white" size={16} />
                    </div>
                </div>
                <div className="w-full space-y-1">
                    <span className="block text-sm font-medium text-gray-600">{translations.booking.from}</span>
                    <LocationInput
                        value={formData.pickup}
                        onChange={(place) => handleLocationUpdate(place, 'pickup')}
                        placeholder={t('hero.pickupPlaceholder')}
                        translations={translations}
                        onClear={() => handleLocationUpdate(null, 'pickup')}
                    />
                    {formData.pickup && !formData.pickup.exactAddress?.businessName && (
                        <div>
                            <input
                                type="text"
                                placeholder={t('booking.houseNumber')}
                                value={formData.pickup.exactAddress?.houseNumber || ''}
                                onChange={(e) => handlePickupHouseNumber(e.target.value)}
                                className={`mt-2 w-32 p-2 border ${pickupHouseNumberError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-primary focus:border-primary`}
                            />
                            {pickupHouseNumberError && (
                                <span className="text-red-500 text-sm mt-1 block">
                                    {pickupHouseNumberError}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex justify-center pt-7">
                    <button
                        type="button"
                        onClick={swapLocations}
                        className="p-2 mt-2 rounded-full hover:bg-gray-100 transition-colors"
                        title={translations.hero.swapLocations}
                    >
                        <ArrowUpDown size={20} className="text-secondary" />
                    </button>
                </div>
            </div>

            <div className="col-span-3">
                {formData.pickup && validationErrors.pickup && (
                    <div className="ml-[24px] xs:ml-[32px] sm:ml-[48px] m-2">
                        <span className="text-red-500 text-sm mt-1 block">
                            {validationErrors.pickup}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );

    const renderStopovers = () => (
        <>
            {formData.stopovers.map((stopover, index) => (
                <div key={index}>
                    <div className="grid grid-cols-[24px_1fr_24px] xs:grid-cols-[32px_1fr_32px] sm:grid-cols-[48px_1fr_48px] items-start gap-1 sm:gap-2">
                        <div className="flex justify-center pt-8">
                            <div className="w-4 h-4 rounded-full bg-secondary mt-4 flex items-center justify-center relative z-20">
                                <MapPin className="text-white" size={12} />
                            </div>
                        </div>
                        <div className="w-full space-y-1">
                            <span className="block text-sm font-medium text-gray-600">{translations.booking.via}</span>
                            <LocationInput
                                value={stopover}
                                onChange={(place) => handleLocationUpdate(place, 'stopover', index)}
                                placeholder={`${translations.hero.stopover} ${index + 1}`}
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

                    <div className="col-span-3">
                        {validationErrors[`stopover_${index}`] && (
                            <div className="ml-[24px] xs:ml-[32px] sm:ml-[48px] m-2">
                                <span className="text-red-500 text-sm mt-1 block">
                                    {validationErrors[`stopover_${index}`]}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </>
    );

    const renderDestination = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-[24px_1fr_24px] xs:grid-cols-[32px_1fr_32px] sm:grid-cols-[48px_1fr_48px] items-start gap-1 sm:gap-2">
                <div className="flex justify-center pt-8">
                    <div className="w-6 h-6 rounded-full mt-2 bg-green-500 flex items-center justify-center relative z-20">
                        <MapPin className="text-white" size={16} />
                    </div>
                </div>
                <div className="w-full space-y-1">
                    <span className="block text-sm font-medium text-gray-600">{translations.booking.to}</span>
                    <LocationInput
                        value={formData.destination}
                        onChange={(place) => handleLocationUpdate(place, 'destination')}
                        placeholder={translations.hero.destinationPlaceholder}
                        translations={translations}
                        onClear={() => handleLocationUpdate(null, 'destination')}
                    />
                    
                </div>
                <div className="flex justify-center pt-7">
                    <button
                        type="button"
                        onClick={swapLocations}
                        className="p-2 mt-2 rounded-full hover:bg-gray-100 transition-colors"
                        title={translations.hero.swapLocations}
                    >
                        <ArrowUpDown size={20} className="text-secondary" />
                    </button>
                </div>
            </div>
            
            
            <div className="col-span-3">
                {validationErrors.destination && (
                    <div className="ml-[24px] xs:ml-[32px] sm:ml-[48px] m-2">
                        <span className="text-red-500 text-sm mt-1 block">
                            {validationErrors.destination}
                        </span>
                    </div>
                )}
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
                <span className="font-medium">{translations.hero.addStopover}</span>
            </button>
            <div></div>
        </div>
    );

    return (
        <div className="w-full max-w-2xl mx-auto px-2 sm:px-4">
            <form className="space-y-6">
                <div className="space-y-4 sm:space-y-6 relative">
                    <div className="absolute left-[12px] xs:left-[14px] sm:left-[24px] top-10 bottom-8 w-0.5 bg-gradient-to-b from-primary/80 to-green-500/80 z-0" />
                    {renderPickupLocation()}
                    {renderStopovers()}
                    {renderAddStopoverButton()}
                    {renderDestination()}
                    
                </div>
                {formData.destination && !formData.destination.exactAddress?.businessName && (
                        <div>
                            <input
                                type="text"
                                placeholder={t('booking.houseNumber')}
                                value={formData.destination.exactAddress?.houseNumber || ''}
                                onChange={(e) => handleDestinationHouseNumber(e.target.value)}
                                className={`mt-[-10px] ms-[34px] lg:ms-[55px] w-32 p-2 border ${destinationHouseNumberError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-primary focus:border-primary`}
                            />
                            {destinationHouseNumberError && (
                                <span className="text-red-500 text-sm mt-1 block">
                                    {destinationHouseNumberError}
                                </span>
                            )}
                        </div>
                    )}
               
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mt-6">
                    <div className="space-y-4 sm:space-y-6 bg-gray-50/80 p-4 sm:p-6 rounded-2xl">
                        <LuggageCheckbox
                            checked={formData.hasLuggage}
                            onChange={(checked) => setFormData(prev => ({ ...prev, hasLuggage: checked }))}
                            label={translations.hero.luggage}
                        />
                        <PassengerSelector
                            value={formData.travelers}
                            onChange={(value) => setFormData(prev => ({ ...prev, travelers: value }))}
                            label={translations.hero.travelers}
                        />
                        {validationErrors.travelers && <span className="text-red-500 text-sm">{validationErrors.travelers}</span>}
                    </div>

                    <div className="space-y-4 sm:space-y-6 bg-gray-50/80 p-4 sm:p-6 rounded-2xl">
                        <DateSelector
                            label={translations.hero.pickupDateTime}
                            value={formData.pickupDate || null}
                            onChange={(date) => setFormData(prev => ({ ...prev, pickupDate: date || undefined }))}
                            placeholder={translations.hero.pickupDateTime}
                        />
                        {validationErrors.pickupDate && <span className="text-red-500 text-sm">{validationErrors.pickupDate}</span>}

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="return"
                                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                                    checked={formData.isReturn}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        isReturn: e.target.checked
                                    }))}
                                />
                                <label htmlFor="return" className="text-sm font-medium text-gray-700 cursor-pointer">
                                    {translations.hero.returnTrip}
                                </label>
                            </div>

                            {formData.isReturn && (
                                <DateSelector
                                    label={translations.hero.returnDateTime}
                                    value={formData.returnDate || null}
                                    onChange={(date) => setFormData(prev => ({ ...prev, returnDate: date || undefined }))}
                                />
                            )}
                            {validationErrors.returnDate && <span className="text-red-500 text-sm">{validationErrors.returnDate}</span>}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        type="button"
                        onClick={handleCalculate}
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-primary text-white px-6 sm:px-8 py-3 rounded-full hover:bg-primary/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>{translations.common.loading}</span>
                            </div>
                        ) : (
                            translations.hero.calculate
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};
