import { api } from './api';
import type { MenuSuggestion } from './aiMenuGenerator';

export async function generateMenuSuggestions(ingredient: string): Promise<MenuSuggestion[]> {
  const prompt = `Buatkan 3 opsi menu sekolah berbasis bahan utama: ${ingredient}.
Balas dalam JSON array dengan elemen memiliki struktur:
{ "name": string, "description": string, "ingredients": string[], "allergens": string[], "nutritionFacts": {"calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number}, "portions": [{"item": string, "amount": string, "weight": string}] }`;
  try {
    const res = await api.post('/api/ai/analyze-food', { foodDescription: prompt });
    const analysis = res.data?.analysis;
    // If backend returns an array already
    if (Array.isArray(analysis)) {
      return analysis as MenuSuggestion[];
    }
    // If backend returns object with suggestions field
    if (analysis?.suggestions && Array.isArray(analysis.suggestions)) {
      return analysis.suggestions as MenuSuggestion[];
    }
    // Fallback: map single analysis into one suggestion
    if (analysis?.foodName) {
      const one: MenuSuggestion = {
        name: analysis.foodName,
        description: analysis.safetyNotes || 'Menu hasil AI',
        ingredients: analysis.ingredients || [],
        allergens: analysis.allergens || [],
        nutritionFacts: {
          calories: analysis.nutritionEstimate?.calories ?? 0,
          protein: parseFloat((analysis.nutritionEstimate?.protein ?? '0').toString()) || 0,
          carbs: parseFloat((analysis.nutritionEstimate?.carbs ?? '0').toString()) || 0,
          fat: parseFloat((analysis.nutritionEstimate?.fat ?? '0').toString()) || 0,
          fiber: 0,
        },
        portions: [],
      };
      return [one];
    }
  } catch (e) {
    // fall through to local suggestions by throwing - page can catch and fall back
    throw e;
  }
  return [];
}
