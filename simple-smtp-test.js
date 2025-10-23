require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSMTP() {
    console.log('Testing SMTP from environment variables...');
    
    if (!process.env.SMTP_PASSWORD) {
        console.error('❌ SMTP_PASSWORD not found in .env file');
        process.exit(1);
    }
    
    // Try multiple configurations using env variables
    const configs = [
        {
            name: 'Port 25',
            host: process.env.SMTP_HOST || 'mailout.hostnet.nl',
            port: 25,
            secure: false,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        },
        {
            name: 'Port 2525',
            host: process.env.SMTP_HOST || 'mailout.hostnet.nl', 
            port: 2525,
            secure: false,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        },
        {
            name: 'Gmail SMTP',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        }
    ];

    for (const config of configs) {
        console.log(`\nTrying ${config.name}...`);
        const transporter = nodemailer.createTransport({
            ...config,
            connectionTimeout: 3000,
            greetingTimeout: 2000,
            socketTimeout: 3000,
        });

        try {
            console.log('Verifying connection...');
            await transporter.verify();
            console.log('✅ Connection verified!');

            console.log('Sending test email...');
            const info = await transporter.sendMail({
                from: 'info@taxiritje.nl',
                to: 'info@taxiritje.nl',
                subject: 'Test Email',
                text: 'This is a test email.',
            });

            console.log('✅ Email sent!', info.messageId);
            return; // Exit on success
        } catch (error) {
            console.error('❌ Error:', error.message);
            console.error('Code:', error.code);
        }
    }
}

testSMTP();