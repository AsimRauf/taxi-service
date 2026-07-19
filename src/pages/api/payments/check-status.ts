import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { getPaymentStatus } from '@/utils/paymentService';
import { applyPaymentStatus } from '@/utils/paymentFinalizer';

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

    let booking = null;
    if (typeof bookingId === 'string') {
      if (mongoose.Types.ObjectId.isValid(bookingId)) {
        booking = await Booking.findById(bookingId);
      }
      if (!booking) {
        booking = await Booking.findOne({ clientBookingId: bookingId });
      }
    } else if (typeof orderId === 'string') {
      booking = await Booking.findOne({ 'payment.orderId': orderId });
    }

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Re-check with MultiSafepay unless the payment is already final —
    // this makes the success page work even when the webhook is delayed
    if (booking.payment?.orderId && booking.payment.status !== 'completed') {
      const paymentStatus = await getPaymentStatus(booking.payment.orderId);
      await applyPaymentStatus(booking, paymentStatus.data || {}, 'check-status');
      await booking.save();
    }

    return res.status(200).json({
      bookingId: booking._id,
      clientBookingId: booking.clientBookingId,
      paymentStatus: booking.payment?.status || 'unknown',
      bookingStatus: booking.status,
      price: booking.price
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Failed to check payment status', details: errorMessage });
  }
}
