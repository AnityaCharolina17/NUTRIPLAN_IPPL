import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'running';
  message: string;
  details?: any;
}

export function TestingPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [customIngredient, setCustomIngredient] = useState('');
  const [customResult, setCustomResult] = useState<any>(null);

  const runQuickTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    const results: TestResult[] = [];

    const tests = [
      {
        name: 'Valid ingredient (tahu)',
        fn: async () => {
          const { data } = await api.post('/ai/validate-ingredient', {
            ingredientName: 'tahu'
          });
          return { pass: data.isValid === true, details: data };
        }
      },
      {
        name: 'Invalid ingredient rejection (pizza)',
        fn: async () => {
          const { data } = await api.post('/ai/validate-ingredient', {
            ingredientName: 'pizza'
          });
          return { pass: data.isValid === false, details: data };
        }
      },
      {
        name: 'Soy allergen detection (tahu)',
        fn: async () => {
          const { data } = await api.post('/ai/check-allergen', {
            ingredients: ['tahu']
          });
          return {
            pass:
              data.success &&
              data.mergedAllergens &&
              data.mergedAllergens.includes('soy'),
            details: data
          };
        }
      },
      {
        name: 'Egg allergen detection (telur)',
        fn: async () => {
          const { data } = await api.post('/ai/check-allergen', {
            ingredients: ['telur']
          });
          return {
            pass:
              data.success &&
              data.mergedAllergens &&
              data.mergedAllergens.includes('egg'),
            details: data
          };
        }
      },
      {
        name: 'Multiple allergen merge (tahu, telur, susu)',
        fn: async () => {
          const { data } = await api.post('/ai/check-allergen', {
            ingredients: ['tahu', 'telur', 'susu']
          });
          const allergens = data.mergedAllergens || [];
          return {
            pass:
              data.success &&
              allergens.includes('soy') &&
              allergens.includes('egg') &&
              allergens.includes('dairy'),
            details: data
          };
        }
      },
      {
        name: 'Menu CBR - chicken (ayam)',
        fn: async () => {
          const { data } = await api.post('/ai/generate-menu-cbr', {
            baseIngredient: 'ayam'
          });
          return {
            pass: data.success && data.menus && data.menus.length > 0,
            details: data
          };
        }
      },
      {
        name: 'Menu CBR - invalid ingredient rejection',
        fn: async () => {
          try {
            const { data } = await api.post('/ai/generate-menu-cbr', {
              baseIngredient: 'invalid_food_item'
            });
            return { pass: !data.success, details: data };
          } catch (error: any) {
            return { pass: true, details: error.response?.data };
          }
        }
      },
      {
        name: 'Case insensitive ingredient (TAHU)',
        fn: async () => {
          const { data } = await api.post('/ai/validate-ingredient', {
            ingredientName: 'TAHU'
          });
          return { pass: data.isValid === true, details: data };
        }
      },
      {
        name: 'Whitespace handling (  telur  )',
        fn: async () => {
          const { data } = await api.post('/ai/validate-ingredient', {
            ingredientName: '  telur  '
          });
          return { pass: data.isValid === true, details: data };
        }
      },
      {
        name: 'Synonym matching (dada ayam)',
        fn: async () => {
          const { data } = await api.post('/ai/validate-ingredient', {
            ingredientName: 'dada ayam'
          });
          return { pass: data.isValid === true, details: data };
        }
      }
    ];

    for (const test of tests) {
      setTestResults((prev) => [
        ...prev,
        { name: test.name, status: 'running', message: 'Running...' }
      ]);

      try {
        const result = await test.fn();
        results.push({
          name: test.name,
          status: result.pass ? 'pass' : 'fail',
          message: result.pass ? 'Test passed' : 'Test failed',
          details: result.details
        });
      } catch (error: any) {
        results.push({
          name: test.name,
          status: 'fail',
          message: error.message || 'Test error',
          details: error.response?.data
        });
      }

      setTestResults([...results]);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setIsRunning(false);
  };

  const testCustomIngredient = async () => {
    if (!customIngredient.trim()) return;

    setCustomResult({ loading: true });

    try {
      const [validationRes, allergenRes] = await Promise.all([
        api.post('/ai/validate-ingredient', { ingredientName: customIngredient }),
        api.post('/ai/check-allergen', { ingredients: [customIngredient] })
      ]);

      setCustomResult({
        validation: validationRes.data,
        allergen: allergenRes.data,
        loading: false
      });
    } catch (error: any) {
      setCustomResult({
        error: error.response?.data?.message || error.message,
        loading: false
      });
    }
  };

  const passed = testResults.filter((r) => r.status === 'pass').length;
  const failed = testResults.filter((r) => r.status === 'fail').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Frontend API Testing</h1>
          <p className="text-gray-600">
            Test ingredient validation, allergen detection, and menu CBR
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Test Suite</CardTitle>
              <CardDescription>Run automated tests for all features</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={runQuickTests} disabled={isRunning} className="w-full">
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  'Run All Tests'
                )}
              </Button>

              {testResults.length > 0 && (
                <div className="mt-6">
                  <div className="flex gap-4 mb-4">
                    <Badge variant="outline" className="text-green-600">
                      ✓ Passed: {passed}
                    </Badge>
                    <Badge variant="outline" className="text-red-600">
                      ✗ Failed: {failed}
                    </Badge>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-3 bg-white rounded-lg border"
                      >
                        {result.status === 'running' && (
                          <Loader2 className="h-5 w-5 animate-spin text-blue-500 flex-shrink-0" />
                        )}
                        {result.status === 'pass' && (
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        )}
                        {result.status === 'fail' && (
                          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{result.name}</p>
                          <p className="text-xs text-gray-500">{result.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Ingredient Test</CardTitle>
              <CardDescription>Test any ingredient manually</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ingredient">Ingredient Name</Label>
                  <Input
                    id="ingredient"
                    value={customIngredient}
                    onChange={(e) => setCustomIngredient(e.target.value)}
                    placeholder="e.g., tahu, telur, pizza"
                    onKeyPress={(e) => e.key === 'Enter' && testCustomIngredient()}
                  />
                </div>
                <Button onClick={testCustomIngredient} className="w-full">
                  Test Ingredient
                </Button>

                {customResult && !customResult.loading && (
                  <div className="mt-4 space-y-3">
                    {customResult.error ? (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 font-medium">Error</p>
                        <p className="text-red-600 text-sm">{customResult.error}</p>
                      </div>
                    ) : (
                      <>
                        <div className="p-4 bg-white border rounded-lg">
                          <p className="font-medium mb-2">Validation Result</p>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Valid:</span>{' '}
                              {customResult.validation?.isValid ? (
                                <Badge className="bg-green-500">Yes</Badge>
                              ) : (
                                <Badge variant="destructive">No</Badge>
                              )}
                            </p>
                            <p className="text-gray-600">
                              {customResult.validation?.message}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 bg-white border rounded-lg">
                          <p className="font-medium mb-2">Allergen Detection</p>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Allergens Found:</span>{' '}
                              {customResult.allergen?.mergedAllergens?.length || 0}
                            </p>
                            {customResult.allergen?.mergedAllergens?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {customResult.allergen.mergedAllergens.map(
                                  (allergen: string) => (
                                    <Badge
                                      key={allergen}
                                      variant="outline"
                                      className="bg-yellow-50 text-yellow-800 border-yellow-300"
                                    >
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      {allergen}
                                    </Badge>
                                  )
                                )}
                              </div>
                            )}
                            {customResult.allergen?.mergedAllergens?.length === 0 && (
                              <p className="text-green-600">No allergens detected</p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium">✅ Expected Behavior:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>Valid ingredients (tahu, telur, ayam) should be accepted</li>
                <li>Invalid ingredients (pizza, burger) should be rejected</li>
                <li>Allergens should be detected from IngredientAllergen relations</li>
                <li>Menu CBR should retrieve stored menus only</li>
                <li>Case insensitive and synonym matching should work</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">⚠️  Warning Triggers:</p>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>When allergens are detected in ingredients</li>
                <li>When invalid ingredients are submitted</li>
                <li>When no menus exist for an ingredient</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
