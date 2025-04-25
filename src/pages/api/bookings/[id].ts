import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ message: 'Booking ID is required' });
    }
    
    // Try to find by MongoDB _id first
    let booking = await Booking.findById(id);
    
    // If not found, try by clientBookingId
    if (!booking) {
      booking = await Booking.findOne({ clientBookingId: id });
    }
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    return res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return res.status(500).json({ 
      message: 'Error fetching booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}