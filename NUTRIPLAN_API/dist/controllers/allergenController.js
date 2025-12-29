"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMenuItemAllergens = exports.checkAllergens = void 0;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
/**
 * POST /api/allergens/check
 * Cek apakah ada allergen dalam menu untuk user tertentu
 * Menggunakan Knowledge Base & keyword matching (tanpa AI)
 */
const checkAllergens = async (req, res) => {
    try {
        const { ingredients, menuAllergens } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }
        // Ambil allergen user dari database
        const userAllergensDb = await prismaClient_1.default.userAllergen.findMany({
            where: { userId },
        });
        // Ambil custom allergen user (jika ada)
        const user = await prismaClient_1.default.user.findUnique({
            where: { id: userId },
            select: { customAllergies: true },
        });
        const customList = user?.customAllergies
            ? user.customAllergies
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [];
        const userAllergenList = [
            ...userAllergensDb.map((a) => a.allergen),
            ...customList,
        ].map((a) => a.toLowerCase());
        const matchedAllergens = [];
        const menuAllergenList = (menuAllergens || []).map((a) => a.toLowerCase());
        const ingredientList = (ingredients || []).map((i) => i.toLowerCase());
        // Cek allergen langsung dari menu
        menuAllergenList.forEach((allergen) => {
            if (userAllergenList.includes(allergen)) {
                matchedAllergens.push(allergen);
            }
        });
        // Cek allergen dari bahan (keyword matching)
        ingredientList.forEach((ingredient) => {
            userAllergenList.forEach((allergen) => {
                if (ingredient.includes(allergen) ||
                    allergen.includes(ingredient)) {
                    if (!matchedAllergens.includes(allergen)) {
                        matchedAllergens.push(allergen);
                    }
                }
            });
        });
        const hasAllergy = matchedAllergens.length > 0;
        return res.json({
            success: true,
            hasAllergy,
            matchedAllergens,
            severity: hasAllergy ? "high" : "none",
            recommendation: hasAllergy
                ? "Pilih menu sehat yang aman untuk alergi Anda"
                : "Menu ini aman untuk Anda",
            method: "knowledge-base",
        });
    }
    catch (error) {
        console.error("Check allergens error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.checkAllergens = checkAllergens;
/**
 * POST /api/allergens/check-menu/:menuItemId
 * Cek allergen untuk menu item tertentu
 */
const checkMenuItemAllergens = async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }
        // Ambil menu item
        const menuItem = await prismaClient_1.default.menuItem.findUnique({
            where: { id: menuItemId },
            include: {
                ingredients: true,
                allergens: true,
            },
        });
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found",
            });
        }
        // Ambil allergen user
        const userAllergens = await prismaClient_1.default.userAllergen.findMany({
            where: { userId },
        });
        const userAllergenList = userAllergens.map((a) => a.allergen.toLowerCase());
        const menuAllergenList = menuItem.allergens.map((a) => a.allergen.toLowerCase());
        const matchedAllergens = menuAllergenList.filter((allergen) => userAllergenList.includes(allergen));
        const hasAllergy = matchedAllergens.length > 0;
        return res.json({
            success: true,
            menuItem,
            hasAllergy,
            matchedAllergens,
            severity: hasAllergy ? "high" : "none",
            recommendation: hasAllergy
                ? "Pilih menu sehat sebagai pengganti"
                : "Menu ini aman untuk Anda",
        });
    }
    catch (error) {
        console.error("Check menu item allergens error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.checkMenuItemAllergens = checkMenuItemAllergens;
