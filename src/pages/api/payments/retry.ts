import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { createPaymentOrder, getPaymentStatus } from '@/utils/paymentService';

// Creates a fresh MultiSafepay order for a booking whose previous payment
// attempt failed, was cancelled, or expired. MSP order ids are single-use,
// so each retry gets a new order id: <clientBookingId>-R<attempt>.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { bookingId, locale } = req.body || {};

    if (!bookingId || typeof bookingId !== 'string') {
      return res.status(400).json({ error: 'Missing bookingId' });
    }

    await connectToDatabase();

    let booking = null;
    if (mongoose.Types.ObjectId.isValid(bookingId)) {
      booking = await Booking.findById(bookingId);
    }
    if (!booking) {
      booking = await Booking.findOne({ clientBookingId: bookingId });
    }

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.payment?.status === 'completed') {
      return res.status(409).json({ error: 'This booking has already been paid' });
    }

    if (!booking.contactInfo?.fullName || !booking.contactInfo?.email) {
      return res.status(400).json({ error: 'Booking is missing customer contact information' });
    }

    // If the previous order is somehow still open, reuse its payment URL
    if (booking.payment?.paymentUrl && booking.payment.orderId) {
      try {
        const mspStatus = await getPaymentStatus(booking.payment.orderId);
        if (mspStatus.data?.status === 'initialized') {
          return res.status(200).json({
            paymentUrl: booking.payment.paymentUrl,
            orderId: booking.payment.orderId
          });
        }
      } catch (statusError) {
        console.error('Could not verify previous order status, creating a new order:', statusError);
      }
    }

    const previousAttempts = booking.payment?.attempts || 1;
    const orderId = `${booking.clientBookingId}-R${previousAttempts}`;

    const paymentResponse = await createPaymentOrder({
      bookingId: booking._id.toString(),
      clientBookingId: booking.clientBookingId,
      orderId,
      amount: booking.price,
      currency: 'EUR',
      description: `Taxi booking ${booking.clientBookingId}`,
      customerName: booking.contactInfo.fullName,
      customerEmail: booking.contactInfo.email,
      customerPhone: booking.contactInfo.phoneNumber,
      locale: typeof locale === 'string' ? locale : undefined
    });

    const paymentUrl = paymentResponse.data?.payment_url;
    const mspOrderId = paymentResponse.data?.order_id;

    if (!paymentUrl || !mspOrderId) {
      throw new Error('Invalid payment response from MultiSafepay');
    }

    booking.payment = {
      ...(booking.payment?.toObject ? booking.payment.toObject() : booking.payment),
      orderId: mspOrderId,
      status: 'pending',
      amount: booking.price,
      currency: 'EUR',
      paymentUrl: paymentUrl,
      attempts: previousAttempts + 1
    };
    booking.paymentPending = true;

    await booking.save();
    console.log('Retry payment order created:', mspOrderId, 'for booking', booking._id.toString());

    return res.status(200).json({
      paymentUrl: paymentUrl,
      orderId: mspOrderId
    });
  } catch (error: unknown) {
    console.error('Payment retry error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ error: 'Payment retry failed', details: errorMessage });
  }
}
