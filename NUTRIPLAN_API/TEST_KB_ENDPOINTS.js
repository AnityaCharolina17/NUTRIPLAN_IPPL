/**
 * Test Knowledge Base Endpoints
 * 
 * This file demonstrates how the knowledge-based AI works
 * Run with: npm run dev (from NUTRIPLAN_API)
 * 
 * Then test endpoints:
 * 
 * 1. Valid ingredient:
 *    POST /api/ai/analyze-food
 *    { "foodDescription": "ayam" }
 *    → Returns menu cases + allergens
 * 
 * 2. Invalid input:
 *    POST /api/ai/analyze-food
 *    { "foodDescription": "mobil" }
 *    → Returns 400 error (not in KB)
 * 
 * 3. Multi-ingredient:
 *    POST /api/ai/analyze-food
 *    { "foodDescription": "ayam, tahu, nasi putih" }
 *    → Validates each, merges allergens
 * 
 * 4. Allergen detection for user:
 *    POST /api/ai/check-allergen-safety
 *    { "foodDescription": "tahu" }
 *    → Shows soy allergen + safety recommendation
 */

const API_BASE = 'http://localhost:5000/api';

// Test 1: Valid single ingredient
async function test1_ValidIngredient() {
  console.log('🧪 TEST 1: Valid Ingredient (ayam)');
  try {
    const res = await fetch(`${API_BASE}/ai/analyze-food`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foodDescription: 'ayam' }),
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

// Test 2: Invalid input
async function test2_InvalidInput() {
  console.log('\n🧪 TEST 2: Invalid Input (mobil)');
  try {
    const res = await fetch(`${API_BASE}/ai/analyze-food`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foodDescription: 'mobil' }),
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

// Test 3: Multi-ingredient
async function test3_MultiIngredient() {
  console.log('\n🧪 TEST 3: Multi-Ingredient (ayam, tahu, nasi putih)');
  try {
    const res = await fetch(`${API_BASE}/ai/analyze-food`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        foodDescription: 'ayam, tahu, nasi putih',
      }),
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

// Test 4: Allergen safety check
async function test4_AllergenSafety() {
  console.log('\n🧪 TEST 4: Allergen Safety (tahu)');
  try {
    const res = await fetch(`${API_BASE}/ai/check-allergen-safety`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foodDescription: 'tahu' }),
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

// Run all tests
async function runAllTests() {
  console.log('========================================');
  console.log('  KNOWLEDGE BASE API TEST SUITE');
  console.log('========================================\n');

  await test1_ValidIngredient();
  await test2_InvalidInput();
  await test3_MultiIngredient();
  await test4_AllergenSafety();

  console.log('\n========================================');
  console.log('  ✅ Tests Complete');
  console.log('========================================');
}

runAllTests().catch(console.error);
