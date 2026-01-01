import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import prisma from "../utils/prismaClient";

/**
 * GET /api/menus/current
 * Ambil menu minggu ini (weekStart <= now <= weekEnd && isActive)
 */
export const getCurrentWeekMenu = async (req: Request, res: Response) => {
  try {
    const now = new Date();

    const menu = await prisma.weeklyMenu.findFirst({
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
  } catch (error) {
    console.error("Get current menu error:", error);
    return res.status(200).json({
      success: false,
      message: "Belum dapat mengambil menu saat ini. Silakan coba lagi nanti.",
      menu: null,
    });
  }
};

/**
 * GET /api/menus/week/:weekStart
 * Ambil menu berdasarkan tanggal minggu (weekStart)
 */
export const getMenuByWeekStart = async (req: Request, res: Response) => {
  try {
    const { weekStart } = req.params;
    if (!weekStart) {
      return res.status(400).json({
        success: false,
        message: "weekStart diperlukan",
      });
    }

    const parsed = new Date(weekStart);
    if (isNaN(parsed.getTime())) {
      return res.status(400).json({
        success: false,
        message: "weekStart tidak valid",
      });
    }

    parsed.setUTCHours(0, 0, 0, 0);

    const menu = await prisma.weeklyMenu.findFirst({
      where: {
        weekStart: parsed,
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
      return res.status(200).json({
        success: false,
        message: "Menu tidak ditemukan untuk minggu ini",
      });
    }

    return res.json({
      success: true,
      menu,
    });
  } catch (error) {
    console.error("Get menu by weekStart error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * GET /api/menus/next-week
 * Ambil menu minggu depan
 */
export const getNextWeekMenu = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    
    const menu = await prisma.weeklyMenu.findFirst({
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
  } catch (error) {
    console.error("Get next week menu error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * POST /api/menus/save
 * Simpan menu mingguan (Admin only)
 */
export const saveWeeklyMenu = async (req: AuthRequest, res: Response) => {
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
    const menu = await prisma.weeklyMenu.create({
      data: {
        weekStart: new Date(weekStart),
        weekEnd: new Date(weekEnd),
        createdById,
        isActive: true,
        items: {
          create: items.map((item: any) => ({
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
              create: (item.ingredients || []).map((ing: any) => ({
                ingredient: ing.ingredient,
                quantity: ing.quantity,
                unit: ing.unit,
              })),
            },
            allergens: {
              create: (item.allergens || []).map((allergen: string) => ({
                allergen,
              })),
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
  } catch (error) {
    console.error("Save menu error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error saving menu",
    });
  }
};

/**
 * PUT /api/menus/:menuItemId/portion
 * Update portionCount (Kitchen staff)
 */
export const updatePortionCount = async (req: AuthRequest, res: Response) => {
  try {
    const { menuItemId } = req.params;
    const { portionCount } = req.body;

    if (req.user?.role !== 'kitchen_staff' && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only kitchen staff or admin can update portions",
      });
    }

    const updated = await prisma.menuItem.update({
      where: { id: menuItemId },
      data: { portionCount },
    });

    return res.json({
      success: true,
      message: "Portion count updated",
      menuItem: updated,
    });
  } catch (error) {
    console.error("Update portion error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

