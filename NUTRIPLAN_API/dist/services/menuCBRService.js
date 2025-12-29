"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMenuCasesByIngredientName = getMenuCasesByIngredientName;
exports.getMenuCasesByIngredientId = getMenuCasesByIngredientId;
exports.getAllMenuCases = getAllMenuCases;
exports.getMenuCaseByName = getMenuCaseByName;
exports.getMenuCasesByCategory = getMenuCasesByCategory;
exports.getMenuCasesByCalorieRange = getMenuCasesByCalorieRange;
exports.getRandomMenuCases = getRandomMenuCases;
exports.getMenuStatistics = getMenuStatistics;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
/**
 * Retrieve menu cases by base ingredient name
 * Returns up to 3 existing menu cases from the knowledge base
 * Does NOT invent new menus
 */
async function getMenuCasesByIngredientName(ingredientName, limit = 3) {
    try {
        if (!ingredientName || typeof ingredientName !== 'string') {
            return {
                success: false,
                requestedIngredient: ingredientName || '',
                totalCases: 0,
                menus: [],
                message: 'Nama bahan harus berupa string',
                error: 'INVALID_INPUT',
            };
        }
        const normalized = ingredientName.trim().toLowerCase();
        if (normalized.length === 0) {
            return {
                success: false,
                requestedIngredient: ingredientName,
                totalCases: 0,
                menus: [],
                message: 'Nama bahan tidak boleh kosong',
                error: 'EMPTY_INPUT',
            };
        }
        // Find ingredient by name or synonym
        const ingredient = await prismaClient_1.default.ingredient.findFirst({
            where: {
                OR: [
                    { name: normalized },
                    { synonyms: { contains: normalized, mode: 'insensitive' } },
                ],
            },
        });
        if (!ingredient) {
            return {
                success: false,
                requestedIngredient: ingredientName,
                totalCases: 0,
                menus: [],
                message: `Bahan '${ingredientName}' tidak ditemukan dalam basis pengetahuan`,
                error: 'INGREDIENT_NOT_FOUND',
            };
        }
        // Retrieve menu cases for this ingredient
        const menuCases = await prismaClient_1.default.menuCase.findMany({
            where: {
                baseIngredientId: ingredient.id,
            },
            take: Math.min(limit, 10),
            include: {
                baseIngredient: {
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
                },
            },
            orderBy: {
                menuName: 'asc',
            },
        });
        if (menuCases.length === 0) {
            return {
                success: false,
                requestedIngredient: ingredientName,
                foundIngredient: ingredient.name,
                totalCases: 0,
                menus: [],
                message: `Tidak ada menu tersimpan untuk bahan '${ingredient.name}'`,
                error: 'NO_CASES_FOUND',
            };
        }
        const formattedMenus = menuCases.map((menuCase) => ({
            id: menuCase.id,
            menuName: menuCase.menuName,
            description: menuCase.description,
            calories: menuCase.calories,
            protein: menuCase.protein,
            carbs: menuCase.carbs,
            fat: menuCase.fat,
            baseIngredient: {
                id: menuCase.baseIngredient.id,
                name: menuCase.baseIngredient.name,
                category: menuCase.baseIngredient.category,
                synonyms: menuCase.baseIngredient.synonyms,
            },
            allergens: menuCase.baseIngredient.allergens.map((link) => link.allergen.name),
        }));
        return {
            success: true,
            requestedIngredient: ingredientName,
            foundIngredient: ingredient.name,
            totalCases: menuCases.length,
            menus: formattedMenus,
            message: `Ditemukan ${menuCases.length} menu berbasis '${ingredient.name}'`,
        };
    }
    catch (error) {
        return {
            success: false,
            requestedIngredient: ingredientName,
            totalCases: 0,
            menus: [],
            message: 'Terjadi kesalahan saat mengambil menu',
            error: 'INTERNAL_ERROR',
        };
    }
}
/**
 * Retrieve menu cases by ingredient ID
 * Returns up to 3 existing menu cases
 */
async function getMenuCasesByIngredientId(ingredientId, limit = 3) {
    try {
        const ingredient = await prismaClient_1.default.ingredient.findUnique({
            where: { id: ingredientId },
        });
        if (!ingredient) {
            return {
                success: false,
                requestedIngredient: ingredientId,
                totalCases: 0,
                menus: [],
                message: 'Ingredient ID tidak ditemukan',
                error: 'INGREDIENT_NOT_FOUND',
            };
        }
        return getMenuCasesByIngredientName(ingredient.name, limit);
    }
    catch (error) {
        return {
            success: false,
            requestedIngredient: ingredientId,
            totalCases: 0,
            menus: [],
            message: 'Terjadi kesalahan saat mengambil menu',
            error: 'INTERNAL_ERROR',
        };
    }
}
/**
 * Get all available menu cases
 * Returns all stored menu cases from knowledge base
 */
