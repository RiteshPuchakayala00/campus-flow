async function test() {
    try {
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'faculty_john',
                password: 'password123'
            })
        });

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Logged in. Token:', token.substring(0, 10) + '...');

        const headers = { 'x-auth-token': token };

        const endpoints = [
            '/api/venues',
            '/api/bookings',
            '/api/notifications',
            '/api/bookings/approved'
        ];

        for (const ep of endpoints) {
            try {
                const res = await fetch(`http://localhost:5000${ep}`, { headers });

                if (!res.ok) {
                    const text = await res.text();
                    console.log(`[ERROR] ${ep} - Status: ${res.status} - Message: ${text}`);
                } else {
                    const data = await res.json();
                    console.log(`[SUCCESS] ${ep} - Status: ${res.status}, Data size: ${Array.isArray(data) ? data.length : 'Object'}`);
                }
            } catch (err) {
                console.log(`[NETWORK ERROR] ${ep} - ${err.message}`);
            }
        }
    } catch (err) {
        console.error('Test failed:', err.message);
    }
}

test();
