import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import '@/models/User';
import mongoose from 'mongoose';
import { sendBookingConfirmation } from '@/utils/emailService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Connect to database first
        await connectToDatabase();
        
        const bookingData = req.body;
        console.log('Raw booking data:', JSON.stringify(bookingData, null, 2));

        // Validate essential fields
        if (!bookingData.clientBookingId || !bookingData.userId) {
            throw new Error('Missing required fields: clientBookingId or userId');
        }

        // Format the data for MongoDB
        const bookingDoc = {
            clientBookingId: bookingData.clientBookingId,
            user: new mongoose.Types.ObjectId(bookingData.userId),
            userId: bookingData.userId,
            pickup: bookingData.pickup,
            destination: bookingData.destination,
            
            // Updated contactInfo with additional phone number
            contactInfo: {
                fullName: bookingData.contactInfo?.fullName || '',
                email: bookingData.contactInfo?.email || '',
                phoneNumber: bookingData.contactInfo?.phoneNumber || '',
                additionalPhoneNumber: bookingData.contactInfo?.additionalPhoneNumber || ''
            },
            
            // Add bookingForOther information
            bookingForOther: bookingData.bookingForOther ? {
                fullName: bookingData.bookingForOther.fullName || '',
                phoneNumber: bookingData.bookingForOther.phoneNumber || ''
            } : null,
            
            // Add other potentially missing fields
            flightNumber: bookingData.flightNumber || '',
            remarks: bookingData.remarks || '',
            isFixedPrice: bookingData.isFixedPrice || false,
            sourceAddress: bookingData.sourceAddress,
            destinationAddress: bookingData.destinationAddress,
            
            // ...rest of existing fields...
            stopovers: bookingData.stopovers || [],
            pickupDateTime: bookingData.pickupDateTime,
            returnDateTime: bookingData.returnDateTime,
            hasLuggage: bookingData.hasLuggage,
            passengers: bookingData.passengers,
            status: 'pending',
            vehicle: bookingData.vehicle,
            price: bookingData.price || 0,
            directDistance: bookingData.directDistance,
            extraDistance: bookingData.extraDistance,
            bookingType: bookingData.bookingType,
            isReturn: bookingData.isReturn || false,
            luggage: bookingData.luggage || {
                regularLuggage: { large: 0, small: 0, handLuggage: 0 },
                specialLuggage: {
                    foldableWheelchair: 0, rollator: 0, pets: 0,
                    bicycle: 0, winterSports: 0, stroller: 0,
                    golfBag: 0, waterSports: 0
                }
            }
        };

        // Create and save the booking
        const booking = new Booking(bookingDoc);
        const savedBooking = await booking.save();
        
        // Populate user details - fixed version
        const populatedBooking = await Booking.findById(savedBooking._id)
            .populate('user', 'name email')
            .lean();
        
        // Send confirmation email asynchronously
        sendBookingConfirmation(savedBooking).catch(error => {
            console.error('Email sending failed:', error);
        });
        
        return res.status(201).json(populatedBooking);
    } catch (error) {
        console.error('Booking creation error:', error);
        return res.status(400).json({ 
            message: 'Error creating booking',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
