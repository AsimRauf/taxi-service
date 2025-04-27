import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';
import { getPaymentStatus } from '@/utils/paymentService';
import { sendBookingConfirmation } from '@/utils/emailService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('💰 Webhook received at:', new Date().toISOString());
    const order_id = req.body.order_id || req.query.transactionid;
    const paymentStatus = await getPaymentStatus(order_id);
    
    await connectToDatabase();
    const booking = await Booking.findOne({ clientBookingId: order_id });

    if (paymentStatus.status === 'completed') {
      // Update payment info
      booking.payment = {
        status: 'completed',
        orderId: order_id,
        amount: booking.price,
        paidAt: new Date(),
        paymentMethod: paymentStatus.payment_details?.type || 'unknown',
        transactionId: paymentStatus.transaction_id
      };
      
      booking.isTemporary = false;
      booking.paymentPending = false;
      booking.status = 'pending';
      
      await booking.save();

      // Create notification
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
      console.log('Notification created:', notification);

      // Send confirmation email
      await sendBookingConfirmation({
        ...booking.toObject(),
        payment: booking.payment
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}