import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { authMiddleware } from '@/middleware/auth';
import { TokenPayload } from '@/lib/jwt';

interface AuthenticatedRequest extends NextApiRequest {
  user: TokenPayload;
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    const userId = req.user.userId;
    const now = new Date();

    // Get confirmed bookings with pickup time in the future
    const bookings = await Booking.find({
      userId,
      status: 'confirmed',
      pickupDateTime: { $gt: now.toISOString() }
    })
    .sort({ pickupDateTime: 1 }) // Sort by pickup time ascending
    .lean();

    return res.status(200).json({
      success: true,
      bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error('Error fetching upcoming bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching upcoming bookings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default authMiddleware(handler);