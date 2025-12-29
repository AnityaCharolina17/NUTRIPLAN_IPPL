"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePortionCount = exports.saveWeeklyMenu = exports.getNextWeekMenu = exports.getCurrentWeekMenu = void 0;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
/**
 * GET /api/menus/current
 * Ambil menu minggu ini (weekStart <= now <= weekEnd && isActive)
 */
const getCurrentWeekMenu = async (req, res) => {
    try {
        const now = new Date();
        const menu = await prismaClient_1.default.weeklyMenu.findFirst({
            where: {
                weekStart: { lte: now },
                weekEnd: { gte: now },
                isActive: true,
            },
            include: {
                items: {
                    select: {
                        id: true,
                        day: true,
                        mainDish: true,
                        sideDish: true,
                        vegetable: true,
                        fruit: true,
                        drink: true,
                        imageUrl: true,
                        calories: true,
                        protein: true,
                        carbs: true,
                        fat: true,
                        portionCount: true,
                        ingredients: true,
                        allergens: true,
                    },
                },
            },
        });
        if (!menu) {
            return res.json({
                success: false,
                message: "Belum ada menu aktif untuk minggu ini",
                menu: null,
            });
        }
        return res.json({
            success: true,
            menu,
        });
    }
    catch (error) {
        console.error("Get current menu error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.getCurrentWeekMenu = getCurrentWeekMenu;
/**
 * GET /api/menus/next-week
 * Ambil menu minggu depan
 */
const getNextWeekMenu = async (req, res) => {
    try {
        const now = new Date();
        const menu = await prismaClient_1.default.weeklyMenu.findFirst({
            where: {
                weekStart: { gt: now },
                isActive: true,
            },
            include: {
                items: {
                    select: {
                        id: true,
                        day: true,
                        mainDish: true,
                        sideDish: true,
                        vegetable: true,
                        fruit: true,
                        drink: true,
                        imageUrl: true,
                        calories: true,
                        protein: true,
                        carbs: true,
                        fat: true,
                        portionCount: true,
                        ingredients: true,
                        allergens: true,
                    },
                },
            },
            orderBy: {
                weekStart: 'asc',
            },
        });
        if (!menu) {
            return res.json({
                success: false,
                message: "Belum ada menu untuk minggu depan",
                menu: null,
            });
        }
        return res.json({
            success: true,
            menu,
        });
    }
    catch (error) {
        console.error("Get next week menu error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.getNextWeekMenu = getNextWeekMenu;
/**
 * POST /api/menus/save
 * Simpan menu mingguan (Admin only)
 */
const saveWeeklyMenu = async (req, res) => {
    try {
        const { weekStart, weekEnd, items } = req.body;
        const createdById = req.user?.userId;
        if (!createdById || req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Only admin can save menus",
            });
        }
        if (!weekStart || !weekEnd || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "weekStart, weekEnd, and items are required",
            });
        }
        // Create menu with nested items
        const menu = await prismaClient_1.default.weeklyMenu.create({
            data: {
                weekStart: new Date(weekStart),
                weekEnd: new Date(weekEnd),
                createdById,
                isActive: true,
                items: {
                    create: items.map((item) => ({
                        day: item.day,
                        mainDish: item.mainDish,
                        sideDish: item.sideDish,
                        vegetable: item.vegetable,
                        fruit: item.fruit,
                        drink: item.drink,
                        calories: item.calories,
                        protein: item.protein,
                        carbs: item.carbs,
                        fat: item.fat,
                        portionCount: item.portionCount || 150,
                        ingredients: {
                            create: (item.ingredients || []).map((ing) => ({
                                ingredient: ing.ingredient,
                                quantity: ing.quantity,
                                unit: ing.unit,
                            })),
                        },
                        allergens: {
                            create: (item.allergens || []).map((allergen) => ({
                                allergen,
                            })),
                            select: {
                                id: true,
                                day: true,
                                mainDish: true,
                                sideDish: true,
                                vegetable: true,
                                fruit: true,
                                drink: true,
                                imageUrl: true,
                                calories: true,
                                protein: true,
                                carbs: true,
                                fat: true,
                                portionCount: true,
                                ingredients: true,
                                allergens: true,
                            },
                        },
                    })),
                },
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
        return res.json({
            success: true,
            message: "Menu saved successfully",
            menu,
        });
    }
    catch (error) {
        console.error("Save menu error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error saving menu",
        });
    }
};
exports.saveWeeklyMenu = saveWeeklyMenu;
/**
 * PUT /api/menus/:menuItemId/portion
 * Update portionCount (Kitchen staff)
 */
const updatePortionCount = async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const { portionCount } = req.body;
        if (req.user?.role !== 'kitchen_staff' && req.user?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Only kitchen staff or admin can update portions",
            });
        }
        const updated = await prismaClient_1.default.menuItem.update({
            where: { id: menuItemId },
            data: { portionCount },
        });
        return res.json({
            success: true,
            message: "Portion count updated",
            menuItem: updated,
        });
    }
    catch (error) {
        console.error("Update portion error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.updatePortionCount = updatePortionCount;
