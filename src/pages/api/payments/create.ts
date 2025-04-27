import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { createPaymentOrder } from '@/utils/paymentService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    const { bookingData } = req.body;

    // Check for existing temporary booking
    const existingBooking = await Booking.findOne({ 
      clientBookingId: bookingData.clientBookingId,
      isTemporary: true,
      paymentPending: true
    });

    if (existingBooking && existingBooking.payment?.paymentUrl) {
      // Return existing payment URL if booking exists
      return res.status(200).json({
        paymentUrl: existingBooking.payment.paymentUrl,
        orderId: existingBooking.payment.orderId
      });
    }

    // If no existing booking or no payment URL, create new booking and payment
    const { ...bookingDataWithoutId } = bookingData;
    
    const tempBooking = existingBooking || new Booking({
      ...bookingDataWithoutId,
      isTemporary: true,
      paymentPending: true
    });

    const paymentResponse = await createPaymentOrder({
      bookingId: tempBooking._id.toString(),
      clientBookingId: bookingData.clientBookingId,
      amount: bookingData.price,
      currency: 'EUR',
      description: `Taxi booking #${bookingData.clientBookingId}`,
      customerName: bookingData.contactInfo.fullName,
      customerEmail: bookingData.contactInfo.email,
      customerPhone: bookingData.contactInfo.phoneNumber
    });

    console.log("Payment response from MultiSafepay:", paymentResponse);
    console.log("Payment order created with ID:", paymentResponse.data?.order_id || paymentResponse.order_id);
    
    // Extract payment details from the nested response structure
    const paymentUrl = paymentResponse.data?.payment_url || paymentResponse.payment_url;
    const orderId = paymentResponse.data?.order_id || paymentResponse.order_id;
    
    if (!paymentUrl || !orderId) {
      throw new Error('Invalid payment response from MultiSafepay');
    }
    
    // Update booking with payment information
    tempBooking.payment = {
      orderId: orderId,
      status: 'pending',
      amount: bookingData.price,
      currency: 'EUR',
      paymentUrl: paymentUrl,
    };
    
    await tempBooking.save();
    
    // Return the payment URL and order ID
    return res.status(200).json({ 
      paymentUrl: paymentUrl,
      orderId: orderId
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return res.status(500).json({ error: 'Payment creation failed' });
  }
}