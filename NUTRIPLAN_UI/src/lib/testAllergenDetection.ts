import { api } from './api';

export interface TestCase {
  name: string;
  ingredients: string[];
  expectedValid: boolean;
  expectedAllergens?: string[];
  description: string;
}

export const allergenTestCases: TestCase[] = [
  {
    name: 'Valid ingredient with soy allergen',
    ingredients: ['tahu'],
    expectedValid: true,
    expectedAllergens: ['soy'],
    description: 'Tahu should be valid and contain soy allergen'
  },
  {
    name: 'Valid ingredient with egg allergen',
    ingredients: ['telur'],
    expectedValid: true,
    expectedAllergens: ['egg'],
    description: 'Telur should be valid and contain egg allergen'
  },
  {
    name: 'Valid ingredient with multiple allergens',
    ingredients: ['tahu', 'telur', 'susu'],
    expectedValid: true,
    expectedAllergens: ['soy', 'egg', 'dairy'],
    description: 'Multiple ingredients should merge allergens correctly'
  },
  {
    name: 'Invalid ingredient rejection',
    ingredients: ['pizza'],
    expectedValid: false,
    description: 'Invalid ingredients should be rejected'
  },
  {
    name: 'Mixed valid and invalid ingredients',
    ingredients: ['ayam', 'invalid_item', 'tahu'],
    expectedValid: false,
    description: 'Should identify both valid and invalid ingredients'
  },
  {
    name: 'Valid ingredient without allergens',
    ingredients: ['ayam'],
    expectedValid: true,
    expectedAllergens: [],
    description: 'Ayam should be valid with no allergens'
  },
  {
    name: 'Fish allergen detection',
    ingredients: ['ikan nila'],
    expectedValid: true,
    expectedAllergens: ['fish'],
    description: 'Fish ingredients should show fish allergen'
  },
  {
    name: 'Shellfish allergen detection',
    ingredients: ['udang'],
    expectedValid: true,
    expectedAllergens: ['shellfish'],
    description: 'Udang should show shellfish allergen'
  },
  {
    name: 'Gluten allergen detection',
    ingredients: ['roti'],
    expectedValid: true,
    expectedAllergens: ['gluten'],
    description: 'Roti should show gluten allergen'
  },
  {
    name: 'Case insensitive matching',
    ingredients: ['TAHU', 'TeLuR'],
    expectedValid: true,
    expectedAllergens: ['soy', 'egg'],
    description: 'Should handle case variations'
  },
  {
    name: 'Synonym matching',
    ingredients: ['dada ayam'],
    expectedValid: true,
    description: 'Should match ingredient by synonym'
  },
  {
    name: 'Empty ingredient list',
    ingredients: [],
    expectedValid: false,
    description: 'Should reject empty ingredient lists'
  },
  {
    name: 'Whitespace handling',
    ingredients: ['  tahu  ', ' telur '],
    expectedValid: true,
    expectedAllergens: ['soy', 'egg'],
    description: 'Should handle whitespace correctly'
  }
];

export interface TestResult {
  testCase: TestCase;
  passed: boolean;
  actualValid: boolean;
  actualAllergens: string[];
  error?: string;
  details: string;
}

export async function runAllergenTest(testCase: TestCase): Promise<TestResult> {
  try {
    const { data } = await api.post('/api/ai/check-allergen', {
      ingredients: testCase.ingredients
    });

    const actualValid = data.success && data.foundCount > 0;
    const actualAllergens = data.mergedAllergens || [];

    let passed = true;
    let details = '';

    if (actualValid !== testCase.expectedValid) {
      passed = false;
      details += `Expected valid=${testCase.expectedValid}, got ${actualValid}. `;
    }

    if (testCase.expectedAllergens) {
      const expectedSet = new Set(testCase.expectedAllergens.map((a: string) => a.toLowerCase()));
      const actualSet = new Set(actualAllergens.map((a: string) => a.toLowerCase()));

      const missing = testCase.expectedAllergens.filter(
        (a: string) => !actualSet.has(a.toLowerCase())
      );
      const extra = actualAllergens.filter(
        (a: string) => !expectedSet.has(a.toLowerCase())
      );

      if (missing.length > 0 || extra.length > 0) {
        passed = false;
        if (missing.length > 0) {
          details += `Missing allergens: ${missing.join(', ')}. `;
        }
        if (extra.length > 0) {
          details += `Extra allergens: ${extra.join(', ')}. `;
        }
      }
    }

    if (passed) {
      details = 'All checks passed';
    }

    return {
      testCase,
      passed,
      actualValid,
      actualAllergens,
      details
    };
  } catch (error: any) {
    return {
      testCase,
      passed: false,
      actualValid: false,
      actualAllergens: [],
      error: error.message || 'Unknown error',
      details: `Error: ${error.response?.data?.message || error.message}`
    };
  }
}

export async function runAllAllergenTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (const testCase of allergenTestCases) {
    const result = await runAllergenTest(testCase);
    results.push(result);
  }

  return results;
}

export function printTestResults(results: TestResult[]): void {
  console.log('\n========== ALLERGEN DETECTION TEST RESULTS ==========\n');

  let passed = 0;
  let failed = 0;

  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${status} - ${result.testCase.name}`);
    console.log(`   Description: ${result.testCase.description}`);
    console.log(`   Ingredients: [${result.testCase.ingredients.join(', ')}]`);
    console.log(`   Valid: ${result.actualValid}`);
    console.log(`   Allergens: [${result.actualAllergens.join(', ')}]`);
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
