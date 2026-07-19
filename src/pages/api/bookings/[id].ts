import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { authMiddleware } from '@/middleware/auth';
import { TokenPayload } from '@/lib/jwt';

interface AuthenticatedRequest extends NextApiRequest {
  user: TokenPayload;
}

// Full booking details contain customer contact data, so this endpoint
// requires authentication and only serves the owner (or an admin).
// Payment result pages use /api/payments/check-status instead, which
// returns only non-sensitive fields.
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    // Try to find by MongoDB _id first (guard against CastError on
    // non-ObjectId values like clientBookingIds)
    let booking = mongoose.Types.ObjectId.isValid(id)
      ? await Booking.findById(id)
      : null;

    // If not found, try by clientBookingId
    if (!booking) {
      booking = await Booking.findOne({ clientBookingId: id });
    }

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isOwner = booking.userId && booking.userId === req.user.userId;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return res.status(500).json({
      message: 'Error fetching booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default authMiddleware(handler);
