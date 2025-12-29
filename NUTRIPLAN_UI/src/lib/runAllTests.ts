import {
  runAllAllergenTests,
  printTestResults as printAllergenResults
} from './testAllergenDetection';
import {
  runAllValidationTests,
  printValidationResults
} from './testIngredientValidation';
import {
  runAllMenuCBRTests,
  printMenuCBRResults
} from './testMenuCBR';

export async function runAllFrontendTests() {
  console.clear();
  console.log('🧪 NUTRIPLAN FRONTEND API TESTS');
  console.log('================================\n');
  console.log('Starting test suite...\n');

  try {
    console.log('📋 Running Ingredient Validation Tests...');
    const validationResults = await runAllValidationTests();
    printValidationResults(validationResults);

    console.log('\n📋 Running Allergen Detection Tests...');
    const allergenResults = await runAllAllergenTests();
    printAllergenResults(allergenResults);

    console.log('\n📋 Running Menu CBR Tests...');
    const menuResults = await runAllMenuCBRTests();
    printMenuCBRResults(menuResults);

    const totalTests =
      validationResults.length + allergenResults.length + menuResults.length;
    const totalPassed =
      validationResults.filter((r) => r.passed).length +
      allergenResults.filter((r) => r.passed).length +
      menuResults.filter((r) => r.passed).length;

    console.log('\n========================================');
    console.log('🎯 OVERALL TEST SUMMARY');
    console.log('========================================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalTests - totalPassed}`);
    console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
    console.log('========================================\n');

    if (totalPassed === totalTests) {
      console.log('✅ All tests passed! System is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Check details above.');
    }
  } catch (error: any) {
    console.error('❌ Test suite failed:', error.message);
  }
}

if (typeof window !== 'undefined') {
  (window as any).runAllFrontendTests = runAllFrontendTests;
  console.log('💡 Test suite loaded. Run window.runAllFrontendTests() to execute tests.');
}