async function getAllMenuCases() {
    try {
        const menuCases = await prismaClient_1.default.menuCase.findMany({
            include: {
                baseIngredient: {
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
                },
            },
            orderBy: {
                menuName: 'asc',
            },
        });
        const formattedMenus = menuCases.map((menuCase) => ({
            id: menuCase.id,
            menuName: menuCase.menuName,
            description: menuCase.description,
            calories: menuCase.calories,
            protein: menuCase.protein,
            carbs: menuCase.carbs,
            fat: menuCase.fat,
            baseIngredient: {
                id: menuCase.baseIngredient.id,
                name: menuCase.baseIngredient.name,
                category: menuCase.baseIngredient.category,
                synonyms: menuCase.baseIngredient.synonyms,
            },
            allergens: menuCase.baseIngredient.allergens.map((link) => link.allergen.name),
        }));
        return {
            success: true,
            totalCases: menuCases.length,
            menus: formattedMenus,
            message: `Ditemukan ${menuCases.length} menu dalam basis pengetahuan`,
        };
    }
    catch (error) {
        return {
            success: false,
            totalCases: 0,
            menus: [],
            message: 'Terjadi kesalahan saat mengambil menu',
        };
    }
}
/**
 * Get menu case by menu name
 */
async function getMenuCaseByName(menuName) {
    try {
        if (!menuName || typeof menuName !== 'string') {
            return {
                success: false,
                message: 'Nama menu harus berupa string',
                error: 'INVALID_INPUT',
            };
        }
        const normalized = menuName.trim();
        const menuCase = await prismaClient_1.default.menuCase.findFirst({
            where: {
                menuName: {
                    equals: normalized,
                    mode: 'insensitive',
                },
            },
            include: {
                baseIngredient: {
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
                },
            },
        });
        if (!menuCase) {
            return {
                success: false,
                message: `Menu '${menuName}' tidak ditemukan`,
                error: 'MENU_NOT_FOUND',
            };
        }
        const formattedMenu = {
            id: menuCase.id,
            menuName: menuCase.menuName,
            description: menuCase.description,
            calories: menuCase.calories,
            protein: menuCase.protein,
            carbs: menuCase.carbs,
            fat: menuCase.fat,
            baseIngredient: {
                id: menuCase.baseIngredient.id,
                name: menuCase.baseIngredient.name,
                category: menuCase.baseIngredient.category,
                synonyms: menuCase.baseIngredient.synonyms,
            },
            allergens: menuCase.baseIngredient.allergens.map((link) => link.allergen.name),
        };
        return {
            success: true,
            menu: formattedMenu,
            message: `Menu '${menuCase.menuName}' ditemukan`,
        };
    }
    catch (error) {
        return {
            success: false,
            message: 'Terjadi kesalahan saat mengambil menu',
            error: 'INTERNAL_ERROR',
        };
    }
}
/**
 * Get menu cases by category
 */
async function getMenuCasesByCategory(category, limit = 10) {
    try {
        const menuCases = await prismaClient_1.default.menuCase.findMany({
            where: {
                baseIngredient: {
                    category: category,
                },
            },
            take: Math.min(limit, 50),
            include: {
                baseIngredient: {
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
                },
            },
            orderBy: {
                menuName: 'asc',
            },
        });
        const formattedMenus = menuCases.map((menuCase) => ({
            id: menuCase.id,
            menuName: menuCase.menuName,
            description: menuCase.description,
            calories: menuCase.calories,
            protein: menuCase.protein,
            carbs: menuCase.carbs,
            fat: menuCase.fat,
            baseIngredient: {
                id: menuCase.baseIngredient.id,
                name: menuCase.baseIngredient.name,
                category: menuCase.baseIngredient.category,
                synonyms: menuCase.baseIngredient.synonyms,
            },
            allergens: menuCase.baseIngredient.allergens.map((link) => link.allergen.name),
        }));
        return {
            success: true,
            category: category,
            totalCases: menuCases.length,
            menus: formattedMenus,
            message: `Ditemukan ${menuCases.length} menu dengan kategori '${category}'`,
        };
    }
    catch (error) {
        return {
            success: false,
            category: category,
            totalCases: 0,
            menus: [],
            message: 'Terjadi kesalahan saat mengambil menu',
        };
    }
}
/**
 * Get menu cases with calorie range filter
 */
