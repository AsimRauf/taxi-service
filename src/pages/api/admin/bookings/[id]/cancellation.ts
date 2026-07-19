import { NextApiResponse, NextApiRequest } from 'next';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';
import { adminMiddleware } from '@/middleware/auth';
import { TokenPayload } from '@/lib/jwt';
import { sendCancellationDecisionEmail } from '@/utils/emailService';

interface AuthenticatedRequest extends NextApiRequest {
  user: TokenPayload;
}

// Approve or reject a customer's cancellation request.
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const id = req.query.id as string;
  const { action, response: adminResponse } = req.body || {};

  if (action !== 'approve' && action !== 'reject') {
    return res.status(400).json({ message: "action must be 'approve' or 'reject'" });
  }

  try {
    await connectToDatabase();

    const booking = mongoose.Types.ObjectId.isValid(id)
      ? await Booking.findById(id)
      : await Booking.findOne({ clientBookingId: id });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (!booking.cancellation || booking.cancellation.status !== 'requested') {
      return res.status(400).json({ message: 'No pending cancellation request on this booking' });
    }

    const approved = action === 'approve';

    booking.cancellation.status = approved ? 'approved' : 'rejected';
    if (adminResponse) {
      booking.cancellation.adminResponse = String(adminResponse);
    }
    if (approved) {
      booking.status = 'cancelled';
    }

    await booking.save();
    console.log(`Admin ${req.user.email} ${action}d cancellation for booking ${booking.clientBookingId}`);

    // In-app notification for the customer
    if (booking.userId && booking.userId !== 'guest') {
      try {
        await Notification.create({
          type: approved ? 'cancellation_request_approved' : 'cancellation_request_rejected',
          recipientType: 'user',
          userId: booking.userId,
          bookingId: booking._id,
          message: approved
            ? `Your cancellation request for booking #${booking.clientBookingId} was approved`
            : `Your cancellation request for booking #${booking.clientBookingId} was rejected — the ride goes ahead as planned`,
          status: approved ? 'success' : 'warning',
          metadata: { adminResponse: adminResponse || '' }
        });
      } catch (notifyError) {
        console.error('Failed to create user notification:', notifyError);
      }
    }

    // Email the customer the decision
    let emailSent = false;
    try {
      await sendCancellationDecisionEmail(
        booking.toObject(),
        approved ? 'approved' : 'rejected',
        adminResponse
      );
      emailSent = true;
    } catch (emailError) {
      console.error('Failed to send cancellation decision email:', emailError);
    }

    return res.status(200).json({ success: true, booking, emailSent });
  } catch (error) {
    console.error('Cancellation decision error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing cancellation decision',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default adminMiddleware(handler);
