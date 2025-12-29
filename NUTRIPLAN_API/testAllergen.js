const http = require('http');

function makeRequest(ingredients) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ ingredients });
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/check-allergen',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch(e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function test() {
  console.log('\n=== Testing Allergen Detection ===\n');
  
  console.log('Test 1: udang + tempe');
  let result = await makeRequest(['udang', 'tempe']);
  console.log('Result:', JSON.stringify(result, null, 2));
  console.log('');
  
  console.log('Test 2: ayam (no allergen)');
  result = await makeRequest(['ayam']);
  console.log('Result:', JSON.stringify(result, null, 2));
  console.log('');
  
  console.log('Test 3: tahu (soy)');
  result = await makeRequest(['tahu']);
  console.log('Result:', JSON.stringify(result, null, 2));
  console.log('');
}

test().catch(console.error);
