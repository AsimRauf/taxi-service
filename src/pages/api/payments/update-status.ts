import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { getPaymentStatus } from '@/utils/paymentService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { bookingId, transactionId } = req.body;
    
    if (!bookingId || !transactionId) {
      return res.status(400).json({ message: 'Booking ID and Transaction ID are required' });
    }
    
    await connectToDatabase();
    
    // Find the booking
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
     
    // If payment is already completed, no need to update
    if (booking.payment?.status === 'completed') {
      return res.status(200).json({ 
        success: true, 
        message: 'Payment already completed',
        status: booking.payment.status
      });
    }
    
    // Try to get payment status from MultiSafepay
    try {
      const paymentStatus = await getPaymentStatus(transactionId);
      console.log('Payment status from MultiSafepay:', paymentStatus);
      
      // Extract the actual status from the nested data structure
      const status = paymentStatus.data?.status || paymentStatus.status;
      const paymentDetails = paymentStatus.data?.payment_details || paymentStatus.payment_details;
      const transactionIdFromResponse = paymentStatus.data?.transaction_id || paymentStatus.transaction_id;
      
      // Update payment status based on MultiSafepay response
      if (status === 'completed' || status === 'initialized' || status === 'uncleared') {
        booking.payment.status = 'completed';
        booking.payment.transactionId = transactionIdFromResponse || transactionId;
        booking.payment.paymentMethod = paymentDetails?.type || 'unknown';
        booking.payment.paidAt = new Date();
        
        // Also update the booking status
        booking.status = 'confirmed';
      }
      
      await booking.save();
      
      return res.status(200).json({ 
        success: true, 
        message: 'Payment status updated',
        status: booking.payment.status
      });
    } catch (error) {
      console.error('Error getting payment status:', error);
      
      // If we can't get the status from MultiSafepay, assume it's completed
      // since the user was redirected to the success page
      booking.payment.status = 'completed';
      booking.payment.transactionId = transactionId;
      booking.payment.paidAt = new Date();
      
      // Also update the booking status
      booking.status = 'confirmed';
      
      await booking.save();
      
      return res.status(200).json({ 
        success: true, 
        message: 'Payment status updated (fallback)',
        status: booking.payment.status
      });
    }
  } catch (error) {
    console.error('Payment status update error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error updating payment status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
