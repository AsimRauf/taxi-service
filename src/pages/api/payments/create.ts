import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { createPaymentOrder } from '@/utils/paymentService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers for ngrok
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    const { bookingData } = req.body;

    console.log('Creating payment for booking:', bookingData.clientBookingId);

    // Check for existing temporary booking
    const existingBooking = await Booking.findOne({ 
      clientBookingId: bookingData.clientBookingId,
      isTemporary: true,
      paymentPending: true
    });

    if (existingBooking && existingBooking.payment?.paymentUrl) {
      console.log('Found existing payment URL for booking:', existingBooking.clientBookingId);
      // Return existing payment URL if booking exists
      return res.status(200).json({
        paymentUrl: existingBooking.payment.paymentUrl,
        orderId: existingBooking.payment.orderId
      });
    }

    // Remove id fields while keeping other data
    const bookingDataWithoutId = Object.fromEntries(
      Object.entries(bookingData).filter(([key]) => !['_id', 'id'].includes(key))
    );
    
    const tempBooking = existingBooking || new Booking({
      ...bookingDataWithoutId,
      isTemporary: true,
      paymentPending: true
    });

    // Use the base URL from environment variable for consistent webhook URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `http://${req.headers.host}`;
    const webhookUrl = `${baseUrl}/api/payments/webhook`;
    const redirectUrl = `${baseUrl}/booking`;    console.log('Using webhook URL:', webhookUrl);
    console.log('Using redirect URL base:', redirectUrl);

    const paymentResponse = await createPaymentOrder({
      bookingId: tempBooking._id.toString(),
      clientBookingId: bookingData.clientBookingId,
      amount: bookingData.price,
      currency: 'EUR',
      description: `Taxi booking #${bookingData.clientBookingId}`,
      customerName: bookingData.contactInfo.fullName,
      customerEmail: bookingData.contactInfo.email,
      customerPhone: bookingData.contactInfo.phoneNumber,
      webhookUrl: webhookUrl,
      redirectUrl: redirectUrl
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
    console.log('Temporary booking saved with payment info:', tempBooking._id.toString());
    
    // Return the payment URL and order ID
    return res.status(200).json({ 
      paymentUrl: paymentUrl,
      orderId: orderId
    });
  } catch (error: unknown) {
    console.error('Payment creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ error: 'Payment creation failed', details: errorMessage });
  }
}