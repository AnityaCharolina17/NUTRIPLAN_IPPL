/**
 * Verification script to inspect the Knowledge Base
 * Shows: Ingredients, Allergens, Mappings, MenuCases
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying Knowledge Base...\n');

  // 1. Count allergens
  const allergens = await prisma.allergen.findMany();
  console.log(`📌 ALLERGENS (${allergens.length}):`);
  allergens.forEach((a) => console.log(`   - ${a.name}: ${a.description}`));
  console.log();

  // 2. Show ingredients by category
  const ingredients = await prisma.ingredient.findMany({
    include: { allergens: { include: { allergen: true } } },
  });

  const byCategory = new Map<string, any[]>();
  ingredients.forEach((ing) => {
    if (!byCategory.has(ing.category)) {
      byCategory.set(ing.category, []);
    }
    byCategory.get(ing.category)!.push(ing);
  });

  console.log(`📦 INGREDIENTS (${ingredients.length}) by Category:`);
  for (const [category, items] of byCategory) {
    console.log(`\n   [${category}] ${items.length} items:`);
    items.forEach((ing) => {
      const allergenTags = ing.allergens.map((link: any) => link.allergen.name).join(', ');
      const allergenStr = allergenTags ? `⚠️ ${allergenTags}` : '✅ Safe';
      const synonymStr = ing.synonyms ? ` (${ing.synonyms})` : '';
      console.log(`      • ${ing.name}${synonymStr} ${allergenStr}`);
    });
  }
  console.log();

  // 3. Show ingredient-allergen mappings
  const mappings = await prisma.ingredientAllergen.findMany({
    include: { ingredient: true, allergen: true },
  });
  console.log(`🔗 INGREDIENT-ALLERGEN MAPPINGS (${mappings.length}):`);
  mappings.slice(0, 10).forEach((m) => {
    console.log(`   ${m.ingredient.name} → ${m.allergen.name}`);
  });
  if (mappings.length > 10) {
    console.log(`   ... and ${mappings.length - 10} more`);
  }
  console.log();

  // 4. Show menu cases (CBR)
  const cases = await prisma.menuCase.findMany({
    include: { baseIngredient: true },
  });
  console.log(`🍽️  MENU CASES (CBR - Case-Based Reasoning) (${cases.length}):`);
  cases.forEach((c) => {
    console.log(`   Base: ${c.baseIngredient.name}`);
    console.log(`      → Menu: ${c.menuName}`);
    console.log(`      → Desc: ${c.description}`);
    console.log(`      → Nutrition: ${c.calories} cal, P:${c.protein}, C:${c.carbs}, F:${c.fat}`);
    console.log();
  });

  console.log('\n✅ Knowledge Base verification complete!');
}

main()
  .catch((e) => {
    console.error('❌ Verification error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
