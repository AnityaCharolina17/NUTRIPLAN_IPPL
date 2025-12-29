import prisma from '../utils/prismaClient';

export interface MenuCaseResult {
  id: string;
  menuName: string;
  description: string | null;
  calories: number;
  protein: string | null;
  carbs: string | null;
  fat: string | null;
  baseIngredient: {
    id: string;
    name: string;
    category: string;
    synonyms: string | null;
  };
  allergens: string[];
}

export interface MenuCBRResponse {
  success: boolean;
  requestedIngredient: string;
  foundIngredient?: string;
  totalCases: number;
  menus: MenuCaseResult[];
  message: string;
  error?: string;
}

/**
 * Retrieve menu cases by base ingredient name
 * Returns up to 3 existing menu cases from the knowledge base
 * Does NOT invent new menus
 */
export async function getMenuCasesByIngredientName(
  ingredientName: string,
  limit: number = 3
): Promise<MenuCBRResponse> {
  try {
    if (!ingredientName || typeof ingredientName !== 'string') {
      return {
        success: false,
        requestedIngredient: ingredientName || '',
        totalCases: 0,
        menus: [],
        message: 'Nama bahan harus berupa string',
        error: 'INVALID_INPUT',
      };
    }

    const normalized = ingredientName.trim().toLowerCase();

    if (normalized.length === 0) {
      return {
        success: false,
        requestedIngredient: ingredientName,
        totalCases: 0,
        menus: [],
        message: 'Nama bahan tidak boleh kosong',
        error: 'EMPTY_INPUT',
      };
    }

    // Find ingredient by name or synonym
    const ingredient = await prisma.ingredient.findFirst({
      where: {
        OR: [
          { name: normalized },
          { synonyms: { contains: normalized, mode: 'insensitive' } },
        ],
      },
    });

    if (!ingredient) {
      return {
        success: false,
        requestedIngredient: ingredientName,
        totalCases: 0,
        menus: [],
        message: `Bahan '${ingredientName}' tidak ditemukan dalam basis pengetahuan`,
        error: 'INGREDIENT_NOT_FOUND',
      };
    }

    // Retrieve menu cases for this ingredient
    const menuCases = await prisma.menuCase.findMany({
      where: {
        baseIngredientId: ingredient.id,
      },
      take: Math.min(limit, 10),
      include: {
        baseIngredient: {
          include: {
            allergens: {
              select: {
                allergen: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        menuName: 'asc',
      },
    });

    if (menuCases.length === 0) {
      return {
        success: false,
        requestedIngredient: ingredientName,
        foundIngredient: ingredient.name,
        totalCases: 0,
        menus: [],
        message: `Tidak ada menu tersimpan untuk bahan '${ingredient.name}'`,
        error: 'NO_CASES_FOUND',
      };
    }

    const formattedMenus: MenuCaseResult[] = menuCases.map((menuCase) => ({
      id: menuCase.id,
      menuName: menuCase.menuName,
      description: menuCase.description,
      calories: menuCase.calories,
      protein: menuCase.protein,
      carbs: menuCase.carbs,
      fat: menuCase.fat,
      baseIngredient: {
        id: menuCase.baseIngredient.id,
        name: menuCase.baseIngredient.name,
        category: menuCase.baseIngredient.category,
        synonyms: menuCase.baseIngredient.synonyms,
      },
      allergens: menuCase.baseIngredient.allergens.map(
        (link) => link.allergen.name
      ),
    }));

    return {
      success: true,
      requestedIngredient: ingredientName,
      foundIngredient: ingredient.name,
      totalCases: menuCases.length,
      menus: formattedMenus,
      message: `Ditemukan ${menuCases.length} menu berbasis '${ingredient.name}'`,
    };
  } catch (error) {
    return {
      success: false,
      requestedIngredient: ingredientName,
      totalCases: 0,
      menus: [],
      message: 'Terjadi kesalahan saat mengambil menu',
      error: 'INTERNAL_ERROR',
    };
  }
}

/**
 * Retrieve menu cases by ingredient ID
 * Returns up to 3 existing menu cases
 */
export async function getMenuCasesByIngredientId(
  ingredientId: string,
  limit: number = 3
): Promise<MenuCBRResponse> {
  try {
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!ingredient) {
      return {
        success: false,
        requestedIngredient: ingredientId,
        totalCases: 0,
        menus: [],
        message: 'Ingredient ID tidak ditemukan',
        error: 'INGREDIENT_NOT_FOUND',
      };
    }

    return getMenuCasesByIngredientName(ingredient.name, limit);
  } catch (error) {
    return {
      success: false,
      requestedIngredient: ingredientId,
      totalCases: 0,
      menus: [],
      message: 'Terjadi kesalahan saat mengambil menu',
      error: 'INTERNAL_ERROR',
    };
  }
}

/**
 * Get all available menu cases
 * Returns all stored menu cases from knowledge base
 */
export async function getAllMenuCases(): Promise<{
  success: boolean;
  totalCases: number;
  menus: MenuCaseResult[];
  message: string;
}> {
  try {
    const menuCases = await prisma.menuCase.findMany({
      include: {
        baseIngredient: {
          include: {
            allergens: {
              select: {
                allergen: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        menuName: 'asc',
      },
    });

    const formattedMenus: MenuCaseResult[] = menuCases.map((menuCase) => ({
      id: menuCase.id,
      menuName: menuCase.menuName,
      description: menuCase.description,
      calories: menuCase.calories,
      protein: menuCase.protein,
      carbs: menuCase.carbs,
      fat: menuCase.fat,
      baseIngredient: {
        id: menuCase.baseIngredient.id,
        name: menuCase.baseIngredient.name,
        category: menuCase.baseIngredient.category,
        synonyms: menuCase.baseIngredient.synonyms,
      },
      allergens: menuCase.baseIngredient.allergens.map(
        (link) => link.allergen.name
      ),
    }));

    return {
      success: true,
      totalCases: menuCases.length,
      menus: formattedMenus,
      message: `Ditemukan ${menuCases.length} menu dalam basis pengetahuan`,
    };
  } catch (error) {
    return {
      success: false,
      totalCases: 0,
      menus: [],
      message: 'Terjadi kesalahan saat mengambil menu',
    };
  }
}

/**
 * Get menu case by menu name
 */
export async function getMenuCaseByName(menuName: string): Promise<{
  success: boolean;
  menu?: MenuCaseResult;
  message: string;
  error?: string;
}> {
  try {
    if (!menuName || typeof menuName !== 'string') {
      return {
        success: false,
        message: 'Nama menu harus berupa string',
        error: 'INVALID_INPUT',
      };
    }

    const normalized = menuName.trim();

    const menuCase = await prisma.menuCase.findFirst({
      where: {
        menuName: {
          equals: normalized,
          mode: 'insensitive',
        },
      },
      include: {
        baseIngredient: {
          include: {
            allergens: {
              select: {
                allergen: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!menuCase) {
      return {
        success: false,
        message: `Menu '${menuName}' tidak ditemukan`,
        error: 'MENU_NOT_FOUND',
      };
    }

    const formattedMenu: MenuCaseResult = {
      id: menuCase.id,
      menuName: menuCase.menuName,
      description: menuCase.description,
      calories: menuCase.calories,
      protein: menuCase.protein,
      carbs: menuCase.carbs,
      fat: menuCase.fat,
      baseIngredient: {
        id: menuCase.baseIngredient.id,
        name: menuCase.baseIngredient.name,
        category: menuCase.baseIngredient.category,
        synonyms: menuCase.baseIngredient.synonyms,
      },
      allergens: menuCase.baseIngredient.allergens.map(
        (link) => link.allergen.name
      ),
    };

    return {
      success: true,
      menu: formattedMenu,
      message: `Menu '${menuCase.menuName}' ditemukan`,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Terjadi kesalahan saat mengambil menu',
      error: 'INTERNAL_ERROR',
    };
  }
}

/**
 * Get menu cases by category
 */
export async function getMenuCasesByCategory(
  category: string,
  limit: number = 10
): Promise<{
  success: boolean;
  category: string;
  totalCases: number;
  menus: MenuCaseResult[];
  message: string;
}> {
  try {
    const menuCases = await prisma.menuCase.findMany({
      where: {
        baseIngredient: {
          category: category as any,
        },
      },
      take: Math.min(limit, 50),
      include: {
        baseIngredient: {
          include: {
            allergens: {
              select: {
                allergen: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        menuName: 'asc',
      },
    });

    const formattedMenus: MenuCaseResult[] = menuCases.map((menuCase) => ({
      id: menuCase.id,
      menuName: menuCase.menuName,
      description: menuCase.description,
      calories: menuCase.calories,
      protein: menuCase.protein,
      carbs: menuCase.carbs,
      fat: menuCase.fat,
      baseIngredient: {
        id: menuCase.baseIngredient.id,
        name: menuCase.baseIngredient.name,
        category: menuCase.baseIngredient.category,
        synonyms: menuCase.baseIngredient.synonyms,
      },
      allergens: menuCase.baseIngredient.allergens.map(
        (link) => link.allergen.name
      ),
    }));

    return {
      success: true,
      category: category,
      totalCases: menuCases.length,
      menus: formattedMenus,
      message: `Ditemukan ${menuCases.length} menu dengan kategori '${category}'`,
    };
  } catch (error) {
    return {
      success: false,
      category: category,
      totalCases: 0,
      menus: [],
      message: 'Terjadi kesalahan saat mengambil menu',
    };
  }
}

/**
 * Get menu cases with calorie range filter
 */
export async function getMenuCasesByCalorieRange(
  minCalories: number,
  maxCalories: number,
  limit: number = 10
): Promise<{
  success: boolean;
  totalCases: number;
  menus: MenuCaseResult[];
  message: string;
}> {
  try {
    const menuCases = await prisma.menuCase.findMany({
      where: {
        calories: {
          gte: minCalories,
          lte: maxCalories,
        },
      },
      take: Math.min(limit, 50),
      include: {
        baseIngredient: {
          include: {
            allergens: {
              select: {
                allergen: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        calories: 'asc',
      },
    });

    const formattedMenus: MenuCaseResult[] = menuCases.map((menuCase) => ({
      id: menuCase.id,
      menuName: menuCase.menuName,
      description: menuCase.description,
      calories: menuCase.calories,
      protein: menuCase.protein,
      carbs: menuCase.carbs,
      fat: menuCase.fat,
      baseIngredient: {
        id: menuCase.baseIngredient.id,
        name: menuCase.baseIngredient.name,
        category: menuCase.baseIngredient.category,
        synonyms: menuCase.baseIngredient.synonyms,
      },
      allergens: menuCase.baseIngredient.allergens.map(
        (link) => link.allergen.name
      ),
    }));

    return {
      success: true,
      totalCases: menuCases.length,
      menus: formattedMenus,
      message: `Ditemukan ${menuCases.length} menu dengan kalori ${minCalories}-${maxCalories}`,
    };
  } catch (error) {
    return {
      success: false,
      totalCases: 0,
      menus: [],
      message: 'Terjadi kesalahan saat mengambil menu',
    };
  }
}

/**
 * Get random menu cases for variety
 * Uses randomized ordering to return varied menu suggestions
 */
export async function getRandomMenuCases(limit: number = 3): Promise<{
  success: boolean;
  totalCases: number;
  menus: MenuCaseResult[];
  message: string;
}> {
  try {
    // Get total count first
    const totalCount = await prisma.menuCase.count();

    if (totalCount === 0) {
      return {
        success: false,
        totalCases: 0,
        menus: [],
        message: 'Tidak ada menu dalam basis pengetahuan',
      };
    }

    // Generate random skip value
    const maxSkip = Math.max(0, totalCount - limit);
    const randomSkip = Math.floor(Math.random() * (maxSkip + 1));

    const menuCases = await prisma.menuCase.findMany({
      skip: randomSkip,
      take: Math.min(limit, 10),
      include: {
        baseIngredient: {
          include: {
            allergens: {
              select: {
                allergen: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const formattedMenus: MenuCaseResult[] = menuCases.map((menuCase) => ({
      id: menuCase.id,
      menuName: menuCase.menuName,
      description: menuCase.description,
      calories: menuCase.calories,
      protein: menuCase.protein,
      carbs: menuCase.carbs,
      fat: menuCase.fat,
      baseIngredient: {
        id: menuCase.baseIngredient.id,
        name: menuCase.baseIngredient.name,
        category: menuCase.baseIngredient.category,
        synonyms: menuCase.baseIngredient.synonyms,
      },
      allergens: menuCase.baseIngredient.allergens.map(
        (link) => link.allergen.name
      ),
    }));

    return {
      success: true,
      totalCases: menuCases.length,
      menus: formattedMenus,
      message: `Mengambil ${menuCases.length} menu secara acak`,
    };
  } catch (error) {
    return {
      success: false,
      totalCases: 0,
      menus: [],
      message: 'Terjadi kesalahan saat mengambil menu',
    };
  }
}

/**
 * Get menu statistics
 */
export async function getMenuStatistics(): Promise<{
  success: boolean;
  statistics: {
    totalMenus: number;
    totalIngredients: number;
    averageCalories: number;
    calorieRange: { min: number; max: number };
    menusByCategory: Record<string, number>;
  };
  message: string;
}> {
  try {
    const totalMenus = await prisma.menuCase.count();

    const ingredientsWithMenus = await prisma.ingredient.findMany({
      where: {
        menuCases: {
          some: {},
        },
      },
      select: {
        id: true,
        category: true,
      },
    });

    const allMenus = await prisma.menuCase.findMany({
      select: {
        calories: true,
      },
    });

    const calories = allMenus.map((m) => m.calories);
    const avgCalories =
      calories.length > 0
        ? Math.round(calories.reduce((a, b) => a + b, 0) / calories.length)
        : 0;
    const minCalories = calories.length > 0 ? Math.min(...calories) : 0;
    const maxCalories = calories.length > 0 ? Math.max(...calories) : 0;

    const categoryCount: Record<string, number> = {};
    ingredientsWithMenus.forEach((ing) => {
      categoryCount[ing.category] = (categoryCount[ing.category] || 0) + 1;
    });

    return {
      success: true,
      statistics: {
        totalMenus: totalMenus,
        totalIngredients: ingredientsWithMenus.length,
        averageCalories: avgCalories,
        calorieRange: { min: minCalories, max: maxCalories },
        menusByCategory: categoryCount,
      },
      message: 'Statistik menu berhasil diambil',
    };
  } catch (error) {
    return {
      success: false,
      statistics: {
        totalMenus: 0,
        totalIngredients: 0,
        averageCalories: 0,
        calorieRange: { min: 0, max: 0 },
        menusByCategory: {},
      },
      message: 'Terjadi kesalahan saat mengambil statistik',
    };
  }
}
