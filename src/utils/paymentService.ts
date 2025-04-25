import MSPClient from '@multisafepay/api-wrapper';

// Initialize the MultiSafepay client
const client = new MSPClient(
  process.env.MULTISAFEPAY_API_KEY || 'd69fe3ddbfbdc1fd18930899b05c090f12cdc283', 
  { environment: process.env.NODE_ENV === 'production' ? 'live' : 'test' }
);

export interface PaymentDetails {
  bookingId: string;
  clientBookingId: string;
  amount: number;
  currency: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

export async function createPaymentOrder(details: PaymentDetails) {
  try {
    // Convert amount to cents and to string (MultiSafepay expects string)
    const amountInCents = Math.round(details.amount * 100).toString();
    
    const response = await client.orders.create({
      type: 'redirect',
      order_id: details.clientBookingId,
      currency: details.currency,
      amount: amountInCents,
      description: details.description,
      payment_options: {
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/webhook`,
        redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/payment-success?bookingId=${details.bookingId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/payment-failed?bookingId=${details.bookingId}`,
      },
      customer: {
        first_name: details.customerName.split(' ')[0],
        last_name: details.customerName.split(' ').slice(1).join(' '),
        email: details.customerEmail,
        phone: details.customerPhone || '',
        locale: 'en_US',
      },
      second_chance: {
        send_email: true,
      },
    });
    
    return response;
  } catch (error) {
    console.error('MultiSafepay payment creation error:', error);
    throw error;
  }
}

export async function getPaymentStatus(orderId: string) {
  try {
    return await client.orders.get(orderId);
  } catch (error) {
    console.error('MultiSafepay payment status error:', error);
    throw error;
  }
}