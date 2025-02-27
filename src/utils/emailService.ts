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
    console.log('Starting email sending process...', {
        bookingId: booking.clientBookingId,
        environment: process.env.NODE_ENV
    });

    try {
        const transporter = createTransporter();
        
        // Enhanced debug logging for all environments
        console.log('SMTP Config:', {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            user: process.env.SMTP_USER?.substring(0, 3) + '***',
            hasPassword: !!process.env.SMTP_PASSWORD,
            environment: process.env.NODE_ENV,
            timestamp: new Date().toISOString()
        });

        // Add connection test
        console.log('Testing SMTP connection...');
        await transporter.verify().catch((err) => {
            console.error('SMTP Verification Failed:', {
                code: err.code,
                command: err.command,
                response: err.response,
                timestamp: new Date().toISOString()
            });
            throw err;
        });
        console.log('SMTP connection verified successfully');

        const mailOptions = {
            from: `"Taxi Service" <${process.env.SMTP_USER}>`,
            to: booking.contactInfo?.email,
            subject: `Booking Confirmation - #${booking.clientBookingId}`,
            html: createBookingConfirmationEmail(booking),
        };

        console.log('Sending email with options:', {
            to: mailOptions.to,
            subject: mailOptions.subject,
            timestamp: new Date().toISOString()
        });

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', {
            messageId: info.messageId,
            recipient: booking.contactInfo?.email,
            response: info.response,
            timestamp: new Date().toISOString()
        });
        return info;

    } catch (error) {
        console.error('Email sending failed:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            booking: {
                id: booking.clientBookingId,
                recipient: booking.contactInfo?.email
            },
            timestamp: new Date().toISOString()
        });
        throw error;
    }
}
