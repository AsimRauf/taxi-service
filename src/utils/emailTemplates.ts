import { BookingData } from '@/types/booking';
import { formatCurrency } from '@/utils/formatters';

export function createBookingConfirmationEmail(booking: BookingData): string {
    const pickupDate = new Date(booking.pickupDateTime).toLocaleString();
    const returnDate = booking.returnDateTime ? new Date(booking.returnDateTime).toLocaleString() : null;
    const formattedPrice = formatCurrency(booking.price);

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #1f2937;
                max-width: 600px;
                margin: 0 auto;
                background-color: #f9fafb;
            }
            
            .header {
                background-color: #2563eb;
                color: white;
                padding: 24px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }
            
            .logo {
                width: 120px;
                margin-bottom: 16px;
            }
            
            .content {
                padding: 32px;
                background-color: white;
                border-radius: 0 0 8px 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .booking-details {
                background-color: #f3f4f6;
                padding: 24px;
                border-radius: 8px;
                margin: 24px 0;
                border: 1px solid #e5e7eb;
            }
            
            .price-highlight {
                background-color: #fbbf24;
                color: #1f2937;
                padding: 16px;
                border-radius: 8px;
                text-align: center;
                font-size: 24px;
                font-weight: bold;
            }
            
            .section-title {
                color: #2563eb;
                margin-bottom: 8px;
                font-size: 18px;
                font-weight: bold;
            }

            .info-box {
                border-left: 4px solid #2563eb;
                padding-left: 16px;
                margin: 16px 0;
            }

            .contact-section {
                background-color: #f3f4f6;
                padding: 16px;
                border-radius: 8px;
                margin-top: 24px;
            }
            
            .footer {
                text-align: center;
                padding: 24px;
                color: #4b5563;
                font-size: 14px;
            }
            
            .divider {
                border-top: 1px solid #e5e7eb;
                margin: 24px 0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <img src="${process.env.NEXT_PUBLIC_BASE_URL}/images/logo.png" alt="Taxi Service Logo" class="logo">
            <h1>Booking Confirmation</h1>
        </div>
        
        <div class="content">
            <p>Dear ${booking.contactInfo?.fullName},</p>
            <p>Thank you for choosing our taxi service. Your booking has been confirmed.</p>
            
            <div class="price-highlight">
                Total Amount: ${formattedPrice}
            </div>
            
            <div class="booking-details">
                <h2 class="section-title">Booking Information</h2>
                <p><strong>Booking ID:</strong> ${booking.clientBookingId}</p>
                
                <div class="info-box">
                    <p><strong>Pickup Location:</strong><br/>${booking.pickup.mainAddress}</p>
                    <p><strong>Destination:</strong><br/>${booking.destination.mainAddress}</p>
                </div>
                
                <div class="divider"></div>
                
                <p><strong>Pickup Date & Time:</strong><br/>${pickupDate}</p>
                ${returnDate ? `<p><strong>Return Date & Time:</strong><br/>${returnDate}</p>` : ''}
                <p><strong>Passengers:</strong> ${booking.passengers}</p>
                ${booking.hasLuggage ? `<p><strong>Luggage:</strong> Yes</p>` : ''}
                ${booking.vehicle ? `<p><strong>Vehicle Type:</strong> ${booking.vehicle}</p>` : ''}
            </div>
            
            <div class="contact-section">
                <h3 class="section-title">Contact Information</h3>
                <p><strong>Name:</strong> ${booking.contactInfo?.fullName}</p>
                <p><strong>Email:</strong> ${booking.contactInfo?.email}</p>
                <p><strong>Phone:</strong> ${booking.contactInfo?.phoneNumber}</p>
            </div>
            
            <div class="divider"></div>
            
            <div class="contact-section">
                <h3 class="section-title">Need Assistance?</h3>
                <p>Our customer service team is here to help:</p>
                <p><strong>Phone:</strong> ${process.env.SUPPORT_PHONE || '+1234567890'}</p>
                <p><strong>Email:</strong> ${process.env.SUPPORT_EMAIL || 'support@taxiservice.com'}</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Thank you for choosing our service!</p>
            <p style="font-size: 12px;">
                © ${new Date().getFullYear()} Taxi Service. All rights reserved.
            </p>
        </div>
    </body>
    </html>
    `;
}
