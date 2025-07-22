import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import {
    Luggage, Briefcase, Package, Minus, Plus,
    Accessibility, Footprints, Dog, Bike, Snowflake, Baby,
    Flag, Waves
} from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import { LuggageFormData, RegularLuggage, SpecialLuggage } from '@/types/luggage';
import { Stepper } from '@/components/booking/Stepper';
import { useEdit } from '@/contexts/EditContext';
import { NavigationButtons } from '@/components/booking/NavigationButtons';




interface BookingData {
    id: string;
    sourceAddress: string;
    destinationAddress: string;
    directDistance: string;
    stopovers: string[];
    extraDistance: string;
    pickupDateTime: string | null;
    returnDateTime: string | null;
    hasLuggage: boolean;
    passengers: number;
    luggage?: LuggageFormData;
    vehicle: 'regular' | 'van' | null;
    price: number;
    isFixedPrice: boolean;
}

const LuggageIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'large': return <Luggage className="w-12 h-12 text-primary" />;
        case 'small': return <Package className="w-12 h-12 text-primary" />;
        case 'handLuggage': return <Briefcase className="w-12 h-12 text-primary" />;
        default: return null;
    }
};

const SpecialLuggageIcon = ({ type }: { type: keyof SpecialLuggage }) => {
    switch (type) {
        case 'foldableWheelchair': return <Accessibility className="w-8 h-8 text-primary" />;
        case 'rollator': return <Footprints className="w-8 h-8 text-primary" />;
        case 'pets': return <Dog className="w-8 h-8 text-primary" />;
        case 'bicycle': return <Bike className="w-8 h-8 text-primary" />;
        case 'winterSports': return <Snowflake className="w-8 h-8 text-primary" />;
        case 'stroller': return <Baby className="w-8 h-8 text-primary" />;
        case 'golfBag': return <Flag className="w-8 h-8 text-primary" />;
        case 'waterSports': return <Waves className="w-8 h-8 text-primary" />;
        default: return null;
    }
};



const RegularLuggageSelector = ({ type, value, onChange, max, title, subtitle }: {
    type: keyof RegularLuggage;
    value: number;
    onChange: (value: number) => void;
    max: number;
    title: string;
    subtitle: string;
}) => (
    <div className="flex flex-col items-center p-6 bg-primary/10 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-lg border border-primary/20 rounded-xl shadow-sm">
        <LuggageIcon type={type} />
        <h3 className="mt-4 font-medium text-black">{title}</h3>
        <p className="text-sm text-black/70 text-center mt-2">{subtitle}</p>
        <div className="flex items-center space-x-4 mt-4">
            <button
                onClick={() => value > 0 && onChange(value - 1)}
                className="p-2 rounded-full hover:bg-primary/10 transition-colors"
                disabled={value === 0}
            >
                <Minus size={20} className={value === 0 ? "text-gray-400" : "text-black"} />
            </button>
            <span className="w-8 text-center font-medium text-black">{value}</span>
            <button
                onClick={() => value < max && onChange(value + 1)}
                className="p-2 rounded-full hover:bg-primary/10 transition-colors"
                disabled={value === max}
            >
                <Plus size={20} className={value === max ? "text-gray-400" : "text-black"} />
            </button>
        </div>
    </div>
);

