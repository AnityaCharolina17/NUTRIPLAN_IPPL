# 🧠 Nutriplan Knowledge-Based AI System

## Overview

Nutriplan uses **deterministic, rule-based AI** instead of generative models. The system is powered by a PostgreSQL knowledge base with:
- **48 food ingredients** with categories and synonyms
- **8 allergen types** with semantic mappings
- **6 menu cases** for case-based reasoning
- **Zero dependency** on OpenAI or other LLMs

---

## 🏗️ Architecture

### Knowledge Base (PostgreSQL)
```
┌─────────────────────────────────────────────┐
│          PostgreSQL Knowledge Base          │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐     ┌──────────────┐    │
│  │ Ingredient   │────▶│  Allergen    │    │
│  │ (48 items)   │     │  (8 types)   │    │
│  └──────────────┘     └──────────────┘    │
│         │                    ▲             │
│         │              Junction Table      │
│         └──────────────────────┘           │
│                                             │
│  ┌──────────────┐                          │
│  │  MenuCase    │ ◀─── (6 CBR cases)      │
│  │  (Retrieval) │                          │
│  └──────────────┘                          │
│                                             │
└─────────────────────────────────────────────┘
```

### API Controller Logic
```
User Input
    ↓
Validate against Ingredient KB
    ↓
Extract Allergens from IngredientAllergen table
    ↓
Retrieve MenuCases for CBR (if single ingredient)
    ↓
Return deterministic result (no generation)
```

---

## 📋 Seeded Data

### Allergens (8)
- `egg` - Telur
- `dairy` - Susu  
- `fish` - Ikan
- `shellfish` - Kerang/Udang
- `soy` - Kedelai
- `gluten` - Gandum/Terigu
- `peanut` - Kacang Tanah
- `tree_nut` - Kacang Pohon

### Ingredients (48)
Organized by 9 categories:
- **Proteins** (7): ayam, daging sapi, ikan nila, ikan tongkol, ikan bandeng, udang, telur
- **Carbs** (7): nasi putih, nasi goreng, kentang, ubi, roti, spaghetti, mie
- **Vegetables** (9): kangkung, buncis, wortel, kubis, bayam, brokoli, edamame, tomat, timun
- **Fruits** (8): pisang, jeruk, apel, semangka, melon, anggur, pepaya, pir
- **Dairy** (4): susu, keju, yogurt, mentega
- **Soy** (4): tahu, tempe, kecap, kecap asin
- **Gluten** (3): roti, spaghetti, mie, tepung terigu (overlap with carbs)
- **Misc/Seasoning** (8): santan, bawang merah, bawang putih, cabai, gula, garam, madu, kunyit

### Ingredient-Allergen Mappings (18)
Examples:
- `tahu` → `soy`
- `telur` → `egg`
- `susu` → `dairy`
- `ikan nila` → `fish`
- `udang` → `shellfish`
- `roti` → `gluten`

### Menu Cases (6) - CBR Knowledge
```
Base: ayam
  ├─ Ayam Bakar Madu (650 cal, P:35g)
  ├─ Ayam Goreng Krispy (700 cal, P:40g)
  └─ Soto Ayam (580 cal, P:28g)

Base: ikan nila
  └─ Ikan Goreng Kecap (600 cal, P:30g)

Base: daging sapi
  └─ Rendang Sapi (720 cal, P:40g)

Base: ikan tongkol
  └─ Tongkol Balado (620 cal, P:32g)
```

---

## 🚀 Quick Start

### 1. Initialize Knowledge Base

**First time only:**
```bash
cd NUTRIPLAN_API

# Migrate schema
npx prisma migrate dev --name add_knowledge_base

# Seed knowledge base
npm run seed:knowledge
```

### 2. Verify Data

```bash
npm run verify:kb
```

Output:
```
📌 ALLERGENS (8):
   - egg: Telur dan produk turunannya
   - dairy: Susu dan produk turunannya
   ...

📦 INGREDIENTS (48) by Category:
   [protein] 7 items:
      • ayam (synonyms: ayam kampung, dada ayam, ayam fillet) ✅ Safe
      • daging sapi (synonyms: sapi, daging) ✅ Safe
      ...
```

### 3. Start Backend

```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### 4. Test Endpoints

```bash
node TEST_KB_ENDPOINTS.js
```

---

## 🧪 API Examples

### ✅ Test 1: Valid Single Ingredient
```bash
curl -X POST http://localhost:5000/api/ai/analyze-food \
  -H "Content-Type: application/json" \
  -d '{"foodDescription":"ayam"}'
```

**Response (200):**
```json
{
  "success": true,
  "analysis": {
    "foodName": "Ayam Bakar Madu",
    "ingredients": ["ayam"],
    "allergens": []
  }
}
```

### ❌ Test 2: Invalid Input (Not in KB)
```bash
curl -X POST http://localhost:5000/api/ai/analyze-food \
  -H "Content-Type: application/json" \
  -d '{"foodDescription":"mobil"}'
```

**Response (400):**
```json
{
  "success": false,
  "message": "Input tidak dikenali sebagai bahan atau menu yang valid",
  "analysis": {
    "foodName": "mobil",
    "ingredients": [],
    "allergens": [],
    "notes": "Input tidak dikenali sebagai bahan atau menu yang valid"
  }
}
```

### ✅ Test 3: Multi-Ingredient
```bash
curl -X POST http://localhost:5000/api/ai/analyze-food \
  -H "Content-Type: application/json" \
  -d '{"foodDescription":"ayam, tahu, nasi putih"}'
