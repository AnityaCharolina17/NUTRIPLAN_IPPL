import { api } from "./api";
import { MenuPortion, DetailedNutrition } from "./menuData";

/**
 * ============================
 * TYPES
 * ============================
 */
export interface MenuSuggestion {
  name: string;
  description: string;
  ingredients: string[];
  allergens: string[];
  nutritionFacts: DetailedNutrition;
  portions: MenuPortion[];
}

/**
 * ============================
 * GENERATE MENU (CBR)
 * Endpoint: POST /api/ai/generate-menu-cbr
 * Body: { ingredients: string[] }
 * ============================
 */
export const generateMenuSuggestions = async (
  ingredient: string
): Promise<MenuSuggestion[]> => {
  try {
    const response = await api.post("/ai/generate-menu-cbr", {
      ingredients: [ingredient], // ⬅️ WAJIB array
    });

    const data = response.data;
    console.log("CBR Response:", data);

    if (!data?.success) {
      throw new Error(data?.message || "Generate menu gagal");
    }

    if (!Array.isArray(data.menus) || data.menus.length === 0) {
      throw new Error("Tidak ada menu yang dihasilkan");
    }

    return data.menus.map((menu: any) => ({
      name: menu.menuName || "Menu Tanpa Nama",
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
      portions: [
        {
          item: menu.menuName || "Menu",
          amount: "1 porsi",
          weight: "300g",
        },
      ],
    }));
  } catch (error: any) {
    console.error(
      "Generate menu error:",
      error?.response?.data || error
    );
    throw error;
  }
};

/**
 * ============================
 * VALIDATE INGREDIENT
 * Endpoint: POST /api/ai/validate-ingredient
 * ============================
 */
export const validateIngredient = async (ingredientName: string) => {
  try {
    const { data } = await api.post("/ai/validate-ingredient", {
      ingredientName,
    });

    return {
      isValid: Boolean(data.isValid),
      message: data.message || "",
      allergens: data.allergens || [],
    };
  } catch (error: any) {
    console.error(
      "Validate ingredient error:",
      error?.response?.data || error
    );
    throw error;
  }
};

/**
 * ============================
 * DETECT ALLERGENS
 * Endpoint: POST /api/ai/check-allergen
 * ============================
 */
export const detectAllergens = async (ingredientNames: string[]) => {
  try {
    const { data } = await api.post("/ai/check-allergen", {
      ingredients: ingredientNames,
    });

    return {
      success: Boolean(data.success),
      mergedAllergens: data.mergedAllergens || [],
      results: data.ingredients || [],
    };
  } catch (error: any) {
    console.error(
      "Detect allergens error:",
      error?.response?.data || error
    );
    throw error;
  }
};
