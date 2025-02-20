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
        errors.pickup = translations.travelInfo.errors.requiredLocations
    }

    if (!formData.destination) {
        errors.destination = translations.travelInfo.errors.requiredLocations
    }

    if (!formData.pickupDate) {
        errors.pickupDate = translations.travelInfo.errors.pickupDateRequired
    } else {
        const now = new Date()
        if (formData.pickupDate < now) {
            errors.pickupDate = translations.travelInfo.errors.invalidPickupTime
        }
    }

    if (formData.travelers < 1 || formData.travelers > 8) {
        errors.travelers = translations.travelInfo.errors.invalidPassengers
    }

    if (formData.isReturn) {
        if (!formData.returnDate) {
            errors.returnDate = translations.travelInfo.errors.returnDateRequired
        } else if (formData.returnDate < formData.pickupDate!) {
            errors.returnDate = translations.travelInfo.errors.invalidReturnTime
        }
    }

    if (formData.pickup && formData.destination && 
        formData.pickup.value.place_id === formData.destination.value.place_id) {
        errors.destination = translations.travelInfo.errors.invalidRoute
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}

