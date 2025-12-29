"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectMultipleIngredientsAllergens = detectMultipleIngredientsAllergens;
exports.checkMenuAllergens = checkMenuAllergens;
exports.checkUserAllergenSafety = checkUserAllergenSafety;
exports.getAllIngredientsWithAllergens = getAllIngredientsWithAllergens;
exports.getAllergenStatistics = getAllergenStatistics;
exports.validateAllergen = validateAllergen;
exports.getAllAllergens = getAllAllergens;
exports.getIngredientAllergenDetails = getIngredientAllergenDetails;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
// ============================================================================
// CORE FUNCTIONS
// ============================================================================
/**
 * Detect allergens from a single ingredient
 * Returns empty array if ingredient not found (no invention)
 */
async function detectIngredientsAllergens(ingredientName) {
    const normalized = ingredientName.trim().toLowerCase();
    // Step 1: Look up ingredient by name or synonym
    const ingredient = await prismaClient_1.default.ingredient.findFirst({
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
async function detectMultipleIngredientsAllergens(ingredientNames) {
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
        const results = await Promise.all(ingredientNames.map((ing) => detectIngredientsAllergens(ing)));
        // Step 3: Merge allergens (deduplicate)
        const mergedAllergenSet = new Set();
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
    }
    catch (error) {
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
async function checkMenuAllergens(baseIngredientName) {
    try {
        const normalized = baseIngredientName.trim().toLowerCase();
        // Step 1: Look up ingredient
        const ingredient = await prismaClient_1.default.ingredient.findFirst({
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
            message: allergens.length > 0
                ? `Menu mengandung ${allergens.length} alergen: ${allergens.join(', ')}`
                : `Menu aman dari alergen yang terdaftar`,
        };
    }
    catch (error) {
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
async function checkUserAllergenSafety(userId, detectedAllergens) {
    try {
        // Step 1: Get user's known allergens
        const user = await prismaClient_1.default.user.findUnique({
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
        const userAllergenSet = new Set();
        user.allergens.forEach((ua) => {
            userAllergenSet.add(ua.allergen.toLowerCase());
        });
        user.customAllergies?.split(',').forEach((a) => {
            userAllergenSet.add(a.trim().toLowerCase());
        });
        // Step 3: Find conflicts
        const detectedNormalized = detectedAllergens.map((a) => a.toLowerCase());
        const conflicts = detectedNormalized.filter((allergen) => userAllergenSet.has(allergen));
        // Step 4: Determine risk level
        const isSafe = conflicts.length === 0;
        let riskLevel = 'safe';
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
    }
    catch (error) {
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
async function getAllIngredientsWithAllergens() {
    try {
        const ingredients = await prismaClient_1.default.ingredient.findMany({
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
    }
    catch (error) {
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
async function getAllergenStatistics() {
    try {
        // Step 1: Get all allergens with ingredient mappings
        const allergens = await prismaClient_1.default.allergen.findMany({
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
        const totalMappings = allergens.reduce((sum, allergen) => sum + allergen.ingredients.length, 0);
        return {
            success: true,
            totalAllergens: allergens.length,
            ingredientAllergenMappings: totalMappings,
            allergensWithIngredients: result,
            message: `${allergens.length} alergen dengan ${totalMappings} pemetaan bahan makanan`,
        };
    }
    catch (error) {
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
async function validateAllergen(allergenName) {
    const allergen = await prismaClient_1.default.allergen.findUnique({
        where: { name: allergenName.toLowerCase() },
    });
    return allergen !== null;
}
/**
 * Get all known allergens
 */
async function getAllAllergens() {
    const allergens = await prismaClient_1.default.allergen.findMany({
        orderBy: { name: 'asc' },
    });
    return allergens.map((a) => a.name);
}
/**
 * Get ingredient details with allergens
 */
async function getIngredientAllergenDetails(ingredientName) {
    const normalized = ingredientName.trim().toLowerCase();
    const ingredient = await prismaClient_1.default.ingredient.findFirst({
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
