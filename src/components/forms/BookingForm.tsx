import { useState } from 'react';
import { MapPin, Plus, Minus, ArrowUpDown } from 'lucide-react';
import { LocationInput } from './booking/LocationInput';
import { Location, BookingFormData, BookingData } from '@/types/booking';
import { handleLocationSelect } from '@/hooks/useLocationSelect';
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

    const handleLocationUpdate = (location: Location, type: 'pickup' | 'destination') => {
        setFormData(prev => ({
            ...prev,
            [type]: location
        }));
        // Clear validation errors when input changes
        setValidationErrors(prev => ({
            ...prev,
            [type]: undefined
        }));
    };

    const handleCalculate = async () => {
        setIsLoading(true);
        try {
            const { isValid, errors } = validateBookingForm(formData, translations);
            setValidationErrors(errors);

            if (!isValid) {
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

    const renderPickupLocation = () => (
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
                    onClear={() => setFormData(prev => ({ ...prev, pickup: null }))}
                />
                {validationErrors.pickup && <span className="text-red-500 text-sm">{validationErrors.pickup}</span>}
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
    );

    const renderStopovers = () => (
        <>
            {formData.stopovers.map((stopover, index) => (
                <div key={index} className="grid grid-cols-[24px_1fr_24px] xs:grid-cols-[32px_1fr_32px] sm:grid-cols-[48px_1fr_48px] items-start gap-1 sm:gap-2">
                    <div className="flex justify-center pt-8">
                        <div className="w-4 h-4 rounded-full bg-secondary mt-4 flex items-center justify-center relative z-20">
                            <MapPin className="text-white" size={12} />
                        </div>
                    </div>
                    <div className="w-full space-y-1">
                        <span className="block text-sm font-medium text-gray-600">{translations.booking.via}</span>
                        <LocationInput
                            value={stopover}
                            onChange={(place) => handleLocationSelect(place, 'stopover', formData, setFormData, translations, index)}
                            placeholder={`${translations.hero.stopover} ${index + 1}`}
                            translations={translations}
                            onClear={() => {
                                const newStopovers = [...formData.stopovers];
                                newStopovers[index] = null as unknown as Location;
                                setFormData(prev => ({ ...prev, stopovers: newStopovers }));
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
        <>
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
                        onChange={(place) => handleLocationSelect(place, 'destination', formData, setFormData, translations)}
                        placeholder={translations.hero.destinationPlaceholder}
                        translations={translations}
                        onClear={() => setFormData(prev => ({ ...prev, destination: null }))}
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
        </>
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
                {validationErrors.destination && (
                    <div className="relative ml-[29px] xs:ml-[14px] sm:ml-[24px] lg:ml-[59px] mt-[-20px] top-[-24px]">
                        <span className="text-red-500 text-sm">{validationErrors.destination}</span>
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