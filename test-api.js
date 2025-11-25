const http = require('http');

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    const username = 'testadmin_' + Date.now();
    const password = 'password123';
    let token;
    let requestId;

    console.log('--- Starting API Tests ---');

    // 1. Register
    console.log(`\n1. Registering user: ${username}`);
    const regRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { username, password });
    console.log('Status:', regRes.status);
    console.log('Body:', regRes.body);

    // 2. Login
    console.log(`\n2. Logging in`);
    const loginRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { username, password });
    console.log('Status:', loginRes.status);
    if (loginRes.status === 200) {
        token = loginRes.body.token;
        console.log('Token received');
    } else {
        console.error('Login failed');
        return;
    }

    // 3. Submit Contact Request
    console.log(`\n3. Submitting Contact Request`);
    const contactRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/contact',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        message: 'This is a test message',
        service: 'consulting'
    });
    console.log('Status:', contactRes.status);
    console.log('Body:', contactRes.body);
    if (contactRes.status === 201) {
        requestId = contactRes.body.id;
    }

    // 4. Fetch Requests
    console.log(`\n4. Fetching Requests (Authenticated)`);
    const fetchRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: '/api/contact',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    console.log('Status:', fetchRes.status);
    console.log('Requests count:', Array.isArray(fetchRes.body) ? fetchRes.body.length : 'Not an array');

    // 5. Delete Request
    if (requestId) {
        console.log(`\n5. Deleting Request: ${requestId}`);
        const deleteRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: `/api/contact/${requestId}`,
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Status:', deleteRes.status);
        console.log('Body:', deleteRes.body);
    }

    console.log('\n--- Tests Completed ---');
}

runTests().catch(console.error);
