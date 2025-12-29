import { api } from './api';
import { MenuPortion, DetailedNutrition } from './menuData';

export interface MenuSuggestion {
  name: string;
  description: string;
  ingredients: string[];
  allergens: string[];
  nutritionFacts: DetailedNutrition;
  portions: MenuPortion[];
}

export const generateMenuSuggestions = async (ingredient: string): Promise<MenuSuggestion[]> => {
  const { data } = await api.post('/ai/generate-menu-cbr', { baseIngredient: ingredient });
  
  if (!data.success || !data.menus || data.menus.length === 0) {
    throw new Error(data.message || 'Tidak ada menu ditemukan untuk bahan ini');
  }
  
  return data.menus.map((menu: any) => ({
    name: menu.menuName,
    description: menu.description || '',
    ingredients: [menu.baseIngredient.name],
    allergens: menu.allergens || [],
    nutritionFacts: {
      calories: menu.calories || 0,
      protein: parseInt(menu.protein) || 0,
      carbs: parseInt(menu.carbs) || 0,
      fat: parseInt(menu.fat) || 0,
      fiber: 0,
      sodium: 0,
      calcium: 0,
      iron: 0,
      vitaminA: 0,
      vitaminC: 0
    },
    portions: [
      { item: menu.menuName, amount: '1 porsi', weight: '300g' }
    ]
  }));
};

export const validateIngredient = async (ingredientName: string): Promise<{
  isValid: boolean;
  message: string;
  allergens: string[];
}> => {
  const { data } = await api.post('/ai/validate-ingredient', { ingredientName });
  return {
    isValid: data.isValid,
    message: data.message,
    allergens: data.allergens || []
  };
};

export const detectAllergens = async (ingredientNames: string[]): Promise<{
  success: boolean;
  mergedAllergens: string[];
  results: any[];
}> => {
  const { data } = await api.post('/ai/check-allergen', { ingredients: ingredientNames });
  return {
    success: data.success,
    mergedAllergens: data.mergedAllergens || [],
    results: data.ingredients || []
  };
};
