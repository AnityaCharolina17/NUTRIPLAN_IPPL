#!/usr/bin/env node

/**
 * CASE-BASED REASONING (CBR) API - TEST SUITE
 * 
 * Tests the menu generation endpoints using Case-Based Reasoning
 * Run: node TEST_CBR_MENU_GENERATION.js
 * 
 * Prerequisites:
 * - Backend server running on localhost:5000
 * - Knowledge base seeded (6 menu cases)
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

test('TEST 1: Generate menu for ayam (3 cases)', async () => {
  const response = await makeRequest(
    'POST',
    '/generate-menu',
    { foodName: 'ayam' }
  );

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success === true, 'Expected success: true');
  assert(response.body.baseIngredient.name === 'ayam', 'Expected ingredient: ayam');
  assert(Array.isArray(response.body.cases), 'Expected cases array');
  assert(response.body.caseCount === 3, `Expected 3 cases, got ${response.body.caseCount}`);
  assert(response.body.cases.length === 3, 'Cases array length should be 3');

  // Verify case data structure
  response.body.cases.forEach((c) => {
    assert(c.id, 'Case should have id');
    assert(c.menuName, 'Case should have menuName');
    assert(typeof c.calories === 'number', 'Case should have calories');
  });

  console.log('✅ PASS: 3 menu cases retrieved for ayam');
  console.log(`   Cases:`);
  response.body.cases.forEach((c) => {
    console.log(
      `     - ${c.menuName} (${c.calories} cal, ${c.protein}, ${c.carbs}, ${c.fat})`
    );
  });
});

test('TEST 2: Generate menu for ikan nila (1 case)', async () => {
  const response = await makeRequest(
    'POST',
    '/generate-menu',
    { foodName: 'ikan nila' }
  );

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success === true, 'Expected success: true');
  assert(response.body.caseCount === 1, `Expected 1 case, got ${response.body.caseCount}`);
  assert(response.body.cases.length === 1, 'Cases array length should be 1');
  assert(response.body.cases[0].menuName === 'Ikan Goreng Kecap', 'Expected Ikan Goreng Kecap');

  console.log('✅ PASS: 1 menu case retrieved for ikan nila');
  console.log(`   Menu: ${response.body.cases[0].menuName}`);
});

test('TEST 3: Generate menu for ingredient with no cases (brokoli)', async () => {
  const response = await makeRequest(
    'POST',
    '/generate-menu',
    { foodName: 'brokoli' }
  );

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success === true, 'Expected success: true');
  assert(response.body.caseCount === 0, `Expected 0 cases, got ${response.body.caseCount}`);
  assert(response.body.cases.length === 0, 'Cases array should be empty');
  assert(response.body.message.includes('Tidak ada menu'), 'Expected "no menu available" message');

  console.log('✅ PASS: Empty cases for ingredient without menus');
  console.log(`   Message: ${response.body.message}`);
});

test('TEST 4: Invalid ingredient (mobil) - explicit rejection', async () => {
  const response = await makeRequest(
    'POST',
    '/generate-menu',
    { foodName: 'mobil' }
  );

  assert(response.status === 400, `Expected 400, got ${response.status}`);
  assert(response.body.success === false, 'Expected success: false');
  assert(response.body.error === 'INGREDIENT_NOT_FOUND', `Expected INGREDIENT_NOT_FOUND, got ${response.body.error}`);
  assert(response.body.message.includes('mobil'), 'Error message should mention the ingredient');

  console.log('✅ PASS: Invalid ingredient explicitly rejected');
  console.log(`   Error: ${response.body.error}`);
  console.log(`   Message: ${response.body.message}`);
});

test('TEST 5: Synonym resolution (potongan ayam → ayam)', async () => {
  const response = await makeRequest(
    'POST',
    '/generate-menu',
    { foodName: 'potongan ayam' }
  );

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success === true, 'Expected success: true');
  assert(response.body.baseIngredient.name === 'ayam', 'Should resolve synonym to ayam');
  assert(response.body.caseCount > 0, 'Should have cases after synonym resolution');

  console.log('✅ PASS: Synonym resolved correctly');
  console.log(`   Input: "potongan ayam" → Resolved to: "${response.body.baseIngredient.name}"`);
});

test('TEST 6: Case-insensitive matching (AYAM)', async () => {
  const response = await makeRequest(
    'POST',
    '/generate-menu',
    { foodName: 'AYAM' }
  );

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success === true, 'Expected success: true');
  assert(response.body.baseIngredient.name === 'ayam', 'Should normalize to lowercase');
  assert(response.body.caseCount === 3, `Expected 3 cases, got ${response.body.caseCount}`);

  console.log('✅ PASS: Case-insensitive matching works');
  console.log(`   Input: "AYAM" → Matched: "${response.body.baseIngredient.name}"`);
});

test('TEST 7: Empty input rejection', async () => {
  const response = await makeRequest(
    'POST',
    '/generate-menu',
    { foodName: '' }
  );

  assert(response.status === 400, `Expected 400, got ${response.status}`);
  assert(response.body.success === false, 'Expected success: false');
  assert(response.body.error === 'EMPTY_INPUT', `Expected EMPTY_INPUT, got ${response.body.error}`);

  console.log('✅ PASS: Empty input rejected');
});

test('TEST 8: Whitespace-only input rejection', async () => {
  const response = await makeRequest(
    'POST',
    '/generate-menu',
    { foodName: '   ' }
  );

  assert(response.status === 400, `Expected 400, got ${response.status}`);
  assert(response.body.error === 'EMPTY_INPUT', 'Expected EMPTY_INPUT error');

  console.log('✅ PASS: Whitespace-only input rejected');
});

test('TEST 9: Null input rejection', async () => {
  const response = await makeRequest(
    'POST',
    '/generate-menu',
    { foodName: null }
  );

  assert(response.status === 400, `Expected 400, got ${response.status}`);
  assert(response.body.error === 'INVALID_INPUT', 'Expected INVALID_INPUT error');

  console.log('✅ PASS: Null input rejected');
});

test('TEST 10: Get all MenuCase records', async () => {
  const response = await makeRequest('GET', '/cbr/cases');

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success === true, 'Expected success: true');
  assert(response.body.totalCases === 6, `Expected 6 total cases, got ${response.body.totalCases}`);
  assert(response.body.ingredientCount === 4, `Expected 4 ingredients, got ${response.body.ingredientCount}`);
  assert(typeof response.body.grouped === 'object', 'Expected grouped object');

  console.log('✅ PASS: All menu cases retrieved');
  console.log(`   Total Cases: ${response.body.totalCases}`);
  console.log(`   Ingredients: ${response.body.ingredientCount}`);
  console.log(`   Ingredients with cases:`);
  Object.entries(response.body.grouped).forEach(([ing, data]) => {
    console.log(`     - ${ing}: ${data.cases.length} case(s)`);
  });
});

test('TEST 11: Get CBR statistics', async () => {
  const response = await makeRequest('GET', '/cbr/statistics');

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success === true, 'Expected success: true');
  assert(response.body.totalCases === 6, `Expected 6 total cases, got ${response.body.totalCases}`);
  assert(response.body.ingredientCount === 4, `Expected 4 ingredients, got ${response.body.ingredientCount}`);
  assert(typeof response.body.categoryDistribution === 'object', 'Expected categoryDistribution object');
  assert(Array.isArray(response.body.ingredientsWithCases), 'Expected ingredientsWithCases array');

  console.log('✅ PASS: CBR statistics retrieved');
  console.log(`   Total Cases: ${response.body.totalCases}`);
  console.log(`   Max Cases Per Ingredient: ${response.body.maxCasesPerIngredient}`);
  console.log(`   Category Distribution:`);
  Object.entries(response.body.categoryDistribution).forEach(([cat, count]) => {
    console.log(`     ${cat}: ${count}`);
  });
});

test('TEST 12: Daging sapi generates 1 case (Rendang)', async () => {
  const response = await makeRequest(
    'POST',
    '/generate-menu',
    { foodName: 'daging sapi' }
  );

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success === true, 'Expected success: true');
  assert(response.body.caseCount === 1, `Expected 1 case, got ${response.body.caseCount}`);
  assert(response.body.cases[0].menuName === 'Rendang Sapi', 'Expected Rendang Sapi');

  console.log('✅ PASS: Daging sapi menu retrieved');
  console.log(`   Menu: ${response.body.cases[0].menuName} (${response.body.cases[0].calories} cal)`);
});

test('TEST 13: Ikan tongkol generates 1 case (Balado)', async () => {
  const response = await makeRequest(
    'POST',
    '/generate-menu',
    { foodName: 'ikan tongkol' }
  );

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success === true, 'Expected success: true');
  assert(response.body.caseCount === 1, `Expected 1 case, got ${response.body.caseCount}`);
  assert(response.body.cases[0].menuName === 'Tongkol Balado', 'Expected Tongkol Balado');

  console.log('✅ PASS: Ikan tongkol menu retrieved');
  console.log(`   Menu: ${response.body.cases[0].menuName}`);
});

test('TEST 14: Verify no menu invention', async () => {
  // Get all cases
  const allCases = await makeRequest('GET', '/cbr/cases');
  const storedMenuNames = new Set();
  
  Object.values(allCases.body.grouped).forEach((group) => {
    group.cases.forEach((c) => {
      storedMenuNames.add(c.menuName.toLowerCase());
    });
  });

  // Generate menu for ayam
  const generated = await makeRequest(
    'POST',
    '/generate-menu',
    { foodName: 'ayam' }
  );

  // Verify all generated menus are in stored menus
  generated.body.cases.forEach((c) => {
    const menuExists = storedMenuNames.has(c.menuName.toLowerCase());
    assert(menuExists, `Menu "${c.menuName}" should exist in MenuCase table`);
  });

  console.log('✅ PASS: All generated menus come from MenuCase table (no invention)');
  console.log(`   Generated menus verified against ${storedMenuNames.size} stored cases`);
});

test('TEST 15: Nutrition data completeness', async () => {
  const response = await makeRequest(
    'POST',
    '/generate-menu',
    { foodName: 'ayam' }
  );

  response.body.cases.forEach((c) => {
    assert(c.menuName, `Menu should have name`);
    assert(typeof c.calories === 'number', `Menu should have numeric calories`);
    assert(c.protein, `Menu should have protein`);
    assert(c.carbs, `Menu should have carbs`);
    assert(c.fat, `Menu should have fat`);
  });

  console.log('✅ PASS: All menu cases have complete nutrition data');
  console.log(`   Sample: ${response.body.cases[0].menuName}`);
  console.log(`   Calories: ${response.body.cases[0].calories}`);
  console.log(`   Protein: ${response.body.cases[0].protein}, Carbs: ${response.body.cases[0].carbs}, Fat: ${response.body.cases[0].fat}`);
});

// ============================================================================
// RUN ALL TESTS
// ============================================================================

async function runAllTests() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 CASE-BASED REASONING (CBR) - TEST SUITE');
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
