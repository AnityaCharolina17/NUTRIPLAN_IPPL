import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, FlaskConical, Sparkles, User, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MenuItem } from '../lib/menuData';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';

interface MenuAllergenTesterProps {
  menu: MenuItem;
}

export function MenuAllergenTester({ menu }: MenuAllergenTesterProps) {
  const { user, isStudent } = useAuth();
  const [testIngredient, setTestIngredient] = useState('');
  const [testResult, setTestResult] = useState<{
    isAllergen: boolean;
    matchedAllergens: string[];
    ingredient: string;
  } | null>(null);

  const handleTest = () => {
    if (!testIngredient.trim()) return;

    const lowerInput = testIngredient.toLowerCase();
    const matchedAllergens = menu.allergens.filter(allergen =>
      allergen.toLowerCase().includes(lowerInput) ||
      lowerInput.includes(allergen.toLowerCase())
    );

    setTestResult({
      isAllergen: matchedAllergens.length > 0,
      matchedAllergens,
      ingredient: testIngredient,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTest();
    }
  };

  // Check if logged-in user has allergens matching this menu
  const userMatchedAllergens = isStudent && user?.allergens 
    ? menu.allergens.filter(menuAllergen =>
        user.allergens.some(userAllergen =>
          menuAllergen.toLowerCase().includes(userAllergen.toLowerCase()) ||
          userAllergen.toLowerCase().includes(menuAllergen.toLowerCase())
        )
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Personal Allergen Warning for logged-in students */}
      {isStudent && userMatchedAllergens.length > 0 && (
        <Alert className="border-red-400 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-red-900 mb-2">
                  🚨 PERINGATAN PRIBADI: Menu Ini Mengandung Alergen Anda!
                </p>
                <p className="text-sm text-red-800">
                  Menu <span className="font-semibold">{menu.name}</span> mengandung bahan yang sesuai dengan daftar alergi Anda (<span className="font-semibold">{user?.name}</span>).
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-red-900 mb-2">
                  Alergen yang Cocok dengan Profil Anda:
                </p>
                <div className="flex flex-wrap gap-2">
                  {userMatchedAllergens.map((allergen) => (
                    <Badge
                      key={allergen}
                      variant="destructive"
                      className="bg-red-600 text-white"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-red-100 rounded-lg p-3 mt-3">
                <p className="text-xs text-red-900">
                  <span className="font-semibold">⚠️ SANGAT PENTING:</span> Sebaiknya hindari menu ini atau konsultasikan dengan petugas kesehatan sekolah sebelum mengonsumsi.
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* General Allergen Warning - Only show if menu has allergens */}
      {menu.allergens.length > 0 && (
        <Alert className="border-orange-300 bg-orange-50">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <AlertDescription>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-orange-900 mb-2">
                  ⚠️ Menu ini mengandung bahan alergenik!
                </p>
                <p className="text-sm text-orange-800">
                  Menu <span className="font-semibold">{menu.name}</span> mengandung bahan-bahan yang dapat memicu reaksi alergi pada sebagian orang.
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-orange-900 mb-2">
                  Daftar Alergen yang Terdeteksi:
                </p>
                <div className="flex flex-wrap gap-2">
                  {menu.allergens.map((allergen) => (
                    <Badge
                      key={allergen}
                      variant="outline"
                      className="bg-white border-orange-300 text-orange-800"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-orange-100 rounded-lg p-3 mt-3">
                <p className="text-xs text-orange-900">
                  <span className="font-semibold">💡 Tips:</span> Gunakan fitur test alergen di bawah untuk mengecek bahan makanan spesifik yang Anda khawatirkan.
                </p>
              </div>

              {/* CTA for non-logged in users or students without allergen data */}
              {(!isStudent || !user?.allergens || user.allergens.length === 0) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-blue-900 font-medium mb-1">
                        Dapatkan Peringatan Otomatis!
                      </p>
                      <p className="text-xs text-blue-800 mb-2">
                        {!isStudent 
                          ? 'Login sebagai siswa dan simpan data alergi Anda untuk mendapatkan peringatan otomatis di setiap menu.'
                          : 'Simpan data alergi Anda di profil untuk mendapatkan peringatan otomatis di setiap menu.'
                        }
                      </p>
                      <Link
                        to={!isStudent ? "/login" : "/profile"}
                        className="inline-flex items-center text-xs font-medium text-blue-700 hover:text-blue-800"
                      >
                        {!isStudent ? 'Login Sekarang' : 'Atur Profil Alergi'} →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Allergen Tester Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-purple-600" />
              Test Alergen Spesifik untuk Menu Ini
            </CardTitle>
            {menu.allergens.length > 0 && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                {menu.allergens.length} Alergen Terdeteksi
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Masukkan bahan makanan yang ingin Anda cek apakah termasuk dalam alergen menu <span className="font-semibold text-gray-900">{menu.name}</span>
              </p>

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Contoh: susu, kacang, telur..."
                    value={testIngredient}
                    onChange={(e) => setTestIngredient(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pr-8"
                  />
                  {testIngredient && (
                    <button
                      onClick={() => {
                        setTestIngredient('');
                        setTestResult(null);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <Button
                  onClick={handleTest}
                  disabled={!testIngredient.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <FlaskConical className="h-4 w-4 mr-2" />
                  Test
                </Button>
              </div>
            </div>

            {/* Test Result */}
            {testResult && (
              <div
                className={`p-4 rounded-lg border-2 ${
                  testResult.isAllergen
                    ? 'bg-red-50 border-red-300'
                    : 'bg-green-50 border-green-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {testResult.isAllergen ? (
                    <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-semibold mb-1 ${
                        testResult.isAllergen ? 'text-red-900' : 'text-green-900'
                      }`}
                    >
                      {testResult.isAllergen
                        ? `⚠️ "${testResult.ingredient}" Terdeteksi sebagai Alergen!`
                        : `✓ "${testResult.ingredient}" Tidak Terdeteksi sebagai Alergen`}
                    </p>
                    <p
                      className={`text-sm ${
                        testResult.isAllergen ? 'text-red-800' : 'text-green-800'
                      }`}
                    >
                      {testResult.isAllergen ? (
                        <>
                          Bahan <span className="font-semibold">"{testResult.ingredient}"</span> ditemukan dalam daftar alergen menu ini.
                          {testResult.matchedAllergens.length > 0 && (
                            <span className="block mt-2">
                              Cocok dengan: {' '}
                              <span className="font-semibold">
                                {testResult.matchedAllergens.join(', ')}
                              </span>
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          Bahan <span className="font-semibold">"{testResult.ingredient}"</span> tidak ditemukan dalam daftar alergen menu ini. Namun, tetap berhati-hati jika Anda memiliki alergi spesifik.
                        </>
                      )}
                    </p>

                    {testResult.isAllergen && (
                      <div className="mt-3 bg-red-100 rounded-lg p-3">
                        <p className="text-xs text-red-900">
                          <span className="font-semibold">🚨 Perhatian:</span> Jika Anda alergi terhadap "{testResult.ingredient}", sebaiknya hindari menu ini atau konsultasikan dengan petugas kantin sekolah.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Helper info */}
            {!testResult && (
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-900">
                      Cara Menggunakan Test Alergen:
                    </p>
                    <ul className="text-xs text-purple-800 mt-2 space-y-1 list-disc list-inside">
                      <li>Ketik nama bahan makanan yang ingin Anda cek</li>
                      <li>Klik tombol "Test" atau tekan Enter</li>
                      <li>Sistem akan mencocokkan dengan daftar alergen menu ini</li>
                      <li>Hasil akan muncul secara langsung di bawah form</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Test Buttons for User's Allergens */}
            {isStudent && user?.allergens && user.allergens.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <User className="h-3 w-3" />
                  Test cepat berdasarkan alergi Anda:
                </p>
                <div className="flex flex-wrap gap-2">
                  {user.allergens.map((allergen) => (
                    <Button
                      key={allergen}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTestIngredient(allergen);
                        const matched = menu.allergens.filter(menuAllergen =>
                          menuAllergen.toLowerCase().includes(allergen.toLowerCase()) ||
                          allergen.toLowerCase().includes(menuAllergen.toLowerCase())
                        );
                        setTestResult({
                          isAllergen: matched.length > 0,
                          matchedAllergens: matched,
                          ingredient: allergen,
                        });
                      }}
                      className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <User className="h-3 w-3 mr-1" />
                      {allergen}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Test Buttons for Menu Allergens */}
            {menu.allergens.length > 0 && (
              <div className={`${isStudent && user?.allergens && user.allergens.length > 0 ? 'pt-3' : 'pt-4 border-t border-gray-200'}`}>
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Test cepat alergen umum dalam menu ini:
                </p>
                <div className="flex flex-wrap gap-2">
                  {menu.allergens.map((allergen) => (
                    <Button
                      key={allergen}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTestIngredient(allergen);
                        setTestResult({
                          isAllergen: true,
                          matchedAllergens: [allergen],
                          ingredient: allergen,
                        });
                      }}
                      className="text-xs"
                    >
                      {allergen}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
