"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllergenStatisticsEndpoint = exports.getAllIngredientsAllergenEndpoint = exports.checkUserAllergenSafetyEndpoint = exports.checkMenuAllergenEndpoint = exports.checkSingleIngredientAllergen = exports.checkIngredientsAllergen = exports.getMenuCaseStatistics = exports.getAllMenuCases = exports.generateMenuFromIngredient = exports.searchIngredientsByKeyword = exports.getAvailableIngredients = exports.validateIngredientsBatch = exports.validateIngredient = exports.detectAllergensAI = exports.generateMealPlan = exports.checkAllergenSafety = exports.analyzeFood = void 0;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const allergenDetectionService_1 = require("../services/allergenDetectionService");
function normalizeName(name) {
    return name.trim().toLowerCase();
}
async function analyzeFoodDeterministic(foodDescription) {
    const trimmed = foodDescription.trim();
    const tokens = trimmed.split(/[,\n]/).map((t) => normalizeName(t)).filter(Boolean);
    // Helper: find ingredient in DB by name or synonyms
    async function findIngredientInDB(name) {
        const normalized = normalizeName(name);
        const found = await prismaClient_1.default.ingredient.findFirst({
            where: {
                OR: [
                    { name: normalized },
                    { synonyms: { contains: normalized, mode: 'insensitive' } },
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
        return found;
    }
    // If multiple tokens provided, treat as ingredient list.
    if (tokens.length > 1) {
        const validated = [];
        const unknown = [];
        const allergenSet = new Set();
        for (const token of tokens) {
            const ing = await findIngredientInDB(token);
            if (ing) {
                validated.push(ing.name);
                ing.allergens.forEach((link) => allergenSet.add(link.allergen.name));
            }
            else {
                unknown.push(token);
            }
        }
        if (unknown.length > 0) {
            return {
                foodName: trimmed,
                ingredients: validated,
                allergens: Array.from(allergenSet),
                notes: `Bahan tidak dikenal: ${unknown.join(', ')}`,
            };
        }
        return {
            foodName: trimmed,
            ingredients: validated,
            allergens: Array.from(allergenSet),
        };
    }
    // Single token: try CBR (menu cases) or ingredient KB.
    const base = tokens[0] || trimmed.toLowerCase();
    // Step 1: Check if it's a known ingredient
    const ingredientMatch = await findIngredientInDB(base);
    if (ingredientMatch) {
        // CBR: retrieve menu cases based on this ingredient
        const cases = await prismaClient_1.default.menuCase.findMany({
            where: { baseIngredientId: ingredientMatch.id },
            take: 1,
        });
        if (cases.length > 0) {
            const allergenNames = ingredientMatch.allergens.map((link) => link.allergen.name);
            return {
                foodName: cases[0].menuName,
                ingredients: [ingredientMatch.name],
                allergens: allergenNames,
            };
        }
        // No case found, return ingredient info
        return {
            foodName: ingredientMatch.name,
            ingredients: [ingredientMatch.name],
            allergens: ingredientMatch.allergens.map((link) => link.allergen.name),
        };
    }
    // Step 2: Try to match existing menu items (legacy data)
    const menuItems = await prismaClient_1.default.menuItem.findMany({
        where: {
            ingredients: {
                some: {
                    ingredient: {
                        contains: base,
                        mode: 'insensitive',
                    },
                },
            },
        },
        include: {
            ingredients: true,
            allergens: true,
        },
        take: 1,
    });
    if (menuItems.length > 0) {
        const chosen = menuItems[0];
        const ingredientNames = chosen.ingredients.map((ing) => normalizeName(ing.ingredient));
        const allergenTags = chosen.allergens.map((a) => normalizeName(a.allergen));
        return {
            foodName: chosen.mainDish,
            ingredients: ingredientNames,
            allergens: allergenTags,
        };
    }
    // Not recognized, reject.
    return {
        foodName: trimmed,
        ingredients: [],
        allergens: [],
        notes: 'Input tidak dikenali sebagai bahan atau menu yang valid',
    };
}
/**
 * POST /api/ai/analyze-food
 * Menganalisis makanan secara komprehensif menggunakan AI
 */
const analyzeFood = async (req, res) => {
    try {
        const { foodDescription } = req.body;
        if (!foodDescription || foodDescription.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Deskripsi makanan wajib diisi",
            });
        }
        const analysis = await analyzeFoodDeterministic(foodDescription);
        if (analysis.ingredients.length === 0) {
            return res.status(400).json({
                success: false,
                message: analysis.notes || "Input tidak valid",
                analysis,
            });
        }
        return res.json({
            success: true,
            analysis,
        });
    }
    catch (error) {
        console.error("Analyze food error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
};
exports.analyzeFood = analyzeFood;
/**
 * POST /api/ai/check-allergen-safety
 * Cek keamanan makanan untuk user dengan alergi tertentu menggunakan AI
 */
const checkAllergenSafety = async (req, res) => {
    try {
        const { foodDescription } = req.body;
        const userId = req.user?.userId;
        if (!foodDescription) {
            return res.status(400).json({
                success: false,
                message: "Deskripsi makanan wajib diisi",
            });
        }
        // Get user allergens
        let userAllergens = [];
        if (userId) {
            const user = await prismaClient_1.default.user.findUnique({
                where: { id: userId },
                select: { customAllergies: true },
            });
            const dbAllergens = await prismaClient_1.default.userAllergen.findMany({
                where: { userId },
                select: { allergen: true },
            });
            const customList = user?.customAllergies
                ? user.customAllergies.split(',').map(s => s.trim()).filter(Boolean)
                : [];
            userAllergens = [...dbAllergens.map(a => a.allergen), ...customList];
        }
        const foodAnalysis = await analyzeFoodDeterministic(foodDescription);
        if (foodAnalysis.ingredients.length === 0) {
            return res.status(400).json({
                success: false,
                message: foodAnalysis.notes || "Input tidak valid",
                foodAnalysis,
            });
        }
        // Match allergens deterministically
        const detectedAllergens = (foodAnalysis.allergens || []).map((a) => a.toLowerCase());
        const userAllergensLower = userAllergens.map(a => a.toLowerCase());
        const matchedAllergens = userAllergensLower.filter(ua => detectedAllergens.some(da => da.includes(ua) || ua.includes(da)));
        const isSafe = matchedAllergens.length === 0;
        const recommendation = isSafe
            ? "Makanan ini aman berdasarkan pengetahuan alergi yang terdeteksi."
            : "Hindari makanan ini karena mengandung alergen Anda.";
        return res.json({
            success: true,
            foodAnalysis,
            userAllergens,
            matchedAllergens,
            isSafe,
            severity: isSafe ? "safe" : "danger",
            recommendation,
        });
    }
    catch (error) {
        console.error("Check allergen safety error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
};
exports.checkAllergenSafety = checkAllergenSafety;
const generateMealPlan = async (req, res) => {
    try {
        const now = new Date();
        const currentMenu = await prismaClient_1.default.weeklyMenu.findFirst({
            where: {
                weekStart: { lte: now },
                weekEnd: { gte: now },
                isActive: true,
            },
            include: {
                items: {
                    include: {
                        ingredients: true,
                        allergens: true,
                    },
                },
            },
        });
        const goodMenus = await prismaClient_1.default.goodMenu.findMany({
            where: {
                weekStart: currentMenu?.weekStart,
            },
            include: {
                ingredients: true,
                allergens: true,
            },
        });
        return res.json({
            success: true,
            mealPlan: {
                source: 'case-based',
                weeklyMenu: currentMenu,
                alternativeMenus: goodMenus,
            },
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};
exports.generateMealPlan = generateMealPlan;
/**
 * POST /api/ai/detect-allergens
 * Deteksi bahan dan alergen berbasis knowledge base (tanpa generative AI)
 * lalu cocokkan dengan alergi user yang login.
 */
const detectAllergensAI = async (req, res) => {
    try {
        const { name, description, ingredients = [] } = req.body;
        if (!name && !description && (!ingredients || ingredients.length === 0)) {
            return res.status(400).json({
                success: false,
                message: "Nama, deskripsi, atau daftar bahan wajib diisi",
            });
        }
        const userId = req.user?.userId;
        let userAllergens = [];
        if (userId) {
            const user = await prismaClient_1.default.user.findUnique({
                where: { id: userId },
                select: { customAllergies: true },
            });
            const dbAllergens = await prismaClient_1.default.userAllergen.findMany({
                where: { userId },
                select: { allergen: true },
            });
            const customList = user?.customAllergies
                ? user.customAllergies
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [];
            userAllergens = [...dbAllergens.map((a) => a.allergen), ...customList]
                .map((a) => a.toLowerCase())
                .filter(Boolean);
        }
        const combinedIngredients = [];
        if (ingredients && ingredients.length > 0) {
            combinedIngredients.push(...ingredients.map((i) => normalizeName(i)));
        }
        if (name)
            combinedIngredients.push(normalizeName(name));
        if (description) {
            combinedIngredients.push(...description.split(/[,\n]/).map((t) => normalizeName(t)).filter(Boolean));
        }
        const validated = [];
        const possibleAllergens = new Set();
        const unknown = [];
        for (const ing of combinedIngredients) {
            const found = await prismaClient_1.default.ingredient.findFirst({
                where: {
                    OR: [
                        { name: ing },
                        { synonyms: { contains: ing, mode: 'insensitive' } },
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
            if (found) {
                validated.push(found.name);
                found.allergens.forEach((link) => possibleAllergens.add(link.allergen.name));
            }
            else {
                unknown.push(ing);
            }
        }
        return res.json({
            success: unknown.length === 0,
            aiExtracted: {
                ingredients: validated,
                possibleAllergens: Array.from(possibleAllergens),
                summary: unknown.length ? `Bahan tidak dikenal: ${unknown.join(', ')}` : undefined,
            },
            userAllergens,
            matchedAllergens: userAllergens.filter((ua) => Array.from(possibleAllergens).some((aa) => aa.includes(ua) || ua.includes(aa))),
            hasAllergy: userAllergens.some((ua) => Array.from(possibleAllergens).some((aa) => aa.includes(ua) || ua.includes(aa))),
        });
    }
    catch (error) {
        console.error("AI detect allergens error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
};
exports.detectAllergensAI = detectAllergensAI;
/**
 * Validate single ingredient against knowledge base
 * Endpoint: POST /api/ai/validate-ingredient
 *
 * Request body: { foodName: string }
 * Response: { valid: boolean, ingredient: {...} | error: string, message: string }
 */
const validateIngredient = async (req, res) => {
    try {
        const { foodName } = req.body;
        // Input validation
        if (!foodName || typeof foodName !== "string") {
            return res.status(400).json({
                valid: false,
                error: "INVALID_INPUT",
                message: "Nama bahan makanan harus berupa teks dan tidak boleh kosong",
            });
        }
        const normalized = foodName.trim().toLowerCase();
        if (normalized.length === 0) {
            return res.status(400).json({
                valid: false,
                error: "EMPTY_INPUT",
                message: "Nama bahan makanan tidak boleh hanya whitespace",
            });
        }
        // Query knowledge base for ingredient
        const ingredientRecord = await prismaClient_1.default.ingredient.findFirst({
            where: {
                OR: [
                    { name: normalized },
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
        // Ingredient not found
        if (!ingredientRecord) {
            return res.status(400).json({
                valid: false,
                error: "INGREDIENT_NOT_FOUND",
                message: `Bahan makanan "${foodName}" tidak dikenali dalam knowledge base. Silakan gunakan nama bahan makanan yang valid.`,
                suggestions: "Gunakan endpoint GET /api/ai/ingredients untuk melihat daftar bahan yang valid",
            });
        }
        // Ingredient found - return with details
        return res.status(200).json({
            valid: true,
            ingredient: {
                id: ingredientRecord.id,
                name: ingredientRecord.name,
                category: ingredientRecord.category,
                synonyms: ingredientRecord.synonyms ? ingredientRecord.synonyms.split(",").map((s) => s.trim()) : [],
                allergens: ingredientRecord.allergens.map((link) => ({
                    allergenId: link.allergen.id,
                    allergenName: link.allergen.name,
                })),
            },
            message: `Bahan makanan "${ingredientRecord.name}" ditemukan dan valid.`,
        });
    }
    catch (error) {
        console.error("Ingredient validation error:", error);
        return res.status(500).json({
            valid: false,
            error: "INTERNAL_ERROR",
            message: "Terjadi kesalahan saat memvalidasi bahan makanan",
        });
    }
};
exports.validateIngredient = validateIngredient;
/**
 * Validate multiple ingredients against knowledge base
 * Endpoint: POST /api/ai/validate-ingredients-batch
 *
 * Request body: { foodNames: string[] }
 * Response: { validations: [...], summary: { total, valid, invalid } }
 */
const validateIngredientsBatch = async (req, res) => {
    try {
        const { foodNames } = req.body;
        // Input validation
        if (!Array.isArray(foodNames) || foodNames.length === 0) {
            return res.status(400).json({
                error: "INVALID_INPUT",
                message: "Harus memberikan array nama bahan makanan yang tidak kosong",
            });
        }
        const validations = [];
        let validCount = 0;
        let invalidCount = 0;
        for (const foodName of foodNames) {
            if (typeof foodName !== "string" || foodName.trim().length === 0) {
                validations.push({
                    foodName: foodName || "(empty)",
                    valid: false,
                    error: "INVALID_INPUT",
                    message: "Nama bahan harus berupa teks dan tidak kosong",
                });
                invalidCount++;
                continue;
            }
            const normalized = foodName.trim().toLowerCase();
            const ingredientRecord = await prismaClient_1.default.ingredient.findFirst({
                where: {
                    OR: [
                        { name: normalized },
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
            if (!ingredientRecord) {
                validations.push({
                    foodName,
                    valid: false,
                    error: "INGREDIENT_NOT_FOUND",
                    message: `Bahan makanan "${foodName}" tidak dikenali`,
                });
                invalidCount++;
            }
            else {
                validations.push({
                    foodName,
                    valid: true,
                    ingredient: {
                        id: ingredientRecord.id,
                        name: ingredientRecord.name,
                        category: ingredientRecord.category,
                        allergens: ingredientRecord.allergens.map((link) => link.allergen.name),
                    },
                });
                validCount++;
            }
        }
        return res.status(200).json({
            validations,
            summary: {
                total: foodNames.length,
                valid: validCount,
                invalid: invalidCount,
                validationPercentage: Math.round((validCount / foodNames.length) * 100),
            },
        });
    }
    catch (error) {
        console.error("Batch ingredient validation error:", error);
        return res.status(500).json({
            error: "INTERNAL_ERROR",
            message: "Terjadi kesalahan saat memvalidasi bahan makanan",
        });
    }
};
exports.validateIngredientsBatch = validateIngredientsBatch;
/**
 * Get all available ingredients from knowledge base
 * Endpoint: GET /api/ai/ingredients
 *
 * Response: { count: number, ingredients: [...] }
 */
const getAvailableIngredients = async (req, res) => {
    try {
        const ingredients = await prismaClient_1.default.ingredient.findMany({
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
        const categoryCounts = ingredients.reduce((acc, ing) => {
            acc[ing.category] = (acc[ing.category] || 0) + 1;
            return acc;
        }, {});
        return res.status(200).json({
            success: true,
            count: ingredients.length,
            categories: categoryCounts,
            ingredients,
        });
    }
    catch (error) {
        console.error("Get ingredients error:", error);
        return res.status(500).json({
            success: false,
            error: "INTERNAL_ERROR",
            message: "Terjadi kesalahan saat mengambil daftar bahan makanan",
        });
    }
};
exports.getAvailableIngredients = getAvailableIngredients;
/**
 * Search ingredients by keyword
 * Endpoint: GET /api/ai/ingredients/search?keyword=nasi&limit=10
 *
 * Response: { count: number, results: [...] }
 */
const searchIngredientsByKeyword = async (req, res) => {
    try {
        const { keyword, limit = 10 } = req.query;
        if (!keyword || typeof keyword !== "string" || keyword.trim().length === 0) {
            return res.status(400).json({
                error: "INVALID_SEARCH",
                message: "Kata kunci pencarian tidak boleh kosong",
            });
        }
        const limitNumber = Math.min(parseInt(limit) || 10, 50);
        const searchKey = keyword.trim().toLowerCase();
        const results = await prismaClient_1.default.ingredient.findMany({
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
            take: limitNumber,
            orderBy: {
                name: "asc",
            },
        });
        return res.status(200).json({
            success: true,
            keyword,
            count: results.length,
            results,
        });
    }
    catch (error) {
        console.error("Search ingredients error:", error);
        return res.status(500).json({
            success: false,
            error: "INTERNAL_ERROR",
            message: "Terjadi kesalahan saat mencari bahan makanan",
        });
    }
};
exports.searchIngredientsByKeyword = searchIngredientsByKeyword;
/**
 * Generate menus using Case-Based Reasoning (CBR)
 * Endpoint: POST /api/ai/generate-menu-cbr (preferred) and /api/ai/generate-menu (legacy)
 *
 * Retrieves up to 3 existing menu cases based on a base ingredient.
 * NO MENU INVENTION - all outputs come from stored MenuCase records.
 *
 * Request body: { foodName: string }
 * Response: { success, baseIngredient, cases: [...], caseCount, message }
 */
const generateMenuFromIngredient = async (req, res) => {
    try {
        // Support both keys: UI sends { baseIngredient }, legacy uses { foodName }
        const { foodName, baseIngredient } = req.body;
        const rawName = (baseIngredient ?? foodName ?? '').toString();
        // Input validation
        if (!rawName || typeof rawName !== "string") {
            return res.status(400).json({
                success: false,
                error: "INVALID_INPUT",
                message: "Nama bahan makanan harus berupa teks dan tidak boleh kosong",
            });
        }
        const normalized = rawName.trim().toLowerCase();
        if (normalized.length === 0) {
            return res.status(400).json({
                success: false,
                error: "EMPTY_INPUT",
                message: "Nama bahan makanan tidak boleh hanya whitespace",
            });
        }
        // Validate ingredient exists (exact name or synonym match)
        // Get ALL ingredients and check both name and synonyms
        const allIngredients = await prismaClient_1.default.ingredient.findMany();
        let ingredient = null;
        for (const ing of allIngredients) {
            const ingNameLower = ing.name.toLowerCase();
            // Check exact name match
            if (ingNameLower === normalized) {
                ingredient = ing;
                break;
            }
            // Check synonyms
            if (ing.synonyms) {
                const synonymList = ing.synonyms.split(',').map(s => s.trim().toLowerCase());
                if (synonymList.includes(normalized)) {
                    ingredient = ing;
                    break;
                }
            }
        }
        if (!ingredient) {
            return res.status(400).json({
                success: false,
                error: "INGREDIENT_NOT_FOUND",
                message: `Bahan makanan "${rawName}" tidak dikenali dalam knowledge base. Gunakan GET /api/ai/ingredients untuk melihat daftar bahan yang valid.`,
            });
        }
        // Query MenuCase table for cases with this base ingredient
        // Limit to 3 most relevant cases
        const cases = await prismaClient_1.default.menuCase.findMany({
            where: {
                baseIngredientId: ingredient.id,
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
            take: 3,
            orderBy: {
                menuName: "asc",
            },
        });
        // Generate appropriate message
        let message;
        if (cases.length === 0) {
            message = `Tidak ada menu yang tersedia untuk bahan makanan "${ingredient.name}". Menu hanya tersedia untuk: ayam, ikan, daging sapi, dan ikan tongkol.`;
        }
        else if (cases.length === 1) {
            message = `Ditemukan ${cases.length} menu untuk bahan makanan "${ingredient.name}".`;
        }
        else {
            message = `Ditemukan ${cases.length} menu untuk bahan makanan "${ingredient.name}". Pilih salah satu untuk digunakan.`;
        }
        // Align response shape to frontend expectations:
        // Return `menus` array and include `baseIngredient` inside each menu item.
        const menus = cases.map((c) => ({
            id: c.id,
            menuName: c.menuName,
            description: c.description,
            calories: c.calories,
            protein: c.protein,
            carbs: c.carbs,
            fat: c.fat,
            baseIngredient: {
                id: ingredient.id,
                name: ingredient.name,
                category: ingredient.category,
            },
        }));
        return res.status(200).json({
            success: true,
            baseIngredient: {
                id: ingredient.id,
                name: ingredient.name,
                category: ingredient.category,
            },
            menus,
            caseCount: menus.length,
            message,
        });
    }
    catch (error) {
        console.error("CBR menu generation error:", error);
        return res.status(500).json({
            success: false,
            error: "INTERNAL_ERROR",
            message: "Terjadi kesalahan saat menghasilkan menu",
        });
    }
};
exports.generateMenuFromIngredient = generateMenuFromIngredient;
/**
 * Get all available MenuCase records
 * Endpoint: GET /api/ai/cbr/cases
 *
 * Shows all stored menu cases grouped by base ingredient.
 * Useful for debugging and exploration.
 */
const getAllMenuCases = async (req, res) => {
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
        return res.status(200).json({
            success: true,
            totalCases: cases.length,
            ingredientCount: Object.keys(grouped).length,
            grouped,
        });
    }
    catch (error) {
        console.error("Get menu cases error:", error);
        return res.status(500).json({
            success: false,
            error: "INTERNAL_ERROR",
            message: "Terjadi kesalahan saat mengambil data menu cases",
        });
    }
};
exports.getAllMenuCases = getAllMenuCases;
/**
 * Get MenuCase statistics
 * Endpoint: GET /api/ai/cbr/statistics
 *
 * Shows distribution of menu cases across ingredients and categories.
 */
const getMenuCaseStatistics = async (req, res) => {
    try {
        // Get total cases
        const totalCases = await prismaClient_1.default.menuCase.count();
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
                _count: {
                    select: {
                        menuCases: true,
                    },
                },
            },
        });
        // Category distribution
        const categoryDistribution = {};
        ingredientsWithCases.forEach((ing) => {
            categoryDistribution[ing.category] =
                (categoryDistribution[ing.category] || 0) + 1;
        });
        // Find max cases for a single ingredient
        const maxCasesPerIngredient = ingredientsWithCases.length > 0
            ? Math.max(...ingredientsWithCases.map((ing) => ing._count.menuCases))
            : 0;
        return res.status(200).json({
            success: true,
            totalCases,
            ingredientCount: ingredientsWithCases.length,
            maxCasesPerIngredient,
            categoryDistribution,
            ingredientsWithCases: ingredientsWithCases.map((ing) => ({
                name: ing.name,
                category: ing.category,
                caseCount: ing._count.menuCases,
            })),
        });
    }
    catch (error) {
        console.error("Get menu case statistics error:", error);
        return res.status(500).json({
            success: false,
            error: "INTERNAL_ERROR",
            message: "Terjadi kesalahan saat mengambil statistik menu cases",
        });
    }
};
exports.getMenuCaseStatistics = getMenuCaseStatistics;
// ============================================================================
// ALLERGEN DETECTION ENDPOINTS
// ============================================================================
/**
 * Check allergens in ingredients
 * Endpoint: POST /api/ai/check-allergen
 *
 * Request body:
 * {
 *   "ingredients": ["ayam", "telur", "susu"]  // array of ingredient names
 * }
 *
 * Returns detected allergens from IngredientAllergen mappings
 */
const checkIngredientsAllergen = async (req, res) => {
    try {
        const { ingredients } = req.body;
        // Validate input
        if (!ingredients) {
            return res.status(400).json({
                success: false,
                error: "INVALID_INPUT",
                message: "Field 'ingredients' harus berupa array",
            });
        }
        if (!Array.isArray(ingredients)) {
            return res.status(400).json({
                success: false,
                error: "INVALID_INPUT",
                message: "Field 'ingredients' harus berupa array",
            });
        }
        if (ingredients.length === 0) {
            return res.status(400).json({
                success: false,
                error: "EMPTY_INPUT",
                message: "Minimal 1 bahan makanan harus diberikan",
            });
        }
        // Validate all items are strings
        if (!ingredients.every((ing) => typeof ing === "string")) {
            return res.status(400).json({
                success: false,
                error: "INVALID_INPUT",
                message: "Semua bahan makanan harus berupa string",
            });
        }
        // Call detection service
        const result = await (0, allergenDetectionService_1.detectMultipleIngredientsAllergens)(ingredients);
        if (!result.success) {
            return res.status(400).json(result);
        }
        // Debug log
        console.log('=== checkIngredientsAllergen DEBUG ===');
        console.log('Request ingredients:', ingredients);
        console.log('Result ingredients:', result.ingredients);
        console.log('Result merged allergens:', result.mergedAllergens);
        return res.status(200).json({
            ...result,
            requestedCount: ingredients.length,
            foundCount: result.ingredients.filter((i) => i.found).length,
        });
    }
    catch (error) {
        console.error("Check allergen error:", error);
        return res.status(500).json({
            success: false,
            error: "INTERNAL_ERROR",
            message: "Terjadi kesalahan saat mendeteksi alergen",
        });
    }
};
exports.checkIngredientsAllergen = checkIngredientsAllergen;
/**
 * Check allergen in single ingredient
 * Endpoint: GET /api/ai/check-allergen/:ingredient
 *
 * Returns allergen details for a single ingredient
 */
const checkSingleIngredientAllergen = async (req, res) => {
    try {
        const { ingredient } = req.params;
        if (!ingredient || typeof ingredient !== "string" || ingredient.trim() === "") {
            return res.status(400).json({
                success: false,
                error: "EMPTY_INPUT",
                message: "Nama bahan makanan tidak boleh kosong",
            });
        }
        // Call service
        const result = await (0, allergenDetectionService_1.getIngredientAllergenDetails)(ingredient);
        if (!result.found) {
            return res.status(400).json({
                success: false,
                error: "INGREDIENT_NOT_FOUND",
                message: `Bahan makanan '${ingredient}' tidak ditemukan dalam basis pengetahuan`,
                searchedTerm: ingredient,
                suggestion: "Cek ejaan atau gunakan nama bahan makanan yang valid",
            });
        }
        return res.status(200).json({
            success: true,
            ingredient: result.ingredient,
            allergens: result.allergens,
            hasAllergens: result.allergens.length > 0,
            message: result.allergens.length > 0
                ? `Bahan ini mengandung ${result.allergens.length} alergen: ${result.allergens.join(", ")}`
                : `Bahan ini aman dari alergen yang terdaftar`,
        });
    }
    catch (error) {
        console.error("Check single ingredient allergen error:", error);
        return res.status(500).json({
            success: false,
            error: "INTERNAL_ERROR",
            message: "Terjadi kesalahan saat mendeteksi alergen bahan",
        });
    }
};
exports.checkSingleIngredientAllergen = checkSingleIngredientAllergen;
/**
 * Check menu allergens
 * Endpoint: GET /api/ai/check-allergen/menu/:ingredient
 *
 * Given a base ingredient, return all allergens for menu cases
 */
const checkMenuAllergenEndpoint = async (req, res) => {
    try {
        const { ingredient } = req.params;
        if (!ingredient || typeof ingredient !== "string" || ingredient.trim() === "") {
            return res.status(400).json({
                success: false,
                error: "EMPTY_INPUT",
                message: "Nama bahan makanan tidak boleh kosong",
            });
        }
        // Call service
        const result = await (0, allergenDetectionService_1.checkMenuAllergens)(ingredient);
        if (!result.success) {
            return res.status(400).json(result);
        }
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Check menu allergen error:", error);
        return res.status(500).json({
            success: false,
            error: "INTERNAL_ERROR",
            message: "Terjadi kesalahan saat memeriksa alergen menu",
        });
    }
};
exports.checkMenuAllergenEndpoint = checkMenuAllergenEndpoint;
/**
 * Check user allergen safety
 * Endpoint: POST /api/ai/check-allergen/user-safety
 *
 * Check if detected allergens conflict with user's known allergens
 */
const checkUserAllergenSafetyEndpoint = async (req, res) => {
    try {
        const authReq = req;
        const { detectedAllergens } = req.body;
        // Validate input
        if (!Array.isArray(detectedAllergens)) {
            return res.status(400).json({
                success: false,
                error: "INVALID_INPUT",
                message: "Field 'detectedAllergens' harus berupa array",
            });
        }
        if (!authReq.user?.userId) {
            return res.status(401).json({
                success: false,
                error: "UNAUTHORIZED",
                message: "Pengguna harus login terlebih dahulu",
            });
        }
        // Call service
        const result = await (0, allergenDetectionService_1.checkUserAllergenSafety)(authReq.user.userId, detectedAllergens);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Check user allergen safety error:", error);
        return res.status(500).json({
            success: false,
            error: "INTERNAL_ERROR",
            message: "Terjadi kesalahan saat memeriksa keamanan alergen pengguna",
        });
    }
};
exports.checkUserAllergenSafetyEndpoint = checkUserAllergenSafetyEndpoint;
/**
 * Get all ingredients with allergens
 * Endpoint: GET /api/ai/allergen/ingredients
 *
 * Returns all ingredients with their allergens for debugging/management
 */
const getAllIngredientsAllergenEndpoint = async (req, res) => {
    try {
        const result = await (0, allergenDetectionService_1.getAllIngredientsWithAllergens)();
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Get all ingredients allergen error:", error);
        return res.status(500).json({
            success: false,
            error: "INTERNAL_ERROR",
            message: "Terjadi kesalahan saat mengambil data bahan makanan dan alergen",
        });
    }
};
exports.getAllIngredientsAllergenEndpoint = getAllIngredientsAllergenEndpoint;
/**
 * Get allergen statistics
 * Endpoint: GET /api/ai/allergen/statistics
 *
 * Shows allergen distribution and ingredient mappings
 */
const getAllergenStatisticsEndpoint = async (req, res) => {
    try {
        const result = await (0, allergenDetectionService_1.getAllergenStatistics)();
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Get allergen statistics error:", error);
        return res.status(500).json({
            success: false,
            error: "INTERNAL_ERROR",
            message: "Terjadi kesalahan saat mengambil statistik alergen",
        });
    }
};
exports.getAllergenStatisticsEndpoint = getAllergenStatisticsEndpoint;
