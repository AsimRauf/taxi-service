import { useState } from 'react'
import { SingleValue } from 'react-select'
import { MapPin, Plus, Minus, ArrowUpDown } from 'lucide-react'
import { LocationInput } from './booking/LocationInput'
import { Location, BookingFormData } from '@/types/booking'
import { WebsiteTranslations } from '@/types/translations'
import type { SelectOption } from '@/hooks/useLocationSelect'
import { handleLocationSelect } from '@/hooks/useLocationSelect'

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
          <ArrowUpDown size={20} className="text-primary" />
        </button>
      </div>
    </div>
  )

  const renderStopovers = () => (
    <>
      {formData.stopovers.map((stopover, index) => (
        <div key={index} className="grid grid-cols-[48px_1fr_48px] items-start gap-2">
          <div className="flex justify-center pt-8">
            <div className="w-4 h-4 rounded-full bg-primary-light mt-4 flex items-center justify-center relative z-10">
              <MapPin className="text-white" size={12} />
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
          <ArrowUpDown size={20} className="text-primary" />
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
        className="w-full flex items-center gap-2 text-sm text-primary hover:text-primary-dark text-left bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors h-[60px]"
      >
        <Plus size={16} />
        <span className="font-medium">{translations.hero.addStopover}</span>
      </button>
      <div></div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <form className="space-y-6">
        <div className="relative">
          <div className="space-y-6 relative">
            <div className="absolute left-6 top-10 bottom-8 w-0.5 bg-gray-200" />
            {renderPickupLocation()}
            {renderStopovers()}
            {renderAddStopoverButton()}
            {renderDestination()}
          </div>
        </div>
      </form>
    </div>
  )
}
