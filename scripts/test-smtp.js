const nodemailer = require('nodemailer');
require('dotenv').config();

async function testSMTP() {
    console.log('Testing SMTP configuration...');
    console.log('Host:', process.env.SMTP_HOST);
    console.log('Port:', process.env.SMTP_PORT);
    console.log('User:', process.env.SMTP_USER);
    console.log('Password:', process.env.SMTP_PASSWORD ? '***' : 'Not set');

    // Try different configurations
    const configs = [
        {
            name: "Hostnet Simple Config",
            config: {
                host: process.env.SMTP_HOST,
                port: 587,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                },
                connectionTimeout: 10000,
                greetingTimeout: 5000,
                socketTimeout: 10000,
            }
        },
        {
            name: "Port 587 with STARTTLS",
            config: {
                host: process.env.SMTP_HOST,
                port: 587,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                },
                tls: {
                    rejectUnauthorized: false
                },
                requireTLS: true,
                connectionTimeout: 10000,
                greetingTimeout: 5000,
                socketTimeout: 10000,
            }
        },
        {
            name: "Port 465 with SSL",
            config: {
                host: process.env.SMTP_HOST,
                port: 465,
                secure: true,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                },
                tls: {
                    rejectUnauthorized: false
                }
            }
        },
        {
            name: "Port 25 plain",
            config: {
                host: process.env.SMTP_HOST,
                port: 25,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                }
            }
        }
    ];

    for (const {name, config} of configs) {
        console.log(`\n--- Testing ${name} ---`);
        const transporter = nodemailer.createTransport(config);

        try {
            console.log('Verifying SMTP connection...');
            await transporter.verify();
            console.log('✅ SMTP connection verified successfully!');

            console.log('Sending test email...');
            const info = await transporter.sendMail({
                from: `"Taxi Ritje Test" <${process.env.SMTP_USER}>`,
                to: process.env.SMTP_USER,
                subject: 'SMTP Test Email',
                text: 'This is a test email to verify SMTP configuration.',
                html: '<p>This is a test email to verify SMTP configuration.</p>'
            });

            console.log('✅ Test email sent successfully!');
            console.log('Message ID:', info.messageId);
            break; // Exit loop on success
            
        } catch (error) {
            console.error('❌ SMTP test failed:', error.message);
            if (error.code) {
                console.error('Error code:', error.code);
            }
            if (error.response) {
                console.error('Server response:', error.response);
            }
        }
    }
}

testSMTP();