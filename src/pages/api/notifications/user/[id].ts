import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { authMiddleware } from '@/middleware/auth';
import Notification from '@/models/Notification';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    
    const userId = req.query.id as string;
    
    const notifications = await Notification.find({
      recipientType: 'user',
      recipientId: userId
    })
    .sort({ createdAt: -1 })
    .limit(20); // Limit to last 20 notifications

    return res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ 
      message: 'Error fetching notifications',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default authMiddleware(handler);