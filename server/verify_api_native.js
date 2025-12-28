const http = require('http');
const fs = require('fs');

const postData = JSON.stringify({
    email: 'admin@example.com',
    password: 'password123'
});

const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
    },
};

const req = http.request(loginOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        if (res.statusCode !== 200) {
            fs.writeFileSync('response_body.txt', 'Login Failed: ' + res.statusCode);
            return;
        }
        const token = JSON.parse(data).token;

        const listOptions = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/elections',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache'
            },
        };

        const reqList = http.request(listOptions, (resList) => {
            let listData = '';
            resList.on('data', (chunk) => { listData += chunk; });
            resList.on('end', () => {
                // Write raw data to file
                fs.writeFileSync('response_body.json', listData);
                console.log('Written to response_body.json');
            });
        });
        reqList.end();
    });
});

req.write(postData);
req.end();
