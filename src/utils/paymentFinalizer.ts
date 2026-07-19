import Notification from '@/models/Notification';
import { sendBookingConfirmation } from '@/utils/emailService';
import { mapMspStatus } from '@/utils/paymentService';

interface MspOrderData {
  status?: string;
  transaction_id?: string;
  payment_details?: {
    type?: string;
  };
}

// Mongoose Booking document — typed loosely since the model is untyped JS-style
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BookingDoc = any;

/**
 * Applies a MultiSafepay order status to a booking and runs the side effects
 * of a completed payment exactly once (confirmation email + admin
 * notification). Shared by the webhook and the check-status endpoint so both
 * paths behave identically. Caller is responsible for booking.save().
 */
export async function applyPaymentStatus(
  booking: BookingDoc,
  mspData: MspOrderData,
  source: 'webhook' | 'check-status'
): Promise<{ paymentStatus: string; transitionedToCompleted: boolean }> {
  const newStatus = mapMspStatus(mspData.status);
  const oldStatus = booking.payment?.status;
  const transitionedToCompleted = newStatus === 'completed' && oldStatus !== 'completed';

  console.log(`💰 [${source}] payment status:`, { oldStatus, mspStatus: mspData.status, newStatus });

  booking.payment = {
    ...(booking.payment?.toObject ? booking.payment.toObject() : booking.payment),
    status: newStatus,
    transactionId: mspData.transaction_id || booking.payment?.transactionId,
    paymentMethod: mspData.payment_details?.type || booking.payment?.paymentMethod,
    ...(source === 'webhook' ? { lastWebhookAt: new Date() } : {}),
    ...(transitionedToCompleted ? { paidAt: new Date() } : {})
  };

  if (newStatus === 'completed') {
    // Paid: promote the temporary booking to a real, confirmed one
    booking.isTemporary = false;
    booking.paymentPending = false;
    booking.status = 'confirmed';
  } else if (newStatus === 'failed' || newStatus === 'expired') {
    // Payment attempt failed — keep the booking temporary so the customer can
    // retry (a retry creates a fresh MSP order) and cleanup jobs can prune it
    booking.paymentPending = true;
  }
  // 'pending' → no state change; 'refunded' → payment recorded, booking
  // status is left to the admin cancellation flow

  if (transitionedToCompleted) {
    try {
      await sendBookingConfirmation({
        ...booking.toObject(),
        payment: booking.payment
      });
      console.log('✅ Confirmation email sent');
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError);
    }

    try {
      await Notification.create({
        type: 'payment_received',
        recipientType: 'admin',
        bookingId: booking._id,
        userId: booking.userId || 'guest',
        message: `Payment received for booking #${booking.clientBookingId}`,
        status: 'info',
        metadata: {
          bookingDetails: {
            clientBookingId: booking.clientBookingId,
            pickupDateTime: booking.pickupDateTime,
            vehicle: booking.vehicle,
            price: booking.price,
            passengers: booking.passengers,
            paymentMethod: booking.payment.paymentMethod
          }
        }
      });
      console.log('✅ Notification created');
    } catch (notificationError) {
      console.error('❌ Failed to create notification:', notificationError);
    }

    // The customer's dashboard bell shows this
    if (booking.userId && booking.userId !== 'guest') {
      try {
        await Notification.create({
          type: 'booking_confirmed',
          recipientType: 'user',
          bookingId: booking._id,
          userId: booking.userId,
          message: `Payment received — your booking #${booking.clientBookingId} is confirmed`,
          status: 'success',
          metadata: {
            clientBookingId: booking.clientBookingId,
            pickupDateTime: booking.pickupDateTime
          }
        });
      } catch (notificationError) {
        console.error('❌ Failed to create user notification:', notificationError);
      }
    }
  }

  return { paymentStatus: newStatus, transitionedToCompleted };
}
