"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMenusFromBaseIngredient = generateMenusFromBaseIngredient;
exports.generateMenusByIngredientName = generateMenusByIngredientName;
exports.getAllMenuCases = getAllMenuCases;
exports.getMenuCaseStatistics = getMenuCaseStatistics;
exports.validateMenuCaseAvailability = validateMenuCaseAvailability;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
/**
 * Case-Based Reasoning Service
 * Retrieves existing menu cases based on a base ingredient
 * No menu invention - all results come from stored MenuCase records
 */
/**
 * Generate menus using Case-Based Reasoning
 * Retrieves up to 3 existing menu cases based on a validated base ingredient
 *
 * @param ingredientId - UUID of the validated base ingredient
 * @param limit - Maximum number of cases to return (default: 3, max: 10)
 * @returns CBR generation result with retrieved cases
 */
async function generateMenusFromBaseIngredient(ingredientId, limit = 3) {
    try {
        // Validate ingredient exists
        const ingredient = await prismaClient_1.default.ingredient.findUnique({
            where: { id: ingredientId },
        });
        if (!ingredient) {
            return {
                success: false,
                baseIngredient: { id: ingredientId, name: "Unknown", category: "misc" },
                cases: [],
                caseCount: 0,
                message: "Bahan makanan tidak ditemukan dalam knowledge base",
            };
        }
        // Limit to maximum 10 cases
        const safeLimit = Math.min(Math.max(limit, 1), 10);
        // Query MenuCase table for cases with this base ingredient
        const cases = await prismaClient_1.default.menuCase.findMany({
            where: {
                baseIngredientId: ingredientId,
            },
            select: {
                id: true,
                menuName: true,
                description: true,
                calories: true,
                protein: true,
                carbs: true,
                fat: true,
            },
            take: safeLimit,
            orderBy: {
                menuName: "asc",
            },
        });
        // Determine message based on case count
        let message;
        if (cases.length === 0) {
            message = `Tidak ada menu yang tersedia untuk bahan makanan "${ingredient.name}". Silakan coba bahan makanan lain.`;
        }
        else if (cases.length === 1) {
            message = `Ditemukan ${cases.length} menu untuk bahan makanan "${ingredient.name}".`;
        }
        else {
            message = `Ditemukan ${cases.length} menu untuk bahan makanan "${ingredient.name}".`;
        }
        return {
            success: true,
            baseIngredient: {
                id: ingredient.id,
                name: ingredient.name,
                category: ingredient.category,
            },
            cases,
            caseCount: cases.length,
            message,
        };
    }
    catch (error) {
        console.error("CBR menu generation error:", error);
        return {
            success: false,
            baseIngredient: { id: ingredientId, name: "Unknown", category: "misc" },
            cases: [],
            caseCount: 0,
            message: "Terjadi kesalahan saat menghasilkan menu",
        };
    }
}
/**
 * Generate menus using Case-Based Reasoning with ingredient name
 * First validates the ingredient, then retrieves menu cases
 *
 * @param ingredientName - Name of the base ingredient (will be validated first)
 * @param limit - Maximum number of cases to return (default: 3)
 * @returns CBR generation result with retrieved cases
 */
async function generateMenusByIngredientName(ingredientName, limit = 3) {
    try {
        // Input validation
        if (!ingredientName || typeof ingredientName !== "string") {
            return {
                success: false,
                baseIngredient: { id: "", name: ingredientName || "", category: "misc" },
                cases: [],
                caseCount: 0,
                message: "Nama bahan makanan harus berupa teks dan tidak boleh kosong",
            };
        }
        const normalized = ingredientName.trim().toLowerCase();
        if (normalized.length === 0) {
            return {
                success: false,
                baseIngredient: { id: "", name: "", category: "misc" },
                cases: [],
                caseCount: 0,
                message: "Nama bahan makanan tidak boleh hanya whitespace",
            };
        }
        // Validate ingredient exists (exact name or synonym match)
        const ingredient = await prismaClient_1.default.ingredient.findFirst({
            where: {
                OR: [
                    { name: normalized },
                    { synonyms: { contains: normalized, mode: "insensitive" } },
                ],
            },
        });
        if (!ingredient) {
            return {
                success: false,
                baseIngredient: { id: "", name: ingredientName, category: "misc" },
                cases: [],
                caseCount: 0,
                message: `Bahan makanan "${ingredientName}" tidak dikenali dalam knowledge base. Gunakan endpoint GET /api/ai/ingredients untuk melihat daftar bahan yang valid.`,
            };
        }
        // Retrieve menu cases for this ingredient
        return generateMenusFromBaseIngredient(ingredient.id, limit);
    }
    catch (error) {
        console.error("CBR menu generation by name error:", error);
        return {
            success: false,
            baseIngredient: { id: "", name: ingredientName, category: "misc" },
            cases: [],
            caseCount: 0,
            message: "Terjadi kesalahan saat menghasilkan menu",
        };
    }
}
/**
 * Get all available MenuCase records (debug/exploration)
 * Shows all stored cases across all ingredients
 *
 * @returns All MenuCase records grouped by base ingredient
 */
