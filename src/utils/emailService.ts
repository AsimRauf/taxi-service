import nodemailer from 'nodemailer';
import { createBookingConfirmationEmail } from './emailTemplates';
import { BookingData } from '@/types/booking';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === '465',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    }
});

export async function sendBookingConfirmation(booking: BookingData) {
    try {
        const mailOptions = {
            from: `"Taxi Service" <${process.env.SMTP_USER}>`,
            to: booking.contactInfo?.email,
            subject: `Booking Confirmation - #${booking.clientBookingId}`,
            html: createBookingConfirmationEmail(booking),
        };

        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
}