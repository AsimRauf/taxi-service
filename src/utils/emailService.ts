import nodemailer from 'nodemailer';
import { BookingData } from '@/types/booking';
import { createBookingConfirmationEmail, createAdminBookingNotificationEmail, createCancellationRequestEmail } from './emailTemplates';

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

        // Send customer confirmation email
        const customerMailOptions = {
            from: `"Taxi Service" <${process.env.SMTP_USER}>`,
            to: booking.contactInfo?.email,
            subject: `Booking Confirmation - #${booking.clientBookingId}`,
            html: createBookingConfirmationEmail(booking),
        };

        // Send admin notification email
        const adminMailOptions = {
            from: `"Taxi Service Booking System" <${process.env.SMTP_USER}>`,
            to: 'info@taxiritje.nl',
            subject: `New Booking Alert - #${booking.clientBookingId}`,
            html: createAdminBookingNotificationEmail(booking),
        };

        // Send both emails concurrently
        const [customerInfo, adminInfo] = await Promise.all([
            transporter.sendMail(customerMailOptions),
            transporter.sendMail(adminMailOptions)
        ]);

        console.log('Emails sent successfully:', {
            customer: {
                messageId: customerInfo.messageId,
                recipient: booking.contactInfo?.email,
            },
            admin: {
                messageId: adminInfo.messageId,
                recipient: 'info@taxiritje.nl',
            },
            timestamp: new Date().toISOString()
        });

        return { customerInfo, adminInfo };

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

export async function sendCancellationEmail(booking: BookingData, reason: string) {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: `"Taxi Service System" <${process.env.SMTP_USER}>`,
            to: 'info@taxiritje.nl',
            subject: `Cancellation Request - Booking #${booking.clientBookingId}`,
            html: createCancellationRequestEmail(booking, reason),
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('Cancellation email sent successfully:', {
            messageId: info.messageId,
            recipient: 'info@taxiritje.nl',
            bookingId: booking.clientBookingId,
            timestamp: new Date().toISOString()
        });

        return info;

    } catch (error) {
        console.error('Failed to send cancellation email:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            booking: {
                id: booking.clientBookingId,
            },
            timestamp: new Date().toISOString()
        });
        throw error;
    }
}
