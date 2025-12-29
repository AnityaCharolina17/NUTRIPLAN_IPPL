import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Knowledge Base...');

  // 1. Create Allergens
  const allergens = await Promise.all([
    prisma.allergen.upsert({
      where: { name: 'egg' },
      update: {},
      create: { name: 'egg', description: 'Telur dan produk turunannya' },
    }),
    prisma.allergen.upsert({
      where: { name: 'dairy' },
      update: {},
      create: { name: 'dairy', description: 'Susu dan produk turunannya' },
    }),
    prisma.allergen.upsert({
      where: { name: 'fish' },
      update: {},
      create: { name: 'fish', description: 'Ikan' },
    }),
    prisma.allergen.upsert({
      where: { name: 'shellfish' },
      update: {},
      create: { name: 'shellfish', description: 'Kerang dan udang' },
    }),
    prisma.allergen.upsert({
      where: { name: 'soy' },
      update: {},
      create: { name: 'soy', description: 'Kedelai dan produk turunannya' },
    }),
    prisma.allergen.upsert({
      where: { name: 'gluten' },
      update: {},
      create: { name: 'gluten', description: 'Gandum, terigu, dan produk turunannya' },
    }),
    prisma.allergen.upsert({
      where: { name: 'peanut' },
      update: {},
      create: { name: 'peanut', description: 'Kacang tanah' },
    }),
    prisma.allergen.upsert({
      where: { name: 'tree_nut' },
      update: {},
      create: { name: 'tree_nut', description: 'Kacang pohon (almond, walnut, dll)' },
    }),
  ]);

  console.log(`✅ Created ${allergens.length} allergens`);

  // 2. Create Ingredients with categories
  const ingredients = [
    // Proteins
    { name: 'ayam', category: 'protein', synonyms: 'ayam kampung,dada ayam,ayam fillet', allergenNames: [] },
    { name: 'daging sapi', category: 'protein', synonyms: 'sapi,daging', allergenNames: [] },
    { name: 'ikan nila', category: 'seafood', synonyms: 'ikan', allergenNames: ['fish'] },
    { name: 'ikan tongkol', category: 'seafood', synonyms: '', allergenNames: ['fish'] },
    { name: 'ikan bandeng', category: 'seafood', synonyms: '', allergenNames: ['fish'] },
    { name: 'udang', category: 'seafood', synonyms: '', allergenNames: ['shellfish'] },
    { name: 'telur', category: 'protein', synonyms: 'telur ayam', allergenNames: ['egg'] },
    { name: 'tempe', category: 'soy', synonyms: '', allergenNames: ['soy'] },
    { name: 'tahu', category: 'soy', synonyms: '', allergenNames: ['soy'] },

    // Carbs
    { name: 'nasi putih', category: 'carb', synonyms: 'nasi', allergenNames: [] },
    { name: 'nasi goreng', category: 'carb', synonyms: '', allergenNames: [] },
    { name: 'kentang', category: 'carb', synonyms: '', allergenNames: [] },
    { name: 'ubi', category: 'carb', synonyms: 'ubi jalar', allergenNames: [] },
    { name: 'roti', category: 'gluten', synonyms: 'roti tawar,roti gandum', allergenNames: ['gluten'] },
    { name: 'spaghetti', category: 'gluten', synonyms: 'pasta', allergenNames: ['gluten'] },
    { name: 'mie', category: 'gluten', synonyms: 'mi,mie instan', allergenNames: ['gluten'] },

    // Vegetables
    { name: 'kangkung', category: 'vegetable', synonyms: '', allergenNames: [] },
    { name: 'buncis', category: 'vegetable', synonyms: '', allergenNames: [] },
    { name: 'wortel', category: 'vegetable', synonyms: '', allergenNames: [] },
    { name: 'kubis', category: 'vegetable', synonyms: 'kol', allergenNames: [] },
    { name: 'bayam', category: 'vegetable', synonyms: '', allergenNames: [] },
    { name: 'brokoli', category: 'vegetable', synonyms: '', allergenNames: [] },
    { name: 'edamame', category: 'soy', synonyms: '', allergenNames: ['soy'] },
    { name: 'tomat', category: 'vegetable', synonyms: '', allergenNames: [] },
    { name: 'timun', category: 'vegetable', synonyms: 'ketimun', allergenNames: [] },

    // Fruits
    { name: 'pisang', category: 'fruit', synonyms: '', allergenNames: [] },
    { name: 'jeruk', category: 'fruit', synonyms: '', allergenNames: [] },
    { name: 'apel', category: 'fruit', synonyms: '', allergenNames: [] },
    { name: 'semangka', category: 'fruit', synonyms: '', allergenNames: [] },
    { name: 'melon', category: 'fruit', synonyms: '', allergenNames: [] },
    { name: 'anggur', category: 'fruit', synonyms: '', allergenNames: [] },
    { name: 'pepaya', category: 'fruit', synonyms: '', allergenNames: [] },
    { name: 'pir', category: 'fruit', synonyms: '', allergenNames: [] },

    // Dairy
    { name: 'susu', category: 'dairy', synonyms: 'susu sapi', allergenNames: ['dairy'] },
    { name: 'keju', category: 'dairy', synonyms: '', allergenNames: ['dairy'] },
    { name: 'yogurt', category: 'dairy', synonyms: '', allergenNames: ['dairy'] },
    { name: 'mentega', category: 'dairy', synonyms: '', allergenNames: ['dairy'] },

    // Misc/Seasoning
    { name: 'kecap', category: 'soy', synonyms: 'kecap manis', allergenNames: ['soy'] },
    { name: 'kecap asin', category: 'soy', synonyms: '', allergenNames: ['soy'] },
    { name: 'santan', category: 'misc', synonyms: 'santan kelapa', allergenNames: [] },
    { name: 'bawang merah', category: 'misc', synonyms: '', allergenNames: [] },
    { name: 'bawang putih', category: 'misc', synonyms: '', allergenNames: [] },
    { name: 'cabai', category: 'misc', synonyms: 'cabai merah,cabe', allergenNames: [] },
    { name: 'tepung terigu', category: 'gluten', synonyms: 'terigu', allergenNames: ['gluten'] },
    { name: 'gula', category: 'misc', synonyms: 'gula pasir', allergenNames: [] },
    { name: 'garam', category: 'misc', synonyms: '', allergenNames: [] },
    { name: 'madu', category: 'misc', synonyms: '', allergenNames: [] },
    { name: 'kunyit', category: 'misc', synonyms: '', allergenNames: [] },
  ];

  const allergenMap = new Map(allergens.map((a) => [a.name, a.id]));

  for (const ing of ingredients) {
    const created = await prisma.ingredient.upsert({
      where: { name: ing.name },
      update: {},
      create: {
        name: ing.name,
        category: ing.category as any,
        synonyms: ing.synonyms || null,
      },
    });

    // Link allergens
    for (const allergenName of ing.allergenNames) {
      const allergenId = allergenMap.get(allergenName);
      if (allergenId) {
        await prisma.ingredientAllergen.upsert({
          where: {
            ingredientId_allergenId: {
              ingredientId: created.id,
              allergenId,
            },
          },
          update: {},
          create: {
            ingredientId: created.id,
            allergenId,
          },
        });
      }
    }
  }

  console.log(`✅ Created ${ingredients.length} ingredients with allergen mappings`);

  // 3. Create Menu Cases (CBR examples)
  const ayamIngredient = await prisma.ingredient.findUnique({ where: { name: 'ayam' } });
  const ikanNilaIngredient = await prisma.ingredient.findUnique({ where: { name: 'ikan nila' } });
  const dagingSapiIngredient = await prisma.ingredient.findUnique({ where: { name: 'daging sapi' } });
  const ikanTongkolIngredient = await prisma.ingredient.findUnique({ where: { name: 'ikan tongkol' } });

  const menuCases = [];

  if (ayamIngredient) {
    menuCases.push(
      await prisma.menuCase.upsert({
        where: { id: 'case-ayam-bakar' },
        update: {},
        create: {
          id: 'case-ayam-bakar',
          baseIngredientId: ayamIngredient.id,
          menuName: 'Ayam Bakar Madu',
          description: 'Ayam bakar dengan saus madu',
          calories: 650,
          protein: '35g',
          carbs: '75g',
          fat: '20g',
        },
      }),
      await prisma.menuCase.upsert({
        where: { id: 'case-ayam-goreng' },
        update: {},
        create: {
          id: 'case-ayam-goreng',
          baseIngredientId: ayamIngredient.id,
          menuName: 'Ayam Goreng Krispy',
          description: 'Ayam goreng tepung renyah',
          calories: 700,
          protein: '40g',
          carbs: '60g',
          fat: '28g',
        },
      }),
      await prisma.menuCase.upsert({
        where: { id: 'case-soto-ayam' },
        update: {},
        create: {
          id: 'case-soto-ayam',
          baseIngredientId: ayamIngredient.id,
          menuName: 'Soto Ayam',
          description: 'Soto ayam dengan bumbu kuning',
          calories: 580,
          protein: '28g',
          carbs: '68g',
          fat: '16g',
        },
      })
    );
  }

  if (ikanNilaIngredient) {
    menuCases.push(
      await prisma.menuCase.upsert({
        where: { id: 'case-ikan-goreng' },
        update: {},
        create: {
          id: 'case-ikan-goreng',
          baseIngredientId: ikanNilaIngredient.id,
          menuName: 'Ikan Goreng Kecap',
          description: 'Ikan nila goreng dengan saus kecap manis',
          calories: 600,
          protein: '30g',
          carbs: '70g',
          fat: '18g',
        },
      })
    );
  }

  if (dagingSapiIngredient) {
    menuCases.push(
      await prisma.menuCase.upsert({
        where: { id: 'case-rendang' },
        update: {},
        create: {
          id: 'case-rendang',
          baseIngredientId: dagingSapiIngredient.id,
          menuName: 'Rendang Sapi',
          description: 'Rendang daging sapi dengan santan',
          calories: 720,
          protein: '40g',
          carbs: '80g',
          fat: '25g',
        },
      })
    );
  }

  if (ikanTongkolIngredient) {
    menuCases.push(
      await prisma.menuCase.upsert({
        where: { id: 'case-tongkol-balado' },
        update: {},
        create: {
          id: 'case-tongkol-balado',
          baseIngredientId: ikanTongkolIngredient.id,
          menuName: 'Tongkol Balado',
          description: 'Ikan tongkol dengan sambal balado',
          calories: 620,
          protein: '32g',
          carbs: '65g',
          fat: '22g',
        },
      })
    );
  }

  console.log(`✅ Created ${menuCases.length} menu cases for CBR`);

  console.log('');
  console.log('🎉 Knowledge Base seed completed!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   Allergens: ${await prisma.allergen.count()}`);
  console.log(`   Ingredients: ${await prisma.ingredient.count()}`);
  console.log(`   Ingredient-Allergen Links: ${await prisma.ingredientAllergen.count()}`);
  console.log(`   Menu Cases: ${await prisma.menuCase.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
