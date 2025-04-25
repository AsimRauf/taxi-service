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
    
    const { bookingId } = req.body;
    
    if (!bookingId) {
      return res.status(400).json({ message: 'Booking ID is required' });
    }
    
    // Find the booking
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if payment already exists
    if (booking.payment && booking.payment.status === 'completed') {
      return res.status(400).json({ message: 'Payment already completed' });
    }
    
    // Create payment order
    console.log("Creating payment for booking:", bookingId);
    console.log("Using client booking ID:", booking.clientBookingId);

    const paymentResponse = await createPaymentOrder({
      bookingId: booking._id.toString(),
      clientBookingId: booking.clientBookingId, // Use the client booking ID
      amount: booking.price,
      currency: 'EUR',
      description: `Taxi booking #${booking.clientBookingId}`,
      customerName: booking.contactInfo.fullName,
      customerEmail: booking.contactInfo.email,
      customerPhone: booking.contactInfo.phoneNumber
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
    booking.payment = {
      orderId: orderId,
      status: 'pending',
      amount: booking.price,
      currency: 'EUR',
      paymentUrl: paymentUrl,
    };
    
    await booking.save();
    
    // Return the payment URL and order ID
    return res.status(200).json({ 
      paymentUrl: paymentUrl,
      orderId: orderId
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return res.status(500).json({ 
      message: 'Error creating payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}