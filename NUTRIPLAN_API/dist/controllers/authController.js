"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.confirmReset = exports.requestReset = exports.login = exports.register = void 0;
const authService_1 = require("../services/authService");
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const register = async (req, res) => {
    const result = await (0, authService_1.registerUser)(req.body);
    res.status(result.success ? 201 : 400).json(result);
};
exports.register = register;
const login = async (req, res) => {
    const { email, password, role } = req.body;
    const result = await (0, authService_1.loginUser)(email, password, role);
    res.status(result.success ? 200 : 401).json(result);
};
exports.login = login;
const requestReset = async (req, res) => {
    const { email } = req.body;
    const result = await (0, authService_1.requestPasswordReset)(email);
    res.status(result.success ? 200 : 404).json(result);
};
exports.requestReset = requestReset;
const confirmReset = async (req, res) => {
    const { token, newPassword } = req.body;
    const result = await (0, authService_1.resetPassword)(token, newPassword);
    res.status(result.success ? 200 : 400).json(result);
};
exports.confirmReset = confirmReset;
/**
 * GET /api/auth/me
 * Return full user profile (not just JWT payload)
 */
const getMe = async (req, res) => {
    if (!req.user?.userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    try {
        const user = await prismaClient_1.default.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                class: true,
                nis: true,
                bio: true,
                customAllergies: true,
                createdAt: true,
                updatedAt: true,
                allergens: {
                    select: {
                        allergen: true,
                        isCustom: true,
                    },
                },
            },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        return res.json({
            success: true,
            user,
        });
    }
    catch (err) {
        console.error("GET /me error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error fetching profile",
        });
    }
};
exports.getMe = getMe;
