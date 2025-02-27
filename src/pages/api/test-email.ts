import { NextApiRequest, NextApiResponse } from 'next';
import { sendBookingConfirmation } from '@/utils/emailService';
import { BookingData } from '@/types/booking';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ message: 'Not available in production' });
    }

    try {
        const testBooking: BookingData = {
            id: 'test-id',
            clientBookingId: 'TEST-123',
            userId: 'test-user-id',
            contactInfo: {
                email: process.env.SMTP_USER || '', // Send to yourself
                fullName: 'Test User',
                phoneNumber: '+1234567890'
            },
            pickup: {
                mainAddress: 'Test Pickup',
                description: 'Test Pickup Location',
                label: 'Pickup',
                value: {
                    place_id: 'test-pickup-id',
                    description: 'Test Pickup Description',
                    structured_formatting: {
                        main_text: 'Test Pickup',
                        secondary_text: 'Test City',
                        place_id: 'test-pickup-id'
                    }
                }
            },
            destination: {
                mainAddress: 'Test Destination',
                description: 'Test Destination Location',
                label: 'Destination',
                value: {
                    place_id: 'test-dest-id',
                    description: 'Test Destination Description',
                    structured_formatting: {
                        main_text: 'Test Destination',
                        secondary_text: 'Test City',
                        place_id: 'test-dest-id'
                    }
                }
            },
            stopovers: [],
            sourceAddress: 'Test Pickup',
            destinationAddress: 'Test Destination',
            directDistance: '10 km',
            extraDistance: '0 km',
            pickupDateTime: new Date().toISOString(),
            returnDateTime: null,
            isReturn: false,
            hasLuggage: true,
            passengers: 2,
            price: 50,
            vehicle: 'Standard',
            status: 'pending'
        };

        const result = await sendBookingConfirmation(testBooking);
        res.status(200).json({ success: true, messageId: result.messageId });
    } catch (error) {
        console.error('Test email failed:', error);
        res.status(500).json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}