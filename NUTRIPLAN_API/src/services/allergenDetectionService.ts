/**
 * Allergen Detection Service
 * ================================
 * Semantic rule-based allergen detection using the knowledge base.
 *
 * Features:
 * - Ingredient → Allergen mapping via IngredientAllergen
 * - No string matching, pure semantic reasoning
 * - Multi-ingredient allergen merging
 * - User allergen safety checking
 * - No generative AI
 *
 * Database Flow:
 * Ingredient (by name/synonym) → IngredientAllergen → Allergen
 */

import prisma from '../utils/prismaClient';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AllergenDetectionResult {
  success: boolean;
  ingredients: Array<{
    name: string;
    found: boolean;
    allergens: string[];
  }>;
  mergedAllergens: string[];
  uniqueAllergenCount: number;
  message: string;
  error?: string;
}

export interface MenuAllergenCheckResult {
  success: boolean;
  menuName: string;
  baseIngredient: {
    name: string;
    category: string;
  };
  detectedAllergens: string[];
  hasAllergens: boolean;
  message: string;
}

export interface UserAllergenSafetyCheckResult {
  success: boolean;
  userId: string;
  userAllergens: string[];
  detectedAllergens: string[];
  conflicts: string[];
  isSafe: boolean;
  riskLevel: 'safe' | 'warning' | 'critical';
  recommendation: string;
}

export interface AllergenStatisticsResult {
  success: boolean;
  totalAllergens: number;
  ingredientAllergenMappings: number;
  allergensWithIngredients: Array<{
    allergenName: string;
    ingredientCount: number;
    examples: string[];
  }>;
  message: string;
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Detect allergens from a single ingredient
 * Returns empty array if ingredient not found (no invention)
 */
async function detectIngredientsAllergens(
  ingredientName: string
): Promise<{ found: boolean; name: string; allergens: string[] }> {
  const normalized = ingredientName.trim().toLowerCase();

  // Step 1: Look up ingredient by name or synonym
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

  // If not found, return empty (no invention)
  if (!ingredient) {
    return {
      found: false,
      name: ingredientName,
      allergens: [],
    };
  }

  // Step 2: Extract allergen names from IngredientAllergen mappings
  const allergens = ingredient.allergens.map((link) => link.allergen.name);

  return {
    found: true,
    name: ingredient.name,
    allergens: allergens,
  };
}

/**
 * Detect allergens from multiple ingredients
 * Merges allergens from all ingredients
 */
export async function detectMultipleIngredientsAllergens(
  ingredientNames: string[]
): Promise<AllergenDetectionResult> {
  try {
    // Step 1: Validate input
    if (!Array.isArray(ingredientNames) || ingredientNames.length === 0) {
      return {
        success: false,
        ingredients: [],
        mergedAllergens: [],
        uniqueAllergenCount: 0,
        message: 'Input harus berupa array dengan minimal 1 bahan makanan',
        error: 'INVALID_INPUT',
      };
    }

    // Step 2: Detect allergens for each ingredient
    const results = await Promise.all(
      ingredientNames.map((ing) => detectIngredientsAllergens(ing))
    );

    // Step 3: Merge allergens (deduplicate)
    const mergedAllergenSet = new Set<string>();
    results.forEach((result) => {
      result.allergens.forEach((allergen) => mergedAllergenSet.add(allergen));
    });

    const mergedAllergens = Array.from(mergedAllergenSet).sort();
    const foundCount = results.filter((r) => r.found).length;

    return {
      success: true,
      ingredients: results,
      mergedAllergens: mergedAllergens,
      uniqueAllergenCount: mergedAllergens.length,
      message: `Ditemukan ${mergedAllergens.length} alergen dari ${foundCount} bahan yang valid`,
    };
  } catch (error) {
    return {
      success: false,
      ingredients: [],
      mergedAllergens: [],
      uniqueAllergenCount: 0,
      message: 'Terjadi kesalahan saat mendeteksi alergen',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check menu case for allergens
 * Given a base ingredient, detect all allergens via IngredientAllergen
 */
export async function checkMenuAllergens(
  baseIngredientName: string
): Promise<MenuAllergenCheckResult> {
  try {
    const normalized = baseIngredientName.trim().toLowerCase();

    // Step 1: Look up ingredient
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
        menuCases: true,
      },
    });

    if (!ingredient) {
      return {
        success: false,
        menuName: baseIngredientName,
        baseIngredient: { name: '', category: '' },
        detectedAllergens: [],
        hasAllergens: false,
        message: `Bahan makanan '${baseIngredientName}' tidak ditemukan`,
      };
    }

    // Step 2: Extract allergens via IngredientAllergen
    const allergens = ingredient.allergens.map((link) => link.allergen.name);

    // Step 3: Get first menu case (for display)
    const menuCase = ingredient.menuCases[0];
    const menuName = menuCase?.menuName || ingredient.name;

    return {
      success: true,
      menuName: menuName,
      baseIngredient: {
        name: ingredient.name,
        category: ingredient.category,
      },
      detectedAllergens: allergens,
      hasAllergens: allergens.length > 0,
      message:
        allergens.length > 0
          ? `Menu mengandung ${allergens.length} alergen: ${allergens.join(', ')}`
          : `Menu aman dari alergen yang terdaftar`,
    };
  } catch (error) {
    return {
      success: false,
      menuName: baseIngredientName,
      baseIngredient: { name: '', category: '' },
      detectedAllergens: [],
      hasAllergens: false,
      message: 'Terjadi kesalahan saat memeriksa alergen menu',
    };
  }
}

/**
 * Check if detected allergens conflict with user's known allergens
 * Provides safety recommendation
 */
export async function checkUserAllergenSafety(
  userId: string,
  detectedAllergens: string[]
): Promise<UserAllergenSafetyCheckResult> {
  try {
    // Step 1: Get user's known allergens
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        allergens: true,
      },
    });

    if (!user) {
      return {
        success: false,
        userId: userId,
        userAllergens: [],
        detectedAllergens: detectedAllergens,
        conflicts: [],
        isSafe: true,
        riskLevel: 'safe',
        recommendation: 'Pengguna tidak ditemukan',
      };
    }

    // Step 2: Extract user's allergen names
    const userAllergenSet = new Set<string>();
    user.allergens.forEach((ua) => {
      userAllergenSet.add(ua.allergen.toLowerCase());
    });
    user.customAllergies?.split(',').forEach((a) => {
      userAllergenSet.add(a.trim().toLowerCase());
    });

    // Step 3: Find conflicts
    const detectedNormalized = detectedAllergens.map((a) =>
      a.toLowerCase()
    );
    const conflicts = detectedNormalized.filter((allergen) =>
      userAllergenSet.has(allergen)
    );

    // Step 4: Determine risk level
    const isSafe = conflicts.length === 0;
    let riskLevel: 'safe' | 'warning' | 'critical' = 'safe';
    if (conflicts.length > 0) {
      riskLevel = conflicts.length === 1 ? 'warning' : 'critical';
    }

    // Step 5: Generate recommendation
    let recommendation = 'Menu aman untuk dikonsumsi oleh pengguna ini';
    if (conflicts.length > 0) {
      recommendation =
        `⚠️ PERINGATAN: Menu mengandung alergen yang diketahui: ${conflicts.join(', ')}. ` +
        `Hindari menu ini atau konsultasikan dengan ahli gizi.`;
    }

    return {
      success: true,
      userId: userId,
      userAllergens: Array.from(userAllergenSet),
      detectedAllergens: detectedAllergens,
      conflicts: conflicts,
      isSafe: isSafe,
      riskLevel: riskLevel,
      recommendation: recommendation,
    };
  } catch (error) {
    return {
      success: false,
      userId: userId,
      userAllergens: [],
      detectedAllergens: detectedAllergens,
      conflicts: [],
      isSafe: true,
      riskLevel: 'safe',
      recommendation: 'Terjadi kesalahan saat memeriksa alergen pengguna',
    };
  }
}

