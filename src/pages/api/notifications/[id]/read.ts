import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { authMiddleware } from '@/middleware/auth';
import Notification from '@/models/Notification';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    
    const notificationId = req.query.id as string;
    
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.status(200).json({ notification });
  } catch (error) {
    console.error('Error updating notification:', error);
    return res.status(500).json({ 
      message: 'Error updating notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default authMiddleware(handler);