#!/usr/bin/env node

/**
 * INGREDIENT VALIDATION API - COMPREHENSIVE TEST SUITE
 * 
 * Tests all ingredient validation endpoints with real examples
 * Run: node TEST_INGREDIENT_VALIDATION.js
 * 
 * Prerequisites:
 * - Backend server running on localhost:5000
 * - Knowledge base seeded (48 ingredients)
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000/api/ai';
const TESTS = [];

/**
 * Make HTTP request
 */
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

/**
 * Register test
 */
function test(name, fn) {
  TESTS.push({ name, fn });
}

/**
 * Assert helper
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// ============================================================================
// TEST CASES
// ============================================================================

test('TEST 1: Validate single valid ingredient (tahu)', async () => {
  const response = await makeRequest(
    'POST',
    '/validate-ingredient',
    { foodName: 'tahu' }
  );

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.valid === true, 'Expected valid: true');
  assert(response.body.ingredient.name === 'tahu', 'Expected ingredient name: tahu');
  assert(Array.isArray(response.body.ingredient.allergens), 'Expected allergens array');
  assert(response.body.ingredient.allergens.length > 0, 'Expected allergens for tahu');

  console.log('✅ PASS: Ingredient found with allergen details');
  console.log(`   Name: ${response.body.ingredient.name}`);
  console.log(`   Category: ${response.body.ingredient.category}`);
  console.log(`   Allergens: ${response.body.ingredient.allergens.map(a => a.allergenName).join(', ')}`);
});

test('TEST 2: Validate single invalid ingredient (mobil)', async () => {
  const response = await makeRequest(
    'POST',
    '/validate-ingredient',
    { foodName: 'mobil' }
  );

  assert(response.status === 400, `Expected 400, got ${response.status}`);
  assert(response.body.valid === false, 'Expected valid: false');
  assert(response.body.error === 'INGREDIENT_NOT_FOUND', `Expected error INGREDIENT_NOT_FOUND, got ${response.body.error}`);
  assert(response.body.message.includes('mobil'), 'Expected error message to mention "mobil"');

  console.log('✅ PASS: Invalid ingredient explicitly rejected');
  console.log(`   Error: ${response.body.error}`);
  console.log(`   Message: ${response.body.message}`);
});

test('TEST 3: Validate by synonym (tofu → tahu)', async () => {
  const response = await makeRequest(
    'POST',
    '/validate-ingredient',
    { foodName: 'tofu' }
  );

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.valid === true, 'Expected valid: true');
  assert(response.body.ingredient.name === 'tahu', 'Expected synonym to resolve to "tahu"');

  console.log('✅ PASS: Synonym matching works');
  console.log(`   Input: "tofu" → Resolved to: "${response.body.ingredient.name}"`);
});

test('TEST 4: Batch validation with mixed valid/invalid', async () => {
  const foodNames = ['ayam', 'tahu', 'nasi putih', 'invalid_food_xyz', 'telur'];

  const response = await makeRequest(
    'POST',
    '/validate-ingredients-batch',
    { foodNames }
  );

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(Array.isArray(response.body.validations), 'Expected validations array');
  assert(response.body.validations.length === 5, `Expected 5 validations, got ${response.body.validations.length}`);
  
  const summary = response.body.summary;
  assert(summary.total === 5, `Expected total 5, got ${summary.total}`);
  assert(summary.valid === 4, `Expected 4 valid, got ${summary.valid}`);
  assert(summary.invalid === 1, `Expected 1 invalid, got ${summary.invalid}`);
  assert(summary.validationPercentage === 80, `Expected 80%, got ${summary.validationPercentage}%`);

  console.log('✅ PASS: Batch validation works with summary');
  console.log(`   Total: ${summary.total}`);
  console.log(`   Valid: ${summary.valid}`);
  console.log(`   Invalid: ${summary.invalid}`);
  console.log(`   Validation Rate: ${summary.validationPercentage}%`);
  console.log(`   Details:`);
  response.body.validations.forEach(v => {
    if (v.valid) {
      console.log(`     ✅ ${v.foodName} (${v.ingredient.category})`);
    } else {
      console.log(`     ❌ ${v.foodName} (${v.error})`);
    }
  });
});

test('TEST 5: Empty input rejection', async () => {
  const response = await makeRequest(
    'POST',
    '/validate-ingredient',
    { foodName: '' }
  );

  assert(response.status === 400, `Expected 400, got ${response.status}`);
  assert(response.body.valid === false, 'Expected valid: false');
  assert(response.body.error === 'EMPTY_INPUT', `Expected error EMPTY_INPUT, got ${response.body.error}`);

  console.log('✅ PASS: Empty input rejected');
  console.log(`   Error: ${response.body.error}`);
});

test('TEST 6: Whitespace-only input rejection', async () => {
  const response = await makeRequest(
    'POST',
    '/validate-ingredient',
    { foodName: '   ' }
  );

  assert(response.status === 400, `Expected 400, got ${response.status}`);
  assert(response.body.error === 'EMPTY_INPUT', 'Expected EMPTY_INPUT error');

  console.log('✅ PASS: Whitespace-only input rejected');
});

test('TEST 7: Null input rejection', async () => {
  const response = await makeRequest(
    'POST',
    '/validate-ingredient',
    { foodName: null }
  );

  assert(response.status === 400, `Expected 400, got ${response.status}`);
  assert(response.body.error === 'INVALID_INPUT', 'Expected INVALID_INPUT error');

  console.log('✅ PASS: Null input rejected');
});

test('TEST 8: Get all available ingredients', async () => {
  const response = await makeRequest('GET', '/ingredients');

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success === true, 'Expected success: true');
  assert(response.body.count === 48, `Expected 48 ingredients, got ${response.body.count}`);
  assert(Array.isArray(response.body.ingredients), 'Expected ingredients array');
  assert(Object.keys(response.body.categories).length > 0, 'Expected categories');

  console.log('✅ PASS: All ingredients retrieved');
  console.log(`   Total Ingredients: ${response.body.count}`);
  console.log(`   Categories:`);
  Object.entries(response.body.categories).forEach(([cat, count]) => {
    console.log(`     ${cat}: ${count}`);
  });
});

test('TEST 9: Search ingredients by keyword (nasi)', async () => {
  const response = await makeRequest('GET', '/ingredients/search?keyword=nasi&limit=10');

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success === true, 'Expected success: true');
  assert(response.body.keyword === 'nasi', 'Expected keyword: nasi');
  assert(Array.isArray(response.body.results), 'Expected results array');
  assert(response.body.count > 0, 'Expected to find items with "nasi"');

  console.log('✅ PASS: Keyword search works');
  console.log(`   Keyword: ${response.body.keyword}`);
  console.log(`   Results Found: ${response.body.count}`);
  console.log(`   Matches:`);
  response.body.results.forEach(ing => {
    console.log(`     - ${ing.name} (${ing.category})`);
  });
});

test('TEST 10: Search with custom limit', async () => {
  const response = await makeRequest('GET', '/ingredients/search?keyword=a&limit=5');

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.results.length <= 5, `Expected max 5 results, got ${response.body.results.length}`);

  console.log('✅ PASS: Search limit respected');
  console.log(`   Results: ${response.body.results.length} (max 5)`);
});

test('TEST 11: Ingredient with multiple allergens', async () => {
  const response = await makeRequest(
    'POST',
    '/validate-ingredient',
    { foodName: 'roti' }
  );

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.valid === true, 'Expected valid: true');
  assert(response.body.ingredient.allergens.length > 0, 'Expected allergens for roti');

  console.log('✅ PASS: Allergen mapping retrieved');
  console.log(`   Ingredient: ${response.body.ingredient.name}`);
  console.log(`   Allergens: ${response.body.ingredient.allergens.map(a => a.allergenName).join(', ')}`);
});

test('TEST 12: Ingredient with no allergens', async () => {
  const response = await makeRequest(
    'POST',
    '/validate-ingredient',
    { foodName: 'brokoli' }
  );

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.valid === true, 'Expected valid: true');
  assert(Array.isArray(response.body.ingredient.allergens), 'Expected allergens array');

  console.log('✅ PASS: Allergen-free ingredient handled');
  console.log(`   Ingredient: ${response.body.ingredient.name}`);
  console.log(`   Allergens: ${response.body.ingredient.allergens.length === 0 ? 'None' : response.body.ingredient.allergens.map(a => a.allergenName).join(', ')}`);
});

test('TEST 13: Case-insensitive matching (TAHU)', async () => {
  const response = await makeRequest(
    'POST',
    '/validate-ingredient',
    { foodName: 'TAHU' }
  );

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.valid === true, 'Expected valid: true');
  assert(response.body.ingredient.name === 'tahu', 'Expected normalized name');

  console.log('✅ PASS: Case-insensitive matching works');
  console.log(`   Input: "TAHU" → Matched: "${response.body.ingredient.name}"`);
});

test('TEST 14: Batch with empty array error', async () => {
  const response = await makeRequest(
    'POST',
    '/validate-ingredients-batch',
    { foodNames: [] }
  );

  assert(response.status === 400, `Expected 400, got ${response.status}`);
  assert(response.body.error === 'INVALID_INPUT', 'Expected INVALID_INPUT error');

  console.log('✅ PASS: Empty batch array rejected');
});

test('TEST 15: Real-world menu composition validation', async () => {
  const menuIngredients = ['ayam', 'nasi putih', 'brokoli', 'minyak sayur'];

  const response = await makeRequest(
    'POST',
    '/validate-ingredients-batch',
    { foodNames: menuIngredients }
  );

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.summary.valid === 4, 'Expected all 4 ingredients valid');
  assert(response.body.summary.validationPercentage === 100, 'Expected 100% validation');

  console.log('✅ PASS: Complete menu composition valid');
  console.log(`   Menu: ${menuIngredients.join(' + ')}`);
  console.log(`   All ingredients valid ✅`);
  
  // Collect all allergens
  const allergens = new Set();
  response.body.validations.forEach(v => {
    if (v.valid) {
      v.ingredient.allergens.forEach(a => allergens.add(a));
    }
  });
  console.log(`   Combined allergens: ${allergens.size === 0 ? 'None' : Array.from(allergens).join(', ')}`);
});

// ============================================================================
// RUN ALL TESTS
// ============================================================================

async function runAllTests() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 INGREDIENT VALIDATION API - TEST SUITE');
  console.log('='.repeat(80) + '\n');

  let passed = 0;
  let failed = 0;

  for (const { name, fn } of TESTS) {
    console.log(`\n${name}`);
    console.log('-'.repeat(80));

    try {
      await fn();
      passed++;
    } catch (error) {
      console.error(`❌ FAIL: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`📊 TEST RESULTS: ${passed} passed, ${failed} failed out of ${TESTS.length} total`);
  console.log('='.repeat(80) + '\n');

  if (failed === 0) {
    console.log('🎉 All tests passed! ✅\n');
    process.exit(0);
  } else {
    console.log(`❌ ${failed} test(s) failed\n`);
    process.exit(1);
  }
}

// Catch unhandled errors
process.on('unhandledRejection', (reason) => {
  console.error('\n❌ Unhandled Error:', reason);
  process.exit(1);
});

// Start tests
runAllTests().catch((error) => {
  console.error('\n💥 Fatal Error:', error);
  process.exit(1);
});
