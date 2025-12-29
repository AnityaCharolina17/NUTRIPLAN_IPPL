const http = require('http');

function makeRequest(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
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
  console.log('\n=== TESTING UPDATED KNOWLEDGE BASE ===\n');
  
  // Test 1: Allergen detection
  console.log('Test 1: Allergen detection for tahu, tempe, telur');
  let result = await makeRequest('/api/ai/check-allergen', {
    ingredients: ['tahu', 'tempe', 'telur']
  });
  console.log('Allergens detected:', result.mergedAllergens);
  console.log('');
  
  // Test 2: Menu generation for tahu
  console.log('Test 2: Menu generation for TAHU');
  result = await makeRequest('/api/ai/generate-menu-cbr', {
    baseIngredient: 'tahu'
  });
  if (result.success) {
    console.log(`Found ${result.caseCount} menus for tahu:`);
    result.cases.forEach((menu, i) => {
      console.log(`  ${i+1}. ${menu.menuName} - ${menu.description.substring(0, 60)}...`);
    });
  } else {
    console.log('Error:', result.message);
  }
  console.log('');
  
  // Test 3: Menu generation for tempe
  console.log('Test 3: Menu generation for TEMPE');
  result = await makeRequest('/api/ai/generate-menu-cbr', {
    baseIngredient: 'tempe'
  });
  if (result.success) {
    console.log(`Found ${result.caseCount} menus for tempe:`);
    result.cases.forEach((menu, i) => {
      console.log(`  ${i+1}. ${menu.menuName}`);
    });
  } else {
    console.log('Error:', result.message);
  }
  console.log('');
  
  // Test 4: Menu generation for ikan
  console.log('Test 4: Menu generation for IKAN NILA');
  result = await makeRequest('/api/ai/generate-menu-cbr', {
    baseIngredient: 'ikan nila'
  });
  if (result.success) {
    console.log(`Found ${result.caseCount} menus for ikan nila:`);
    result.cases.forEach((menu, i) => {
      console.log(`  ${i+1}. ${menu.menuName}`);
    });
  } else {
    console.log('Error:', result.message);
  }
  console.log('');
  
  // Test 5: Menu generation for kentang
  console.log('Test 5: Menu generation for KENTANG');
  result = await makeRequest('/api/ai/generate-menu-cbr', {
    baseIngredient: 'kentang'
  });
  if (result.success) {
    console.log(`Found ${result.caseCount} menus for kentang:`);
    result.cases.forEach((menu, i) => {
      console.log(`  ${i+1}. ${menu.menuName}`);
    });
  } else {
    console.log('Error:', result.message);
  }
  console.log('');
}

test().catch(console.error);
