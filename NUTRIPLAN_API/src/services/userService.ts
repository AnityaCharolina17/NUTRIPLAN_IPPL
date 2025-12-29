import prisma from "../prisma";

export const getUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      allergens: true
    }
  });
};

export const updateUserProfile = async (id: string, data: {
  name?: string;
  email?: string;
  class?: string;
  bio?: string;
}) => {
  const updated = await prisma.user.update({
    where: { id },
    data,
    include: { allergens: true }
  });

  return updated;
};

export const updateUserAllergens = async (id: string, allergens: string[], customAllergies: string = "") => {
  // Hapus alergi lama
  await prisma.userAllergen.deleteMany({ where: { userId: id } });

  // Tambahkan alergi baru
  await prisma.userAllergen.createMany({
    data: allergens.map(a => ({
      userId: id,
      allergen: a,
      isCustom: false
    }))
  });

  // Update custom allergies
  const updated = await prisma.user.update({
    where: { id },
    data: { customAllergies },
    include: { allergens: true }
  });

  return updated;
};
