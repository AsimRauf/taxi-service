import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { Stepper } from '@/components/booking/Stepper';
import { calculatePrice, determineVehicleAvailability } from '@/utils/pricingCalculator';
import { BookingData } from '@/types/booking';
import { useEdit } from '@/contexts/EditContext';


interface VehicleOption {
    id: 'regular' | 'van';
    name: string;
    features: string[];
}

const useVehicleOptions = () => {
    const { t } = useTranslation();
    return [
        {
            id: 'regular',
            name: t('offers.regularTaxi.name'),
            features: [
                t('offers.regularTaxi.features.passengers'),
                t('offers.regularTaxi.features.luggage'),
                t('offers.regularTaxi.features.freeTransport'),
                t('offers.regularTaxi.features.doorService'),
                t('offers.regularTaxi.features.fixedPrice')
            ]
        },
        {
            id: 'van',
            name: t('offers.vanTaxi.name'),
            features: [
                t('offers.vanTaxi.features.passengers'),
                t('offers.vanTaxi.features.luggage'),
                t('offers.vanTaxi.features.freeTransport'),
                t('offers.vanTaxi.features.doorService'),
                t('offers.vanTaxi.features.fixedPrice'),
                t('offers.vanTaxi.features.extraSpace')
            ]
        }
    ];
};

const VehicleCard = ({
    vehicle,
    isSelected,
    onSelect,
    isAvailable,
    price,
    bookingData
}: {
    vehicle: VehicleOption;
    isSelected: boolean;
    onSelect: () => void;
    isAvailable: boolean;
    price: number;
    bookingData: BookingData | null;
}) => {
    const { t } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 transition-all duration-200 ${!isAvailable ? 'hidden' : 'cursor-pointer hover:shadow-md'
                } ${isSelected ? 'ring-2 ring-primary' : ''}`}
            onClick={onSelect}
        >
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                <div className="w-16 h-16 sm:w-24 sm:h-24 relative shrink-0 mx-auto sm:mx-0">
                    <Image
                        src={`/images/vehicles/${vehicle.id}.svg`}
                        alt={vehicle.name}
                        width={96}
                        height={96}
                        className="object-contain"
                    />
                </div>

                <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 text-center sm:text-left">
                        {vehicle.name}
                    </h3>
                    <ul className="mt-2 sm:mt-3 space-y-1 sm:space-y-2">
                        {vehicle.features.map((feature, index) => (
                            <li key={index} className="flex items-start text-xs sm:text-sm text-gray-600">
                                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary mr-1 sm:mr-2 shrink-0 mt-0.5" />
                                <span className="flex-1">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="text-center sm:text-right shrink-0 mt-4 sm:mt-0 border-t sm:border-t-0 pt-4 sm:pt-0">
                    <div className="flex flex-col">
                        <div className="text-xl sm:text-2xl font-bold text-primary">
                            €{price.toFixed(2)}
                            <span className="text-sm text-gray-500 ml-1">
                                {bookingData?.isReturn ? t('offers.oneWayPrice') : ''}
                            </span>
                        </div>
                        {bookingData?.isReturn && (
                            <div className="text-sm text-gray-600 mt-1">
                                {t('offers.returnTotalPrice', { price: (price * 2).toFixed(2) })}
                            </div>
                        )}
                    </div>
                    {isAvailable && (
                        <button
                            className={`mt-2 sm:mt-4 w-full sm:w-auto px-4 sm:px-6 py-2 rounded-full text-sm transition-colors ${isSelected
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {isSelected ? t('offers.selected') : t('offers.select')}
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const PriceInfo = ({ isFixedPrice, bookingData }: { isFixedPrice: boolean, bookingData: BookingData | null }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                {isFixedPrice ? t('offers.priceInfo.fixed') : t('offers.priceInfo.estimated')}
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">{t('offers.priceInfo.includes')}:</p>
            <ul className="mt-2 space-y-1">
                {['allTaxes', 'freeCancellation', 'luggageIncluded'].map((item) => (
                    <li key={item} className="text-xs sm:text-sm text-gray-600 flex items-center">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary mr-1 sm:mr-2 shrink-0" />
                        {t(`offers.priceInfo.${item}`)}
                    </li>
                ))}
            </ul>
            {bookingData?.isReturn && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                        {t('offers.returnTripNote')}
                    </p>
                </div>
            )}
        </div>
    );
};

