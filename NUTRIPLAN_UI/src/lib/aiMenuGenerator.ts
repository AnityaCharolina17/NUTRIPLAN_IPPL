import { api } from "./api";
import { MenuPortion, DetailedNutrition } from "./menuData";

export interface MenuSuggestion {
  name: string;
  description: string;
  ingredients: string[];
  allergens: string[];
  nutritionFacts: DetailedNutrition;
  portions: MenuPortion[];
}

/**
 * Generate menu menggunakan CBR
 * Endpoint: POST /api/ai/generate-menu-cbr
 */
export const generateMenuSuggestions = async (
  ingredient: string
): Promise<MenuSuggestion[]> => {
  try {
    const { data } = await api.post("/ai/generate-menu-cbr", {
      ingredients: [ingredient], // ✅ sesuai backend
    });

    console.log("CBR Response:", data);

    if (!data.success || !data.menus || data.menus.length === 0) {
      throw new Error(data.message || "Tidak ada menu ditemukan");
    }

    return data.menus.map((menu: any) => ({
      name: menu.menuName,
      description: menu.description || "",
      ingredients: menu.ingredients || [ingredient],
      allergens: menu.allergens || [],
      nutritionFacts: {
        calories: Number(menu.calories) || 0,
        protein: Number(menu.protein) || 0,
        carbs: Number(menu.carbs) || 0,
        fat: Number(menu.fat) || 0,
        fiber: 0,
        sodium: 0,
        calcium: 0,
        iron: 0,
        vitaminA: 0,
        vitaminC: 0,
      },
      portions: [{ item: menu.menuName, amount: "1 porsi", weight: "300g" }],
    }));
  } catch (error: any) {
    console.error("Generate menu error:", error?.response?.data || error);
    throw error;
  }
};

/**
 * Validasi ingredient
 * Endpoint: POST /api/ai/validate-ingredient
 */
export const validateIngredient = async (ingredientName: string) => {
  const { data } = await api.post("/ai/validate-ingredient", {
    ingredientName,
  });

  return {
    isValid: data.isValid,
    message: data.message,
    allergens: data.allergens || [],
  };
};

/**
 * Deteksi allergen
 * Endpoint: POST /api/ai/check-allergen
 */
export const detectAllergens = async (ingredientNames: string[]) => {
  const { data } = await api.post("/ai/check-allergen", {
    ingredients: ingredientNames,
  });

  return {
    success: data.success,
    mergedAllergens: data.mergedAllergens || [],
    results: data.ingredients || [],
  };
};
