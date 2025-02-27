import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import '@/models/User';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        await connectToDatabase();
        const bookingData = req.body;
        console.log('Booking data received:', bookingData.id);
        
        // Destructure id and userId from bookingData
        const { id, userId, ...restBookingData } = bookingData;
        
        const booking = new Booking({
            clientBookingId: id,
            user: new mongoose.Types.ObjectId(userId),
            userId, // Keep userId as string
            ...restBookingData,
            status: 'pending'
        });

        const savedBooking = await booking.save();
        const populatedBooking = await savedBooking.populate('user', 'name email');
        
        res.status(201).json(populatedBooking);
    } catch (error) {
        console.error('Booking error:', error);
        res.status(400).json({ 
            message: 'Error creating booking',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
