// Booking types
export interface Location {
    label: string
    value: {
      place_id: string
      description: string
      structured_formatting: {
        main_text: string
        secondary_text: string
      }
    }
    mainAddress?: string
    secondaryAddress?: string
}

export interface BookingFormData {
    pickup: Location | null
    stopovers: Location[]
    destination: Location | null
    hasLuggage: boolean
    travelers: number
    pickupDate: Date | undefined
    isReturn: boolean
    returnDate: Date | undefined
}

export interface BookingData {
    sourceAddress: string
    destinationAddress: string
    directDistance: string
    stopovers: string[]
    extraDistance: string
    pickupDateTime: string | null
    returnDateTime: string | null
    hasLuggage: boolean
    passengers: number
}
