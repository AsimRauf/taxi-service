import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';
import { getPaymentStatus } from '@/utils/paymentService';
import { sendBookingConfirmation } from '@/utils/emailService';

// Define the MultiSafepay webhook payload type
interface MultiSafepayWebhookPayload {
  order_id?: string;
  transaction_id?: string;
  status?: string;
  payment_details?: {
    type: string;
  };
}

// Add request validation with more detailed logging
const validateWebhookRequest = (body: MultiSafepayWebhookPayload): boolean => {
  console.log('🔍 Webhook Validation Start');
  console.log('📦 Request body:', JSON.stringify(body, null, 2));
  
  if (!body) {
    console.log('❌ No request body found');
    return false;
  }
  
  if (!body.order_id && !body.transaction_id) {
    console.log('❌ No order_id or transaction_id found in body');
    return false;
  }
  
  console.log('✅ Webhook validation passed');
  return true;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`\n${'='.repeat(80)}\n💰 Webhook Request ${requestId} Start`);
  console.log('⏰ Received at:', new Date().toISOString());
  console.log('📍 Method:', req.method);
  console.log('🔑 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('❓ Query:', JSON.stringify(req.query, null, 2));
  console.log('📦 Body:', JSON.stringify(req.body, null, 2));

  // Add CORS headers for all environments
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-MultiSafepay-Signature');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS request');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate the webhook request
    if (!validateWebhookRequest(req.body)) {
      console.error('❌ Invalid webhook payload');
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    // Get orderId from either body or query parameters
    const orderId = req.body.order_id || req.query.transactionid || req.body.transaction_id;
    
    if (!orderId) {
      console.error('❌ No order ID found in request');
      return res.status(400).json({ error: 'Missing order ID' });
    }
    
    console.log('✅ Processing payment for order_id:', orderId);
    
    // Get payment status from payment service
    const paymentStatusResponse = await getPaymentStatus(orderId);
    console.log('💳 Payment status from service:', JSON.stringify(paymentStatusResponse.data || {}, null, 2));
    
    await connectToDatabase();
    
    // Find booking by clientBookingId or payment orderId
    const booking = await Booking.findOne({ 
      $or: [
        { clientBookingId: orderId },
        { 'payment.orderId': orderId },
        { 'payment.transactionId': orderId }
      ]
    });
    
    if (!booking) {
      console.error(`❌ No booking found for order_id: ${orderId}`);
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    console.log('✅ Found booking:', booking._id.toString());

    // Update payment info with more robust status handling
    const paymentData = paymentStatusResponse.data || {};
    const oldStatus = booking.payment?.status;
    const newStatus = paymentData.status;
    
    console.log('💰 Payment status update:', { oldStatus, newStatus });

    booking.payment = {
      ...booking.payment,
      status: paymentData.status === 'completed' ? 'completed' : 'pending',
      orderId: orderId,
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
      console.log('✅ Payment completed, booking confirmed');
    }
    
    await booking.save();
    console.log('✅ Booking updated successfully with payment status:', paymentData.status);

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
      console.log('✅ Notification created:', notification._id.toString());
    } catch (notificationError) {
      console.error('❌ Failed to create notification:', notificationError);
    }

    // Send confirmation email
    try {
      await sendBookingConfirmation({
        ...booking.toObject(),
        payment: booking.payment
      });
      console.log('✅ Confirmation email sent');
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError);
    }

    return res.status(200).json({ success: true });
  } catch (error: unknown) {
    console.error('❌ Webhook processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.log(`\n${'='.repeat(80)}\n💰 Webhook Request ${requestId} End (Error)\n`);
    return res.status(500).json({ error: 'Webhook processing failed', details: errorMessage });
  }

}