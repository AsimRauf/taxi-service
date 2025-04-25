import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { getPaymentStatus } from '@/utils/paymentService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // MultiSafepay sends POST requests to the webhook
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Webhook received:', req.body);
    
    // Extract order_id from the request body
    // MultiSafepay might send it as order_id or transactionid
    const order_id = req.body.order_id || req.body.transactionid;
    
    if (!order_id) {
      console.error('Webhook missing order_id:', req.body);
      return res.status(400).json({ message: 'Order ID is required' });
    }
    
    await connectToDatabase();
    
    // Get the latest payment status from MultiSafepay
    const paymentStatus = await getPaymentStatus(order_id);
    console.log('Payment status from MultiSafepay:', paymentStatus);
    
    // Extract the actual status from the nested data structure
    const status = paymentStatus.data?.status || paymentStatus.status;
    const paymentDetails = paymentStatus.data?.payment_details || paymentStatus.payment_details;
    const transactionIdFromResponse = paymentStatus.data?.transaction_id || paymentStatus.transaction_id;
    
    // Find the booking by order ID
    let booking = await Booking.findOne({ 'payment.orderId': order_id });
    
    // If not found by orderId, try clientBookingId as fallback
    if (!booking) {
      booking = await Booking.findOne({ clientBookingId: order_id });
    }
    
    if (!booking) {
      console.error(`Booking not found for order_id: ${order_id}`);
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    console.log(`Found booking ${booking._id} with current payment status: ${booking.payment?.status}`);
    
    // Update payment status based on MultiSafepay status
    if (status === 'completed' || status === 'initialized' || status === 'uncleared') {
      booking.payment.status = 'completed';
      booking.payment.transactionId = transactionIdFromResponse || order_id;
      booking.payment.paymentMethod = paymentDetails?.type || 'unknown';
      booking.payment.paidAt = new Date();
      
      // Also update the booking status
      booking.status = 'confirmed';
      
      console.log(`Updating booking ${booking._id} payment status to completed`);
    } else if (status === 'declined' || status === 'expired' || status === 'cancelled') {
      booking.payment.status = status === 'declined' ? 'failed' : 'expired';
      console.log(`Updating booking ${booking._id} payment status to ${booking.payment.status}`);
    } else if (status === 'refunded') {
      booking.payment.status = 'refunded';
      console.log(`Updating booking ${booking._id} payment status to refunded`);
    }

    // Add logging to debug
    console.log(`Updated booking ${booking._id} payment status to ${booking.payment.status}`);
    
    await booking.save();
    
    // Return OK to MultiSafepay
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ 
      message: 'Error processing webhook',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}