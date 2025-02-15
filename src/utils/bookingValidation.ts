// Booking validation
import { BookingFormData } from '@/types/booking'

export const validateBookingForm = (formData: BookingFormData): { isValid: boolean; error?: string } => {
    if (!formData.pickup) {
        return { isValid: false, error: 'Please select a pickup location' }
    }

    if (!formData.destination) {
        return { isValid: false, error: 'Please select a destination' }
    }

    if (!formData.pickupDate) {
        return { isValid: false, error: 'Please select a pickup date and time' }
    }

    const now = new Date()
    if (formData.pickupDate < now) {
        return { isValid: false, error: 'Pickup date cannot be in the past' }
    }

    if (formData.travelers < 1 || formData.travelers > 8) {
        return { isValid: false, error: 'Number of travelers must be between 1 and 8' }
    }

    if (formData.isReturn && !formData.returnDate) {
        return { isValid: false, error: 'Please select a return date and time' }
    }

    if (formData.isReturn && formData.returnDate && formData.returnDate < formData.pickupDate) {
        return { isValid: false, error: 'Return date must be after pickup date' }
    }

    if (formData.pickup.value.place_id === formData.destination.value.place_id) {
        return { isValid: false, error: 'Pickup and destination cannot be the same location' }
    }

    return { isValid: true }
}

