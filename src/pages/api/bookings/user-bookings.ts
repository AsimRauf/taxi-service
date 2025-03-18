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
    
    // Query the database for all bookings belonging to this user
    const bookings = await Booking.find({ userId })
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .lean(); // Convert to plain JavaScript objects for better performance
    
    return res.status(200).json({ 
      success: true, 
      bookings,
      count: bookings.length
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