```

**Response (200):**
```json
{
  "success": true,
  "analysis": {
    "foodName": "ayam, tahu, nasi putih",
    "ingredients": ["ayam", "tahu", "nasi putih"],
    "allergens": ["soy"]
  }
}
```

### ✅ Test 4: Allergen Safety Check
```bash
curl -X POST http://localhost:5000/api/ai/check-allergen-safety \
  -H "Content-Type: application/json" \
  -d '{"foodDescription":"tahu"}'
```

**Response (200):**
```json
{
  "success": true,
  "foodAnalysis": {
    "foodName": "tahu",
    "ingredients": ["tahu"],
    "allergens": ["soy"]
  },
  "userAllergens": [],
  "matchedAllergens": [],
  "isSafe": true,
  "severity": "safe",
  "recommendation": "Makanan ini aman berdasarkan pengetahuan alergi yang terdeteksi."
}
```

---

## 🔄 How It Works

### Flow: Ingredient Input → Allergen Detection

```
INPUT: "tahu"
  ↓
SELECT * FROM ingredient WHERE name = 'tahu'
  ↓
FOUND: { id: 'xxx', name: 'tahu', category: 'soy' }
  ↓
SELECT * FROM ingredient_allergen 
WHERE ingredientId = 'xxx'
  ↓
FOUND: { allergenId: 'yyy' }
  ↓
SELECT * FROM allergen WHERE id = 'yyy'
  ↓
FOUND: { name: 'soy' }
  ↓
RETURN: {
  foodName: 'tahu',
  ingredients: ['tahu'],
  allergens: ['soy']
}
```

---

## 📁 Project Structure

```
NUTRIPLAN_API/
├── prisma/
│   ├── schema.prisma           ← 4 KB tables defined
│   ├── seedKnowledge.ts        ← Seed script
│   ├── verifyKnowledge.ts      ← Verification script
│   ├── seed.ts                 ← User/menu data seed
│   └── migrations/
│       └── 20251229080845_add_knowledge_base/
│           └── migration.sql
├── src/
│   ├── controllers/
│   │   └── aiController.ts     ← KB query logic
│   ├── routes/
│   │   └── aiRoutes.ts
│   ├── knowledge/
│   │   └── foodKnowledge.ts    ← [Deprecated - using DB]
│   └── ...
├── KNOWLEDGE_BASE_DOCS.md      ← Full KB docs
├── SEED_DATA_SUMMARY.md        ← Data inventory
└── TEST_KB_ENDPOINTS.js        ← Test suite
```

---

## 🔧 Commands

```bash
# Seed user/menu data
npm run seed

# Seed knowledge base
npm run seed:knowledge

# Verify KB data
npm run verify:kb

# Start backend
npm run dev

# Type check
npx tsc --noEmit

# Prisma Studio (visual editor)
npx prisma studio
```

---

## 🧠 Why Knowledge-Based AI?

✅ **Deterministic** - No hallucinations or guessing  
✅ **Auditable** - Every decision traceable to KB  
✅ **Safe** - No allergic reactions from wrong allergen mapping  
✅ **Fast** - Direct database queries, no API calls  
✅ **Offline** - Works without internet  
✅ **Explainable** - Shows which ingredient → which allergen  
✅ **Maintainable** - Update KB without code changes  
✅ **Scalable** - Add ingredients/allergens easily  

---

## 📊 Data Quality

- **Unique Constraints:** Ingredient names and allergen names are unique
- **Referential Integrity:** Foreign keys ensure data consistency
- **Idempotent Operations:** Safe to run seeds multiple times
- **Semantic Accuracy:** Ingredient categories match international standards

---

## 🚀 Extending the KB

### Add New Ingredient
```typescript
// In prisma/seedKnowledge.ts
{ 
  name: 'beras merah', 
  category: 'carb', 
  synonyms: 'brown rice', 
  allergenNames: [] 
}
```

### Add New Allergen
```typescript
prisma.allergen.create({
  name: 'sesame',
  description: 'Wijen'
})
```

### Add Menu Case
```typescript
prisma.menuCase.create({
  baseIngredientId: ayamId,
  menuName: 'Ayam Taliwang',
  description: 'Ayam sambel matah',
  calories: 680,
  protein: '38g',
  carbs: '72g',
  fat: '23g'
})
```

### Re-seed
```bash
npm run seed:knowledge
```

---

## ✅ Verification Checklist

- [x] Schema with 4 KB tables
- [x] 48 realistic Indonesian food ingredients
- [x] 8 allergen types
- [x] 18 ingredient-allergen semantic mappings
- [x] 6 menu cases for CBR
- [x] Idempotent seed script
- [x] Controllers using KB queries (no OpenAI)
- [x] Deterministic, auditable logic
- [x] Full documentation
- [x] Test endpoints provided

---

## 📞 Support

For questions about the knowledge base:
1. Check [KNOWLEDGE_BASE_DOCS.md](./KNOWLEDGE_BASE_DOCS.md)
2. Review [SEED_DATA_SUMMARY.md](./SEED_DATA_SUMMARY.md)
3. Run verification: `npm run verify:kb`
4. Test endpoints: `node TEST_KB_ENDPOINTS.js`

---

**Last Updated:** December 29, 2025  
**Knowledge Base Version:** 1.0  
**Total Ingredients:** 48  
**Total Allergens:** 8  
**Menu Cases:** 6
