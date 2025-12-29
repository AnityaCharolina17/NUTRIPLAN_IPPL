import prisma from "../utils/prismaClient";

/**
 * Normalize ingredient name for consistent matching
 * @param name - Raw ingredient name
 * @returns Normalized name (lowercase, trimmed)
 */
function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Ingredient validation result
 */
export interface IngredientValidationResult {
  valid: boolean;
  ingredient?: {
    id: string;
    name: string;
    category: string;
    synonyms?: string;
    allergens: Array<{
      allergenId: string;
      allergenName: string;
    }>;
  };
  error?: string;
  message?: string;
}

/**
 * Validate an ingredient string against the knowledge base
 * Uses semantic matching: exact name or synonym match
 *
 * @param foodName - The ingredient string to validate
 * @returns Validation result with ingredient details if valid
 */
export async function validateIngredient(
  foodName: string
): Promise<IngredientValidationResult> {
  try {
    // Input validation
    if (!foodName || typeof foodName !== "string") {
      return {
        valid: false,
        error: "INVALID_INPUT",
        message: "Nama bahan makanan harus berupa teks dan tidak boleh kosong",
      };
    }

    const normalized = normalizeName(foodName);

    // Empty after normalization
    if (normalized.length === 0) {
      return {
        valid: false,
        error: "EMPTY_INPUT",
        message: "Nama bahan makanan tidak boleh hanya whitespace",
      };
    }

    // Query database for exact name match or synonym match
    const ingredientRecord = await prisma.ingredient.findFirst({
      where: {
        OR: [
          // Exact name match
          { name: normalized },
          // Synonym match (case-insensitive contains)
          { synonyms: { contains: normalized, mode: "insensitive" } },
        ],
      },
      include: {
        allergens: {
          include: {
            allergen: true,
          },
        },
      },
    });

    // Ingredient not found in KB
    if (!ingredientRecord) {
      return {
        valid: false,
        error: "INGREDIENT_NOT_FOUND",
        message: `Bahan makanan "${foodName}" tidak dikenali dalam knowledge base. Silakan gunakan nama bahan makanan yang valid.`,
      };
    }

    // Ingredient found: return detailed information
    return {
      valid: true,
      ingredient: {
        id: ingredientRecord.id,
        name: ingredientRecord.name,
        category: ingredientRecord.category,
        synonyms: ingredientRecord.synonyms || undefined,
        allergens: ingredientRecord.allergens.map((link) => ({
          allergenId: link.allergen.id,
          allergenName: link.allergen.name,
        })),
      },
      message: `Bahan makanan "${ingredientRecord.name}" ditemukan dan valid.`,
    };
  } catch (error) {
    console.error("Error validating ingredient:", error);
    return {
      valid: false,
      error: "INTERNAL_ERROR",
      message: "Terjadi kesalahan saat memvalidasi bahan makanan",
    };
  }
}

/**
 * Validate multiple ingredients
 * Returns validation results for each ingredient
 *
 * @param foodNames - Array of ingredient strings to validate
 * @returns Array of validation results
 */
export async function validateMultipleIngredients(
  foodNames: string[]
): Promise<IngredientValidationResult[]> {
  if (!Array.isArray(foodNames) || foodNames.length === 0) {
    return [
      {
        valid: false,
        error: "INVALID_INPUT",
        message: "Harus memberikan array nama bahan makanan yang tidak kosong",
      },
    ];
  }

  const results = await Promise.all(
    foodNames.map((name) => validateIngredient(name))
  );

  return results;
}

/**
 * Get all available ingredients from knowledge base
 * Useful for autocomplete and suggestions
 *
 * @returns List of all ingredient names and categories
 */
export async function getAllIngredients() {
  try {
    const ingredients = await prisma.ingredient.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        synonyms: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      valid: true,
      count: ingredients.length,
      ingredients,
    };
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return {
      valid: false,
      error: "INTERNAL_ERROR",
      message: "Terjadi kesalahan saat mengambil daftar bahan makanan",
    };
  }
}

/**
 * Search ingredients by keyword
 * Matches against name and synonyms
 *
 * @param keyword - Search keyword
 * @param limit - Maximum results to return
 * @returns Matching ingredients
 */
export async function searchIngredients(keyword: string, limit: number = 10) {
  try {
    if (!keyword || typeof keyword !== "string" || keyword.trim().length === 0) {
      return {
        valid: false,
        error: "INVALID_SEARCH",
        message: "Kata kunci pencarian tidak boleh kosong",
      };
    }

    const searchKey = normalizeName(keyword);

    const results = await prisma.ingredient.findMany({
      where: {
        OR: [
          { name: { contains: searchKey, mode: "insensitive" } },
          { synonyms: { contains: searchKey, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        category: true,
        synonyms: true,
      },
      take: limit,
      orderBy: {
        name: "asc",
      },
    });

    return {
      valid: true,
      count: results.length,
      results,
    };
  } catch (error) {
    console.error("Error searching ingredients:", error);
    return {
      valid: false,
      error: "INTERNAL_ERROR",
      message: "Terjadi kesalahan saat mencari bahan makanan",
    };
  }
}
