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
      place_id: string
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
  bookingType: 'individual' | 'business'; // Add bookingType to BookingFormData
}

export interface BookingData {
  id: string; // Add id property for unique identification
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
  isReturn: boolean; // Added to track if the trip is a return trip
  hasLuggage: boolean;
  passengers: number;

  // Added by luggage.tsx
  luggage: LuggageFormData;

  // Added by offers.tsx
  vehicle: 'regular' | 'van' | null;
  price: number;
  isFixedPrice: boolean;

  // Added by travel-info.tsx
  flightNumber?: string;
  remarks?: string;

  // Added by personal-info.tsx
  contactInfo?: {
    fullName: string;
    email: string;
    phoneNumber: string;
    additionalPhoneNumber?: string;
    hasAdditionalPhone: boolean; 
  };
  bookingForOther?: {
    fullName: string;
    phoneNumber: string;
  };
  bookingType: 'individual' | 'business';
  businessInfo?: {
    companyName: string;
    businessAddress: Location;
  };
}