const SpecialLuggageItem = ({ type, value, onChange }: {
    type: keyof SpecialLuggage;
    value: number;
    onChange: (value: number) => void;
}) => {
    const { t } = useTranslation();
    return (
        <div className="bg-primary/10 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-lg border border-primary/20 p-4 rounded-lg transition-all hover:shadow-md">
            <div className="space-y-3">
                <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8">
                        <SpecialLuggageIcon type={type} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className="font-medium text-black block text-sm">
                            {t(`luggage.special.${type}.title`)}
                        </span>
                        <p className="text-xs text-black/70 mt-1 truncate">
                            {t(`luggage.special.${type}.description`)}
                        </p>
                    </div>
                </div>
                <div className="flex justify-end items-center space-x-3">
                    <button
                        onClick={() => value > 0 && onChange(value - 1)}
                        className="p-1 rounded-full hover:bg-primary/10 transition-colors"
                        disabled={value === 0}
                    >
                        <Minus size={16} className={value === 0 ? "text-gray-400" : "text-black"} />
                    </button>
                    <span className="w-8 text-center font-medium text-black">{value}</span>
                    <button
                        onClick={() => value < 3 && onChange(value + 1)}
                        className="p-1 rounded-full hover:bg-primary/10 transition-colors"
                        disabled={value === 3}
                    >
                        <Plus size={16} className={value === 3 ? "text-gray-400" : "text-black"} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const LuggagePage = () => {
    const router = useRouter();
    const { isEditing, editingBookingId, setEditMode } = useEdit();
    const { t } = useTranslation();
    const [, setBookingData] = useState<BookingData | null>(null);
    const [showSpecialLuggage, setShowSpecialLuggage] = useState(false);
    const [luggageData, setLuggageData] = useState<LuggageFormData>({
        regularLuggage: {
            large: 0,
            small: 0,
            handLuggage: 0
        },
        specialLuggage: {
            foldableWheelchair: 0,
            rollator: 0,
            pets: 0,
            bicycle: 0,
            winterSports: 0,
            stroller: 0,
            golfBag: 0,
            waterSports: 0
        }
    });

    useEffect(() => {
        if (isEditing && editingBookingId) {
            const allBookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
            const editingBooking = allBookings.find((b: BookingData) => b.id === editingBookingId);
            if (editingBooking) {
                setLuggageData(editingBooking.luggage);
            }
        }
    }, [isEditing, editingBookingId]);

    useEffect(() => {
        const savedData = localStorage.getItem('bookingData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            setBookingData(parsedData);

            if (parsedData.luggage) {
                setLuggageData(parsedData.luggage);
                if (Object.values(parsedData.luggage.specialLuggage).some((value): value is number => typeof value === 'number' && value > 0)) {
                    setShowSpecialLuggage(true);
                }
            }
        }
    }, []);

    const handleSave = () => {
        if (isEditing && editingBookingId) {
            const allBookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
            const updatedBookings = allBookings.map((booking: BookingData) => {
                if (booking.id === editingBookingId) {
                    return { ...booking, luggage: luggageData };
                }
                return booking;
            });
            localStorage.setItem('allBookings', JSON.stringify(updatedBookings));
            router.push('/booking/overview');
        } else {
            handleContinue();
        }
    };

    const handleRegularLuggageChange = (type: keyof RegularLuggage, value: number) => {
        if (type === 'handLuggage' && value <= 8) {
            setLuggageData(prev => ({
                ...prev,
                regularLuggage: {
                    ...prev.regularLuggage,
                    [type]: value
                }
            }));
            return;
        }

        const { large, small } = luggageData.regularLuggage;
        const stationWagonCapacity = 8;

        if (type === 'large') {
            if (value + small <= stationWagonCapacity && value <= stationWagonCapacity) {
                setLuggageData(prev => ({
                    ...prev,
                    regularLuggage: { ...prev.regularLuggage, large: value }
                }));
            }
        } else if (type === 'small') {
            if (large + value <= stationWagonCapacity && value <= stationWagonCapacity) {
                setLuggageData(prev => ({
                    ...prev,
                    regularLuggage: { ...prev.regularLuggage, small: value }
                }));
            }
        }
    };

    const handleSpecialLuggageChange = (type: keyof SpecialLuggage, value: number) => {
        const totalOthers = Object.entries(luggageData.specialLuggage)
            .filter(([key]) => key !== type)
            .reduce((sum, [, value]) => sum + value, 0);

        if (totalOthers + value <= 3) {
            setLuggageData(prev => ({
                ...prev,
                specialLuggage: {
                    ...prev.specialLuggage,
                    [type]: value
                }
            }));
        }
    };

    const handleBack = () => {
        if (isEditing) {
            setEditMode(null); // Clear edit mode
            router.push('/booking/overview');
        } else {
            router.back();
        }
    };

    const handleContinue = () => {
        const savedData = localStorage.getItem('bookingData');
        if (!savedData) return;

        const bookingData: BookingData = JSON.parse(savedData);
        const updatedData: BookingData = {
            ...bookingData,
            luggage: luggageData,
            vehicle: null // Reset selected vehicle when luggage changes
        };

        localStorage.setItem('bookingData', JSON.stringify(updatedData));
        router.push('/booking/offers');
    };



    return (
        <div className="min-h-screen bg-gradient-to-b from-primary via-primary/80 to-secondary pt-24 pb-8">
            <div className="max-w-4xl mx-auto px-4 flex flex-col items-center mt-8">
                {isEditing ? (
                    <button
                        onClick={handleBack}
                        className="text-white hover:text-gray-200 transition-colors lg:mb-[-70px] lg:mt-[-20px] mt-[-40px]"
                    >
                        ← {t('common.backToOverview')}
                    </button>
                ) : (
                    <Stepper currentStep="luggage" />
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="w-full bg-white rounded-2xl p-4 md:p-6 shadow-xl mt-8 lg:mt-[100px]"
                >
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">{t('luggage.regularLuggage')}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-8">
                        <RegularLuggageSelector
                            type="large"
                            value={luggageData.regularLuggage.large}
                            onChange={(value) => handleRegularLuggageChange('large', value)}
                            max={8}
                            title={t('luggage.large.title')}
                            subtitle={t('luggage.large.dimensions')}
                        />
                        <RegularLuggageSelector
                            type="small"
                            value={luggageData.regularLuggage.small}
                            onChange={(value) => handleRegularLuggageChange('small', value)}
                            max={11}
                            title={t('luggage.small.title')}
                            subtitle={t('luggage.small.dimensions')}
                        />
                        <RegularLuggageSelector
                            type="handLuggage"
                            value={luggageData.regularLuggage.handLuggage}
                            onChange={(value) => handleRegularLuggageChange('handLuggage', value)}
                            max={8}
                            title={t('luggage.hand.title')}
                            subtitle={t('luggage.hand.description')}
                        />
                    </div>

                    <div className="mt-6">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                checked={showSpecialLuggage}
                                onChange={(e) => setShowSpecialLuggage(e.target.checked)}
                            />
                            <span className="text-base md:text-lg font-medium text-gray-900">{t('luggage.specialItems')}</span>
                        </label>

                        {showSpecialLuggage && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 grid grid-cols-2 gap-3"
                            >
                                {Object.keys(luggageData.specialLuggage).map((item) => (
                                    <SpecialLuggageItem
                                        key={item}
                                        type={item as keyof SpecialLuggage}
                                        value={luggageData.specialLuggage[item as keyof SpecialLuggage]}
                                        onChange={(value) => handleSpecialLuggageChange(item as keyof SpecialLuggage, value)}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </div>

                    <div className="flex justify-between mt-8">
                        <NavigationButtons
                            onBack={handleBack}
                            onContinue={handleSave}
                            continueText={isEditing ? t('common.update') : t('luggage.continue')}
                            backText={isEditing ? t('common.backToOverview') : t('luggage.back')}
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

export default LuggagePage;
