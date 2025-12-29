"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAllergensController = exports.updateProfile = exports.getUser = void 0;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const userService_1 = require("../services/userService");
/**
 * GET /api/users/:id
 * Ambil profil user (hanya boleh melihat dirinya sendiri)
 */
const getUser = async (req, res) => {
    const { id } = req.params;
    if (req.user?.userId !== id) {
        return res.status(403).json({
            success: false,
            message: "You can only view your own profile",
        });
    }
    const user = await (0, userService_1.getUserById)(id);
    return res.json({ success: true, user });
};
exports.getUser = getUser;
/**
 * PUT /api/users/:id/profile
 * Update profil user (name, email, class, bio)
 */
const updateProfile = async (req, res) => {
    const { id } = req.params;
    const authUser = req.user;
    // hanya bisa edit diri sendiri
    if (authUser?.userId !== id) {
        return res.status(403).json({
            success: false,
            message: "Cannot update another user's profile",
        });
    }
    // Guest tidak boleh update
    if (authUser.role === "guest") {
        return res.status(403).json({
            success: false,
            message: "Guest cannot update profile",
        });
    }
    const { name, email, class: classInput, bio } = req.body;
    try {
        // Jika email ingin diganti → cek apakah unique
        if (email) {
            const existing = await prismaClient_1.default.user.findUnique({
                where: { email },
            });
            if (existing && existing.id !== id) {
                return res.status(400).json({
                    success: false,
                    message: "Email is already used by another account",
                });
            }
        }
        const dataToUpdate = {
            name,
            email,
            bio,
        };
        // Student boleh update class
        if (authUser.role === "student") {
            dataToUpdate.class = classInput;
        }
        const updated = await prismaClient_1.default.user.update({
            where: { id },
            data: dataToUpdate,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                class: true,
                nis: true,
                bio: true,
            },
        });
        return res.json({
            success: true,
            message: "Profile updated successfully",
            user: updated,
        });
    }
    catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error updating profile",
        });
    }
};
exports.updateProfile = updateProfile;
/**
 * PUT /api/users/:id/allergens
 * Update daftar alergen siswa
 */
const updateAllergensController = async (req, res) => {
    const { id } = req.params;
    // Hanya student yang boleh update allergens
    if (req.user?.userId !== id || req.user.role !== "student") {
        return res.status(403).json({
            success: false,
            message: "Only students can update allergens",
        });
    }
    const { allergens, customAllergies } = req.body;
    try {
        const updated = await (0, userService_1.updateUserAllergens)(id, allergens, customAllergies);
        return res.json({
            success: true,
            message: "Allergens updated successfully",
            user: updated,
        });
    }
    catch (error) {
        console.error("Update allergens error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error updating allergens",
        });
    }
};
exports.updateAllergensController = updateAllergensController;
