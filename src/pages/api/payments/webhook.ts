import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { getPaymentStatus } from '@/utils/paymentService';
import { applyPaymentStatus } from '@/utils/paymentFinalizer';

// MultiSafepay notifies us with the order id (POST body, or legacy GET with a
// ?transactionid query). We never trust the notification payload itself —
// the authoritative status is always re-fetched from the MultiSafepay API.
const extractOrderId = (req: NextApiRequest): string | null => {
  const fromBody = req.body?.order_id || req.body?.transaction_id;
  const fromQuery = req.query.transactionid || req.query.order_id;
  const orderId = fromBody || fromQuery;
  return typeof orderId === 'string' && orderId.length > 0 ? orderId : null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`\n💰 Webhook ${requestId}:`, req.method, JSON.stringify(req.body || {}), JSON.stringify(req.query || {}));

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const orderId = extractOrderId(req);

    if (!orderId) {
      console.error('❌ No order ID found in webhook request');
      return res.status(400).json({ error: 'Missing order ID' });
    }

    console.log('✅ Processing webhook for order_id:', orderId);

    // Authoritative status straight from MultiSafepay
    const paymentStatusResponse = await getPaymentStatus(orderId);
    const paymentData = paymentStatusResponse.data || {};

    await connectToDatabase();

    // Find booking by payment orderId (covers retry orders like XYZ-R2),
    // clientBookingId (first attempt) or transaction id
    const booking = await Booking.findOne({
      $or: [
        { 'payment.orderId': orderId },
        { clientBookingId: orderId },
        { 'payment.transactionId': orderId }
      ]
    });

    if (!booking) {
      console.error(`❌ No booking found for order_id: ${orderId}`);
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Idempotency: a completed payment is final
    if (booking.payment?.status === 'completed') {
      console.log('⚠️ Payment already completed, skipping update');
      return res.status(200).json({ message: 'Payment status already processed' });
    }

    const { paymentStatus } = await applyPaymentStatus(booking, paymentData, 'webhook');

    await booking.save();
    console.log(`✅ Webhook ${requestId} done — booking ${booking._id} payment status:`, paymentStatus);

    // MultiSafepay expects a plain "OK" body for legacy GET notifications
    if (req.method === 'GET') {
      return res.status(200).send('OK');
    }
    return res.status(200).json({ success: true });
  } catch (error: unknown) {
    console.error(`❌ Webhook ${requestId} processing error:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ error: 'Webhook processing failed', details: errorMessage });
  }
}
