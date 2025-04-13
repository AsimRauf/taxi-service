import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { authMiddleware } from '@/middleware/auth';
import { TokenPayload } from '@/lib/jwt';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification'; // Add this import
import mongoose from 'mongoose';
import { sendCancellationEmail } from '@/utils/emailService';  // Add this import


interface AuthenticatedRequest extends NextApiRequest {
  user: TokenPayload;
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const bookingId = req.query.id as string;
  const userId = req.user.userId;
  const { reason } = req.body;

  // Validate booking ID format
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    console.error('Invalid booking ID format:', bookingId);
    return res.status(400).json({ message: 'Invalid booking ID format' });
  }

  console.log('---- Cancellation Request Details ----');
  console.log('Raw booking ID from query:', req.query.id);
  console.log('Parsed booking ID:', bookingId);
  console.log('User ID from token:', userId);
  console.log('Request body:', req.body);
  console.log('------------------------------------');

  if (!reason || !reason.trim()) {
    console.log('Cancellation rejected: No reason provided');
    return res.status(400).json({ message: 'Cancellation reason is required' });
  }

  try {
    await connectToDatabase();
    console.log('Database connected');
    
    // Find booking with both ID and userId for security
    const booking = await Booking.findOne({
      _id: new mongoose.Types.ObjectId(bookingId),
      userId: userId
    });

    if (!booking) {
      console.error('Booking not found or unauthorized:', {
        bookingId,
        userId,
        exists: await Booking.exists({ _id: bookingId }),
        userMatch: await Booking.exists({ userId })
      });
      return res.status(404).json({ message: 'Booking not found or unauthorized' });
    }

    console.log('Found booking:', {
      id: booking._id,
      clientBookingId: booking.clientBookingId,
      status: booking.status,
      userId: booking.userId,
      pickupDateTime: booking.pickupDateTime
    });
    
    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }
    
    // Check if cancellation was already requested
    if (booking.cancellation) {
      return res.status(400).json({ message: 'Cancellation already requested for this booking' });
    }
    
    // Check if booking is within the cancellation time window (3 hours)
    const now = new Date();
    const pickupTime = new Date(booking.pickupDateTime);
    const threeHoursInMs = 3 * 60 * 60 * 1000;
    
    if (pickupTime.getTime() - now.getTime() <= threeHoursInMs) {
      return res.status(400).json({ message: 'Cannot cancel booking less than 3 hours before pickup time' });
    }
    
    // Update booking with cancellation request
    booking.cancellation = {
      requestedAt: new Date(),
      reason: reason,
      status: 'requested'
    };
    
    await booking.save();
    console.log('Cancellation request saved for booking:', booking.clientBookingId);
    
    // Create admin notification using the Notification model
    const adminNotification = new Notification({
      type: 'booking_cancellation_request',  // Fixed: Changed to match enum value
      recipientType: 'admin',
      userId: userId,  // Added missing required field
      bookingId: booking._id,
      message: `Cancellation requested for booking #${booking.clientBookingId}`,
      status: 'info',
      read: false,
      metadata: {
        bookingDetails: {
          clientBookingId: booking.clientBookingId,
          pickupDateTime: booking.pickupDateTime,
          vehicle: booking.vehicle,
          price: booking.price,
          passengers: booking.passengers,
          cancellationReason: reason
        }
      }
    });

    // Save the notification
    await adminNotification.save();
    console.log('Admin notification created for cancellation request');

    // Send cancellation email
    try {
      await sendCancellationEmail(booking, reason);
      console.log('Cancellation notification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
      // Don't fail the request if email fails
    }

    console.log('Cancellation request processed successfully');
    return res.status(200).json({ 
      success: true, 
      message: 'Cancellation request submitted successfully' 
    });
  } catch (error) {
    console.error('Error processing cancellation request:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error processing cancellation request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default authMiddleware(handler);