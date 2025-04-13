import { BookingData, Location } from '@/types/booking';
import { LuggageFormData } from '@/types/luggage';
import { formatCurrency } from '@/utils/formatters';

export function createBookingConfirmationEmail(booking: BookingData): string {
    const pickupDate = new Date(booking.pickupDateTime).toLocaleString();
    const returnDate = booking.returnDateTime ? new Date(booking.returnDateTime).toLocaleString() : null;
    const formattedPrice = formatCurrency(booking.price);

    // Helper function to format luggage items
    const formatLuggage = (luggage: LuggageFormData) => {
        const items = [];
        
        // Regular luggage
        if (luggage.regularLuggage) {
            if (luggage.regularLuggage.large > 0) items.push(`Large Suitcases: ${luggage.regularLuggage.large}`);
            if (luggage.regularLuggage.small > 0) items.push(`Small Suitcases: ${luggage.regularLuggage.small}`);
            if (luggage.regularLuggage.handLuggage > 0) items.push(`Hand Luggage: ${luggage.regularLuggage.handLuggage}`);
        }
        
        // Special luggage
        if (luggage.specialLuggage) {
            if (luggage.specialLuggage.foldableWheelchair > 0) items.push(`Foldable Wheelchairs: ${luggage.specialLuggage.foldableWheelchair}`);
            if (luggage.specialLuggage.rollator > 0) items.push(`Rollators: ${luggage.specialLuggage.rollator}`);
            if (luggage.specialLuggage.pets > 0) items.push(`Pets: ${luggage.specialLuggage.pets}`);
            if (luggage.specialLuggage.bicycle > 0) items.push(`Bicycles: ${luggage.specialLuggage.bicycle}`);
            if (luggage.specialLuggage.winterSports > 0) items.push(`Winter Sports Equipment: ${luggage.specialLuggage.winterSports}`);
            if (luggage.specialLuggage.stroller > 0) items.push(`Strollers: ${luggage.specialLuggage.stroller}`);
            if (luggage.specialLuggage.golfBag > 0) items.push(`Golf Bags: ${luggage.specialLuggage.golfBag}`);
            if (luggage.specialLuggage.waterSports > 0) items.push(`Water Sports Equipment: ${luggage.specialLuggage.waterSports}`);
        }

        return items.length > 0 ? items.join('<br>') : 'No luggage specified';
    };

    // Get vehicle display name
    const getVehicleDisplay = (vehicle: string) => {
        switch (vehicle) {
            case 'sedan': return 'Sedan Taxi';
            case 'stationWagon': return 'Station Wagon Taxi';
            case 'bus': return 'Minibus Taxi';
            default: return vehicle;
        }
    };

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
            
            .price-box {
                background-color: #fef3c7;
                border: 2px solid #fbbf24;
                color: #92400e;
                padding: 16px;
                border-radius: 8px;
                text-align: center;
                margin: 24px 0;
            }
            
            .price-amount {
                font-size: 24px;
                font-weight: bold;
                color: #92400e;
            }
            
            .price-type {
                font-size: 14px;
                color: #92400e;
                margin-top: 4px;
            }
            
            .section-title {
                color: #2563eb;
                margin: 24px 0 8px 0;
                font-size: 18px;
                font-weight: bold;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 8px;
            }

            .route-box {
                background-color: #f8fafc;
                border-left: 4px solid #2563eb;
                padding: 16px;
                margin: 16px 0;
            }

            .route-point {
                margin: 12px 0;
                padding-left: 24px;
                position: relative;
            }

            .route-point:before {
                content: "•";
                color: #2563eb;
                position: absolute;
                left: 8px;
            }

            .luggage-box {
                background-color: #f8fafc;
                border: 1px solid #e5e7eb;
                padding: 16px;
                border-radius: 8px;
                margin: 16px 0;
            }

            .contact-section {
                background-color: #f3f4f6;
                padding: 16px;
                border-radius: 8px;
                margin-top: 24px;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: auto 1fr;
                gap: 8px 16px;
                margin: 16px 0;
            }
            
            .info-label {
                font-weight: bold;
                color: #4b5563;
            }
            
            .footer {
                text-align: center;
                padding: 24px;
                color: #4b5563;
                font-size: 14px;
            }
            
            .important-note {
                background-color: #fee2e2;
                border: 1px solid #ef4444;
                color: #991b1b;
                padding: 16px;
                border-radius: 8px;
                margin: 24px 0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Booking Confirmation</h1>
            <p>Thank you for choosing our taxi service</p>
        </div>
        
        <div class="content">
            <p>Dear ${booking.contactInfo?.fullName},</p>
            <p>Your booking has been confirmed. Below you will find all the details of your reservation.</p>
            
            <div class="price-box">
                <div class="price-amount">${formattedPrice}</div>
                <div class="price-type">${booking.isFixedPrice ? 'Fixed Price' : 'Estimated Price'}</div>
            </div>

            <div class="booking-details">
                <h2 class="section-title">Booking Reference</h2>
                <div class="info-grid">
                    <span class="info-label">Booking ID:</span>
                    <span>${booking.clientBookingId}</span>
                    <span class="info-label">Vehicle Type:</span>
                    <span>${getVehicleDisplay(booking.vehicle || 'unknown')}</span>
                    <span class="info-label">Number of Passengers:</span>
                    <span>${booking.passengers}</span>
                </div>

                <h2 class="section-title">Route Details</h2>
                <div class="route-box">
                    <h3>Outbound Journey</h3>
                    <div class="route-point">
                        <strong>Pickup:</strong><br>
                        ${booking.pickup.mainAddress}
                        ${booking.pickup.exactAddress ? `<br>(${booking.pickup.exactAddress.businessName || ''} ${booking.pickup.exactAddress.city})` : ''}
                    </div>
                    ${booking.stopovers.map((stop: Location, index: number) => `
                        <div class="route-point">
                            <strong>Stopover ${index + 1}:</strong><br>
                            ${stop.mainAddress}
                        </div>
                    `).join('')}
                    <div class="route-point">
                        <strong>Destination:</strong><br>
                        ${booking.destination.mainAddress}
                        ${booking.destination.exactAddress ? `<br>(${booking.destination.exactAddress.businessName || ''} ${booking.destination.exactAddress.city})` : ''}
                    </div>
                </div>

                ${booking.isReturn ? `
                <div class="route-box">
                    <h3>Return Journey</h3>
                    <div class="route-point">
                        <strong>Pickup:</strong><br>
                        ${booking.destination.mainAddress}
                    </div>
                    ${booking.stopovers.slice().reverse().map((stop: Location, index: number) => `
                        <div class="route-point">
                            <strong>Stopover ${index + 1}:</strong><br>
                            ${stop.mainAddress}
                        </div>
                    `).join('')}
                    <div class="route-point">
                        <strong>Destination:</strong><br>
                        ${booking.pickup.mainAddress}
                    </div>
                </div>
                ` : ''}

                <h2 class="section-title">Schedule</h2>
                <div class="info-grid">
                    <span class="info-label">Pickup Date & Time:</span>
                    <span>${pickupDate}</span>
                    ${returnDate ? `
                        <span class="info-label">Return Date & Time:</span>
                        <span>${returnDate}</span>
                    ` : ''}
                </div>

                <h2 class="section-title">Luggage Details</h2>
                <div class="luggage-box">
                    ${formatLuggage(booking.luggage)}
                </div>
            </div>
            
            <div class="contact-section">
                <h2 class="section-title">Contact Information</h2>
                ${booking.bookingForOther ? `
                    <div class="info-grid">
                        <span class="info-label">Booked by:</span>
                        <span>${booking.contactInfo?.fullName}</span>
                        <span class="info-label">Email:</span>
                        <span>${booking.contactInfo?.email}</span>
                        <span class="info-label">Phone:</span>
                        <span>${booking.contactInfo?.phoneNumber}</span>
                        ${booking.contactInfo?.additionalPhoneNumber ? `
                            <span class="info-label">Additional Phone:</span>
                            <span>${booking.contactInfo.additionalPhoneNumber}</span>
                        ` : ''}
                        <span class="info-label">Passenger Name:</span>
                        <span>${booking.bookingForOther.fullName}</span>
                        <span class="info-label">Passenger Phone:</span>
                        <span>${booking.bookingForOther.phoneNumber}</span>
                    </div>
                ` : `
                    <div class="info-grid">
                        <span class="info-label">Name:</span>
                        <span>${booking.contactInfo?.fullName}</span>
                        <span class="info-label">Email:</span>
                        <span>${booking.contactInfo?.email}</span>
                        <span class="info-label">Phone:</span>
                        <span>${booking.contactInfo?.phoneNumber}</span>
                        ${booking.contactInfo?.additionalPhoneNumber ? `
                            <span class="info-label">Additional Phone:</span>
                            <span>${booking.contactInfo.additionalPhoneNumber}</span>
                        ` : ''}
                    </div>
                `}
            </div>

            ${booking.flightNumber || booking.remarks ? `
                <div class="contact-section">
                    <h2 class="section-title">Additional Information</h2>
                    <div class="info-grid">
                        ${booking.flightNumber ? `
                            <span class="info-label">Flight Number:</span>
                            <span>${booking.flightNumber}</span>
                        ` : ''}
                        ${booking.remarks ? `
                            <span class="info-label">Special Notes:</span>
                            <span>${booking.remarks}</span>
                        ` : ''}
                    </div>
                </div>
            ` : ''}

            <div class="important-note">
                <strong>Important:</strong>
                <ul>
                    <li>Please be ready at the pickup location 5 minutes before the scheduled time.</li>
                    <li>Keep your phone accessible for any updates from the driver.</li>
                    <li>For any changes to your booking, please contact us at least 24 hours in advance.</li>
                </ul>
            </div>

            <div class="contact-section">
                <h2 class="section-title">Need Help?</h2>
                <p>Our customer service team is available 24/7:</p>
                <div class="info-grid">
                    <span class="info-label">Phone:</span>
                    <span>${process.env.SUPPORT_PHONE || '+1234567890'}</span>
                    <span class="info-label">Email:</span>
                    <span>${process.env.SUPPORT_EMAIL || 'support@taxiservice.com'}</span>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Thank you for choosing our service!</p>
            <p>© ${new Date().getFullYear()} Taxi Service. All rights reserved.</p>
        </div>
    </body>
    </html>
    `;
}

export function createAdminBookingNotificationEmail(booking: BookingData): string {
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
            }
            .booking-info {
                background-color: #f3f4f6;
                padding: 16px;
                border-radius: 8px;
                margin: 16px 0;
            }
            .section {
                margin-bottom: 16px;
            }
            .label {
                font-weight: bold;
                color: #4b5563;
            }
            .highlight {
                background-color: #fef3c7;
                padding: 8px;
                border-radius: 4px;
                margin: 8px 0;
            }
            .route {
                border-left: 4px solid #2563eb;
                padding-left: 12px;
                margin: 8px 0;
            }
        </style>
    </head>
    <body>
        <h2>New Booking Notification</h2>
        <div class="booking-info">
            <div class="section">
                <div class="label">Booking Reference:</div>
                <div class="highlight">#${booking.clientBookingId}</div>
            </div>

            <div class="section">
                <div class="label">Customer Details:</div>
                <div>${booking.contactInfo?.fullName}</div>
                <div>${booking.contactInfo?.email}</div>
                <div>${booking.contactInfo?.phoneNumber}</div>
                ${booking.contactInfo?.additionalPhoneNumber ? 
                    `<div>Additional Phone: ${booking.contactInfo.additionalPhoneNumber}</div>` : ''}
            </div>

            ${booking.bookingForOther ? `
                <div class="section">
                    <div class="label">Passenger Details:</div>
                    <div>${booking.bookingForOther.fullName}</div>
                    <div>${booking.bookingForOther.phoneNumber}</div>
                </div>
            ` : ''}

            <div class="section">
                <div class="label">Journey Details:</div>
                <div class="route">
                    <strong>From:</strong> ${booking.pickup.mainAddress}<br>
                    <strong>To:</strong> ${booking.destination.mainAddress}
                </div>
                ${booking.stopovers.length > 0 ? `
                    <div class="label">Stopovers:</div>
                    ${booking.stopovers.map((stop: Location, index: number) => 
                        `<div>${index + 1}. ${stop.mainAddress}</div>`).join('')}
                ` : ''}
            </div>

            <div class="section">
                <div class="label">Schedule:</div>
                <div>Pickup: ${pickupDate}</div>
                ${returnDate ? `<div>Return: ${returnDate}</div>` : ''}
            </div>

            <div class="section">
                <div class="label">Vehicle & Passengers:</div>
                <div>Vehicle: ${booking.vehicle?.toUpperCase()}</div>
                <div>Passengers: ${booking.passengers}</div>
            </div>

            <div class="section">
                <div class="label">Price:</div>
                <div class="highlight">
                    ${formattedPrice} (${booking.isFixedPrice ? 'Fixed' : 'Estimated'})
                </div>
            </div>

            ${booking.flightNumber ? `
                <div class="section">
                    <div class="label">Flight Number:</div>
                    <div>${booking.flightNumber}</div>
                </div>
            ` : ''}

            ${booking.remarks ? `
                <div class="section">
                    <div class="label">Special Notes:</div>
                    <div>${booking.remarks}</div>
                </div>
            ` : ''}
        </div>
    </body>
    </html>
    `;
}

export function createCancellationRequestEmail(booking: BookingData, reason: string): string {
    const pickupDate = new Date(booking.pickupDateTime).toLocaleString();
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
            }
            .alert-box {
                background-color: #fee2e2;
                border: 2px solid #ef4444;
                color: #991b1b;
                padding: 16px;
                border-radius: 8px;
                margin: 16px 0;
            }
            .booking-info {
                background-color: #f3f4f6;
                padding: 16px;
                border-radius: 8px;
                margin: 16px 0;
            }
            .section {
                margin-bottom: 16px;
            }
            .label {
                font-weight: bold;
                color: #4b5563;
            }
        </style>
    </head>
    <body>
        <div class="alert-box">
            <h2>Cancellation Request</h2>
            <p>A customer has requested to cancel their booking.</p>
        </div>

        <div class="booking-info">
            <div class="section">
                <div class="label">Booking Reference:</div>
                <div>#${booking.clientBookingId}</div>
            </div>

            <div class="section">
                <div class="label">Customer Details:</div>
                <div>${booking.contactInfo?.fullName}</div>
                <div>${booking.contactInfo?.email}</div>
                <div>${booking.contactInfo?.phoneNumber}</div>
            </div>

            <div class="section">
                <div class="label">Cancellation Reason:</div>
                <div>${reason}</div>
            </div>

            <div class="section">
                <div class="label">Original Booking Details:</div>
                <div>Pickup: ${pickupDate}</div>
                <div>From: ${booking.pickup.mainAddress}</div>
                <div>To: ${booking.destination.mainAddress}</div>
                <div>Vehicle: ${booking.vehicle?.toUpperCase()}</div>
                <div>Price: ${formattedPrice}</div>
                <div>Passengers: ${booking.passengers}</div>
            </div>

            ${booking.flightNumber ? `
                <div class="section">
                    <div class="label">Flight Number:</div>
                    <div>${booking.flightNumber}</div>
                </div>
            ` : ''}
        </div>

        <p>Please review this cancellation request and take appropriate action.</p>
    </body>
    </html>
    `;
}
