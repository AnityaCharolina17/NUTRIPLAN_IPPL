# Knowledge Base Seed Documentation

## Overview
The Nutriplan Knowledge-Based AI system uses a **deterministic, rule-based approach** instead of generative AI. The knowledge base is stored in PostgreSQL and accessed via Prisma ORM.

---

## 📋 Schema Structure

### 1. **Allergen** Table
Stores all known allergen types in the system.

```sql
CREATE TABLE allergen (
  id UUID PRIMARY KEY,
  name VARCHAR UNIQUE,          -- e.g., 'egg', 'dairy', 'fish', 'soy'
  description VARCHAR,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)
```

**Seeded Allergens (8):**
- `egg` - Telur dan produk turunannya
- `dairy` - Susu dan produk turunannya
- `fish` - Ikan
- `shellfish` - Kerang dan udang
- `soy` - Kedelai dan produk turunannya
- `gluten` - Gandum, terigu, dan produk turunannya
- `peanut` - Kacang tanah
- `tree_nut` - Kacang pohon (almond, walnut, dll)

---

### 2. **Ingredient** Table
Represents food ingredients with categories and synonyms for fuzzy matching.

```sql
CREATE TABLE ingredient (
  id UUID PRIMARY KEY,
  name VARCHAR UNIQUE,          -- e.g., 'ayam', 'tahu', 'susu'
  category VARCHAR,             -- Enum: protein, carb, vegetable, fruit, dairy, soy, seafood, gluten, misc
  synonyms VARCHAR,             -- Comma-separated for matching variations
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)
```

**Seeded Ingredients (48):**

#### Proteins
- ayam (synonyms: ayam kampung, dada ayam, ayam fillet)
- daging sapi (synonyms: sapi, daging)
- ikan nila
- ikan tongkol
- ikan bandeng
- udang
- telur (synonyms: telur ayam)

#### Carbs
- nasi putih (synonyms: nasi)
- nasi goreng
- kentang
- ubi (synonyms: ubi jalar)
- roti (synonyms: roti tawar, roti gandum)
- spaghetti (synonyms: pasta)
- mie (synonyms: mi, mie instan)

#### Vegetables
- kangkung
- buncis
- wortel
- kubis (synonyms: kol)
- bayam
- brokoli
- edamame
- tomat
- timun (synonyms: ketimun)

#### Fruits
- pisang, jeruk, apel, semangka, melon, anggur, pepaya, pir

#### Dairy
- susu (synonyms: susu sapi) → ⚠️ dairy
- keju → ⚠️ dairy
- yogurt → ⚠️ dairy
- mentega → ⚠️ dairy

#### Soy Products
- tahu → ⚠️ soy
- tempe → ⚠️ soy
- kecap (synonyms: kecap manis) → ⚠️ soy
- kecap asin → ⚠️ soy

#### Gluten Products
- tepung terigu (synonyms: terigu) → ⚠️ gluten
- roti → ⚠️ gluten
- spaghetti → ⚠️ gluten
- mie → ⚠️ gluten

#### Misc/Seasoning
- santan, bawang merah, bawang putih, cabai, gula, garam, madu, kunyit

---

### 3. **IngredientAllergen** Table (Junction)
Many-to-many mapping between ingredients and allergens.

```sql
CREATE TABLE ingredient_allergen (
  id UUID PRIMARY KEY,
  ingredientId UUID FOREIGN KEY,
  allergenId UUID FOREIGN KEY,
  UNIQUE(ingredientId, allergenId)
)
```

**Seeded Mappings (18):**
- telur → egg
- tahu → soy
- tempe → soy
- kecap → soy
- kecap asin → soy
- susu → dairy
- keju → dairy
- yogurt → dairy
- mentega → dairy
- ikan nila → fish
- ikan tongkol → fish
- ikan bandeng → fish
- udang → shellfish
- roti → gluten
- spaghetti → gluten
- mie → gluten
- tepung terigu → gluten
- edamame → soy

---

### 4. **MenuCase** Table (Case-Based Reasoning)
Stores real menu cases that can be retrieved when a base ingredient is provided.
Used for case-based reasoning (CBR) to suggest menus without generating new recipes.

```sql
CREATE TABLE menu_case (
  id UUID PRIMARY KEY,
  baseIngredientId UUID FOREIGN KEY,  -- The main ingredient
  menuName VARCHAR,                    -- e.g., 'Ayam Bakar Madu'
  description VARCHAR,
  calories INT,
  protein VARCHAR,
  carbs VARCHAR,
  fat VARCHAR,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)
```

**Seeded Menu Cases (6):**

