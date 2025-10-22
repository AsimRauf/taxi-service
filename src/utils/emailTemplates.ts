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
            if (luggage.regularLuggage.large > 0) items.push(`Grote koffers: ${luggage.regularLuggage.large}`);
            if (luggage.regularLuggage.small > 0) items.push(`Kleine koffers: ${luggage.regularLuggage.small}`);
            if (luggage.regularLuggage.handLuggage > 0) items.push(`Handbagage: ${luggage.regularLuggage.handLuggage}`);
        }

        // Special luggage
        if (luggage.specialLuggage) {
            if (luggage.specialLuggage.foldableWheelchair > 0) items.push(`Opvouwbare rolstoelen: ${luggage.specialLuggage.foldableWheelchair}`);
            if (luggage.specialLuggage.rollator > 0) items.push(`Rollators: ${luggage.specialLuggage.rollator}`);
            if (luggage.specialLuggage.pets > 0) items.push(`Huisdieren: ${luggage.specialLuggage.pets}`);
            if (luggage.specialLuggage.bicycle > 0) items.push(`Fietsen: ${luggage.specialLuggage.bicycle}`);
            if (luggage.specialLuggage.winterSports > 0) items.push(`Wintersportuitrusting: ${luggage.specialLuggage.winterSports}`);
            if (luggage.specialLuggage.stroller > 0) items.push(`Kinderwagens: ${luggage.specialLuggage.stroller}`);
            if (luggage.specialLuggage.golfBag > 0) items.push(`Golftassen: ${luggage.specialLuggage.golfBag}`);
            if (luggage.specialLuggage.waterSports > 0) items.push(`Watersportuitrusting: ${luggage.specialLuggage.waterSports}`);
        }

        return items.length > 0 ? items.join('<br>') : 'Geen bagage opgegeven';
    };

    // Get vehicle display name
    const getVehicleDisplay = (vehicle: string) => {
        switch (vehicle) {
            case 'sedan': return 'Sedan Taxi';
            case 'stationWagon': return 'Stationwagen Taxi';
            case 'bus': return 'Minibus Taxi';
            default: return vehicle;
        }
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                line-height: 1.5;
                color: #1f2937;
                background-color: #f3f4f6;
                -webkit-font-smoothing: antialiased;
            }

            .email-wrapper {
                width: 100%;
                background-color: #f3f4f6;
                padding: 16px 0;
            }

            .container {
                max-width: 560px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            .header {
                background: linear-gradient(135deg, #00A3EE 0%, #0077BE 100%);
                color: #ffffff;
                padding: 24px 20px;
                text-align: center;
            }

            .header h1 {
                font-size: 20px;
                font-weight: 700;
                margin: 0 0 4px 0;
                letter-spacing: -0.3px;
            }

            .header p {
                font-size: 13px;
                font-weight: 400;
                margin: 0;
                opacity: 0.95;
            }

            .logo-section {
                background-color: #ffffff;
                padding: 20px;
                text-align: center;
                border-bottom: 1px solid #e5e7eb;
            }

            .logo-section img {
                max-width: 180px;
                height: auto;
                display: inline-block;
            }

            .content {
                padding: 20px;
            }

            .greeting {
                font-size: 14px;
                margin-bottom: 12px;
                color: #374151;
                font-weight: 500;
            }

            .intro-text {
                font-size: 13px;
                color: #6b7280;
                margin-bottom: 16px;
            }

            .price-badge {
                background: linear-gradient(135deg, #FFD700 0%, #FFC700 100%);
                color: #1f2937;
                padding: 16px;
                border-radius: 8px;
                text-align: center;
                margin: 16px 0;
            }

            .price-amount {
                font-size: 24px;
                font-weight: 700;
                margin: 0;
            }

            .price-label {
                font-size: 12px;
                font-weight: 500;
                margin: 4px 0 0 0;
                opacity: 0.8;
            }

            .section {
                background-color: #f9fafb;
                border-radius: 8px;
                padding: 16px;
                margin: 12px 0;
            }

            .section-title {
                color: #0077BE;
                font-size: 14px;
                font-weight: 600;
                margin: 0 0 10px 0;
            }

            .info-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e5e7eb;
                font-size: 13px;
            }

            .info-row:last-child {
                border-bottom: none;
            }

            .info-label {
                font-weight: 500;
                color: #6b7280;
            }

            .info-value {
                color: #1f2937;
                font-weight: 500;
                text-align: right;
                flex: 1;
                margin-left: 12px;
            }

            .route-card {
                background-color: #ffffff;
                border-left: 3px solid #00A3EE;
                padding: 12px;
                margin: 10px 0;
                border-radius: 4px;
            }

            .route-card h4 {
                font-size: 13px;
                font-weight: 600;
                color: #0077BE;
                margin: 0 0 8px 0;
            }

            .route-item {
                font-size: 13px;
                margin: 6px 0;
                padding-left: 12px;
                position: relative;
                color: #374151;
            }

            .route-item::before {
                content: "";
                position: absolute;
                left: 0;
                top: 7px;
                width: 6px;
                height: 6px;
                background-color: #00A3EE;
                border-radius: 50%;
            }

            .route-label {
                font-weight: 600;
                color: #1f2937;
            }

            .luggage-list {
                font-size: 13px;
                color: #374151;
                line-height: 1.6;
            }

            .notice-box {
                background-color: #fef3c7;
                border-left: 3px solid #FFD700;
                padding: 12px;
                border-radius: 4px;
                margin: 16px 0;
            }

            .notice-title {
                font-size: 13px;
                font-weight: 600;
                color: #92400e;
                margin: 0 0 6px 0;
            }

            .notice-list {
                font-size: 12px;
                color: #92400e;
                margin: 0;
                padding-left: 16px;
            }

            .notice-list li {
                margin: 4px 0;
            }

            .footer {
                background-color: #f9fafb;
                text-align: center;
                padding: 16px 20px;
                border-top: 1px solid #e5e7eb;
            }

            .footer-text {
                font-size: 12px;
                color: #6b7280;
                margin: 4px 0;
            }

            .footer-contact {
                font-size: 11px;
                color: #9ca3af;
                margin: 8px 0 0 0;
            }

            @media only screen and (max-width: 600px) {
                .container {
                    border-radius: 0;
                }

                .email-wrapper {
                    padding: 0;
                }

                .content {
                    padding: 16px;
                }

                .section {
                    padding: 12px;
                }

                .info-row {
                    flex-direction: column;
                    gap: 2px;
                }

                .info-value {
                    text-align: left;
                    margin-left: 0;
                }

                .price-amount {
                    font-size: 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="container">
                <div class="header">
                    <h1>Boeking Bevestigd</h1>
                    <p>Bedankt voor uw vertrouwen</p>
                </div>

                <div class="logo-section">
                    <img src="https://taxiritje.nl/_next/image?url=%2Fimages%2FLogo.png&w=384&q=75" alt="TaxiRitje Logo">
                </div>

                <div class="content">
                    <p class="greeting">Beste ${booking.contactInfo?.fullName},</p>
                    <p class="intro-text">Uw taxiboeking is bevestigd. Hier zijn uw ritgegevens:</p>

                    <div class="price-badge">
                        <div class="price-amount">${formattedPrice}</div>
                        <div class="price-label">${booking.isFixedPrice ? 'Vaste Prijs' : 'Geschatte Prijs'}</div>
                    </div>

                    <div class="section">
                        <h3 class="section-title">Boekingsinformatie</h3>
                        <div class="info-row">
                            <span class="info-label">Boeking ID</span>
                            <span class="info-value">${booking.clientBookingId}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Voertuig</span>
                            <span class="info-value">${getVehicleDisplay(booking.vehicle || 'onbekend')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Passagiers</span>
                            <span class="info-value">${booking.passengers}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Ophaaltijd</span>
                            <span class="info-value">${pickupDate}</span>
                        </div>
                        ${returnDate ? `
                        <div class="info-row">
                            <span class="info-label">Retourtijd</span>
                            <span class="info-value">${returnDate}</span>
                        </div>
                        ` : ''}
                    </div>

                    <div class="section">
                        <h3 class="section-title">Ritgegevens</h3>
                        <div class="route-card">
                            <h4>Heenreis</h4>
                            <div class="route-item">
                                <span class="route-label">Van:</span> ${booking.pickup.mainAddress}
                                ${booking.pickup.exactAddress ? `<br><span style="font-size: 12px; color: #6b7280;">${booking.pickup.exactAddress.businessName || ''} ${booking.pickup.exactAddress.city || ''}</span>` : ''}
                            </div>
                            ${booking.stopovers.map((stop: Location, index: number) => `
                                <div class="route-item">
                                    <span class="route-label">Stop ${index + 1}:</span> ${stop.mainAddress}
                                </div>
                            `).join('')}
                            <div class="route-item">
                                <span class="route-label">Naar:</span> ${booking.destination.mainAddress}
                                ${booking.destination.exactAddress ? `<br><span style="font-size: 12px; color: #6b7280;">${booking.destination.exactAddress.businessName || ''} ${booking.destination.exactAddress.city || ''}</span>` : ''}
                            </div>
                        </div>

                        ${booking.isReturn ? `
                        <div class="route-card">
                            <h4>Retour</h4>
                            <div class="route-item">
                                <span class="route-label">Van:</span> ${booking.destination.mainAddress}
                            </div>
                            ${booking.stopovers.slice().reverse().map((stop: Location, index: number) => `
                                <div class="route-item">
                                    <span class="route-label">Stop ${index + 1}:</span> ${stop.mainAddress}
                                </div>
                            `).join('')}
                            <div class="route-item">
                                <span class="route-label">Naar:</span> ${booking.pickup.mainAddress}
                            </div>
                        </div>
                        ` : ''}
                    </div>

                    <div class="section">
                        <h3 class="section-title">Bagage</h3>
                        <div class="luggage-list">${formatLuggage(booking.luggage)}</div>
                    </div>

                    <div class="section">
                        <h3 class="section-title">Contactgegevens</h3>
                        ${booking.bookingForOther ? `
                            <div class="info-row">
                                <span class="info-label">Geboekt door</span>
                                <span class="info-value">${booking.contactInfo?.fullName}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">E-mail</span>
                                <span class="info-value">${booking.contactInfo?.email}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Telefoon</span>
                                <span class="info-value">${booking.contactInfo?.phoneNumber}</span>
                            </div>
                            ${booking.contactInfo?.additionalPhoneNumber ? `
                            <div class="info-row">
                                <span class="info-label">Alternatief Tel.</span>
                                <span class="info-value">${booking.contactInfo.additionalPhoneNumber}</span>
                            </div>
                            ` : ''}
                            <div class="info-row">
                                <span class="info-label">Passagier</span>
                                <span class="info-value">${booking.bookingForOther.fullName}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Passagier Tel.</span>
                                <span class="info-value">${booking.bookingForOther.phoneNumber}</span>
                            </div>
                        ` : `
                            <div class="info-row">
                                <span class="info-label">Naam</span>
                                <span class="info-value">${booking.contactInfo?.fullName}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">E-mail</span>
                                <span class="info-value">${booking.contactInfo?.email}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Telefoon</span>
                                <span class="info-value">${booking.contactInfo?.phoneNumber}</span>
                            </div>
                            ${booking.contactInfo?.additionalPhoneNumber ? `
                            <div class="info-row">
                                <span class="info-label">Alternatief Tel.</span>
                                <span class="info-value">${booking.contactInfo.additionalPhoneNumber}</span>
                            </div>
                            ` : ''}
                        `}
                    </div>

                    ${booking.flightNumber || booking.remarks ? `
                        <div class="section">
                            <h3 class="section-title">Extra Informatie</h3>
                            ${booking.flightNumber ? `
                            <div class="info-row">
                                <span class="info-label">Vluchtnummer</span>
                                <span class="info-value">${booking.flightNumber}</span>
                            </div>
                            ` : ''}
                            ${booking.remarks ? `
                            <div class="info-row">
                                <span class="info-label">Bijzonderheden</span>
                                <span class="info-value">${booking.remarks}</span>
                            </div>
                            ` : ''}
                        </div>
                    ` : ''}

                    <div class="notice-box">
                        <div class="notice-title">Belangrijke Herinneringen</div>
                        <ul class="notice-list">
                            <li>Wees 5 minuten voor ophaaltijd gereed</li>
                            <li>Houd uw telefoon bereikbaar voor contact met de chauffeur</li>
                            <li>Neem 24 uur van tevoren contact op voor wijzigingen</li>
                        </ul>
                    </div>

                    <div class="section">
                        <h3 class="section-title">Hulp Nodig?</h3>
                        <div class="info-row">
                            <span class="info-label">Telefoon</span>
                            <span class="info-value">${process.env.SUPPORT_PHONE || '+1234567890'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">E-mail</span>
                            <span class="info-value">${process.env.SUPPORT_EMAIL || 'support@taxiservice.com'}</span>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <p class="footer-text">Bedankt voor het kiezen van onze taxiservice</p>
                    <p class="footer-contact">© ${new Date().getFullYear()} TaxiRitje. Alle rechten voorbehouden.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

export function createAdminBookingNotificationEmail(booking: BookingData): string {
    const pickupDate = new Date(booking.pickupDateTime).toLocaleString();
    const returnDate = booking.returnDateTime ? new Date(booking.returnDateTime).toLocaleString() : null;
    const formattedPrice = formatCurrency(booking.price);

    // Get vehicle display name
    const getVehicleDisplay = (vehicle: string) => {
        switch (vehicle) {
            case 'sedan': return 'Sedan';
            case 'stationWagon': return 'Station Wagon';
            case 'bus': return 'Minibus';
            default: return vehicle;
        }
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                line-height: 1.5;
                color: #1f2937;
                background-color: #f3f4f6;
                -webkit-font-smoothing: antialiased;
            }

            .email-wrapper {
                width: 100%;
                background-color: #f3f4f6;
                padding: 16px 0;
            }

            .container {
                max-width: 560px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            .header {
                background: linear-gradient(135deg, #0077BE 0%, #005A8D 100%);
                color: #ffffff;
                padding: 24px 20px;
                text-align: center;
            }

            .header h1 {
                font-size: 20px;
                font-weight: 700;
                margin: 0;
                letter-spacing: -0.3px;
            }

            .logo-section {
                background-color: #ffffff;
                padding: 20px;
                text-align: center;
                border-bottom: 1px solid #e5e7eb;
            }

            .logo-section img {
                max-width: 180px;
                height: auto;
                display: inline-block;
            }

            .content {
                padding: 20px;
            }

            .alert-badge {
                background: linear-gradient(135deg, #FFD700 0%, #FFC700 100%);
                color: #1f2937;
                padding: 12px 16px;
                border-radius: 8px;
                text-align: center;
                margin: 0 0 16px 0;
                font-weight: 600;
                font-size: 13px;
            }

            .section {
                background-color: #f9fafb;
                border-radius: 8px;
                padding: 16px;
                margin: 12px 0;
            }

            .section-title {
                color: #0077BE;
                font-size: 13px;
                font-weight: 600;
                margin: 0 0 10px 0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .info-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e5e7eb;
                font-size: 13px;
            }

            .info-row:last-child {
                border-bottom: none;
            }

            .info-label {
                font-weight: 500;
                color: #6b7280;
            }

            .info-value {
                color: #1f2937;
                font-weight: 500;
                text-align: right;
                flex: 1;
                margin-left: 12px;
            }

            .route-info {
                background-color: #ffffff;
                border-left: 3px solid #00A3EE;
                padding: 12px;
                margin: 10px 0;
                border-radius: 4px;
                font-size: 13px;
                color: #374151;
            }

            .route-label {
                font-weight: 600;
                color: #1f2937;
            }

            .footer {
                background-color: #f9fafb;
                text-align: center;
                padding: 16px 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 12px;
                color: #6b7280;
            }

            @media only screen and (max-width: 600px) {
                .container {
                    border-radius: 0;
                }

                .email-wrapper {
                    padding: 0;
                }

                .content {
                    padding: 16px;
                }

                .section {
                    padding: 12px;
                }

                .info-row {
                    flex-direction: column;
                    gap: 2px;
                }

                .info-value {
                    text-align: left;
                    margin-left: 0;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="container">
                <div class="header">
                    <h1>Nieuwe Boeking Ontvangen</h1>
                </div>

                <div class="logo-section">
                    <img src="https://taxiritje.nl/_next/image?url=%2Fimages%2FLogo.png&w=384&q=75" alt="TaxiRitje Logo">
                </div>

                <div class="content">
                    <div class="alert-badge">
                        Boeking ID: ${booking.clientBookingId}
                    </div>

                    <div class="section">
                        <h3 class="section-title">Klantinformatie</h3>
                        <div class="info-row">
                            <span class="info-label">Naam</span>
                            <span class="info-value">${booking.contactInfo?.fullName}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">E-mail</span>
                            <span class="info-value">${booking.contactInfo?.email}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Telefoon</span>
                            <span class="info-value">${booking.contactInfo?.phoneNumber}</span>
                        </div>
                        ${booking.contactInfo?.additionalPhoneNumber ? `
                        <div class="info-row">
                            <span class="info-label">Alternatief Tel.</span>
                            <span class="info-value">${booking.contactInfo.additionalPhoneNumber}</span>
                        </div>
                        ` : ''}
                    </div>

                    ${booking.bookingForOther ? `
                        <div class="section">
                            <h3 class="section-title">Passagiersgegevens</h3>
                            <div class="info-row">
                                <span class="info-label">Naam</span>
                                <span class="info-value">${booking.bookingForOther.fullName}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Telefoon</span>
                                <span class="info-value">${booking.bookingForOther.phoneNumber}</span>
                            </div>
                        </div>
                    ` : ''}

                    <div class="section">
                        <h3 class="section-title">Ritgegevens</h3>
                        <div class="route-info">
                            <span class="route-label">Van:</span> ${booking.pickup.mainAddress}
                        </div>
                        ${booking.stopovers.length > 0 ? booking.stopovers.map((stop: Location, index: number) => `
                            <div class="route-info">
                                <span class="route-label">Stop ${index + 1}:</span> ${stop.mainAddress}
                            </div>
                        `).join('') : ''}
                        <div class="route-info">
                            <span class="route-label">Naar:</span> ${booking.destination.mainAddress}
                        </div>
                    </div>

                    <div class="section">
                        <h3 class="section-title">Boekingsdetails</h3>
                        <div class="info-row">
                            <span class="info-label">Ophaaltijd</span>
                            <span class="info-value">${pickupDate}</span>
                        </div>
                        ${returnDate ? `
                        <div class="info-row">
                            <span class="info-label">Retourtijd</span>
                            <span class="info-value">${returnDate}</span>
                        </div>
                        ` : ''}
                        <div class="info-row">
                            <span class="info-label">Voertuig</span>
                            <span class="info-value">${getVehicleDisplay(booking.vehicle || 'onbekend')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Passagiers</span>
                            <span class="info-value">${booking.passengers}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Prijs</span>
                            <span class="info-value">${formattedPrice} (${booking.isFixedPrice ? 'Vast' : 'Schatting'})</span>
                        </div>
                    </div>

                    ${booking.flightNumber ? `
                        <div class="section">
                            <h3 class="section-title">Vluchtinformatie</h3>
                            <div class="info-row">
                                <span class="info-label">Vluchtnummer</span>
                                <span class="info-value">${booking.flightNumber}</span>
                            </div>
                        </div>
                    ` : ''}

                    ${booking.remarks ? `
                        <div class="section">
                            <h3 class="section-title">Bijzonderheden</h3>
                            <div class="info-row">
                                <span class="info-value">${booking.remarks}</span>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <div class="footer">
                    Gelieve deze boeking snel te verwerken
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}

export function createCancellationRequestEmail(booking: BookingData, reason: string): string {
    const pickupDate = new Date(booking.pickupDateTime).toLocaleString();
    const formattedPrice = formatCurrency(booking.price);

    // Get vehicle display name
    const getVehicleDisplay = (vehicle: string) => {
        switch (vehicle) {
            case 'sedan': return 'Sedan';
            case 'stationWagon': return 'Station Wagon';
            case 'bus': return 'Minibus';
            default: return vehicle;
        }
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                line-height: 1.5;
                color: #1f2937;
                background-color: #f3f4f6;
                -webkit-font-smoothing: antialiased;
            }

            .email-wrapper {
                width: 100%;
                background-color: #f3f4f6;
                padding: 16px 0;
            }

            .container {
                max-width: 560px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            .header {
                background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
                color: #ffffff;
                padding: 24px 20px;
                text-align: center;
            }

            .header h1 {
                font-size: 20px;
                font-weight: 700;
                margin: 0;
                letter-spacing: -0.3px;
            }

            .logo-section {
                background-color: #ffffff;
                padding: 20px;
                text-align: center;
                border-bottom: 1px solid #e5e7eb;
            }

            .logo-section img {
                max-width: 180px;
                height: auto;
                display: inline-block;
            }

            .content {
                padding: 20px;
            }

            .alert-badge {
                background-color: #fef3c7;
                border-left: 3px solid #f59e0b;
                color: #92400e;
                padding: 12px 16px;
                border-radius: 4px;
                margin: 0 0 16px 0;
                font-weight: 500;
                font-size: 13px;
            }

            .section {
                background-color: #f9fafb;
                border-radius: 8px;
                padding: 16px;
                margin: 12px 0;
            }

            .section-title {
                color: #4b5563;
                font-size: 13px;
                font-weight: 600;
                margin: 0 0 10px 0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .info-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e5e7eb;
                font-size: 13px;
            }

            .info-row:last-child {
                border-bottom: none;
            }

            .info-label {
                font-weight: 500;
                color: #6b7280;
            }

            .info-value {
                color: #1f2937;
                font-weight: 500;
                text-align: right;
                flex: 1;
                margin-left: 12px;
            }

            .reason-box {
                background-color: #ffffff;
                border: 1px solid #e5e7eb;
                padding: 12px;
                border-radius: 4px;
                font-size: 13px;
                color: #374151;
            }

            .footer {
                background-color: #f9fafb;
                text-align: center;
                padding: 16px 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 12px;
                color: #6b7280;
            }

            @media only screen and (max-width: 600px) {
                .container {
                    border-radius: 0;
                }

                .email-wrapper {
                    padding: 0;
                }

                .content {
                    padding: 16px;
                }

                .section {
                    padding: 12px;
                }

                .info-row {
                    flex-direction: column;
                    gap: 2px;
                }

                .info-value {
                    text-align: left;
                    margin-left: 0;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="container">
                <div class="header">
                    <h1>Annuleringsverzoek</h1>
                </div>

                <div class="logo-section">
                    <img src="https://taxiritje.nl/_next/image?url=%2Fimages%2FLogo.png&w=384&q=75" alt="TaxiRitje Logo">
                </div>

                <div class="content">
                    <div class="alert-badge">
                        Een klant heeft verzocht om boeking ${booking.clientBookingId} te annuleren
                    </div>

                    <div class="section">
                        <h3 class="section-title">Klantinformatie</h3>
                        <div class="info-row">
                            <span class="info-label">Naam</span>
                            <span class="info-value">${booking.contactInfo?.fullName}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">E-mail</span>
                            <span class="info-value">${booking.contactInfo?.email}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Telefoon</span>
                            <span class="info-value">${booking.contactInfo?.phoneNumber}</span>
                        </div>
                    </div>

                    <div class="section">
                        <h3 class="section-title">Annuleringsreden</h3>
                        <div class="reason-box">${reason}</div>
                    </div>

                    <div class="section">
                        <h3 class="section-title">Boekingsdetails</h3>
                        <div class="info-row">
                            <span class="info-label">Ophaaltijd</span>
                            <span class="info-value">${pickupDate}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Van</span>
                            <span class="info-value">${booking.pickup.mainAddress}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Naar</span>
                            <span class="info-value">${booking.destination.mainAddress}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Voertuig</span>
                            <span class="info-value">${getVehicleDisplay(booking.vehicle || 'onbekend')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Passagiers</span>
                            <span class="info-value">${booking.passengers}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Prijs</span>
                            <span class="info-value">${formattedPrice}</span>
                        </div>
                    </div>

                    ${booking.flightNumber ? `
                        <div class="section">
                            <h3 class="section-title">Vluchtinformatie</h3>
                            <div class="info-row">
                                <span class="info-label">Vluchtnummer</span>
                                <span class="info-value">${booking.flightNumber}</span>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <div class="footer">
                    Gelieve dit annuleringsverzoek te beoordelen en te verwerken
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}