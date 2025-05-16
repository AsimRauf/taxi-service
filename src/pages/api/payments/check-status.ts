import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { getPaymentStatus } from '@/utils/paymentService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { bookingId, orderId } = req.query;

  if (!bookingId && !orderId) {
    return res.status(400).json({ error: 'Missing bookingId or orderId parameter' });
  }

  try {
    await connectToDatabase();
    
    // Find booking
    const booking = await Booking.findOne(
      bookingId 
        ? { _id: bookingId } 
        : { 'payment.orderId': orderId }
    );
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // If we have an orderId, check payment status
    if (booking.payment?.orderId) {
      const paymentStatus = await getPaymentStatus(booking.payment.orderId);
      
      // Update booking if status has changed
      if (paymentStatus.data?.status && 
          paymentStatus.data.status !== booking.payment.status) {
        
        booking.payment.status = paymentStatus.data.status;
        
        if (paymentStatus.data.status === 'completed') {
          booking.status = 'pending';
          booking.paymentPending = false;
          booking.isTemporary = false;
        }
        
        await booking.save();
      }
      
      return res.status(200).json({
        bookingId: booking._id,
        clientBookingId: booking.clientBookingId,
        paymentStatus: booking.payment.status,
        bookingStatus: booking.status
      });
    }
    
    return res.status(200).json({
      bookingId: booking._id,
      clientBookingId: booking.clientBookingId,
      paymentStatus: booking.payment?.status || 'unknown',
      bookingStatus: booking.status
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Failed to check payment status', details: errorMessage });
  }
}