| Base Ingredient | Menu Name | Description | Calories | Nutrition |
|---|---|---|---|---|
| ayam | Ayam Bakar Madu | Ayam bakar dengan saus madu | 650 | P:35g C:75g F:20g |
| ayam | Ayam Goreng Krispy | Ayam goreng tepung renyah | 700 | P:40g C:60g F:28g |
| ayam | Soto Ayam | Soto ayam dengan bumbu kuning | 580 | P:28g C:68g F:16g |
| ikan nila | Ikan Goreng Kecap | Ikan nila goreng dengan saus kecap manis | 600 | P:30g C:70g F:18g |
| daging sapi | Rendang Sapi | Rendang daging sapi dengan santan | 720 | P:40g C:80g F:25g |
| ikan tongkol | Tongkol Balado | Ikan tongkol dengan sambal balado | 620 | P:32g C:65g F:22g |

---

## 🌱 Seed Script: `prisma/seedKnowledge.ts`

The seed script uses **upsert** to safely populate the database:

1. **Creates Allergens** (idempotent via unique name)
2. **Creates Ingredients** (with category and synonyms)
3. **Links Ingredients to Allergens** (many-to-many via IngredientAllergen)
4. **Creates Menu Cases** (for CBR retrieval)

**Run:**
```bash
npx ts-node prisma/seedKnowledge.ts
```

**Output:**
```
🌱 Seeding Knowledge Base...
✅ Created 8 allergens
✅ Created 48 ingredients with allergen mappings
✅ Created 6 menu cases for CBR

🎉 Knowledge Base seed completed!

📊 Summary:
   Allergens: 8
   Ingredients: 48
   Ingredient-Allergen Links: 18
   Menu Cases: 6
```

---

## 🔄 How It Works: Knowledge-Based AI

### Flow 1: Analyze Food (Input Validation + Allergen Detection)
```
User Input: "ayam"
     ↓
Query Ingredient KB: WHERE name = 'ayam' OR synonyms LIKE 'ayam%'
     ↓
Found: Ingredient { name: 'ayam', category: 'protein', allergens: [] }
     ↓
Retrieve Menu Cases: WHERE baseIngredientId = ayam.id
     ↓
Return: MenuCase { menuName: 'Ayam Bakar Madu', allergens: [] }
```

### Flow 2: Validate Multi-Ingredient (List Parsing)
```
User Input: "ayam, tahu, nasi putih"
     ↓
Split & Normalize: ['ayam', 'tahu', 'nasi putih']
     ↓
For each token:
  Query Ingredient KB → Found or Not
  If found, collect allergens → Soy (from tahu)
     ↓
Return: Valid ingredients: [ayam, tahu, nasi putih], Allergens: [soy]
```

### Flow 3: Reject Unknown Input
```
User Input: "mobil"
     ↓
Query Ingredient KB: WHERE name = 'mobil' (not found)
     ↓
Return: Error 400 "Input tidak dikenali sebagai bahan atau menu yang valid"
```

### Flow 4: Case-Based Menu Retrieval (No Generation)
```
Admin Input: Base Ingredient = "ikan nila"
     ↓
Query MenuCase: WHERE baseIngredientId = ikan_nila.id
     ↓
Found: MenuCase { menuName: 'Ikan Goreng Kecap', calories: 600, ... }
     ↓
Return: Existing menu (not invented)
```

---

## 🧠 Why This Approach?

1. **Deterministic** - No LLM hallucination
2. **Auditable** - Every decision traceable to KB
3. **Explainable** - Shows which ingredient → which allergen
4. **Safe for Schools** - No guessing on allergies
5. **Scalable** - Add ingredients/allergens without code change
6. **Offline** - Works without API calls

---

## ✅ Verification

Run:
```bash
npx ts-node prisma/verifyKnowledge.ts
```

Shows:
- All allergens with descriptions
- All ingredients by category with allergen tags
- All mappings
- All menu cases with base ingredients

---

## 📝 SQL Example: Direct KB Query

```sql
-- Find all allergens for a given ingredient
SELECT a.name
FROM allergen a
JOIN ingredient_allergen ia ON a.id = ia.allergenId
JOIN ingredient i ON ia.ingredientId = i.id
WHERE i.name = 'tahu';
-- Result: soy

-- Find menu cases for base ingredient
SELECT menuName, description, calories
FROM menu_case
WHERE baseIngredientId = (SELECT id FROM ingredient WHERE name = 'ayam');
-- Returns: Ayam Bakar Madu, Ayam Goreng Krispy, Soto Ayam

-- Check if ingredient exists (validation)
SELECT COUNT(*) > 0 as exists
FROM ingredient
WHERE LOWER(name) = LOWER('Nasi Putih')
   OR synonyms ILIKE '%nasi%';
```

---

## 🎯 Next Steps

1. ✅ Schema defined and migrated
2. ✅ Knowledge base seeded (8 allergens, 48 ingredients, 6 menu cases)
3. ✅ Controllers refactored to use KB (deterministic queries, no OpenAI)
4. ⏭️ Test endpoints with knowledge-based logic
5. ⏭️ Monitor and expand KB as needed (add more ingredients, cases, allergens)

