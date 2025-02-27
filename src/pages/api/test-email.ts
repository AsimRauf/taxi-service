import { NextApiRequest, NextApiResponse } from 'next';
import { sendBookingConfirmation } from '@/utils/emailService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ message: 'Not available in production' });
    }

    try {
        const testBooking = {
            clientBookingId: 'TEST-123',
            contactInfo: {
                email: process.env.SMTP_USER, // Send to yourself
                fullName: 'Test User',
                phoneNumber: '+1234567890'
            },
            // Add other required booking fields
            price: 50,
            pickup: { mainAddress: 'Test Pickup' },
            destination: { mainAddress: 'Test Destination' },
            pickupDateTime: new Date().toISOString(),
            // ...other required fields
        };

        const result = await sendBookingConfirmation(testBooking as any);
        res.status(200).json({ success: true, messageId: result.messageId });
    } catch (error) {
        console.error('Test email failed:', error);
        res.status(500).json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}