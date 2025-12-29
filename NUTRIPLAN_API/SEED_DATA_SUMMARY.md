# Knowledge Base Seed Data Summary

## 📊 Seeded Data Overview

| Entity | Count | Details |
|--------|-------|---------|
| **Allergens** | 8 | egg, dairy, fish, shellfish, soy, gluten, peanut, tree_nut |
| **Ingredients** | 48 | Across 9 categories: protein, carb, vegetable, fruit, dairy, soy, seafood, gluten, misc |
| **Ingredient-Allergen Mappings** | 18 | e.g., tahu→soy, telur→egg, susu→dairy |
| **Menu Cases (CBR)** | 6 | Base ingredient → menu name + nutrition |

---

## 🥘 Complete Ingredient Inventory

### Proteins (7 items)
```
ayam                     [protein]
daging sapi             [protein]
ikan nila               [seafood] → fish ⚠️
ikan tongkol            [seafood] → fish ⚠️
ikan bandeng            [seafood] → fish ⚠️
udang                   [seafood] → shellfish ⚠️
telur                   [protein] → egg ⚠️
```

### Carbs (7 items)
```
nasi putih              [carb]
nasi goreng             [carb]
kentang                 [carb]
ubi                     [carb]
roti                    [gluten] → gluten ⚠️
spaghetti               [gluten] → gluten ⚠️
mie                     [gluten] → gluten ⚠️
```

### Vegetables (9 items)
```
kangkung                [vegetable]
buncis                  [vegetable]
wortel                  [vegetable]
kubis                   [vegetable]
bayam                   [vegetable]
brokoli                 [vegetable]
edamame                 [soy] → soy ⚠️
tomat                   [vegetable]
timun                   [vegetable]
```

### Fruits (8 items)
```
pisang                  [fruit]
jeruk                   [fruit]
apel                    [fruit]
semangka                [fruit]
melon                   [fruit]
anggur                  [fruit]
pepaya                  [fruit]
pir                     [fruit]
```

### Dairy (4 items)
```
susu                    [dairy] → dairy ⚠️
keju                    [dairy] → dairy ⚠️
yogurt                  [dairy] → dairy ⚠️
mentega                 [dairy] → dairy ⚠️
```

### Soy Products (4 items)
```
tahu                    [soy] → soy ⚠️
tempe                   [soy] → soy ⚠️
kecap                   [soy] → soy ⚠️
kecap asin              [soy] → soy ⚠️
```

### Seasonings/Misc (4 items)
```
santan                  [misc]
bawang merah            [misc]
bawang putih            [misc]
cabai                   [misc]
gula                    [misc]
garam                   [misc]
madu                    [misc]
kunyit                  [misc]
tepung terigu           [gluten] → gluten ⚠️
```

---

## 🧬 Allergen Semantic Mappings (18 Links)

### By Allergen Type:

**Egg (1 mapping)**
- telur → egg

**Dairy (4 mappings)**
- susu → dairy
- keju → dairy
- yogurt → dairy
- mentega → dairy

**Fish (3 mappings)**
- ikan nila → fish
- ikan tongkol → fish
- ikan bandeng → fish

**Shellfish (1 mapping)**
- udang → shellfish

**Soy (5 mappings)**
- tahu → soy
- tempe → soy
- kecap → soy
- kecap asin → soy
- edamame → soy

**Gluten (4 mappings)**
- roti → gluten
- spaghetti → gluten
- mie → gluten
- tepung terigu → gluten

---

## 🍽️ Menu Cases (CBR Knowledge)

### Case 1: Ayam Bakar Madu
```
Base Ingredient: ayam
Menu Name: Ayam Bakar Madu
Description: Ayam bakar dengan saus madu
Calories: 650
Nutrition: P:35g, C:75g, F:20g
Allergens: None
```

### Case 2: Ayam Goreng Krispy
```
Base Ingredient: ayam
Menu Name: Ayam Goreng Krispy
Description: Ayam goreng tepung renyah
Calories: 700
Nutrition: P:40g, C:60g, F:28g
Allergens: None
```

