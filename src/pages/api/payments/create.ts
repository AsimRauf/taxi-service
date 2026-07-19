import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { createPaymentOrder, getPaymentStatus } from '@/utils/paymentService';
import { generateBookingId } from '@/utils/generateId';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { bookingData } = req.body || {};

    // Basic input validation before touching the database
    if (!bookingData || typeof bookingData !== 'object') {
      return res.status(400).json({ error: 'Missing booking data' });
    }
    if (typeof bookingData.price !== 'number' || bookingData.price <= 0) {
      return res.status(400).json({ error: 'Invalid booking price' });
    }
    if (!bookingData.contactInfo?.fullName || !bookingData.contactInfo?.email) {
      return res.status(400).json({ error: 'Missing customer contact information' });
    }

    await connectToDatabase();

    console.log('Creating payment for booking:', bookingData.clientBookingId);

    const existingBooking = bookingData.clientBookingId
      ? await Booking.findOne({ clientBookingId: bookingData.clientBookingId })
      : null;

    // Never create a second payment for an already-paid booking
    if (existingBooking?.payment?.status === 'completed') {
      return res.status(409).json({ error: 'This booking has already been paid' });
    }

    // Reuse the open payment URL only when MultiSafepay confirms the order is
    // still awaiting payment. A failed/cancelled/expired order can't be paid
    // again under the same order id — a fresh order is created below instead.
    if (existingBooking?.payment?.paymentUrl && existingBooking.payment.orderId) {
      try {
        const mspStatus = await getPaymentStatus(existingBooking.payment.orderId);
        if (mspStatus.data?.status === 'initialized') {
          console.log('Reusing open payment URL for booking:', existingBooking.clientBookingId);
          return res.status(200).json({
            paymentUrl: existingBooking.payment.paymentUrl,
            orderId: existingBooking.payment.orderId
          });
        }
      } catch (statusError) {
        console.error('Could not verify existing order status, creating a new order:', statusError);
      }
    }

    // Remove _id and id fields while keeping other data (keep clientBookingId)
    const bookingDataWithoutId = Object.fromEntries(
      Object.entries(bookingData).filter(([key]) => key !== '_id' && key !== 'id')
    );

    let finalBookingData = bookingDataWithoutId;
    if (!existingBooking && !bookingDataWithoutId.clientBookingId) {
      finalBookingData = {
        ...bookingDataWithoutId,
        clientBookingId: await generateBookingId()
      };
    }

    let tempBooking;
    if (existingBooking) {
      // Update placeholder with the latest booking data
      Object.assign(existingBooking, {
        ...finalBookingData,
        isTemporary: true,
        paymentPending: true
      });
      tempBooking = existingBooking;
    } else {
      tempBooking = new Booking({
        ...finalBookingData,
        isTemporary: true,
        paymentPending: true
      });
    }

    // MSP order ids must be unique per attempt: first attempt uses the
    // clientBookingId, retries get a -R<n> suffix
    const previousAttempts = existingBooking?.payment?.attempts || 0;
    const orderId = previousAttempts === 0
      ? tempBooking.clientBookingId
      : `${tempBooking.clientBookingId}-R${previousAttempts}`;

    const paymentResponse = await createPaymentOrder({
      bookingId: tempBooking._id.toString(),
      clientBookingId: tempBooking.clientBookingId,
      orderId,
      amount: bookingData.price,
      currency: 'EUR',
      description: `Taxi booking ${tempBooking.clientBookingId}`,
      customerName: bookingData.contactInfo.fullName,
      customerEmail: bookingData.contactInfo.email,
      customerPhone: bookingData.contactInfo.phoneNumber,
      locale: typeof req.body.locale === 'string' ? req.body.locale : undefined
    });

    const paymentUrl = paymentResponse.data?.payment_url;
    const mspOrderId = paymentResponse.data?.order_id;

    if (!paymentUrl || !mspOrderId) {
      throw new Error('Invalid payment response from MultiSafepay');
    }

    tempBooking.payment = {
      orderId: mspOrderId,
      status: 'pending',
      amount: bookingData.price,
      currency: 'EUR',
      paymentUrl: paymentUrl,
      attempts: previousAttempts + 1
    };

    await tempBooking.save();
    console.log('Temporary booking saved with payment info:', tempBooking._id.toString());

    return res.status(200).json({
      paymentUrl: paymentUrl,
      orderId: mspOrderId
    });
  } catch (error: unknown) {
    console.error('Payment creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ error: 'Payment creation failed', details: errorMessage });
  }
}
