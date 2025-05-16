import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';
import { getPaymentStatus } from '@/utils/paymentService';
import { sendBookingConfirmation } from '@/utils/emailService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers for all environments
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('💰 Webhook headers:', JSON.stringify(req.headers));
    console.log('💰 Webhook raw body:', req.body);
   
    
    // Get order_id from either body or query parameters
    const order_id = req.body.order_id || req.query.transactionid || req.body.transaction_id;
    
    if (!order_id) {
      console.error('No order_id or transactionid found in webhook request');
      return res.status(400).json({ error: 'Missing order_id or transactionid' });
    }
    
    console.log('Processing payment for order_id:', order_id);
    
    // Get payment status from payment service
    const paymentStatus = await getPaymentStatus(order_id);
    console.log('Payment status from service:', JSON.stringify(paymentStatus.data || {}));
    
    await connectToDatabase();
    
    // Find booking by clientBookingId or payment orderId
    const booking = await Booking.findOne({ 
      $or: [
        { clientBookingId: order_id },
        { 'payment.orderId': order_id },
        { 'payment.transactionId': order_id }
      ]
    });
    
    if (!booking) {
      console.error(`No booking found for order_id: ${order_id}`);
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    console.log('Found booking:', booking._id.toString());

    // Update payment info with more robust status handling
    const paymentData = paymentStatus.data || {};
    booking.payment = {
      status: paymentData.status === 'completed' ? 'completed' : 'pending',
      orderId: order_id,
      amount: booking.price,
      paidAt: new Date(),
      paymentMethod: paymentData.payment_details?.type || 'unknown',
      transactionId: paymentData.transaction_id
    };
    
    booking.isTemporary = false;
    booking.paymentPending = paymentData.status !== 'completed';
    
    // Set status based on payment status
    if (paymentData.status === 'completed') {
      booking.status = 'confirmed';
    }
    
    await booking.save();
    console.log('Booking updated successfully with payment status:', paymentData.status);

    // Create notification
    try {
      const notification = await Notification.create({
        type: 'payment_received',
        recipientType: 'admin',
        bookingId: booking._id,
        userId: booking.userId || 'guest',
        message: `Payment received for booking #${booking.clientBookingId}`,
        status: 'info',
        metadata: {
          bookingDetails: {
            clientBookingId: booking.clientBookingId,
            pickupDateTime: booking.pickupDateTime,
            vehicle: booking.vehicle,
            price: booking.price,
            passengers: booking.passengers,
            paymentMethod: booking.payment.paymentMethod
          }
        }
      });
      console.log('Notification created:', notification._id.toString());
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Continue processing even if notification creation fails
    }

    // Send confirmation email
    try {
      await sendBookingConfirmation({
        ...booking.toObject(),
        payment: booking.payment
      });
      console.log('Confirmation email sent');
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Continue processing even if email sending fails
    }

    return res.status(200).json({ success: true });
  } catch (error: unknown) {
    console.error('Webhook processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ error: 'Webhook processing failed', details: errorMessage });
  }
}