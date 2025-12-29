"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.requestPasswordReset = exports.loginUser = exports.registerUser = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const authUtils_1 = require("../utils/authUtils");
const email_1 = require("../utils/email");
const crypto_1 = __importDefault(require("crypto"));
// In-memory reset token store (dummy for demo)
// key: token, value: { userId, expiresAt }
const resetTokens = new Map();
const registerUser = async (data) => {
    const { name, email, password, role, class: className, nis } = data;
    const existingEmail = await prisma_1.default.user.findUnique({ where: { email } });
    if (existingEmail)
        return { success: false, message: "Email already registered" };
    if (nis) {
        // NIS/NISN must be at least 10 digits and numeric only
        const isValidNIS = /^\d{10,}$/.test(nis);
        if (!isValidNIS) {
            return { success: false, message: "NIS/NISN must be numeric and at least 10 digits" };
        }
        const existingNIS = await prisma_1.default.user.findFirst({ where: { nis } });
        if (existingNIS)
            return { success: false, message: "NIS/NISN already used" };
    }
    const hashed = await (0, authUtils_1.hashPassword)(password);
    const newUser = await prisma_1.default.user.create({
        data: {
            name,
            email,
            password: hashed,
            role,
            class: className,
            nis
        },
    });
    const token = (0, authUtils_1.generateToken)(newUser.id, newUser.role);
    // Attempt to send a welcome email if SMTP is configured
    try {
        await (0, email_1.sendEmail)({
            to: newUser.email,
            subject: "Selamat datang di Nutriplan",
            text: `Halo ${newUser.name}, akun Anda berhasil dibuat sebagai ${newUser.role}.`,
            html: `<p>Halo <strong>${newUser.name}</strong>,</p>
             <p>Akun Anda berhasil dibuat sebagai <strong>${newUser.role}</strong>.</p>
             <p>Selamat menggunakan Nutriplan.</p>`,
        });
    }
    catch (e) {
        // Do not block registration on email failure
        console.warn("Email sending failed (skipped or error):", e.message);
    }
    return {
        success: true,
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            class: newUser.class,
            nis: newUser.nis,
        },
        token,
    };
};
exports.registerUser = registerUser;
const loginUser = async (email, password, expectedRole) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma_1.default.user.findFirst({ where: { email: { equals: normalizedEmail, mode: "insensitive" } } });
    if (!user)
        return { success: false, message: "Invalid credentials" };
    const match = await (0, authUtils_1.comparePassword)(password, user.password);
    if (!match)
        return { success: false, message: "Invalid credentials" };
    if (expectedRole && user.role !== expectedRole) {
        return { success: false, message: "Role tidak sesuai untuk akun ini" };
    }
    const token = (0, authUtils_1.generateToken)(user.id, user.role);
    return {
        success: true,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            class: user.class,
            nis: user.nis,
        },
        token,
    };
};
exports.loginUser = loginUser;
const requestPasswordReset = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma_1.default.user.findFirst({ where: { email: { equals: normalizedEmail, mode: "insensitive" } } });
    if (!user) {
        return { success: false, message: "Email tidak terdaftar" };
    }
    const token = crypto_1.default.randomBytes(24).toString("hex");
    const expiresAt = Date.now() + 1000 * 60 * 15; // 15 menit
    resetTokens.set(token, { userId: user.id, expiresAt });
    // Skip real email; return token for demo/testing
    return {
        success: true,
        message: "Token reset dibuat",
        token,
        expiresAt,
    };
};
exports.requestPasswordReset = requestPasswordReset;
const resetPassword = async (token, newPassword) => {
    const entry = resetTokens.get(token);
    if (!entry) {
        return { success: false, message: "Token tidak valid" };
    }
    if (Date.now() > entry.expiresAt) {
        resetTokens.delete(token);
        return { success: false, message: "Token kadaluarsa" };
    }
    if (!newPassword || newPassword.length < 5) {
        return { success: false, message: "Password minimal 5 karakter" };
    }
    const hashed = await (0, authUtils_1.hashPassword)(newPassword);
    await prisma_1.default.user.update({
        where: { id: entry.userId },
        data: { password: hashed },
    });
    resetTokens.delete(token);
    return { success: true, message: "Password berhasil direset" };
};
exports.resetPassword = resetPassword;
