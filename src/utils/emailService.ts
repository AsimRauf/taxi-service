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
            rejectUnauthorized: isProduction
        },
        requireTLS: true,
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
            from: `"Taxi Ritje" <${process.env.SMTP_USER}>`,
            to: booking.contactInfo?.email,
            subject: `Booking Confirmation - #${booking.clientBookingId}`,
            html: createBookingConfirmationEmail(booking),
        };

        // Send admin notification email
        const adminMailOptions = {
            from: `"Taxi Ritje Booking System" <${process.env.SMTP_USER}>`,
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

// Sent to the customer when an admin edits their booking (fare, times,
// addresses, vehicle, …). `changes` is a list of human-readable change lines.
export async function sendBookingUpdatedEmail(booking: BookingData, changes: string[]) {
    if (!booking.contactInfo?.email) {
        console.log('No customer email on booking, skipping update email:', booking.clientBookingId);
        return null;
    }

    try {
        const transporter = createTransporter();

        const changeRows = changes
            .map(change => `<li style="margin: 4px 0; color: #333;">${change}</li>`)
            .join('');

        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8f9fa; border-radius: 8px;">
            <h2 style="color: #0b1e3b; margin-top: 0;">Your booking has been updated</h2>
            <p style="color: #333;">Dear ${booking.contactInfo?.fullName || 'customer'},</p>
            <p style="color: #333;">Our team has updated your booking <strong>#${booking.clientBookingId}</strong>. The changes are:</p>
            <ul style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px 32px;">${changeRows}</ul>
            <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin-top: 16px;">
                <p style="margin: 4px 0; color: #333;"><strong>Pickup:</strong> ${booking.sourceAddress}</p>
                <p style="margin: 4px 0; color: #333;"><strong>Destination:</strong> ${booking.destinationAddress}</p>
                <p style="margin: 4px 0; color: #333;"><strong>Date &amp; time:</strong> ${booking.pickupDateTime}</p>
                <p style="margin: 4px 0; color: #333;"><strong>Price:</strong> €${(booking.price || 0).toFixed(2)}</p>
            </div>
            <p style="color: #333; margin-top: 16px;">If anything looks wrong, reply to this email or call us and we'll sort it out.</p>
            <p style="color: #888; font-size: 12px; margin-top: 24px;">Taxi Ritje — this is an automated message about booking #${booking.clientBookingId}.</p>
        </div>`;

        const info = await transporter.sendMail({
            from: `"Taxi Ritje" <${process.env.SMTP_USER}>`,
            to: booking.contactInfo.email,
            subject: `Booking Updated - #${booking.clientBookingId}`,
            html
        });

        console.log('Booking update email sent:', {
            messageId: info.messageId,
            recipient: booking.contactInfo.email,
            bookingId: booking.clientBookingId
        });

        return info;
    } catch (error) {
        console.error('Failed to send booking update email:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            bookingId: booking.clientBookingId
        });
        throw error;
    }
}

// Sent to the customer when an admin approves or rejects their cancellation request
export async function sendCancellationDecisionEmail(
    booking: BookingData,
    decision: 'approved' | 'rejected',
    adminResponse?: string
) {
    if (!booking.contactInfo?.email) {
        console.log('No customer email on booking, skipping decision email:', booking.clientBookingId);
        return null;
    }

    try {
        const transporter = createTransporter();
        const approved = decision === 'approved';

        const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8f9fa; border-radius: 8px;">
            <h2 style="color: ${approved ? '#16a34a' : '#dc2626'}; margin-top: 0;">
                Cancellation ${approved ? 'approved' : 'rejected'}
            </h2>
            <p style="color: #333;">Dear ${booking.contactInfo?.fullName || 'customer'},</p>
            <p style="color: #333;">
                Your cancellation request for booking <strong>#${booking.clientBookingId}</strong>
                (${booking.sourceAddress} → ${booking.destinationAddress}, ${booking.pickupDateTime})
                has been <strong>${approved ? 'approved' : 'rejected'}</strong>.
            </p>
            ${approved
                ? '<p style="color: #333;">The ride will not take place. If you already paid, the refund will be processed according to our refund policy.</p>'
                : '<p style="color: #333;">Your booking remains active and the driver will pick you up as planned.</p>'}
            ${adminResponse ? `<div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px;"><p style="margin: 0; color: #333;"><strong>Note from our team:</strong> ${adminResponse}</p></div>` : ''}
            <p style="color: #888; font-size: 12px; margin-top: 24px;">Taxi Ritje — this is an automated message about booking #${booking.clientBookingId}.</p>
        </div>`;

        const info = await transporter.sendMail({
            from: `"Taxi Ritje" <${process.env.SMTP_USER}>`,
            to: booking.contactInfo.email,
            subject: `Cancellation ${approved ? 'Approved' : 'Rejected'} - #${booking.clientBookingId}`,
            html
        });

        console.log('Cancellation decision email sent:', {
            messageId: info.messageId,
            recipient: booking.contactInfo.email,
            decision,
            bookingId: booking.clientBookingId
        });

        return info;
    } catch (error) {
        console.error('Failed to send cancellation decision email:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            bookingId: booking.clientBookingId
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
