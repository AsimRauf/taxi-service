// Booking validation
import { BookingFormData } from '@/types/booking'
import { WebsiteTranslations } from '@/types/translations'

export interface ValidationErrors {
    pickup?: string
    destination?: string
    pickupDate?: string
    travelers?: string
    returnDate?: string
    [key: string]: string | undefined
}

export const validateBookingForm = (formData: BookingFormData, translations: WebsiteTranslations): { isValid: boolean; errors: ValidationErrors } => {
    const errors: ValidationErrors = {}

    if (!formData.pickup) {
        errors.pickup = translations.errors.requiredLocations
    }

    if (!formData.destination) {
        errors.destination = translations.errors.requiredLocations
    }

    if (!formData.pickupDate) {
        errors.pickupDate = translations.errors.pickupDateRequired
    } else {
        const now = new Date()
        if (formData.pickupDate < now) {
            errors.pickupDate = translations.errors.invalidPickupTime
        }
    }

    if (formData.travelers < 1 || formData.travelers > 8) {
        errors.travelers = translations.errors.invalidPassengers
    }

    if (formData.isReturn) {
        if (!formData.returnDate) {
            errors.returnDate = translations.errors.returnDateRequired
        } else if (formData.returnDate < formData.pickupDate!) {
            errors.returnDate = translations.errors.invalidReturnTime
        }
    }

    if (formData.pickup && formData.destination && 
        formData.pickup.value.place_id === formData.destination.value.place_id) {
        errors.destination = translations.errors.invalidRoute
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}

