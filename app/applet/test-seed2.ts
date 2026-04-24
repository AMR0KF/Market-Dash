import http from 'http';

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/dev/seed',
  method: 'POST',
}, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', data);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
