import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import '@/models/User';
import mongoose from 'mongoose';
import { sendBookingConfirmation } from '@/utils/emailService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectToDatabase();
        const bookingData = req.body;
        console.log('Booking data received:', bookingData.id);
        
        const { id, userId, ...restBookingData } = bookingData;
        
        const booking = new Booking({
            clientBookingId: id,
            user: new mongoose.Types.ObjectId(userId),
            userId,
            ...restBookingData,
            status: 'pending'
        });

        const savedBooking = await booking.save();
        const populatedBooking = await savedBooking.populate('user', 'name email');
        
        // Send confirmation email asynchronously
        sendBookingConfirmation(savedBooking).catch(error => {
            console.error('Email sending failed:', error);
            // Log to your error tracking service
        });
        
        res.status(201).json(populatedBooking);
    } catch (error) {
        console.error('Booking error:', error);
        res.status(400).json({ 
            message: 'Error creating booking',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
