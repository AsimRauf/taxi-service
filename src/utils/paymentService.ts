import MSPClient from '@multisafepay/api-wrapper';

// Initialize the MultiSafepay client (API key must come from the environment)
const client = new MSPClient(
  process.env.MULTISAFEPAY_API_KEY || '',
  { environment: process.env.NODE_ENV === 'production' ? 'live' : 'test' }
);

// Validate environment variables
const validateEnvVariables = () => {
  const requiredVars = ['MULTISAFEPAY_API_KEY', 'NEXT_PUBLIC_BASE_URL'];
  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Our internal payment statuses (must match the enum in models/Booking.ts)
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'expired';

// Map a MultiSafepay order status onto our internal payment status.
// MSP statuses: initialized, uncleared, reserved, completed, shipped,
// declined, cancelled, void, expired, refunded, partial_refunded, chargedback
export const mapMspStatus = (mspStatus?: string): PaymentStatus => {
  switch (mspStatus) {
    case 'completed':
    case 'shipped':
      return 'completed';
    case 'declined':
    case 'cancelled':
    case 'void':
      return 'failed';
    case 'expired':
      return 'expired';
    case 'refunded':
    case 'partial_refunded':
    case 'chargedback':
      return 'refunded';
    case 'initialized':
    case 'uncleared':
    case 'reserved':
    default:
      return 'pending';
  }
};

export interface PaymentDetails {
  bookingId: string;
  clientBookingId: string;
  // MSP order id — must be unique per payment attempt. Defaults to
  // clientBookingId; retries must pass a suffixed id (e.g. TAXI123-R1).
  orderId?: string;
  amount: number;
  currency: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  locale?: string;
}

export async function createPaymentOrder(details: PaymentDetails) {
  try {
    // Validate environment variables before proceeding
    validateEnvVariables();

    // Convert amount to cents and to string (MultiSafepay expects string)
    const amountInCents = Math.round(details.amount * 100).toString();
    const orderId = details.orderId || details.clientBookingId;

    console.log('Creating payment order:', { orderId, clientBookingId: details.clientBookingId });

    // Always use the NEXT_PUBLIC_BASE_URL for webhooks in both environments
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const webhookUrl = `${baseUrl}/api/payments/webhook`;

    // The success page verifies the real status itself — reaching it does not
    // mean the payment succeeded, so it polls /api/payments/check-status.
    const redirectUrl = `${baseUrl}/payment-success?bookingId=${details.bookingId}`;
    const cancelUrl = `${baseUrl}/payment-failed?bookingId=${details.bookingId}`;

    const response = await client.orders.create({
      type: 'redirect',
      order_id: orderId,
      currency: details.currency,
      amount: amountInCents,
      description: details.description,
      payment_options: {
        notification_url: webhookUrl,
        notification_method: 'POST',
        redirect_url: redirectUrl,
        cancel_url: cancelUrl,
        close_window: false,
      },
      customer: {
        first_name: details.customerName.split(' ')[0],
        last_name: details.customerName.split(' ').slice(1).join(' '),
        email: details.customerEmail,
        phone: details.customerPhone || '',
        locale: details.locale === 'nl' ? 'nl_NL' : 'en_US',
      },
      second_chance: {
        send_email: true,
      },
    });

    console.log('MultiSafepay order created:', response.data?.order_id);

    if (!response.data?.payment_url) {
      throw new Error('No payment URL received from MultiSafepay');
    }

    return response;
  } catch (error) {
    console.error('MultiSafepay payment creation error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name
      });
    }
    throw error;
  }
}

export async function getPaymentStatus(orderId: string) {
  try {
    const response = await client.orders.get(orderId);
    return response;
  } catch (error) {
    console.error('MultiSafepay payment status error:', error);
    throw error;
  }
}
