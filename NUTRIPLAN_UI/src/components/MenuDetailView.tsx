import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AlertCircle, Apple, Flame, Activity, Scale, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { MenuItem } from '../lib/menuData';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Button } from './ui/button';
import { MenuAllergenTester } from './MenuAllergenTester';

interface MenuDetailViewProps {
  menu: MenuItem;
}

export function MenuDetailView({ menu }: MenuDetailViewProps) {
  const [showPortions, setShowPortions] = useState(false);

  return (
    <div className="space-y-8">
      {/* Hero Image */}
      <div className="aspect-[16/9] rounded-2xl overflow-hidden shadow-xl">
        <ImageWithFallback
          src={menu.imageUrl}
          alt={menu.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="inline-block text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
            {menu.category}
          </span>
          <span className="inline-block text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
            Menu MBG
          </span>
        </div>
        <h1 className="text-4xl text-gray-900">{menu.name}</h1>
        <p className="text-lg text-gray-600">{menu.description}</p>
      </div>

      {/* Allergen Warning & Tester - Prominent placement after header */}
      <MenuAllergenTester menu={menu} />

      {/* Portions/Composition - Collapsible */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-green-600" />
              Komposisi & Porsi Menu
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPortions(!showPortions)}
              className="gap-2"
            >
              {showPortions ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Sembunyikan
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Lihat Detail
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Collapsible open={showPortions}>
            <CollapsibleContent>
              <div className="space-y-3">
                {menu.portions.map((portion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-green-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{portion.item}</p>
                    <p className="text-sm text-gray-500">{portion.amount}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-white border border-gray-200 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                    {portion.weight}
                  </span>
                </div>
              </div>
            ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Total Porsi Per Sajian</p>
                      <p className="text-xs text-green-700 mt-1">
                        Porsi di atas merupakan takaran standar untuk 1 siswa sesuai program MBG
                      </p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            {!showPortions && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Klik "Lihat Detail" untuk melihat komposisi lengkap menu</p>
              </div>
            )}
          </CardContent>
        </Card>

      {/* Nutrition Facts - Detailed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Informasi Nilai Gizi Lengkap
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Main Macros - Always visible */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Makronutrien Utama
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center border border-orange-200">
                <Flame className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{menu.nutritionFacts.calories}</p>
                <p className="text-xs text-gray-600 mt-1">Kalori (kkal)</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                <p className="text-2xl font-bold text-gray-900">{menu.nutritionFacts.protein}g</p>
                <p className="text-xs text-gray-600 mt-1">Protein</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                <p className="text-2xl font-bold text-gray-900">{menu.nutritionFacts.carbs}g</p>
                <p className="text-xs text-gray-600 mt-1">Karbohidrat</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                <p className="text-2xl font-bold text-gray-900">{menu.nutritionFacts.fat}g</p>
                <p className="text-xs text-gray-600 mt-1">Lemak</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                <p className="text-2xl font-bold text-gray-900">{menu.nutritionFacts.fiber}g</p>
                <p className="text-xs text-gray-600 mt-1">Serat</p>
              </div>
            </div>
          </div>

          {/* Micronutrients - Always visible */}
          {(menu.nutritionFacts.sodium || menu.nutritionFacts.calcium || 
            menu.nutritionFacts.iron || menu.nutritionFacts.vitaminA || 
            menu.nutritionFacts.vitaminC) && (
            <>
              <Separator className="my-6" />
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  Mikronutrien & Mineral
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {menu.nutritionFacts.sodium && (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-semibold text-gray-900">
                        {menu.nutritionFacts.sodium}mg
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Natrium</p>
                    </div>
                  )}
                  {menu.nutritionFacts.calcium && (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-semibold text-gray-900">
                        {menu.nutritionFacts.calcium}mg
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Kalsium</p>
                    </div>
                  )}
                  {menu.nutritionFacts.iron && (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-semibold text-gray-900">
                        {menu.nutritionFacts.iron}mg
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Zat Besi</p>
                    </div>
                  )}
                  {menu.nutritionFacts.vitaminA && (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-semibold text-gray-900">
                        {menu.nutritionFacts.vitaminA}mcg
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Vitamin A</p>
                    </div>
                  )}
                  {menu.nutritionFacts.vitaminC && (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-semibold text-gray-900">
                        {menu.nutritionFacts.vitaminC}mg
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Vitamin C</p>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-blue-900 font-medium mb-1">
                  📊 Standar Kebutuhan Gizi Anak Sekolah (7-12 tahun)
                </p>
                <p className="text-xs text-blue-700">
                  Menu ini dirancang untuk memenuhi sekitar 30-35% kebutuhan energi harian anak sekolah 
                  sesuai Angka Kecukupan Gizi (AKG) Indonesia.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Ingredients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5 text-green-600" />
            Bahan-Bahan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {menu.ingredients.map((ingredient, index) => (
              <span
                key={index}
                className="inline-block text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
