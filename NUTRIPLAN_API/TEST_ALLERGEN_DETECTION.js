#!/usr/bin/env node

/**
 * ALLERGEN DETECTION API - TEST SUITE
 * 
 * Tests semantic rule-based allergen detection using IngredientAllergen mappings.
 * Run: node TEST_ALLERGEN_DETECTION.js
 * 
 * Prerequisites:
 * - Backend server running on localhost:5000
 * - Knowledge base seeded (8 allergens, 18 ingredient-allergen mappings)
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

test('TEST 1: Detect allergen in single ingredient (tahu → soy)', async () => {
  const response = await makeRequest('POST', '/check-allergen', {
    ingredients: ['tahu'],
  });

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success === true, 'Expected success: true');
  assert(response.body.mergedAllergens.includes('soy'), 'Expected soy allergen');
  assert(response.body.uniqueAllergenCount === 1, `Expected 1 allergen, got ${response.body.uniqueAllergenCount}`);

  console.log('✅ PASS: Allergen detected for tahu');
  console.log(`   Allergens: ${response.body.mergedAllergens.join(', ')}`);
});

test('TEST 2: Detect allergen in egg (telur → egg)', async () => {
  const response = await makeRequest('POST', '/check-allergen', {
    ingredients: ['telur'],
  });

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success === true, 'Expected success: true');
  assert(response.body.mergedAllergens.includes('egg'), 'Expected egg allergen');

  console.log('✅ PASS: Allergen detected for telur');
  console.log(`   Allergens: ${response.body.mergedAllergens.join(', ')}`);
});

test('TEST 3: Merge allergens from multiple ingredients', async () => {
  const response = await makeRequest('POST', '/check-allergen', {
    ingredients: ['tahu', 'telur', 'susu'],
  });

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success === true, 'Expected success: true');
  assert(response.body.mergedAllergens.length >= 2, 'Expected at least 2 allergens');
  assert(response.body.mergedAllergens.includes('soy'), 'Expected soy allergen');
  assert(response.body.mergedAllergens.includes('egg'), 'Expected egg allergen');
  assert(response.body.mergedAllergens.includes('dairy'), 'Expected dairy allergen');

  console.log('✅ PASS: Multiple allergens merged correctly');
  console.log(`   Ingredients: tahu, telur, susu`);
  console.log(`   Merged allergens: ${response.body.mergedAllergens.join(', ')}`);
});

test('TEST 4: Detect allergen for fish-based ingredient (ikan nila)', async () => {
  const response = await makeRequest('POST', '/check-allergen', {
    ingredients: ['ikan nila'],
  });

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success === true, 'Expected success: true');
  assert(response.body.mergedAllergens.includes('fish'), 'Expected fish allergen');

  console.log('✅ PASS: Fish allergen detected for ikan nila');
});

test('TEST 5: Ingredient with no allergens (beras putih)', async () => {
  const response = await makeRequest('POST', '/check-allergen', {
    ingredients: ['beras putih'],
  });

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success === true, 'Expected success: true');
  assert(response.body.mergedAllergens.length === 0, 'Expected no allergens for rice');

  console.log('✅ PASS: No allergens for beras putih');
});

test('TEST 6: Unknown ingredient rejection (mobil)', async () => {
  const response = await makeRequest('POST', '/check-allergen', {
    ingredients: ['mobil'],
  });

  // Service still returns 200 but marks ingredient as not found
  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.ingredients[0].found === false, 'Expected ingredient not found');

  console.log('✅ PASS: Unknown ingredient marked as not found');
});

test('TEST 7: Mixed valid and invalid ingredients', async () => {
  const response = await makeRequest('POST', '/check-allergen', {
    ingredients: ['tahu', 'xyz', 'telur'],
  });

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success === true, 'Expected success: true');
  assert(response.body.ingredients.length === 3, 'Expected 3 ingredient results');
  assert(
    response.body.ingredients.filter((i) => i.found).length === 2,
    'Expected 2 valid ingredients'
  );
  assert(response.body.mergedAllergens.length > 0, 'Expected allergens from valid ingredients');

  console.log('✅ PASS: Mixed valid/invalid ingredients handled correctly');
  console.log(`   Valid: ${response.body.foundCount}, Invalid: ${response.body.ingredients.length - response.body.foundCount}`);
});

test('TEST 8: Empty ingredients array rejection', async () => {
  const response = await makeRequest('POST', '/check-allergen', {
    ingredients: [],
  });

  assert(response.status === 400, `Expected 400, got ${response.status}`);
  assert(response.body.success === false, 'Expected success: false');

  console.log('✅ PASS: Empty ingredients array rejected');
});

test('TEST 9: Non-array ingredients rejection', async () => {
  const response = await makeRequest('POST', '/check-allergen', {
    ingredients: 'tahu',
  });

  assert(response.status === 400, `Expected 400, got ${response.status}`);
  assert(response.body.error === 'INVALID_INPUT', 'Expected INVALID_INPUT error');

  console.log('✅ PASS: Non-array ingredients rejected');
});

test('TEST 10: Non-string ingredient rejection', async () => {
  const response = await makeRequest('POST', '/check-allergen', {
    ingredients: ['tahu', 123, 'telur'],
  });

  assert(response.status === 400, `Expected 400, got ${response.status}`);
  assert(response.body.error === 'INVALID_INPUT', 'Expected INVALID_INPUT error');

  console.log('✅ PASS: Non-string ingredient rejected');
});

test('TEST 11: Single ingredient GET endpoint (roti → gluten)', async () => {
  const response = await makeRequest('GET', '/check-allergen/roti');

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success === true, 'Expected success: true');
  assert(response.body.allergens.includes('gluten'), 'Expected gluten allergen for roti');

  console.log('✅ PASS: Single ingredient GET endpoint works');
  console.log(`   Ingredient: roti`);
  console.log(`   Allergens: ${response.body.allergens.join(', ')}`);
});

test('TEST 12: Single ingredient not found (unknown)', async () => {
  const response = await makeRequest('GET', '/check-allergen/unknown_food');

  assert(response.status === 400, `Expected 400, got ${response.status}`);
  assert(response.body.error === 'INGREDIENT_NOT_FOUND', 'Expected INGREDIENT_NOT_FOUND');

  console.log('✅ PASS: Single ingredient not found error');
});

test('TEST 13: Case-insensitive ingredient matching (TAHU)', async () => {
  const response = await makeRequest('POST', '/check-allergen', {
    ingredients: ['TAHU'],
  });

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.ingredients[0].found === true, 'Expected to find TAHU (case-insensitive)');
  assert(response.body.mergedAllergens.includes('soy'), 'Expected soy allergen');

  console.log('✅ PASS: Case-insensitive matching works');
});

test('TEST 14: Menu allergen check (ayam)', async () => {
  const response = await makeRequest('GET', '/check-allergen/menu/ayam');

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success === true, 'Expected success: true');
  assert(response.body.baseIngredient.name === 'ayam', 'Expected ayam as base ingredient');
  assert(response.body.hasAllergens === false, 'Expected no allergens for ayam');

  console.log('✅ PASS: Menu allergen check works');
  console.log(`   Base ingredient: ${response.body.baseIngredient.name}`);
  console.log(`   Allergens: ${response.body.detectedAllergens.join(', ') || 'None'}`);
});

test('TEST 15: Allergen statistics endpoint', async () => {
  const response = await makeRequest('GET', '/allergen/statistics');

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success === true, 'Expected success: true');
  assert(response.body.totalAllergens > 0, 'Expected allergens in KB');
  assert(response.body.ingredientAllergenMappings > 0, 'Expected ingredient-allergen mappings');
  assert(Array.isArray(response.body.allergensWithIngredients), 'Expected allergen list');

  console.log('✅ PASS: Allergen statistics endpoint works');
  console.log(`   Total allergens: ${response.body.totalAllergens}`);
  console.log(`   Total mappings: ${response.body.ingredientAllergenMappings}`);
});

test('TEST 16: Get all ingredients with allergens', async () => {
  const response = await makeRequest('GET', '/allergen/ingredients');

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success === true, 'Expected success: true');
  assert(response.body.totalIngredients > 0, 'Expected ingredients in KB');
  assert(Array.isArray(response.body.ingredientsWithAllergens), 'Expected ingredient list');

  console.log('✅ PASS: Get all ingredients endpoint works');
  console.log(`   Total ingredients: ${response.body.totalIngredients}`);
});

test('TEST 17: Allergen deduplication (same allergen from multiple ingredients)', async () => {
  const response = await makeRequest('POST', '/check-allergen', {
    ingredients: ['tahu', 'kedelai muda'], // Both contain soy
  });

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success === true, 'Expected success: true');
  
  // Count soy occurrences - should be deduplicated
  const soyCount = response.body.mergedAllergens.filter((a) => a === 'soy').length;
  assert(soyCount === 1, 'Soy allergen should appear only once (deduplicated)');

  console.log('✅ PASS: Allergen deduplication works');
  console.log(`   Merged allergens: ${response.body.mergedAllergens.join(', ')}`);
});

test('TEST 18: Whitespace handling in ingredient names', async () => {
  const response = await makeRequest('POST', '/check-allergen', {
    ingredients: ['  tahu  ', '  telur  '],
  });

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(
    response.body.ingredients.every((i) => i.found === true),
    'Expected whitespace to be trimmed'
  );

  console.log('✅ PASS: Whitespace handling works');
});

test('TEST 19: Semantic mapping accuracy (verify no string matching)', async () => {
  // "ikan nila" should map to "fish" via IngredientAllergen
  const response = await makeRequest('POST', '/check-allergen', {
    ingredients: ['ikan nila'],
  });

  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.body.success === true, 'Expected success: true');
  
  // Should find "fish" via semantic mapping, not keyword matching
  assert(response.body.mergedAllergens.includes('fish'), 'Expected fish allergen via semantic mapping');
  
  // Should NOT contain word "fish" in ingredient name (no string matching)
  assert(
    !response.body.ingredients[0].name.toLowerCase().includes('fish'),
    'Ingredient name should not contain "fish" (pure semantic mapping)'
  );

  console.log('✅ PASS: Semantic mapping verified (not keyword matching)');
  console.log(`   Ingredient: ${response.body.ingredients[0].name}`);
  console.log(`   Allergen: ${response.body.mergedAllergens.join(', ')}`);
});

test('TEST 20: Consistency - same allergens for same ingredients', async () => {
  const response1 = await makeRequest('POST', '/check-allergen', {
    ingredients: ['tahu', 'telur'],
  });

  const response2 = await makeRequest('POST', '/check-allergen', {
    ingredients: ['telur', 'tahu'],
  });

  assert(
    JSON.stringify(response1.body.mergedAllergens.sort()) ===
    JSON.stringify(response2.body.mergedAllergens.sort()),
    'Expected same allergens regardless of order'
  );

  console.log('✅ PASS: Consistent allergen detection');
});

// ============================================================================
// RUN ALL TESTS
// ============================================================================

async function runAllTests() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 ALLERGEN DETECTION - TEST SUITE');
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
