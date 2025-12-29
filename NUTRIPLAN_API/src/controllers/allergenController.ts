import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import prisma from "../utils/prismaClient";

/**
 * POST /api/allergens/check
 * Cek apakah ada allergen dalam menu untuk user tertentu
 * Menggunakan Knowledge Base & keyword matching (tanpa AI)
 */
export const checkAllergens = async (req: AuthRequest, res: Response) => {
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
    const userAllergensDb = await prisma.userAllergen.findMany({
      where: { userId },
    });

    // Ambil custom allergen user (jika ada)
    const user = await prisma.user.findUnique({
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

    const matchedAllergens: string[] = [];

    const menuAllergenList = (menuAllergens || []).map((a: string) =>
      a.toLowerCase()
    );
    const ingredientList = (ingredients || []).map((i: string) =>
      i.toLowerCase()
    );

    // Cek allergen langsung dari menu
    menuAllergenList.forEach((allergen: string) => {
      if (userAllergenList.includes(allergen)) {
        matchedAllergens.push(allergen);
      }
    });

    // Cek allergen dari bahan (keyword matching)
    ingredientList.forEach((ingredient: string) => {
      userAllergenList.forEach((allergen) => {
        if (
          ingredient.includes(allergen) ||
          allergen.includes(ingredient)
        ) {
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
  } catch (error) {
    console.error("Check allergens error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * POST /api/allergens/check-menu/:menuItemId
 * Cek allergen untuk menu item tertentu
 */
export const checkMenuItemAllergens = async (
  req: AuthRequest,
  res: Response
) => {
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
    const menuItem = await prisma.menuItem.findUnique({
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
    const userAllergens = await prisma.userAllergen.findMany({
      where: { userId },
    });

    const userAllergenList = userAllergens.map((a) =>
      a.allergen.toLowerCase()
    );
    const menuAllergenList = menuItem.allergens.map((a) =>
      a.allergen.toLowerCase()
    );

    const matchedAllergens = menuAllergenList.filter((allergen) =>
      userAllergenList.includes(allergen)
    );

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
  } catch (error) {
    console.error("Check menu item allergens error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
