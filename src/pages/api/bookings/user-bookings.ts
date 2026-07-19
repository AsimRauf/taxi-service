import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { authMiddleware } from '@/middleware/auth';
import { TokenPayload } from '@/lib/jwt';

interface AuthenticatedRequest extends NextApiRequest {
  user: TokenPayload;
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    
    // Get the user ID from the authenticated request
    const userId = req.user.userId;
    console.log('Fetching bookings for user:', userId);
    
    // Optional pagination (backwards compatible: no params = first 100)
    const page = Math.max(parseInt(String(req.query.page)) || 1, 1);
    const limit = Math.min(Math.max(parseInt(String(req.query.limit)) || 100, 1), 100);

    // Query the database for all real bookings belonging to this user.
    // Temporary bookings are unpaid payment placeholders — never show them.
    const filter = { userId, isTemporary: { $ne: true } };
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 }) // Sort by creation date, newest first
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      bookings,
      count: bookings.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error fetching bookings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Wrap the handler with the auth middleware to ensure the request is authenticated
export default authMiddleware(handler);
