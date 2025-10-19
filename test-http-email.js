// Test using HTTP-based email service instead of SMTP
const https = require('https');

// Try using a service like EmailJS or similar HTTP-based email API
// This bypasses SMTP port blocking

async function testHttpEmail() {
    console.log('Testing HTTP-based email alternatives...');
    
    // Check if we can reach external services
    const testUrls = [
        'https://api.emailjs.com',
        'https://api.sendgrid.com',
        'https://api.mailgun.net'
    ];
    
    for (const url of testUrls) {
        try {
            console.log(`Testing connection to ${url}...`);
            await new Promise((resolve, reject) => {
                const req = https.get(url, (res) => {
                    console.log(`✅ ${url} - Status: ${res.statusCode}`);
                    resolve();
                });
                req.on('error', reject);
                req.setTimeout(3000, () => reject(new Error('Timeout')));
            });
        } catch (error) {
            console.log(`❌ ${url} - Error: ${error.message}`);
        }
    }
}

testHttpEmail();