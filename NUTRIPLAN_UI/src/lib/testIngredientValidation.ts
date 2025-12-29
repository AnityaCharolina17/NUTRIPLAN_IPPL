import { api } from './api';

export interface ValidationTestCase {
  name: string;
  ingredients: string[];
  expectedValid: number;
  expectedInvalid: number;
  description: string;
}

export const validationTestCases: ValidationTestCase[] = [
  {
    name: 'All valid ingredients',
    ingredients: ['ayam', 'tahu', 'telur'],
    expectedValid: 3,
    expectedInvalid: 0,
    description: 'All ingredients should be valid'
  },
  {
    name: 'All invalid ingredients',
    ingredients: ['pizza', 'burger', 'soda'],
    expectedValid: 0,
    expectedInvalid: 3,
    description: 'All ingredients should be rejected'
  },
  {
    name: 'Mixed valid and invalid',
    ingredients: ['ayam', 'invalid', 'tahu', 'fake_item'],
    expectedValid: 2,
    expectedInvalid: 2,
    description: 'Should separate valid from invalid'
  },
  {
    name: 'Synonym matching',
    ingredients: ['dada ayam', 'ayam kampung', 'ayam fillet'],
    expectedValid: 3,
    expectedInvalid: 0,
    description: 'Should match by synonyms'
  },
  {
    name: 'Case insensitive',
    ingredients: ['TAHU', 'TeLuR', 'AyAm'],
    expectedValid: 3,
    expectedInvalid: 0,
    description: 'Should handle case variations'
  },
  {
    name: 'Empty ingredient list',
    ingredients: [],
    expectedValid: 0,
    expectedInvalid: 0,
    description: 'Should reject empty lists'
  },
  {
    name: 'Whitespace trimming',
    ingredients: ['  tahu  ', ' telur ', '  ayam  '],
    expectedValid: 3,
    expectedInvalid: 0,
    description: 'Should trim whitespace'
  },
  {
    name: 'Common ingredients',
    ingredients: ['beras putih', 'wortel', 'bayam', 'tomat'],
    expectedValid: 4,
    expectedInvalid: 0,
    description: 'Common vegetables and carbs should be valid'
  },
  {
    name: 'Seafood ingredients',
    ingredients: ['ikan nila', 'ikan tongkol', 'udang'],
    expectedValid: 3,
    expectedInvalid: 0,
    description: 'Seafood ingredients should be valid'
  },
  {
    name: 'Dairy ingredients',
    ingredients: ['susu', 'keju', 'yogurt'],
    expectedValid: 3,
    expectedInvalid: 0,
    description: 'Dairy ingredients should be valid'
  }
];

export interface ValidationTestResult {
  testCase: ValidationTestCase;
  passed: boolean;
  actualValid: number;
  actualInvalid: number;
  validIngredients: string[];
  invalidIngredients: string[];
  details: string;
  error?: string;
}

export async function runValidationTest(
  testCase: ValidationTestCase
): Promise<ValidationTestResult> {
  try {
    const { data } = await api.post('/ai/validate-ingredients', {
      ingredients: testCase.ingredients
    });

    const actualValid = data.validCount || 0;
    const actualInvalid = data.invalidCount || 0;
    const validIngredients = (data.results || [])
      .filter((r: any) => r.isValid)
      .map((r: any) => r.ingredient?.name || r.ingredientName);
    const invalidIngredients = (data.results || [])
      .filter((r: any) => !r.isValid)
      .map((r: any) => r.ingredientName);

    let passed = true;
    let details = '';

    if (actualValid !== testCase.expectedValid) {
      passed = false;
      details += `Expected ${testCase.expectedValid} valid, got ${actualValid}. `;
    }

    if (actualInvalid !== testCase.expectedInvalid) {
      passed = false;
      details += `Expected ${testCase.expectedInvalid} invalid, got ${actualInvalid}. `;
    }

    if (passed) {
      details = 'All validation checks passed';
    }

    return {
      testCase,
      passed,
      actualValid,
      actualInvalid,
      validIngredients,
      invalidIngredients,
      details
    };
  } catch (error: any) {
    return {
      testCase,
      passed: false,
      actualValid: 0,
      actualInvalid: 0,
      validIngredients: [],
      invalidIngredients: [],
      error: error.message,
      details: `Error: ${error.response?.data?.message || error.message}`
    };
  }
}

export async function runAllValidationTests(): Promise<ValidationTestResult[]> {
  const results: ValidationTestResult[] = [];

  for (const testCase of validationTestCases) {
    const result = await runValidationTest(testCase);
    results.push(result);
  }

  return results;
}

export function printValidationResults(results: ValidationTestResult[]): void {
  console.log('\n========== INGREDIENT VALIDATION TEST RESULTS ==========\n');

  let passed = 0;
  let failed = 0;

  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${status} - ${result.testCase.name}`);
    console.log(`   Description: ${result.testCase.description}`);
    console.log(`   Input: [${result.testCase.ingredients.join(', ')}]`);
    console.log(`   Valid: ${result.actualValid} (expected ${result.testCase.expectedValid})`);
    console.log(`   Invalid: ${result.actualInvalid} (expected ${result.testCase.expectedInvalid})`);
    if (result.validIngredients.length > 0) {
      console.log(`   Valid Items: [${result.validIngredients.join(', ')}]`);
    }
    if (result.invalidIngredients.length > 0) {
      console.log(`   Invalid Items: [${result.invalidIngredients.join(', ')}]`);
    }
    console.log(`   Details: ${result.details}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    console.log('');

    if (result.passed) passed++;
    else failed++;
  });

  console.log('========================================');
  console.log(`Total: ${results.length} tests`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  console.log('========================================\n');
}