### Case 3: Soto Ayam
```
Base Ingredient: ayam
Menu Name: Soto Ayam
Description: Soto ayam dengan bumbu kuning
Calories: 580
Nutrition: P:28g, C:68g, F:16g
Allergens: None
```

### Case 4: Ikan Goreng Kecap
```
Base Ingredient: ikan nila
Menu Name: Ikan Goreng Kecap
Description: Ikan nila goreng dengan saus kecap manis
Calories: 600
Nutrition: P:30g, C:70g, F:18g
Allergens: fish, soy (from kecap)
```

### Case 5: Rendang Sapi
```
Base Ingredient: daging sapi
Menu Name: Rendang Sapi
Description: Rendang daging sapi dengan santan
Calories: 720
Nutrition: P:40g, C:80g, F:25g
Allergens: None
```

### Case 6: Tongkol Balado
```
Base Ingredient: ikan tongkol
Menu Name: Tongkol Balado
Description: Ikan tongkol dengan sambal balado
Calories: 620
Nutrition: P:32g, C:65g, F:22g
Allergens: fish
```

---

## 📁 Files Location

```
NUTRIPLAN_API/
├── prisma/
│   ├── schema.prisma              ← Schema definition
│   ├── seedKnowledge.ts           ← Knowledge base seed script
│   ├── verifyKnowledge.ts         ← Verification script
│   └── migrations/
│       └── 20251229080845_add_knowledge_base/
│           └── migration.sql      ← Applied migration
├── src/
│   ├── controllers/
│   │   └── aiController.ts        ← Refactored to use KB
│   └── knowledge/
│       └── foodKnowledge.ts       ← [Deprecated - using DB now]
├── KNOWLEDGE_BASE_DOCS.md         ← Full documentation
└── TEST_KB_ENDPOINTS.js           ← Test script
```

---

## 🚀 How to Use

### 1. Run Seed (One-time)
```bash
npx ts-node prisma/seedKnowledge.ts
```

### 2. Verify Data
```bash
npx ts-node prisma/verifyKnowledge.ts
```

### 3. Start Backend
```bash
npm run dev
```

### 4. Test Endpoints
```bash
node TEST_KB_ENDPOINTS.js
```

### 5. View in Prisma Studio
```bash
npx prisma studio
```

---

## 🔐 Data Integrity

- **Unique Constraints:**
  - `Ingredient.name` (UNIQUE)
  - `Allergen.name` (UNIQUE)
  - `IngredientAllergen` (UNIQUE pair: ingredientId + allergenId)

- **Foreign Keys:**
  - `IngredientAllergen.ingredientId` → `Ingredient.id`
  - `IngredientAllergen.allergenId` → `Allergen.id`
  - `MenuCase.baseIngredientId` → `Ingredient.id`

- **Idempotent Seed:**
  - Uses `upsert()` - safe to run multiple times
  - Won't create duplicates

---

## 📈 Scalability

To extend the knowledge base:

1. **Add more ingredients:**
   ```typescript
   { name: 'beras merah', category: 'carb', synonyms: '', allergenNames: [] }
   ```

2. **Add new allergen:**
   ```typescript
   prisma.allergen.create({ name: 'sesame', description: 'Wijen' })
   ```

3. **Add ingredient-allergen mapping:**
   ```typescript
   // In seed script, add to allergenNames array
   ```

4. **Add menu cases:**
   ```typescript
   prisma.menuCase.create({
     baseIngredientId: ...,
     menuName: '...',
     description: '...',
     calories: ...,
     ...
   })
   ```

5. **Re-run seed:**
   ```bash
   npx ts-node prisma/seedKnowledge.ts
   ```

---

## ✅ Quality Checklist

- [x] Schema defined (Ingredient, Allergen, IngredientAllergen, MenuCase)
- [x] 48 realistic Indonesian food ingredients
- [x] 8 common allergen types
- [x] 18 semantic ingredient-allergen mappings
- [x] 6 menu cases for CBR
- [x] Seed script with idempotent upserts
- [x] Controllers refactored to use KB queries
- [x] No OpenAI/LLM dependency
- [x] Deterministic, auditable logic
- [x] Documentation & test script

