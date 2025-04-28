import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';
import { getPaymentStatus } from '@/utils/paymentService';
import { sendBookingConfirmation } from '@/utils/emailService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers for ngrok
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
    console.log('💰 Webhook received at:', new Date().toISOString());
    console.log('Webhook request body:', req.body);
    console.log('Webhook request query:', req.query);
    
    // Get order_id from either body or query parameters
    const order_id = req.body.order_id || req.query.transactionid;
    
    if (!order_id) {
      console.error('No order_id or transactionid found in webhook request');
      return res.status(400).json({ error: 'Missing order_id or transactionid' });
    }
    
    console.log('Processing payment for order_id:', order_id);
    
    // Get payment status from payment service
    const paymentStatus = await getPaymentStatus(order_id);
    console.log('Payment status from service:', paymentStatus);
    
    await connectToDatabase();
    
    // Find booking by clientBookingId
    const booking = await Booking.findOne({ 
      $or: [
        { clientBookingId: order_id },
        { 'payment.orderId': order_id }
      ]
    });
    
    if (!booking) {
      console.error(`No booking found for order_id: ${order_id}`);
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    console.log('Found booking:', booking._id.toString());

    // Always update the booking status to ensure it's processed
    console.log('Updating booking status regardless of payment status');
    
    // Update payment info
    booking.payment = {
      status: paymentStatus.data?.status || 'pending',
      orderId: order_id,
      amount: booking.price,
      paidAt: new Date(),
      paymentMethod: paymentStatus.data?.payment_details?.type || 'unknown',
      transactionId: paymentStatus.data?.transaction_id
    };
    
    booking.isTemporary = false;
    booking.paymentPending = false;
    
    // Set status based on payment status
    if (paymentStatus.status === 'completed') {
      booking.status = 'pending';
    }
    
    await booking.save();
    console.log('Booking updated successfully');

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