import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { commonAllergens } from '../lib/menuData';

interface AllergenFormProps {
  onSubmit: (ingredients: string, selectedAllergens: string[]) => void;
  isLoading: boolean;
}

export function AllergenForm({ onSubmit, isLoading }: AllergenFormProps) {
  const [ingredients, setIngredients] = useState('');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [customAllergen, setCustomAllergen] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.trim()) {
      // Combine selected allergens with custom allergen input
      const customList = customAllergen
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);
      const allSelectedAllergens = [...selectedAllergens, ...customList];
      onSubmit(ingredients, allSelectedAllergens);
    }
  };

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens(prev =>
      prev.includes(allergen)
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="ingredients">
          Masukkan Nama Makanan atau Nama Bahan Makanan
        </Label>
        <Textarea
          id="ingredients"
          placeholder="Masukkan nama makanan atau daftar bahan makanan yang ingin dideteksi&#10;&#10;Contoh:&#10;- Nasi goreng ayam&#10;- Soto ayam&#10;- ayam, kentang, wortel, telur, susu, tepung terigu&#10;- tahu, tempe, kecap, bawang"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          className="min-h-32 resize-none"
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500">
          Anda bisa memasukkan nama makanan lengkap atau daftar bahan. Pisahkan setiap bahan dengan koma atau baris baru.
        </p>
      </div>

      <div className="space-y-3">
        <Label>Alergen yang Ingin Dideteksi (Opsional)</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {commonAllergens.map((allergen) => (
            <div key={allergen} className="flex items-center gap-2">
              <Checkbox
                id={`allergen-${allergen}`}
                checked={selectedAllergens.includes(allergen)}
                onCheckedChange={() => toggleAllergen(allergen)}
                disabled={isLoading}
              />
              <Label
                htmlFor={`allergen-${allergen}`}
                className="cursor-pointer text-sm"
              >
                {allergen}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="custom-allergen">Alergen Kustom (Opsional)</Label>
        <p className="text-xs text-gray-500">
          Tambahkan alergen lain yang tidak ada dalam daftar di atas
        </p>
        <div className="flex items-center gap-2">
          <Input
            id="custom-allergen"
            placeholder="Contoh: MSG, pengawet, pewarna"
            value={customAllergen}
            onChange={(e) => setCustomAllergen(e.target.value)}
            className="flex-1"
            disabled={isLoading}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700"
        disabled={isLoading || !ingredients.trim()}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Menganalisis...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 mr-2" />
            Deteksi Alergen dengan AI
          </>
        )}
      </Button>
    </form>
  );
}