export type IngredientCategory = 'protein' | 'carb' | 'vegetable' | 'fruit' | 'dairy' | 'soy' | 'seafood' | 'gluten' | 'misc';

export type KnownIngredient = {
  name: string;
  category: IngredientCategory;
  allergens: string[]; // Semantic allergen tags
  synonyms?: string[];
};

// Explicit knowledge base used for validation and allergen reasoning.
export const KNOWN_INGREDIENTS: KnownIngredient[] = [
  // Proteins
  { name: 'ayam', category: 'protein', allergens: [], synonyms: ['ayam kampung', 'dada ayam', 'ayam fillet'] },
  { name: 'daging sapi', category: 'protein', allergens: [], synonyms: ['sapi'] },
  { name: 'ikan nila', category: 'seafood', allergens: ['fish'], synonyms: ['ikan'] },
  { name: 'ikan tongkol', category: 'seafood', allergens: ['fish'] },
  { name: 'udang', category: 'seafood', allergens: ['shellfish'] },
  { name: 'telur', category: 'protein', allergens: ['egg'] },
  { name: 'tempe', category: 'soy', allergens: ['soy'] },
  { name: 'tahu', category: 'soy', allergens: ['soy'] },

  // Carbs / staples
  { name: 'nasi putih', category: 'carb', allergens: [] },
  { name: 'nasi', category: 'carb', allergens: [], synonyms: ['nasi goreng'] },
  { name: 'kentang', category: 'carb', allergens: [] },
  { name: 'ubi', category: 'carb', allergens: [] },
  { name: 'roti', category: 'gluten', allergens: ['gluten'], synonyms: ['roti tawar', 'roti gandum'] },
  { name: 'spaghetti', category: 'gluten', allergens: ['gluten'] },
  { name: 'mie', category: 'gluten', allergens: ['gluten'], synonyms: ['mi', 'mie instan'] },

  // Vegetables
  { name: 'kangkung', category: 'vegetable', allergens: [] },
  { name: 'buncis', category: 'vegetable', allergens: [] },
  { name: 'wortel', category: 'vegetable', allergens: [] },
  { name: 'kubis', category: 'vegetable', allergens: [] },
  { name: 'bayam', category: 'vegetable', allergens: [] },
  { name: 'brokoli', category: 'vegetable', allergens: [] },
  { name: 'edamame', category: 'soy', allergens: ['soy'] },

  // Fruits
  { name: 'pisang', category: 'fruit', allergens: [] },
  { name: 'jeruk', category: 'fruit', allergens: [] },
  { name: 'apel', category: 'fruit', allergens: [] },
  { name: 'semangka', category: 'fruit', allergens: [] },
  { name: 'melon', category: 'fruit', allergens: [] },
  { name: 'anggur', category: 'fruit', allergens: [] },

  // Dairy
  { name: 'susu', category: 'dairy', allergens: ['dairy'], synonyms: ['susu sapi'] },
  { name: 'keju', category: 'dairy', allergens: ['dairy'] },
  { name: 'yogurt', category: 'dairy', allergens: ['dairy'] },

  // Seasoning / misc
  { name: 'kecap', category: 'soy', allergens: ['soy'], synonyms: ['kecap manis'] },
  { name: 'kecap asin', category: 'soy', allergens: ['soy'] },
  { name: 'santan', category: 'misc', allergens: [] },
  { name: 'bawang merah', category: 'misc', allergens: [] },
  { name: 'bawang putih', category: 'misc', allergens: [] },
  { name: 'cabai', category: 'misc', allergens: [] },
  { name: 'tepung terigu', category: 'gluten', allergens: ['gluten'], synonyms: ['terigu'] },
  { name: 'mentega', category: 'dairy', allergens: ['dairy'] },
];

export function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export function findIngredient(name: string): KnownIngredient | undefined {
  const normalized = normalizeName(name);
  return KNOWN_INGREDIENTS.find((ing) => {
    if (ing.name === normalized) return true;
    return ing.synonyms?.some((syn) => normalizeName(syn) === normalized);
  });
}