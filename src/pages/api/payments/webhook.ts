import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { getPaymentStatus } from '@/utils/paymentService';
import { sendBookingConfirmation } from '@/utils/emailService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('💰 Webhook received at:', new Date().toISOString());
    console.log('Webhook body:', req.body);
    console.log('Webhook query:', req.query);
    
    const order_id = req.body.order_id || req.query.transactionid;
    
    if (!order_id) {
      console.error('No order_id found in request');
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const paymentStatus = await getPaymentStatus(order_id);
    console.log('Payment status from MultiSafepay:', paymentStatus);
    
    await connectToDatabase();
    const booking = await Booking.findOne({ 
      $or: [
        { clientBookingId: order_id },
        { 'payment.orderId': order_id }
      ]
    });

    if (!booking) {
      console.error(`Booking not found for order_id: ${order_id}`);
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log('Found booking:', booking._id);

    if (paymentStatus.status === 'completed' || paymentStatus.data?.status === 'completed') {
      booking.payment = {
        status: 'completed',
        orderId: order_id,
        amount: booking.price,
        paidAt: new Date(),
        paymentMethod: paymentStatus.data?.payment_details?.type || 'unknown',
        transactionId: paymentStatus.data?.transaction_id || order_id
      };
      
      booking.isTemporary = false;
      booking.paymentPending = false;
      booking.status = 'pending';
      
      await booking.save();
      console.log('Updated booking payment status:', booking.payment);

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