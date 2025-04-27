import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification'; 
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

        // Ensure we have a valid and consistent booking ID
        const clientBookingId = bookingData.clientBookingId || bookingData.id;
        console.log('Using booking ID:', clientBookingId);

        // Add type validation for vehicle
        if (!['sedan', 'stationWagon', 'bus'].includes(bookingData.vehicle)) {
            throw new Error('Invalid vehicle type');
        }

        // Format the data for MongoDB
        const bookingDoc = {
            clientBookingId: clientBookingId,
            user: bookingData.userId ? new mongoose.Types.ObjectId(bookingData.userId) : null,
            userId: bookingData.userId || null,
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
            vehicle: bookingData.vehicle as 'sedan' | 'stationWagon' | 'bus',
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

        // Double-check the clientBookingId before saving
        console.log('About to save booking with clientBookingId:', booking.clientBookingId);

        const savedBooking = await booking.save();

        // Verify the clientBookingId after saving
        console.log('Saved booking with clientBookingId:', savedBooking.clientBookingId);

        // If the ID changed, force it back to the original
        if (savedBooking.clientBookingId !== clientBookingId) {
            console.log('Warning: clientBookingId changed during save, fixing it');
            savedBooking.clientBookingId = clientBookingId;
            await savedBooking.save();
            console.log('Fixed clientBookingId to:', savedBooking.clientBookingId);
        }

        // Create admin notification without user reference if not logged in
        const adminNotification = new Notification({
            type: 'new_booking',
            recipientType: 'admin',
            userId: bookingData.userId || 'guest',
            bookingId: savedBooking._id,
            message: `New booking #${savedBooking.clientBookingId} has been created.`,
            status: 'info',
            read: false,
            metadata: {
                bookingDetails: {
                    clientBookingId: savedBooking.clientBookingId,
                    pickupDateTime: savedBooking.pickupDateTime,
                    vehicle: savedBooking.vehicle,
                    price: savedBooking.price,
                    passengers: savedBooking.passengers
                }
            }
        });

        // Save the notification
        await adminNotification.save();

        // Populate user details
        const populatedBooking = await Booking.findById(savedBooking._id)
            .populate('user', 'name email')
            .lean();
        
        // Send confirmation email
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
