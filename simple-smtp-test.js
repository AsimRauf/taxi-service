const nodemailer = require('nodemailer');

async function testSMTP() {
    console.log('Testing hardcoded SMTP...');
    
    // Try multiple configurations
    const configs = [
        {
            name: 'Port 25',
            host: 'mailout.hostnet.nl',
            port: 25,
            secure: false,
            auth: { user: 'info@taxiritje.nl', pass: 'Host786@!net' }
        },
        {
            name: 'Port 2525',
            host: 'mailout.hostnet.nl', 
            port: 2525,
            secure: false,
            auth: { user: 'info@taxiritje.nl', pass: 'Host786@!net' }
        },
        {
            name: 'Gmail SMTP',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: { user: 'info@taxiritje.nl', pass: 'Host786@!net' }
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