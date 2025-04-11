import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { authMiddleware } from '@/middleware/auth';
import Notification from '@/models/Notification';
import { TokenPayload } from '@/lib/jwt';

interface AuthenticatedRequest extends NextApiRequest {
  user: TokenPayload;
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    
    const notificationId = req.query.id as string;
    const userId = req.user.userId; // Using userId from TokenPayload
    
    // Use findOneAndUpdate instead of findOne and save
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: notificationId,
        userId: userId,
        recipientType: 'user'
      },
      { $set: { read: true } },
      { new: true, runValidators: true }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notification not found' 
      });
    }

    return res.status(200).json({ 
      success: true,
      notification 
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error updating notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default authMiddleware(handler);