async function getAllMenuCases() {
    try {
        const cases = await prismaClient_1.default.menuCase.findMany({
            include: {
                baseIngredient: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                    },
                },
            },
            orderBy: [
                {
                    baseIngredient: {
                        name: "asc",
                    },
                },
                {
                    menuName: "asc",
                },
            ],
        });
        // Group by base ingredient
        const grouped = {};
        cases.forEach((c) => {
            const key = c.baseIngredient.name;
            if (!grouped[key]) {
                grouped[key] = {
                    ingredient: c.baseIngredient,
                    cases: [],
                };
            }
            grouped[key].cases.push({
                id: c.id,
                menuName: c.menuName,
                description: c.description,
                calories: c.calories,
                protein: c.protein,
                carbs: c.carbs,
                fat: c.fat,
            });
        });
        return {
            success: true,
            totalCases: cases.length,
            ingredientCount: Object.keys(grouped).length,
            grouped,
        };
    }
    catch (error) {
        console.error("Error fetching all menu cases:", error);
        return {
            success: false,
            totalCases: 0,
            ingredientCount: 0,
            message: "Terjadi kesalahan saat mengambil data menu cases",
        };
    }
}
/**
 * Get menu case statistics
 * Shows distribution of cases across ingredients and categories
 *
 * @returns Statistics about stored menu cases
 */
async function getMenuCaseStatistics() {
    try {
        // Get total cases
        const totalCases = await prismaClient_1.default.menuCase.count();
        // Get cases per ingredient
        const casesPerIngredient = await prismaClient_1.default.menuCase.groupBy({
            by: ["baseIngredientId"],
            _count: true,
        });
        // Get ingredients with cases
        const ingredientsWithCases = await prismaClient_1.default.ingredient.findMany({
            where: {
                menuCases: {
                    some: {},
                },
            },
            select: {
                id: true,
                name: true,
                category: true,
            },
        });
        // Category distribution
        const categoryDistribution = {};
        ingredientsWithCases.forEach((ing) => {
            categoryDistribution[ing.category] =
                (categoryDistribution[ing.category] || 0) + 1;
        });
        return {
            success: true,
            totalCases,
            ingredientCount: ingredientsWithCases.length,
            maxCasesPerIngredient: casesPerIngredient.length > 0
                ? Math.max(...casesPerIngredient.map((c) => c._count))
                : 0,
            categoryDistribution,
            ingredientsWithCases: ingredientsWithCases.map((ing) => ({
                name: ing.name,
                category: ing.category,
            })),
        };
    }
    catch (error) {
        console.error("Error getting menu case statistics:", error);
        return {
            success: false,
            message: "Terjadi kesalahan saat mengambil statistik menu cases",
        };
    }
}
/**
 * Validate that MenuCase can be generated for an ingredient
 * Returns success if ingredient exists and has at least one case
 *
 * @param ingredientId - UUID of ingredient
 * @returns Validation result with case availability
 */
async function validateMenuCaseAvailability(ingredientId) {
    try {
        // Check ingredient exists
        const ingredient = await prismaClient_1.default.ingredient.findUnique({
            where: { id: ingredientId },
        });
        if (!ingredient) {
            return {
                valid: false,
                error: "INGREDIENT_NOT_FOUND",
                message: "Bahan makanan tidak ditemukan",
            };
        }
        // Check if cases exist
        const caseCount = await prismaClient_1.default.menuCase.count({
            where: { baseIngredientId: ingredientId },
        });
        if (caseCount === 0) {
            return {
                valid: true,
                ingredient: {
                    id: ingredient.id,
                    name: ingredient.name,
                },
                casesAvailable: false,
                caseCount: 0,
                message: `Bahan makanan "${ingredient.name}" tidak memiliki menu tersimpan dalam knowledge base`,
            };
        }
        return {
            valid: true,
            ingredient: {
                id: ingredient.id,
                name: ingredient.name,
            },
            casesAvailable: true,
            caseCount,
            message: `Bahan makanan "${ingredient.name}" memiliki ${caseCount} menu tersimpan`,
        };
    }
    catch (error) {
        console.error("Error validating menu case availability:", error);
        return {
            valid: false,
            error: "INTERNAL_ERROR",
            message: "Terjadi kesalahan saat memvalidasi ketersediaan menu",
        };
    }
}
