const axios = require('axios');

async function verifyApi() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@example.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Login successful. Token acquired.');

        // 2. Fetch Elections
        console.log('Fetching /api/elections...');
        const res = await axios.get('http://localhost:5000/api/elections', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Status:', res.status);
        console.log('Type of data:', typeof res.data);
        console.log('Is Array?', Array.isArray(res.data));
        console.log('Data Preview:', JSON.stringify(res.data).slice(0, 200));

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

verifyApi();