export const OffersPage = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const vehicleOptions = useVehicleOptions();
    const [bookingData, setBookingData] = useState<BookingData | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<'regular' | 'van' | null>(null);
    const [prices, setPrices] = useState({ regular: 0, van: 0 });
    const [availableVehicles, setAvailableVehicles] = useState({ regular: true, van: true });
    const [isFixedPrice, setIsFixedPrice] = useState(false);
    const { isEditing, editingBookingId, setEditMode } = useEdit();


    useEffect(() => {
        const savedData = localStorage.getItem('bookingData');
        if (!savedData) {
            router.push('/booking/luggage');
            return;
        }

        const parsedData: BookingData = JSON.parse(savedData);

        const calculatedPrices = calculatePrice(
            parsedData.sourceAddress,
            parsedData.destinationAddress,
            parsedData.directDistance,
            parsedData.extraDistance
        );

        setPrices({
            regular: calculatedPrices.regular,
            van: calculatedPrices.van
        });
        setIsFixedPrice(calculatedPrices.isFixedPrice);

        const availability = determineVehicleAvailability(
            parsedData.passengers,
            {
                regularLuggage: parsedData.luggage.regularLuggage,
                specialLuggage: parsedData.luggage.specialLuggage as unknown as Record<string, number>
            }
        );
        setAvailableVehicles(availability);

        // Update price if vehicle is already selected
        if (parsedData.vehicle) {
            const basePrice = calculatedPrices[parsedData.vehicle];
            const finalPrice = parsedData.isReturn ? basePrice * 2 : basePrice;
            const updatedData: BookingData = {
                ...parsedData,
                price: finalPrice,
                isFixedPrice: calculatedPrices.isFixedPrice
            };
            setBookingData(updatedData);
            setSelectedVehicle(parsedData.vehicle);
            localStorage.setItem('bookingData', JSON.stringify(updatedData));
        } else {
            setBookingData(parsedData);
        }
    }, [router]);


    const handleVehicleSelect = (vehicleId: 'regular' | 'van') => {
        if (!bookingData) return;

        const basePrice = prices[vehicleId];
        const finalPrice = bookingData.isReturn ? basePrice * 2 : basePrice;
        setSelectedVehicle(vehicleId);

        const updatedData: BookingData = {
            ...bookingData,
            vehicle: vehicleId,
            price: finalPrice,
            isFixedPrice
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
        }

        setBookingData(updatedData);
        localStorage.setItem('bookingData', JSON.stringify(updatedData));
    };

    const handleBack = () => {
        if (isEditing) {
            setEditMode(null);
            router.push('/booking/overview');
        } else {
            router.back();
        }
    };

    const handleContinue = () => {
        if (!selectedVehicle || !bookingData) return;

        const basePrice = prices[selectedVehicle];
        const finalPrice = bookingData.isReturn ? basePrice * 2 : basePrice;

        const finalData: BookingData = {
            ...bookingData,
            price: finalPrice,
            isFixedPrice
        };

        if (isEditing && editingBookingId) {
            const allBookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
            const updatedBookings = allBookings.map((booking: BookingData) => {
                if (booking.id === editingBookingId) {
                    return finalData;
                }
                return booking;
            });
            localStorage.setItem('allBookings', JSON.stringify(updatedBookings));
            setEditMode(null);
            router.push('/booking/overview');
        } else {
            localStorage.setItem('bookingData', JSON.stringify(finalData));
            router.push('/booking/travel-info');
        }
    };

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
                    <Stepper currentStep="offers" />
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-xl mt-[130px] lg:mt-[165px]"
                >
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1 sm:mb-2">
                        {t('offers.title')}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                        {t('offers.subtitle')}
                    </p>

                    <div className="space-y-4 sm:space-y-6">
                        {vehicleOptions.map(vehicle => (
                            <VehicleCard
                                key={vehicle.id}
                                vehicle={vehicle as VehicleOption}
                                isSelected={selectedVehicle === vehicle.id}
                                onSelect={() => handleVehicleSelect(vehicle.id as 'regular' | 'van')}
                                isAvailable={availableVehicles[vehicle.id as 'regular' | 'van']}
                                price={prices[vehicle.id as 'regular' | 'van']}
                                bookingData={bookingData}
                            />
                        ))}
                    </div>

                    <PriceInfo isFixedPrice={isFixedPrice} bookingData={bookingData} />

                    <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 sm:mt-12">
                        <button
                            onClick={handleBack}
                            className="order-2 sm:order-1 text-center px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            {isEditing ? t('common.backToOverview') : t('offers.back')}
                        </button>
                        <button
                            onClick={handleContinue}
                            disabled={!selectedVehicle}
                            className="order-1 sm:order-2 w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isEditing ? t('common.update') : t('offers.continue')}
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

export default OffersPage;
