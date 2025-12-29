import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import prisma from "../utils/prismaClient";

/**
 * GET /api/kitchen/recap/:weekStart
 * Rekap porsi dan bahan untuk minggu tertentu
 */
export const getWeeklyRecap = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'kitchen_staff' && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only kitchen staff or admin can access recap",
      });
    }

    const weekStartParam = (req.params as any).weekStart || (req.query as any).weekStart;
    const today = new Date();
    // Default to next Monday if no weekStart provided
    const defaultWeek = (() => {
      const d = new Date(today);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff + 7); // next Monday
      d.setHours(0, 0, 0, 0);
      return d;
    })();
    const weekDate = weekStartParam ? new Date(weekStartParam) : defaultWeek;
    weekDate.setUTCHours(0, 0, 0, 0);

    // Ambil menu minggu tersebut
    const menu = await prisma.weeklyMenu.findFirst({
      where: {
        weekStart: weekDate,
        isActive: true,
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

    if (!menu) {
      return res.json({
        success: false,
        message: "Menu not found for this week",
      });
    }

    // Ambil semua pilihan siswa untuk minggu ini
    const choices = await prisma.studentMenuChoice.findMany({
      where: {
        weekStart: weekDate,
      },
    });

    // Hitung porsi per hari
    const dailyRecap: any = {};

    menu.items.forEach(item => {
      const dayChoices = choices.filter(c => c.day === item.day);
      const harianCount = dayChoices.filter(c => c.choice === 'harian').length;
      const sehatCount = dayChoices.filter(c => c.choice === 'sehat').length;

      dailyRecap[item.day] = {
        menuItem: item,
        harianCount,
        sehatCount,
        totalCount: harianCount + sehatCount,
      };
    });

    // Aggregate bahan per minggu
    const ingredientMap: Record<string, { quantity: string; unit: string; days: string[] }> = {};

    menu.items.forEach(item => {
      item.ingredients.forEach(ing => {
        const key = ing.ingredient.toLowerCase();
        if (!ingredientMap[key]) {
          ingredientMap[key] = {
            quantity: ing.quantity || '',
            unit: ing.unit || '',
            days: [],
          };
        }
        ingredientMap[key].days.push(item.day);
      });
    });

    const weeklyIngredients = Object.entries(ingredientMap).map(([ingredient, data]) => ({
      ingredient,
      ...data,
    }));

    const totalStudents = Array.from(new Set(choices.map((c) => c.studentId))).length;

    return res.json({
      success: true,
      weekStart: weekDate,
      menu,
      dailyRecap,
      weeklyIngredients,
      totalStudents,
    });
  } catch (error) {
    console.error("Get weekly recap error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * GET /api/kitchen/daily-recap/:weekStart/:day
 * Rekap detail per hari
 */
export const getDailyRecap = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'kitchen_staff' && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only kitchen staff or admin can access recap",
      });
    }

    const { weekStart, day } = req.params;
    const weekDate = new Date(weekStart);

    // Ambil menu item untuk hari tersebut
    const menuItem = await prisma.menuItem.findFirst({
      where: {
        weekMenu: {
          weekStart: weekDate,
          isActive: true,
        },
        day: day as any,
      },
      include: {
        ingredients: true,
        allergens: true,
      },
    });

    if (!menuItem) {
      return res.json({
        success: false,
        message: "Menu item not found",
      });
    }

    // Ambil pilihan siswa untuk hari ini
    const choices = await prisma.studentMenuChoice.findMany({
      where: {
        weekStart: weekDate,
        day: day as any,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            class: true,
          },
        },
      },
    });

    const harianCount = choices.filter(c => c.choice === 'harian').length;
    const sehatCount = choices.filter(c => c.choice === 'sehat').length;

    return res.json({
      success: true,
      menuItem,
      choices,
      summary: {
        harianCount,
        sehatCount,
        totalCount: harianCount + sehatCount,
      },
    });
  } catch (error) {
    console.error("Get daily recap error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
