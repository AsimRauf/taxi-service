import { NextApiResponse, NextApiRequest } from 'next';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';
import { adminMiddleware } from '@/middleware/auth';
import { TokenPayload } from '@/lib/jwt';
import { sendBookingUpdatedEmail } from '@/utils/emailService';

interface AuthenticatedRequest extends NextApiRequest {
  user: TokenPayload;
}

// Fields an admin may change. Anything else in the payload is ignored, so a
// compromised client can never flip payment state or ownership.
const EDITABLE_FIELDS = [
  'pickup', 'destination', 'stopovers', 'returnDestination',
  'sourceAddress', 'destinationAddress',
  'pickupDateTime', 'returnDateTime', 'isReturn',
  'passengers', 'vehicle', 'hasLuggage',
  'price', 'returnPrice', 'isFixedPrice',
  'directDistance', 'extraDistance', 'returnDistance',
  'flightNumber', 'incomingFlightNumber', 'remarks',
  'status'
] as const;

const VALID_STATUSES = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'];

// Human-readable labels for the change summary sent to the customer
const CHANGE_LABELS: Record<string, string> = {
  sourceAddress: 'Pickup address',
  destinationAddress: 'Destination address',
  pickupDateTime: 'Pickup date & time',
  returnDateTime: 'Return date & time',
  isReturn: 'Return trip',
  passengers: 'Passengers',
  vehicle: 'Vehicle',
  price: 'Price',
  flightNumber: 'Flight number',
  incomingFlightNumber: 'Incoming flight number',
  remarks: 'Remarks',
  status: 'Booking status'
};

const formatValue = (field: string, value: unknown): string => {
  if (value === null || value === undefined || value === '') return '—';
  if (field === 'price') return `€${Number(value).toFixed(2)}`;
  if (field === 'isReturn') return value ? 'yes' : 'no';
  return String(value);
};

async function findBooking(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const byId = await Booking.findById(id);
    if (byId) return byId;
  }
  return Booking.findOne({ clientBookingId: id });
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const id = req.query.id as string;

  try {
    await connectToDatabase();
    const booking = await findBooking(id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (req.method === 'GET') {
      return res.status(200).json({ success: true, booking });
    }

    if (req.method !== 'PATCH') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const updates = req.body || {};

    if (updates.status && !VALID_STATUSES.includes(updates.status)) {
      return res.status(400).json({ message: `Invalid status: ${updates.status}` });
    }
    if (updates.price !== undefined && (typeof updates.price !== 'number' || updates.price < 0)) {
      return res.status(400).json({ message: 'Invalid price' });
    }
    if (updates.vehicle !== undefined && !['stationWagon', 'bus'].includes(updates.vehicle)) {
      return res.status(400).json({ message: 'Invalid vehicle type' });
    }

    // Collect human-readable changes for the customer email/notification
    const changes: string[] = [];
    for (const field of EDITABLE_FIELDS) {
      if (!(field in updates)) continue;
      const before = booking.get(field);
      const after = updates[field];
      const label = CHANGE_LABELS[field];
      if (label && JSON.stringify(before) !== JSON.stringify(after)) {
        changes.push(`${label}: ${formatValue(field, before)} → ${formatValue(field, after)}`);
      }
      booking.set(field, after);
    }

    await booking.save();
    console.log(`Admin ${req.user.email} updated booking ${booking.clientBookingId}:`, changes);

    // Notify the customer (in-app + email). Failures here must not fail the
    // update itself — the booking is already saved.
    if (changes.length > 0) {
      if (booking.userId && booking.userId !== 'guest') {
        try {
          await Notification.create({
            type: 'booking_update',
            recipientType: 'user',
            userId: booking.userId,
            bookingId: booking._id,
            message: `Your booking #${booking.clientBookingId} was updated: ${changes.join('; ')}`,
            status: 'info',
            metadata: { changes }
          });
        } catch (notifyError) {
          console.error('Failed to create user notification:', notifyError);
        }
      }

      let emailSent = false;
      try {
        await sendBookingUpdatedEmail(booking.toObject(), changes);
        emailSent = true;
      } catch (emailError) {
        console.error('Failed to send booking update email:', emailError);
      }

      return res.status(200).json({ success: true, booking, changes, emailSent });
    }

    return res.status(200).json({ success: true, booking, changes: [], emailSent: false });
  } catch (error) {
    console.error('Admin booking update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default adminMiddleware(handler);
