import nodemailer from 'nodemailer';
import { BookingData } from '@/types/booking';
import { createBookingConfirmationEmail } from './emailTemplates';

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.hostinger.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER || 'your-email@hostinger.com',
            pass: process.env.SMTP_PASSWORD || 'your-hostinger-password',
        },
        tls: {
            // Do not fail on invalid certs
            rejectUnauthorized: isProduction
        },
        debug: !isProduction
    });
};

export async function sendBookingConfirmation(booking: BookingData) {
    try {
        const transporter = createTransporter();

        // Verify SMTP connection configuration
        await transporter.verify().catch((err) => {
            console.error('SMTP Verification Error:', err);
            throw new Error('SMTP Connection Failed');
        });

        const mailOptions = {
            from: `"Taxi Service" <${process.env.SMTP_USER || 'your-email@hostinger.com'}>`,
            to: booking.contactInfo?.email,
            subject: `Booking Confirmation - #${booking.clientBookingId}`,
            html: createBookingConfirmationEmail(booking),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;

    } catch (error) {
        console.error('Email sending failed:', error);
        // Log more details in production
        if (process.env.NODE_ENV === 'production') {
            console.error('SMTP Config:', {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                user: process.env.SMTP_USER?.substring(0, 3) + '***',
                hasPassword: !!process.env.SMTP_PASSWORD
            });
        }
        throw error;
    }
}