async function getMenuCasesByCalorieRange(minCalories, maxCalories, limit = 10) {
    try {
        const menuCases = await prismaClient_1.default.menuCase.findMany({
            where: {
                calories: {
                    gte: minCalories,
                    lte: maxCalories,
                },
            },
            take: Math.min(limit, 50),
            include: {
                baseIngredient: {
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
                },
            },
            orderBy: {
                calories: 'asc',
            },
        });
        const formattedMenus = menuCases.map((menuCase) => ({
            id: menuCase.id,
            menuName: menuCase.menuName,
            description: menuCase.description,
            calories: menuCase.calories,
            protein: menuCase.protein,
            carbs: menuCase.carbs,
            fat: menuCase.fat,
            baseIngredient: {
                id: menuCase.baseIngredient.id,
                name: menuCase.baseIngredient.name,
                category: menuCase.baseIngredient.category,
                synonyms: menuCase.baseIngredient.synonyms,
            },
            allergens: menuCase.baseIngredient.allergens.map((link) => link.allergen.name),
        }));
        return {
            success: true,
            totalCases: menuCases.length,
            menus: formattedMenus,
            message: `Ditemukan ${menuCases.length} menu dengan kalori ${minCalories}-${maxCalories}`,
        };
    }
    catch (error) {
        return {
            success: false,
            totalCases: 0,
            menus: [],
            message: 'Terjadi kesalahan saat mengambil menu',
        };
    }
}
/**
 * Get random menu cases for variety
 * Uses randomized ordering to return varied menu suggestions
 */
async function getRandomMenuCases(limit = 3) {
    try {
        // Get total count first
        const totalCount = await prismaClient_1.default.menuCase.count();
        if (totalCount === 0) {
            return {
                success: false,
                totalCases: 0,
                menus: [],
                message: 'Tidak ada menu dalam basis pengetahuan',
            };
        }
        // Generate random skip value
        const maxSkip = Math.max(0, totalCount - limit);
        const randomSkip = Math.floor(Math.random() * (maxSkip + 1));
        const menuCases = await prismaClient_1.default.menuCase.findMany({
            skip: randomSkip,
            take: Math.min(limit, 10),
            include: {
                baseIngredient: {
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
                },
            },
        });
        const formattedMenus = menuCases.map((menuCase) => ({
            id: menuCase.id,
            menuName: menuCase.menuName,
            description: menuCase.description,
            calories: menuCase.calories,
            protein: menuCase.protein,
            carbs: menuCase.carbs,
            fat: menuCase.fat,
            baseIngredient: {
                id: menuCase.baseIngredient.id,
                name: menuCase.baseIngredient.name,
                category: menuCase.baseIngredient.category,
                synonyms: menuCase.baseIngredient.synonyms,
            },
            allergens: menuCase.baseIngredient.allergens.map((link) => link.allergen.name),
        }));
        return {
            success: true,
            totalCases: menuCases.length,
            menus: formattedMenus,
            message: `Mengambil ${menuCases.length} menu secara acak`,
        };
    }
    catch (error) {
        return {
            success: false,
            totalCases: 0,
            menus: [],
            message: 'Terjadi kesalahan saat mengambil menu',
        };
    }
}
/**
 * Get menu statistics
 */
async function getMenuStatistics() {
    try {
        const totalMenus = await prismaClient_1.default.menuCase.count();
        const ingredientsWithMenus = await prismaClient_1.default.ingredient.findMany({
            where: {
                menuCases: {
                    some: {},
                },
            },
            select: {
                id: true,
                category: true,
            },
        });
        const allMenus = await prismaClient_1.default.menuCase.findMany({
            select: {
                calories: true,
            },
        });
        const calories = allMenus.map((m) => m.calories);
        const avgCalories = calories.length > 0
            ? Math.round(calories.reduce((a, b) => a + b, 0) / calories.length)
            : 0;
        const minCalories = calories.length > 0 ? Math.min(...calories) : 0;
        const maxCalories = calories.length > 0 ? Math.max(...calories) : 0;
        const categoryCount = {};
        ingredientsWithMenus.forEach((ing) => {
            categoryCount[ing.category] = (categoryCount[ing.category] || 0) + 1;
        });
        return {
            success: true,
            statistics: {
                totalMenus: totalMenus,
                totalIngredients: ingredientsWithMenus.length,
                averageCalories: avgCalories,
                calorieRange: { min: minCalories, max: maxCalories },
                menusByCategory: categoryCount,
            },
            message: 'Statistik menu berhasil diambil',
        };
    }
    catch (error) {
        return {
            success: false,
            statistics: {
                totalMenus: 0,
                totalIngredients: 0,
                averageCalories: 0,
                calorieRange: { min: 0, max: 0 },
                menusByCategory: {},
            },
            message: 'Terjadi kesalahan saat mengambil statistik',
        };
    }
}
