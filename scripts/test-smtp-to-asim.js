const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendTestEmail() {
    console.log('=== SMTP Test Email to asimraufbuzz@gmail.com ===\n');
    console.log('SMTP Configuration:');
    console.log('Host:', process.env.SMTP_HOST);
    console.log('Port:', process.env.SMTP_PORT);
    console.log('User:', process.env.SMTP_USER);
    console.log('Password:', process.env.SMTP_PASSWORD ? '***' : 'Not set');
    console.log('\n');

    const configs = [
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
                requireTLS: true
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
            name: "Port 587 Basic",
            config: {
                host: process.env.SMTP_HOST,
                port: 587,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                }
            }
        }
    ];

    for (const {name, config} of configs) {
        console.log(`\n--- Trying ${name} ---`);
        const transporter = nodemailer.createTransport(config);

        try {
            console.log('Verifying SMTP connection...');
            await transporter.verify();
            console.log('✅ SMTP connection verified successfully!\n');

            console.log('Sending test email to asimraufbuzz@gmail.com...');
            const info = await transporter.sendMail({
                from: `"Taxi Ritje - SMTP Test" <${process.env.SMTP_USER}>`,
                to: 'asimraufbuzz@gmail.com',
                subject: 'SMTP Test Email from Taxi Ritje',
                text: 'This is a test email to verify SMTP configuration is working correctly.',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
                        <h2 style="color: #333;">SMTP Test Email</h2>
                        <p>This is a test email from Taxi Ritje to verify the SMTP configuration.</p>
                        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p><strong>SMTP Server:</strong> ${process.env.SMTP_HOST}</p>
                            <p><strong>Port:</strong> ${config.port}</p>
                            <p><strong>From:</strong> ${process.env.SMTP_USER}</p>
                            <p><strong>Config:</strong> ${name}</p>
                        </div>
                        <p style="color: #28a745; font-weight: bold;">✅ If you received this email, your SMTP configuration is working correctly!</p>
                    </div>
                `
            });

            console.log('✅ Test email sent successfully!');
            console.log('Message ID:', info.messageId);
            console.log('\nCheck asimraufbuzz@gmail.com inbox for the test email.');
            return;
            
        } catch (error) {
            console.error('❌ Failed:', error.message);
            if (error.code) {
                console.error('Error code:', error.code);
            }
        }
    }
    
    console.error('\n❌ All configurations failed. Please verify SMTP credentials.');
    process.exit(1);
}

sendTestEmail();
