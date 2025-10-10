import Booking from '@/models/Booking';

export const generateBookingId = async (): Promise<string> => {
  // Find the last booking by sorting clientBookingId in descending order
  const lastBooking = await Booking.findOne().sort({ clientBookingId: -1 }).select('clientBookingId');

  let nextNumber = 1;

  if (lastBooking && lastBooking.clientBookingId) {
    // Extract the number from the last ID, assuming format like "00001"
    const lastNumber = parseInt(lastBooking.clientBookingId.replace(/\D/g, ''), 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  // Format as 5-digit string with leading zeros
  return nextNumber.toString().padStart(5, '0');
};