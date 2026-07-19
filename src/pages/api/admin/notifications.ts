import { NextApiResponse, NextApiRequest } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { adminMiddleware } from '@/middleware/auth';
import { TokenPayload } from '@/lib/jwt';

interface AuthenticatedRequest extends NextApiRequest {
  user: TokenPayload;
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const page = Math.max(parseInt(String(req.query.page)) || 1, 1);
      const limit = Math.min(Math.max(parseInt(String(req.query.limit)) || 20, 1), 100);
      const unreadOnly = req.query.unread === 'true';

      const filter: Record<string, unknown> = { recipientType: 'admin' };
      if (unreadOnly) filter.read = false;

      const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Notification.countDocuments(filter),
        Notification.countDocuments({ recipientType: 'admin', read: false })
      ]);

      return res.status(200).json({
        success: true,
        notifications,
        total,
        unreadCount,
        page,
        pages: Math.ceil(total / limit) || 1
      });
    }

    if (req.method === 'PATCH') {
      // Mark notifications read: { ids: [...] } or { all: true }
      const { ids, all } = req.body || {};

      if (all === true) {
        await Notification.updateMany(
          { recipientType: 'admin', read: false },
          { $set: { read: true } }
        );
      } else if (Array.isArray(ids) && ids.length > 0) {
        await Notification.updateMany(
          { _id: { $in: ids }, recipientType: 'admin' },
          { $set: { read: true } }
        );
      } else {
        return res.status(400).json({ message: 'Provide ids array or all: true' });
      }

      const unreadCount = await Notification.countDocuments({ recipientType: 'admin', read: false });
      return res.status(200).json({ success: true, unreadCount });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Admin notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error handling notifications',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default adminMiddleware(handler);