/**
 * Get all ingredients with their allergens
 * For debugging and allergen management
 */
export async function getAllIngredientsWithAllergens(): Promise<{
  success: boolean;
  totalIngredients: number;
  ingredientsWithAllergens: Array<{
    name: string;
    category: string;
    allergens: string[];
  }>;
}> {
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

    const result = ingredients.map((ing) => ({
      name: ing.name,
      category: ing.category,
      allergens: ing.allergens.map((link) => link.allergen.name),
    }));

    return {
      success: true,
      totalIngredients: result.length,
      ingredientsWithAllergens: result,
    };
  } catch (error) {
    return {
      success: false,
      totalIngredients: 0,
      ingredientsWithAllergens: [],
    };
  }
}

/**
 * Get allergen statistics
 * Shows which allergens are mapped to which ingredients
 */
export async function getAllergenStatistics(): Promise<AllergenStatisticsResult> {
  try {
    // Step 1: Get all allergens with ingredient mappings
    const allergens = await prisma.allergen.findMany({
      include: {
        ingredients: {
          include: {
            ingredient: {
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

    // Step 2: Build result
    const result = allergens.map((allergen) => ({
      allergenName: allergen.name,
      ingredientCount: allergen.ingredients.length,
      examples: allergen.ingredients
        .slice(0, 3)
        .map((link) => link.ingredient.name),
    }));

    // Step 3: Count total mappings
    const totalMappings = allergens.reduce(
      (sum, allergen) => sum + allergen.ingredients.length,
      0
    );

    return {
      success: true,
      totalAllergens: allergens.length,
      ingredientAllergenMappings: totalMappings,
      allergensWithIngredients: result,
      message: `${allergens.length} alergen dengan ${totalMappings} pemetaan bahan makanan`,
    };
  } catch (error) {
    return {
      success: false,
      totalAllergens: 0,
      ingredientAllergenMappings: 0,
      allergensWithIngredients: [],
      message: 'Terjadi kesalahan saat mengambil statistik alergen',
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate if allergen exists in knowledge base
 */
export async function validateAllergen(allergenName: string): Promise<boolean> {
  const allergen = await prisma.allergen.findUnique({
    where: { name: allergenName.toLowerCase() },
  });
  return allergen !== null;
}

/**
 * Get all known allergens
 */
export async function getAllAllergens(): Promise<string[]> {
  const allergens = await prisma.allergen.findMany({
    orderBy: { name: 'asc' },
  });
  return allergens.map((a) => a.name);
}

/**
 * Get ingredient details with allergens
 */
export async function getIngredientAllergenDetails(
  ingredientName: string
): Promise<{
  found: boolean;
  ingredient: {
    name: string;
    category: string;
    synonyms?: string;
  } | null;
  allergens: string[];
}> {
  const normalized = ingredientName.trim().toLowerCase();

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
      found: false,
      ingredient: null,
      allergens: [],
    };
  }

  return {
    found: true,
    ingredient: {
      name: ingredient.name,
      category: ingredient.category,
      synonyms: ingredient.synonyms || undefined,
    },
    allergens: ingredient.allergens.map((link) => link.allergen.name),
  };
}
