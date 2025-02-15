import { useState } from 'react'
import { SingleValue } from 'react-select'
import { MapPin, Plus, Minus, ArrowUpDown } from 'lucide-react'
import { LocationInput } from './booking/LocationInput'
import { Location, BookingFormData } from '@/types/booking'
import { WebsiteTranslations } from '@/types/translations'
import type { SelectOption } from '@/hooks/useLocationSelect'
import { handleLocationSelect } from '@/hooks/useLocationSelect'
import { LuggageCheckbox } from './booking/LuggageCheckbox'
import { DateSelector } from './booking/DateSelector'
import { PassengerSelector } from './booking/PassengerSelector'

interface BookingFormProps {
    translations: WebsiteTranslations
}

export const BookingForm = ({ translations }: BookingFormProps) => {
    const [formData, setFormData] = useState<BookingFormData>({
        pickup: null,
        stopovers: [],
        destination: null,
        hasLuggage: false,
        travelers: 1,
        pickupDate: undefined,
        isReturn: false,
        returnDate: undefined,
    })

    const handleCalculate = () => {
        console.log('Form Data:', formData)
      }    


    const swapLocations = () => {
        setFormData(prev => ({
            ...prev,
            pickup: prev.destination,
            destination: prev.pickup
        }))
    }

    const addStopover = () => {
        setFormData(prev => ({
            ...prev,
            stopovers: [...prev.stopovers, null] as Location[]
        }))
    }

    const removeStopover = (index: number) => {
        setFormData(prev => ({
            ...prev,
            stopovers: prev.stopovers.filter((_, i) => i !== index)
        }))
    }

    const renderPickupLocation = () => (
        <div className="grid grid-cols-[48px_1fr_48px] items-start gap-2">
            <div className="flex justify-center pt-7">
                <div className="w-6 h-6 m-2 rounded-full bg-primary flex items-center justify-center relative z-10">
                    <MapPin className="text-white" size={16} />
                </div>
            </div>
            <div className="space-y-1">
                <span className="block text-sm font-medium text-gray-600">From</span>
                <LocationInput
                    value={formData.pickup}
                    onChange={(place: SingleValue<SelectOption>) =>
                        handleLocationSelect(place, 'pickup', formData, setFormData, translations)}
                    placeholder={translations.hero.pickupPlaceholder}
                    translations={translations}
                    onClear={() => setFormData(prev => ({ ...prev, pickup: null }))}
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
    )

    const renderStopovers = () => (
        <>
            {formData.stopovers.map((stopover, index) => (
                <div key={index} className="grid grid-cols-[48px_1fr_48px] items-start gap-2">
                    <div className="flex justify-center pt-8">
                        <div className="w-4 h-4 rounded-full bg-primary mt-4 flex items-center justify-center relative z-10">
                            <MapPin className="text-secondary" size={12} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="block text-sm font-medium text-gray-600">Via</span>
                        <LocationInput
                            value={stopover}
                            onChange={(place) => handleLocationSelect(place, 'stopover', formData, setFormData, translations, index)}
                            placeholder={`${translations.hero.stopover} ${index + 1}`}
                            translations={translations}
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
    )

    const renderDestination = () => (
        <div className="grid grid-cols-[48px_1fr_48px] items-start gap-2">
            <div className="flex justify-center pt-8">
                <div className="w-6 h-6 rounded-full mt-2 bg-green-500 flex items-center justify-center relative z-10">
                    <MapPin className="text-white" size={16} />
                </div>
            </div>
            <div className="space-y-1">
                <span className="block text-sm font-medium text-gray-600">To</span>
                <LocationInput
                    value={formData.destination}
                    onChange={(place) => handleLocationSelect(place, 'destination', formData, setFormData, translations)}
                    placeholder={translations.hero.destinationPlaceholder}
                    translations={translations}
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
    )

    const renderAddStopoverButton = () => (
        <div className="grid grid-cols-[48px_1fr_48px] items-center">
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
    )
    return (
        <div className="max-w-2xl mx-auto">
            <form className="space-y-8">
                <div className="relative bg-white/50 p-6 rounded-2xl backdrop-blur-sm">
                    <div className="space-y-6 relative">
                        <div className="absolute left-6 top-10 bottom-8 w-0.5 bg-gradient-to-b from-primary/80 to-green-500/80" />
                        {renderPickupLocation()}
                        {renderStopovers()}
                        {renderAddStopoverButton()}
                        {renderDestination()}
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8 mt-8">
                    <div className="space-y-6 bg-gray-50/80 p-6 rounded-2xl">
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
                    </div>

                    <div className="space-y-6 bg-gray-50/80 p-6 rounded-2xl">
                        <DateSelector
                            label={translations.hero.pickupDateTime}
                            value={formData.pickupDate || null}
                            onChange={(date) => setFormData(prev => ({ ...prev, pickupDate: date || undefined }))}
                            placeholder={translations.hero.pickupDateTime}
                        />

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
                        </div>

                    </div>
                </div>
                <div className="flex justify-end mt-8">
                    <button
                        type="button"
                        onClick={handleCalculate}
                        className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primary/90 transition-colors"
                    >
                        {translations.hero.calculate}
                    </button>
                </div>
            </form>
        </div>
    )
}