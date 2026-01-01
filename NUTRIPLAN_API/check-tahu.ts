import prisma from './src/utils/prismaClient';

(async () => {
  try {
    const ing = await prisma.ingredient.findFirst({
      where: { name: 'tahu' }
    });
    
    console.log('Ingredient tahu:', ing);
    
    if (ing) {
      const cases = await prisma.menuCase.findMany({
        where: { baseIngredientId: ing.id }
      });
      console.log('Menu cases for tahu:', cases.length);
      console.log(cases);
    } else {
      console.log('Ingredient tahu tidak ditemukan!');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
})();
