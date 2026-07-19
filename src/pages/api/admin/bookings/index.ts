import { NextApiResponse, NextApiRequest } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { adminMiddleware } from '@/middleware/auth';
import { TokenPayload } from '@/lib/jwt';

interface AuthenticatedRequest extends NextApiRequest {
  user: TokenPayload;
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const page = Math.max(parseInt(String(req.query.page)) || 1, 1);
    const limit = Math.min(Math.max(parseInt(String(req.query.limit)) || 20, 1), 100);
    const { status, search, paymentStatus, includeTemporary } = req.query;

    const filter: Record<string, unknown> = {};

    // Unpaid placeholder bookings are hidden unless explicitly requested
    if (includeTemporary !== 'true') {
      filter.isTemporary = { $ne: true };
    }
    if (typeof status === 'string' && status !== 'all') {
      filter.status = status;
    }
    if (typeof paymentStatus === 'string' && paymentStatus !== 'all') {
      filter['payment.status'] = paymentStatus;
    }
    if (typeof search === 'string' && search.trim()) {
      const regex = new RegExp(escapeRegex(search.trim()), 'i');
      filter.$or = [
        { clientBookingId: regex },
        { 'contactInfo.fullName': regex },
        { 'contactInfo.email': regex },
        { 'contactInfo.phoneNumber': regex },
        { sourceAddress: regex },
        { destinationAddress: regex }
      ];
    }
    if (req.query.cancellationRequested === 'true') {
      filter['cancellation.status'] = 'requested';
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Booking.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      bookings,
      total,
      page,
      pages: Math.ceil(total / limit) || 1
    });
  } catch (error) {
    console.error('Admin bookings list error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default adminMiddleware(handler);
