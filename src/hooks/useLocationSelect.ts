import { Location, BookingFormData } from '@/types/booking'
import { WebsiteTranslations } from '@/types/translations'
import { SingleValue } from 'react-select'

export interface SelectOption {
    label: string
    value: {
        description: string
        structured_formatting: {
            main_text: string
            secondary_text: string
            place_id: string
        }
        place_id: string
    }
}



export const handleLocationSelect = async (
    selected: SingleValue<SelectOption>,
    type: 'pickup' | 'destination' | 'stopover',
    formData: BookingFormData,
    setFormData: React.Dispatch<React.SetStateAction<BookingFormData>>,
    translations: WebsiteTranslations,
    index?: number
) => {    if (!selected) {
        if (type === 'stopover' && typeof index === 'number') {
            const newStopovers = [...formData.stopovers]
            newStopovers[index] = null as unknown as Location
            setFormData({ ...formData, stopovers: newStopovers })
        } else {
            setFormData({ ...formData, [type]: null })
        }
        return
    }

    const geocoder = new google.maps.Geocoder()
    const mainLocale = translations.locale
    const secondaryLocale = mainLocale === 'nl' ? 'en' : 'nl'

    try {
        const [mainResult, secondaryResult] = await Promise.all([
            geocoder.geocode({
                placeId: selected.value.place_id,
                language: mainLocale
            }),
            geocoder.geocode({
                placeId: selected.value.place_id,
                language: secondaryLocale
            })
        ])

        const enrichedLocation: Location = {
            label: selected.value.structured_formatting.main_text,
            mainAddress: mainResult.results[0]?.formatted_address,
            secondaryAddress: secondaryResult.results[0]?.formatted_address,
            value: {
                place_id: selected.value.place_id,
                description: selected.value.description,
                structured_formatting: {
                    main_text: selected.value.structured_formatting.main_text,
                    secondary_text: selected.value.structured_formatting.secondary_text
                }
            }
        }

        if (type === 'stopover' && typeof index === 'number') {
            const newStopovers = [...formData.stopovers]
            newStopovers[index] = enrichedLocation
            setFormData({ ...formData, stopovers: newStopovers })
        } else {
            setFormData({ ...formData, [type]: enrichedLocation })
        }
    } catch (error) {
        console.error('Error fetching address details:', error)
    }
}