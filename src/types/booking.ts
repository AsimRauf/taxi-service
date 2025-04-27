// Booking types
import { LuggageFormData } from "./luggage"

export interface Location {
  description: string;
  label: string;
  value: {
    place_id: string;
    description: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
      place_id: string;
    }
  };
  mainAddress?: string;
  secondaryAddress?: string;
  exactAddress?: {
    streetName?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
    businessName?: string;
  }
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
  clientBookingId: string;
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
  vehicle: 'sedan' | 'stationWagon' | 'bus' | null;
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

export interface Booking {
  _id: string;
  clientBookingId: string;
  userId: string;
  sourceAddress: string;
  destinationAddress: string;
  stopovers: Location[];
  pickupDateTime: string;
  returnDateTime?: string;
  passengers: number;
  hasLuggage: boolean;
  luggage?: {
    regularLuggage: {
      large: number;
      small: number;
      handLuggage: number;
    };
    specialLuggage: {
      foldableWheelchair: number;
      rollator: number;
      pets: number;
      bicycle: number;
      winterSports: number;
      stroller: number;
      golfBag: number;
      waterSports: number;
    };
  };
  price: number;
  status: BookingStatus;
  directDistance: string;
  extraDistance?: string;
  vehicle: string;
  isReturn: boolean;
  bookingType: 'individual' | 'business';
  isFixedPrice: boolean;
  flightNumber?: string;
  remarks?: string;
  contactInfo?: {
    fullName: string;
    email: string;
    phoneNumber: string;
    additionalPhoneNumber?: string;
    hasAdditionalPhone?: boolean;
  };
  bookingForOther?: {
    fullName: string;
    phoneNumber: string;
  };
  businessInfo?: {
    companyName: string;
    businessAddress: Location;
  };
  cancellation?: {
    requestedAt: string;
    reason: string;
    status: CancellationStatus;
    adminResponse?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 
  | 'pending'      // Initial state when booking is created
  | 'confirmed'    // After admin/system confirms
  | 'in-progress'  // When ride has started
  | 'completed'    // After ride completion
  | 'cancelled'    // If booking is cancelled
  | 'no-show';     // If passenger doesn't show up

export type CancellationStatus = 
  | 'requested'    // Initial state when cancellation is requested
  | 'approved'     // After admin approves cancellation
  | 'rejected'     // If admin rejects cancellation
  | 'auto-approved'; // For automatic approvals within cancellation window

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'cash'
  | 'invoice';

export interface Payment {
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  paidAt?: string;
  refundedAt?: string;
}
