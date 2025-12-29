"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyChoice = exports.getMyChoices = exports.getChoiceStatus = void 0;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
/**
 * GET /api/student-choices/status
 * Cek status pemilihan menu siswa (bisa pilih atau tidak, deadline)
 */
const getChoiceStatus = async (req, res) => {
    try {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Sunday, 5 = Friday
        const hours = now.getHours();
        // Pemilihan hanya bisa di hari Jumat sebelum jam 17.00
        const canSelect = dayOfWeek === 5 && hours < 17;
        // Hitung deadline (Jumat minggu ini jam 17.00)
        const deadline = new Date(now);
        const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
        deadline.setDate(now.getDate() + daysUntilFriday);
        deadline.setHours(17, 0, 0, 0);
        return res.json({
            success: true,
            canSelect,
            deadline,
            currentTime: now,
        });
    }
    catch (error) {
        console.error("Get choice status error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.getChoiceStatus = getChoiceStatus;
/**
 * GET /api/student-choices/my-choices
 * Ambil pilihan menu siswa untuk minggu depan
 */
const getMyChoices = async (req, res) => {
    try {
        const studentId = req.user?.userId;
        if (!studentId || req.user?.role !== 'student') {
            return res.status(403).json({
                success: false,
                message: "Only students can view choices",
            });
        }
        // Ambil menu minggu depan
        const now = new Date();
        const nextMenu = await prismaClient_1.default.weeklyMenu.findFirst({
            where: {
                weekStart: { gt: now },
                isActive: true,
            },
            orderBy: {
                weekStart: 'asc',
            },
        });
        if (!nextMenu) {
            return res.json({
                success: false,
                message: "No upcoming menu found",
                choices: [],
            });
        }
        // Ambil pilihan siswa
        const choices = await prismaClient_1.default.studentMenuChoice.findMany({
            where: {
                studentId,
                weekStart: nextMenu.weekStart,
            },
        });
        return res.json({
            success: true,
            choices,
            weekStart: nextMenu.weekStart,
        });
    }
    catch (error) {
        console.error("Get my choices error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.getMyChoices = getMyChoices;
/**
 * PUT /api/student-choices
 * Update pilihan menu siswa (harian/sehat per hari)
 */
const updateMyChoice = async (req, res) => {
    try {
        const studentId = req.user?.userId;
        const { day, choice, weekStart } = req.body;
        if (!studentId || req.user?.role !== 'student') {
            return res.status(403).json({
                success: false,
                message: "Only students can make choices",
            });
        }
        // Cek apakah masih bisa pilih (Jumat sebelum 17.00)
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hours = now.getHours();
        if (dayOfWeek !== 5 || hours >= 17) {
            return res.status(403).json({
                success: false,
                message: "Menu selection is only allowed on Friday before 17:00",
            });
        }
        if (!day || !choice || !weekStart) {
            return res.status(400).json({
                success: false,
                message: "day, choice, and weekStart are required",
            });
        }
        // Upsert pilihan
        const existing = await prismaClient_1.default.studentMenuChoice.findFirst({
            where: {
                studentId,
                weekStart: new Date(weekStart),
                day,
            },
        });
        let result;
        if (existing) {
            result = await prismaClient_1.default.studentMenuChoice.update({
                where: { id: existing.id },
                data: { choice, isAutoAssigned: false },
            });
        }
        else {
            result = await prismaClient_1.default.studentMenuChoice.create({
                data: {
                    studentId,
                    weekStart: new Date(weekStart),
                    day,
                    choice,
                    isAutoAssigned: false,
                },
            });
        }
        return res.json({
            success: true,
            message: "Choice saved",
            choice: result,
        });
    }
    catch (error) {
        console.error("Update choice error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.updateMyChoice = updateMyChoice;
