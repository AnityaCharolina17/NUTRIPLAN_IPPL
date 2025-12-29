"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserAllergens = exports.updateUserProfile = exports.getUserById = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const getUserById = async (id) => {
    return prisma_1.default.user.findUnique({
        where: { id },
        include: {
            allergens: true
        }
    });
};
exports.getUserById = getUserById;
const updateUserProfile = async (id, data) => {
    const updated = await prisma_1.default.user.update({
        where: { id },
        data,
        include: { allergens: true }
    });
    return updated;
};
exports.updateUserProfile = updateUserProfile;
const updateUserAllergens = async (id, allergens, customAllergies = "") => {
    // Hapus alergi lama
    await prisma_1.default.userAllergen.deleteMany({ where: { userId: id } });
    // Tambahkan alergi baru
    await prisma_1.default.userAllergen.createMany({
        data: allergens.map(a => ({
            userId: id,
            allergen: a,
            isCustom: false
        }))
    });
    // Update custom allergies
    const updated = await prisma_1.default.user.update({
        where: { id },
        data: { customAllergies },
        include: { allergens: true }
    });
    return updated;
};
exports.updateUserAllergens = updateUserAllergens;
