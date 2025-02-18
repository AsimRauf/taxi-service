// Booking types
import { LuggageFormData } from "./luggage"
export interface Location {
  description: string
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
  // Location data
  pickup: Location;
  destination: Location;
  stopovers: Location[];
  sourceAddress: string;
  destinationAddress: string;

  // Trip details
  directDistance: string;
  extraDistance: string;
  pickupDateTime: string;
  returnDateTime: string | null;
  hasLuggage: boolean;
  passengers: number;

  // Added by luggage.tsx
  luggage: LuggageFormData;

  // Added by offers.tsx
  vehicle: 'regular' | 'van';
  price: number;
  isFixedPrice: boolean;

  // Added by travel-info.tsx
  flightNumber?: string;
  remarks?: string;
}
