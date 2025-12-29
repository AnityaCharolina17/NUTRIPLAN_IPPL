import prisma from "../utils/prismaClient";

export const getCurrentWeekMenu = async () => {
  // Ambil 1 menu yang isActive = true, termasuk item, bahan, dan alergennya
  const menu = await prisma.weeklyMenu.findFirst({
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
