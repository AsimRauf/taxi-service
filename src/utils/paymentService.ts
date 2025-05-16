import MSPClient from '@multisafepay/api-wrapper';

// Initialize the MultiSafepay client
const client = new MSPClient(
  process.env.MULTISAFEPAY_API_KEY || 'd69fe3ddbfbdc1fd18930899b05c090f12cdc283', 
  { environment: process.env.NODE_ENV === 'production' ? 'live' : 'test' }
);

// Validate environment variables
const validateEnvVariables = () => {
  const requiredVars = ['MULTISAFEPAY_API_KEY', 'NEXT_PUBLIC_BASE_URL'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

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
    // Validate environment variables before proceeding
    validateEnvVariables();

    // Convert amount to cents and to string (MultiSafepay expects string)
    const amountInCents = Math.round(details.amount * 100).toString();
    
    console.log('Creating payment order with client booking ID:', details.clientBookingId);
    
    // Always use the NEXT_PUBLIC_BASE_URL for webhooks in both environments
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const webhookUrl = `${baseUrl}/api/payments/webhook`;
    
    console.log('Setting webhook URL:', webhookUrl);
    
    // Use correct paths for redirects without duplicating 'booking'
    const redirectUrl = `${baseUrl}/payment-success?bookingId=${details.bookingId}`;
    const cancelUrl = `${baseUrl}/payment-failed?bookingId=${details.bookingId}`;
    
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
        close_window: false,
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
    
    // Enhanced logging
    console.log('MultiSafepay API Response:', JSON.stringify(response, null, 2));
    console.log('Payment options:', response.data?.payment_options);
    console.log('Order ID:', response.data?.order_id);
    
    if (!response.data?.payment_url) {
      throw new Error('No payment URL received from MultiSafepay');
    }
    
    return response;
  } catch (error) {
    console.error('MultiSafepay payment creation error:', error);
    // Add more detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
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