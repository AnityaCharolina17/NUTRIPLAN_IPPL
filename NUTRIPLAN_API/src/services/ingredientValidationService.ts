import prisma from '../utils/prismaClient';

export interface ValidationResult {
  isValid: boolean;
  ingredientName: string;
  ingredient?: {
    id: string;
    name: string;
    category: string;
    synonyms?: string;
  };
  allergens: string[];
  message: string;
  error?: string;
}

export interface BatchValidationResult {
  success: boolean;
  requestedCount: number;
  validCount: number;
  invalidCount: number;
  results: ValidationResult[];
  mergedAllergens: string[];
  message: string;
}

export interface IngredientSearchResult {
  found: boolean;
  totalResults: number;
  results: Array<{
    id: string;
    name: string;
    category: string;
    synonyms?: string;
    allergens: string[];
  }>;
}

/**
 * Validate a single ingredient against the knowledge base
 * Returns validation result with allergen information
 */
export async function validateSingleIngredient(
  ingredientName: string
): Promise<ValidationResult> {
  try {
    if (!ingredientName || typeof ingredientName !== 'string') {
      return {
        isValid: false,
        ingredientName: ingredientName || '',
        allergens: [],
        message: 'Input harus berupa string',
        error: 'INVALID_INPUT',
      };
    }

    const normalized = ingredientName.trim().toLowerCase();

    if (normalized.length === 0) {
      return {
        isValid: false,
        ingredientName: ingredientName,
        allergens: [],
        message: 'Nama bahan makanan tidak boleh kosong',
        error: 'EMPTY_INPUT',
      };
    }

    // Query by name or synonym
    const ingredient = await prisma.ingredient.findFirst({
      where: {
        OR: [
          { name: normalized },
          { synonyms: { contains: normalized, mode: 'insensitive' } },
        ],
      },
      include: {
        allergens: {
          select: {
            allergen: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!ingredient) {
      return {
        isValid: false,
        ingredientName: ingredientName,
        allergens: [],
        message: `Bahan makanan '${ingredientName}' tidak ditemukan dalam basis pengetahuan`,
        error: 'INGREDIENT_NOT_FOUND',
      };
    }

    const allergens = ingredient.allergens.map((link) => link.allergen.name);

    return {
      isValid: true,
      ingredientName: ingredientName,
      ingredient: {
        id: ingredient.id,
        name: ingredient.name,
        category: ingredient.category,
        synonyms: ingredient.synonyms || undefined,
      },
      allergens: allergens,
      message: `Bahan '${ingredient.name}' valid${
        allergens.length > 0
          ? ` (mengandung alergen: ${allergens.join(', ')})`
          : ' (aman dari alergen terdaftar)'
      }`,
    };
  } catch (error) {
    return {
      isValid: false,
      ingredientName: ingredientName,
      allergens: [],
      message: 'Terjadi kesalahan saat validasi bahan makanan',
      error: 'INTERNAL_ERROR',
    };
  }
}

/**
 * Validate multiple ingredients
 * Returns batch validation result with merged allergens
 */
export async function validateMultipleIngredients(
  ingredientNames: string[]
): Promise<BatchValidationResult> {
  try {
    if (!Array.isArray(ingredientNames)) {
      return {
        success: false,
        requestedCount: 0,
        validCount: 0,
        invalidCount: 0,
        results: [],
        mergedAllergens: [],
        message: 'Input harus berupa array',
      };
    }

    if (ingredientNames.length === 0) {
      return {
        success: false,
        requestedCount: 0,
        validCount: 0,
        invalidCount: 0,
        results: [],
        mergedAllergens: [],
        message: 'Minimal 1 bahan makanan harus diberikan',
      };
    }

    // Validate each ingredient
    const results = await Promise.all(
      ingredientNames.map((ing) => validateSingleIngredient(ing))
    );

    // Merge allergens
    const allergenSet = new Set<string>();
    results.forEach((result) => {
      result.allergens.forEach((allergen) => allergenSet.add(allergen));
    });

    const validCount = results.filter((r) => r.isValid).length;
    const invalidCount = results.length - validCount;

    return {
      success: validCount > 0,
      requestedCount: ingredientNames.length,
      validCount: validCount,
      invalidCount: invalidCount,
      results: results,
      mergedAllergens: Array.from(allergenSet).sort(),
      message: `Validasi selesai: ${validCount} valid, ${invalidCount} invalid dari ${ingredientNames.length} bahan`,
    };
  } catch (error) {
    return {
      success: false,
      requestedCount: ingredientNames.length,
      validCount: 0,
      invalidCount: ingredientNames.length,
      results: [],
      mergedAllergens: [],
      message: 'Terjadi kesalahan saat validasi batch',
    };
  }
}

/**
 * Get all available ingredients
 * Returns full ingredient list with allergen information
 */
export async function getAllAvailableIngredients(): Promise<IngredientSearchResult> {
  try {
    const ingredients = await prisma.ingredient.findMany({
      include: {
        allergens: {
          select: {
            allergen: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      found: true,
      totalResults: ingredients.length,
      results: ingredients.map((ing) => ({
        id: ing.id,
        name: ing.name,
        category: ing.category,
        synonyms: ing.synonyms || undefined,
        allergens: ing.allergens.map((link) => link.allergen.name),
      })),
    };
  } catch (error) {
    return {
      found: false,
      totalResults: 0,
      results: [],
    };
  }
}

/**
 * Search ingredients by keyword
 * Returns matching ingredients by name or synonyms
 */
export async function searchIngredientsByKeyword(
  keyword: string
): Promise<IngredientSearchResult> {
  try {
    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
      return {
        found: false,
        totalResults: 0,
        results: [],
      };
    }

    const normalized = keyword.trim().toLowerCase();

    const ingredients = await prisma.ingredient.findMany({
      where: {
        OR: [
          { name: { contains: normalized, mode: 'insensitive' } },
          { synonyms: { contains: normalized, mode: 'insensitive' } },
        ],
      },
      include: {
        allergens: {
          select: {
            allergen: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      found: ingredients.length > 0,
      totalResults: ingredients.length,
      results: ingredients.map((ing) => ({
        id: ing.id,
        name: ing.name,
        category: ing.category,
        synonyms: ing.synonyms || undefined,
        allergens: ing.allergens.map((link) => link.allergen.name),
      })),
    };
  } catch (error) {
    return {
      found: false,
      totalResults: 0,
      results: [],
    };
  }
}

/**
 * Get ingredients by category
 */
export async function getIngredientsByCategory(
  category: string
): Promise<IngredientSearchResult> {
  try {
    const ingredients = await prisma.ingredient.findMany({
      where: {
        category: category as any,
      },
      include: {
        allergens: {
          select: {
            allergen: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      found: ingredients.length > 0,
      totalResults: ingredients.length,
      results: ingredients.map((ing) => ({
        id: ing.id,
        name: ing.name,
        category: ing.category,
        synonyms: ing.synonyms || undefined,
        allergens: ing.allergens.map((link) => link.allergen.name),
      })),
    };
  } catch (error) {
    return {
      found: false,
      totalResults: 0,
      results: [],
    };
  }
}

/**
 * Validate ingredient and get detailed information
 */
export async function getIngredientDetails(
  ingredientName: string
): Promise<ValidationResult> {
  return validateSingleIngredient(ingredientName);
}

/**
 * Check if ingredient has specific allergen
 */
export async function ingredientHasAllergen(
  ingredientName: string,
  allergenName: string
): Promise<boolean> {
  try {
    const normalized = ingredientName.trim().toLowerCase();
    const allergenNormalized = allergenName.trim().toLowerCase();

    const result = await prisma.ingredient.findFirst({
      where: {
        OR: [
          { name: normalized },
          { synonyms: { contains: normalized, mode: 'insensitive' } },
        ],
      },
      include: {
        allergens: {
          select: {
            allergen: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!result) return false;

    return result.allergens.some(
      (link) => link.allergen.name.toLowerCase() === allergenNormalized
    );
  } catch (error) {
    return false;
  }
}

/**
 * Get all ingredient categories
 */
export async function getAllIngredientCategories(): Promise<string[]> {
  try {
    const categories = await prisma.ingredient.findMany({
      distinct: ['category'],
      select: {
        category: true,
      },
    });

    return categories.map((c) => c.category).sort();
  } catch (error) {
    return [];
  }
}

/**
 * Validate ingredient against user allergens
 * Returns safety assessment
 */
export async function validateIngredientsAgainstUserAllergens(
  ingredientNames: string[],
  userAllergens: string[]
): Promise<{
  safe: boolean;
  validIngredients: string[];
  invalidIngredients: string[];
  conflictingAllergens: Array<{
    ingredient: string;
    allergens: string[];
    userAllergyMatches: string[];
  }>;
  message: string;
}> {
  try {
    const validationResults = await validateMultipleIngredients(ingredientNames);

    const validIngredients = validationResults.results
      .filter((r) => r.isValid)
      .map((r) => r.ingredient!.name);

    const invalidIngredients = validationResults.results
      .filter((r) => !r.isValid)
      .map((r) => r.ingredientName);

    const userAllergenSet = new Set(
      userAllergens.map((a) => a.trim().toLowerCase())
    );

    const conflicts: Array<{
      ingredient: string;
      allergens: string[];
      userAllergyMatches: string[];
    }> = [];

    validationResults.results
      .filter((r) => r.isValid)
      .forEach((result) => {
        const matches = result.allergens.filter((allergen) =>
          userAllergenSet.has(allergen.toLowerCase())
        );

        if (matches.length > 0) {
          conflicts.push({
            ingredient: result.ingredient!.name,
            allergens: result.allergens,
            userAllergyMatches: matches,
          });
        }
      });

    const safe = conflicts.length === 0;

    return {
      safe: safe,
      validIngredients: validIngredients,
      invalidIngredients: invalidIngredients,
      conflictingAllergens: conflicts,
      message: safe
        ? `Semua bahan aman untuk dikonsumsi`
        : `⚠️ ${conflicts.length} bahan mengandung alergen yang cocok dengan alergi pengguna`,
    };
  } catch (error) {
    return {
      safe: false,
      validIngredients: [],
      invalidIngredients: ingredientNames,
      conflictingAllergens: [],
      message: 'Terjadi kesalahan saat validasi',
    };
  }
}
