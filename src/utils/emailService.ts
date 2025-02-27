import nodemailer from 'nodemailer';
import { BookingData } from '@/types/booking';
import { createBookingConfirmationEmail } from './emailTemplates';

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
        tls: {
            // Do not fail on invalid certs
            rejectUnauthorized: isProduction,
            ciphers: 'SSLv3',
            minVersion: 'TLSv1'
        },
        pool: true, // Use pooled connections
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 1000,
        rateLimit: 5
    });
};

export async function sendBookingConfirmation(booking: BookingData) {
    try {
        const transporter = createTransporter();
        
        // Add debug logging for production
        if (process.env.NODE_ENV === 'production') {
            console.log('SMTP Config:', {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                user: process.env.SMTP_USER?.substring(0, 3) + '***',
                hasPassword: !!process.env.SMTP_PASSWORD
            });
        }

        // Verify SMTP connection with detailed error logging
        await transporter.verify().catch((err) => {
            console.error('SMTP Verification Error Details:', {
                code: err.code,
                command: err.command,
                response: err.response
            });
            throw err;
        });

        const mailOptions = {
            from: `"Taxi Service" <${process.env.SMTP_USER}>`,
            to: booking.contactInfo?.email,
            subject: `Booking Confirmation - #${booking.clientBookingId}`,
            html: createBookingConfirmationEmail(booking),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', {
            messageId: info.messageId,
            recipient: booking.contactInfo?.email
        });
        return info;

    } catch (error) {
        console.error('Email sending failed:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            booking: {
                id: booking.clientBookingId,
                recipient: booking.contactInfo?.email
            }
        });
        throw error;
    }
}
