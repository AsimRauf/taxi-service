import { NextApiResponse, NextApiRequest } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';
import { adminMiddleware } from '@/middleware/auth';
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

    // pickupDateTime is a "yyyy-MM-dd HH:mm" local-time string
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    const nowString = local.toISOString().slice(0, 16).replace('T', ' ');
    const todayPrefix = nowString.slice(0, 10);

    const real = { isTemporary: { $ne: true } };

    const [
      totalBookings,
      upcomingRides,
      todayRides,
      pendingCancellations,
      unreadNotifications,
      paidAgg
    ] = await Promise.all([
      Booking.countDocuments(real),
      Booking.countDocuments({
        ...real,
        status: { $in: ['confirmed', 'in-progress'] },
        pickupDateTime: { $gt: nowString }
      }),
      Booking.countDocuments({
        ...real,
        status: { $nin: ['cancelled', 'no-show'] },
        pickupDateTime: { $regex: `^${todayPrefix}` }
      }),
      Booking.countDocuments({ 'cancellation.status': 'requested' }),
      Notification.countDocuments({ recipientType: 'admin', read: false }),
      Booking.aggregate([
        { $match: { 'payment.status': 'completed' } },
        { $group: { _id: null, revenue: { $sum: '$price' }, count: { $sum: 1 } } }
      ])
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        upcomingRides,
        todayRides,
        pendingCancellations,
        unreadNotifications,
        paidBookings: paidAgg[0]?.count || 0,
        totalRevenue: paidAgg[0]?.revenue || 0
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default adminMiddleware(handler);
