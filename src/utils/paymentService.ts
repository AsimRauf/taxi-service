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
  webhookUrl?: string;  // Add optional webhookUrl parameter
  redirectUrl?: string;  // Add optional redirectUrl parameter
}

export async function createPaymentOrder(details: PaymentDetails) {
  try {
    // Convert amount to cents and to string (MultiSafepay expects string)
    const amountInCents = Math.round(details.amount * 100).toString();
    
    console.log('Creating payment order with client booking ID:', details.clientBookingId);
    
    // Use provided webhookUrl or fall back to environment variable
    const webhookUrl = details.webhookUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/webhook`;
    console.log('Setting webhook URL:', webhookUrl);
    
    // Use provided redirectUrl or fall back to environment variable
    const baseRedirectUrl = details.redirectUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/booking`;
    const redirectUrl = `${baseRedirectUrl}/payment-success?bookingId=${details.bookingId}`;
    const cancelUrl = `${baseRedirectUrl}/payment-failed?bookingId=${details.bookingId}`;
    
    console.log('Setting redirect URL:', redirectUrl);
    console.log('Setting cancel URL:', cancelUrl);
    
    const response = await client.orders.create({
      type: 'redirect',
      order_id: details.clientBookingId,
      currency: details.currency,
      amount: amountInCents,
      description: details.description,
      payment_options: {
        notification_url: webhookUrl,
        notification_method: 'POST',
        redirect_url: redirectUrl,
        cancel_url: cancelUrl,
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
    
    console.log('MultiSafepay payment options:', response.data?.payment_options);
    return response;
  } catch (error) {
    console.error('MultiSafepay payment creation error:', error);
    throw error;
  }
}

export async function getPaymentStatus(orderId: string) {
  try {
    const response = await client.orders.get(orderId);
    console.log('Payment status response:', response);
    return response;
  } catch (error) {
    console.error('MultiSafepay payment status error:', error);
    throw error;
  }
}