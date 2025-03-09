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



/**
 * Handles the selection of a location in a booking form.
 *
 * @param selected - The selected location option.
 * @param type - The type of location being selected (pickup, destination, or stopover).
 * @param formData - The current state of the booking form data.
 * @param setFormData - The function to update the booking form data.
 * @param translations - The website translations.
 * @param index - The index of the stopover location (if applicable).
 * @returns - Void.
 */
export const handleLocationSelect = async (
    selected: SingleValue<SelectOption>,
    type: 'pickup' | 'destination' | 'stopover',
    formData: BookingFormData,
    setFormData: React.Dispatch<React.SetStateAction<BookingFormData>>,
    translations: WebsiteTranslations,
    index?: number
) => {
    // Add error handling for geocoding failures
    if (!selected?.value?.place_id) {
        console.error('Invalid location selection');
        return;
    }

    console.log('Selected location:', selected); // Debugging line
    if (!selected) {
        if (type === 'stopover' && typeof index === 'number') {
            const newStopovers = [...formData.stopovers];
            newStopovers[index] = null as unknown as Location;
            setFormData({ ...formData, stopovers: newStopovers });
        } else {
            setFormData({ ...formData, [type]: null });
        }
        return;
    }

    // Handle manual entries (when place_id is 'manual-entry')
    if (selected.value.place_id === 'manual-entry') {
        const manualLocation: Location = {
            label: selected.value.description,
            mainAddress: selected.value.description,
            secondaryAddress: '',
            value: {
                place_id: 'manual-entry',
                description: selected.value.description,
                structured_formatting: {
                    main_text: selected.value.description,
                    secondary_text: '',
                    place_id: 'manual-entry'
                }
            },
            description: selected.value.description
        };

        if (type === 'stopover' && typeof index === 'number') {
            const newStopovers = [...formData.stopovers];
            newStopovers[index] = manualLocation;
            setFormData({ ...formData, stopovers: newStopovers });
        } else {
            setFormData({ ...formData, [type]: manualLocation });
        }
        return;
    }

    const geocoder = new google.maps.Geocoder();
    const mainLocale = translations.locale;
    const secondaryLocale = mainLocale === 'nl' ? 'en' : 'nl';

    // Add loading state handling
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
        ]);

        const enrichedLocation: Location = {
            label: selected.value.structured_formatting.main_text,
            mainAddress: mainResult.results[0]?.formatted_address,
            secondaryAddress: secondaryResult.results[0]?.formatted_address,
            value: {
                place_id: selected.value.place_id,
                description: selected.value.description,
                structured_formatting: {
                    main_text: selected.value.structured_formatting.main_text,
                    secondary_text: selected.value.structured_formatting.secondary_text,
                    place_id: selected.value.place_id
                }
            },
            description: ''
        };

        if (type === 'stopover' && typeof index === 'number') {
            const newStopovers = [...formData.stopovers];
            newStopovers[index] = enrichedLocation;
            setFormData({ ...formData, stopovers: newStopovers });
        } else {
            setFormData({ ...formData, [type]: enrichedLocation });
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        // Add user-friendly error handling
        throw new Error( 'Location lookup failed');
    }
};