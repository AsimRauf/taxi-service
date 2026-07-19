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

    // pickupDateTime is stored as a "yyyy-MM-dd HH:mm" local-time string, so
    // the comparison value must use the same format (an ISO string with its
    // 'T' separator sorts after every same-day booking and hides them)
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    const nowString = local.toISOString().slice(0, 16).replace('T', ' ');

    // Paid rides that haven't happened yet
    const bookings = await Booking.find({
      userId,
      status: { $in: ['confirmed', 'in-progress'] },
      isTemporary: { $ne: true },
      pickupDateTime: { $gt: nowString }
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