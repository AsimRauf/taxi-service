import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    
    // Retry up to 5 times in case of ID collision
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      try {
        // Get ALL bookings and find the actual maximum 5-digit numeric ID
        const allBookings = await Booking.find()
          .select('clientBookingId')
          .lean();

        let maxId = 0;
        for (const booking of allBookings) {
          if (booking.clientBookingId) {
            const numericId = parseInt(booking.clientBookingId, 10);
            // Only consider 5-digit IDs (00001 to 99999)
            if (!isNaN(numericId) && numericId >= 1 && numericId <= 99999 && numericId > maxId) {
              maxId = numericId;
            }
          }
        }

        const nextId = maxId + 1;
        const bookingId = nextId.toString().padStart(5, '0');
        console.log(`Found max 5-digit ID: ${maxId}, attempting to create booking ID: ${bookingId} (attempt ${attempts + 1})`);
        
        // Create a placeholder booking to reserve this ID
        await Booking.create({
          clientBookingId: bookingId,
          pickup: { label: 'PLACEHOLDER', mainAddress: 'PLACEHOLDER' },
          destination: { label: 'PLACEHOLDER', mainAddress: 'PLACEHOLDER' },
          pickupDateTime: new Date().toISOString(),
          passengers: 1,
          vehicle: 'stationWagon',
          price: 0,
          isTemporary: true,
          paymentPending: true,
          status: 'pending'
        });
        
        console.log(`✅ Successfully created booking ID: ${bookingId}`);
        return res.status(200).json({ bookingId });
        
      } catch (err: unknown) {
        // If it's a duplicate key error, retry with next ID
        if (err && typeof err === 'object' && 'code' in err && err.code === 11000) {
          console.log(`⚠️ ID collision detected, retrying... (attempt ${attempts + 1})`);
          attempts++;
          // Small delay before retry to allow DB to sync
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }
        // If it's a different error, throw it
        throw err;
      }
    }
    
    // If we exhausted all attempts
    throw new Error('Failed to generate unique booking ID after multiple attempts');
    
  } catch (error) {
    console.error('Error generating booking ID:', error);
    return res.status(500).json({ message: 'Failed to generate booking ID' });
  }
}