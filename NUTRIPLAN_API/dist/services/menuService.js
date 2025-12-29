"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentWeekMenu = void 0;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const getCurrentWeekMenu = async () => {
    // Ambil 1 menu yang isActive = true, termasuk item, bahan, dan alergennya
    const menu = await prismaClient_1.default.weeklyMenu.findFirst({
        where: {
            isActive: true,
        },
        orderBy: {
            weekStart: "desc",
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
    return menu;
};
exports.getCurrentWeekMenu = getCurrentWeekMenu;
