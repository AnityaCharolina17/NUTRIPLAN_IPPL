import { api } from './api';

export interface MenuCBRTestCase {
  name: string;
  ingredient: string;
  expectedMenuCount: number;
  shouldSucceed: boolean;
  description: string;
}

export const menuCBRTestCases: MenuCBRTestCase[] = [
  {
    name: 'Generate menu from chicken',
    ingredient: 'ayam',
    expectedMenuCount: 3,
    shouldSucceed: true,
    description: 'Should retrieve up to 3 chicken-based menus from knowledge base'
  },
  {
    name: 'Generate menu from fish',
    ingredient: 'ikan nila',
    expectedMenuCount: 1,
    shouldSucceed: true,
    description: 'Should retrieve fish-based menus'
  },
  {
    name: 'Generate menu from beef',
    ingredient: 'daging sapi',
    expectedMenuCount: 1,
    shouldSucceed: true,
    description: 'Should retrieve beef-based menus'
  },
  {
    name: 'Invalid ingredient rejection',
    ingredient: 'invalid_food',
    expectedMenuCount: 0,
    shouldSucceed: false,
    description: 'Should reject invalid ingredients and return no menus'
  },
  {
    name: 'Case insensitive ingredient',
    ingredient: 'AYAM',
    expectedMenuCount: 3,
    shouldSucceed: true,
    description: 'Should handle case variations'
  },
  {
    name: 'Ingredient with no menu cases',
    ingredient: 'brokoli',
    expectedMenuCount: 0,
    shouldSucceed: false,
    description: 'Valid ingredient but no menu cases should return error'
  },
  {
    name: 'Synonym matching',
    ingredient: 'dada ayam',
    expectedMenuCount: 3,
    shouldSucceed: true,
    description: 'Should match ingredient by synonym'
  }
];

export interface MenuCBRTestResult {
  testCase: MenuCBRTestCase;
  passed: boolean;
  actualMenuCount: number;
  actualSuccess: boolean;
  menus: any[];
  details: string;
  error?: string;
}

export async function runMenuCBRTest(
  testCase: MenuCBRTestCase
): Promise<MenuCBRTestResult> {
  try {
    const { data } = await api.post('/api/ai/generate-menu-cbr', {
      baseIngredient: testCase.ingredient
    });

    const actualSuccess = data.success;
    const actualMenuCount = data.menus?.length || 0;
    const menus = data.menus || [];

    let passed = true;
    let details = '';

    if (actualSuccess !== testCase.shouldSucceed) {
      passed = false;
      details += `Expected success=${testCase.shouldSucceed}, got ${actualSuccess}. `;
    }

    if (actualMenuCount !== testCase.expectedMenuCount) {
      passed = false;
      details += `Expected ${testCase.expectedMenuCount} menus, got ${actualMenuCount}. `;
    }

    if (actualSuccess && menus.length > 0) {
      const hasInvalidMenus = menus.some((menu: any) => {
        return !menu.menuName || !menu.baseIngredient || menu.calories === undefined;
      });

      if (hasInvalidMenus) {
        passed = false;
        details += 'Some menus have invalid structure. ';
      }
    }

    if (passed) {
      details = 'All CBR checks passed';
    }

    return {
      testCase,
      passed,
      actualMenuCount,
      actualSuccess,
      menus,
      details
    };
  } catch (error: any) {
    const expectedToFail = !testCase.shouldSucceed;
    const passed = expectedToFail;

    return {
      testCase,
      passed,
      actualMenuCount: 0,
      actualSuccess: false,
      menus: [],
      error: error.message,
      details: passed
        ? 'Expected to fail and failed correctly'
        : `Unexpected error: ${error.response?.data?.message || error.message}`
    };
  }
}

export async function runAllMenuCBRTests(): Promise<MenuCBRTestResult[]> {
  const results: MenuCBRTestResult[] = [];

  for (const testCase of menuCBRTestCases) {
    const result = await runMenuCBRTest(testCase);
    results.push(result);
  }

  return results;
}

export function printMenuCBRResults(results: MenuCBRTestResult[]): void {
  console.log('\n========== MENU CBR TEST RESULTS ==========\n');

  let passed = 0;
  let failed = 0;

  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${status} - ${result.testCase.name}`);
    console.log(`   Description: ${result.testCase.description}`);
    console.log(`   Ingredient: ${result.testCase.ingredient}`);
    console.log(`   Menu Count: ${result.actualMenuCount} (expected ${result.testCase.expectedMenuCount})`);
    console.log(`   Success: ${result.actualSuccess} (expected ${result.testCase.shouldSucceed})`);
    if (result.menus.length > 0) {
      console.log(`   Menus Retrieved:`);
      result.menus.forEach((menu: any, i: number) => {
        console.log(`     ${i + 1}. ${menu.menuName} (${menu.calories} cal)`);
      });
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
