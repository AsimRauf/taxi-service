require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSMTPWithTLS() {
    console.log('Testing SMTP with TLS enabled...');

    if (!process.env.SMTP_PASSWORD) {
        console.error('❌ SMTP_PASSWORD not found in .env file');
        process.exit(1);
    }

    // SMTP credentials from environment variables
    const smtpConfig = {
        host: process.env.SMTP_HOST || 'smtp.hostnet.nl',
        port: Number(process.env.SMTP_PORT) || 587, // Use 587 for STARTTLS (TLS enabled)
        secure: false, // false for STARTTLS, true for SMTPS (port 465)
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        },
        tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false // Allow self-signed certificates if needed
        }
    };

    const transporter = nodemailer.createTransport(smtpConfig);

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection verified!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: 'info@taxiritje.nl',
            to: 'asimraufbuzz@gmail.com',
            subject: 'SMTP TLS Test Email',
            text: 'This is a test email to verify SMTP with TLS is working.',
        });

        console.log('✅ Email sent successfully!', info.messageId);
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
    }
}

testSMTPWithTLS();
