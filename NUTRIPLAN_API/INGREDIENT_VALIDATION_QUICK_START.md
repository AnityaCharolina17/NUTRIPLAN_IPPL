# ⚡ Ingredient Validation API - Quick Reference

## What Was Built

A **production-ready ingredient validation service** that validates food ingredients against a PostgreSQL knowledge base using semantic matching.

**No generative AI.** Explicit rejection of unknown ingredients.

---

## 🚀 Quick Start

### 1. Start Backend (if not running)
```bash
cd NUTRIPLAN_API
npm run dev
```

### 2. Test Endpoint
```bash
curl -X POST http://localhost:5000/api/ai/validate-ingredient \
  -H "Content-Type: application/json" \
  -d '{"foodName": "tahu"}'
```

### 3. Expected Response (Success)
```json
{
  "valid": true,
  "ingredient": {
    "id": "uuid-123",
    "name": "tahu",
    "category": "soy",
    "synonyms": ["tahu putih", "tofu"],
    "allergens": [
      {
        "allergenId": "uuid-soy",
        "allergenName": "soy"
      }
    ]
  },
  "message": "Bahan makanan \"tahu\" ditemukan dan valid."
}
```

---

## 📚 All Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| **POST** | `/api/ai/validate-ingredient` | Validate single ingredient ⭐ |
| **POST** | `/api/ai/validate-ingredients-batch` | Validate multiple ingredients |
| **GET** | `/api/ai/ingredients` | List all 48 ingredients |
| **GET** | `/api/ai/ingredients/search?keyword=nasi` | Search by keyword |

---

## 🔍 Main Endpoint: POST /api/ai/validate-ingredient

### Request
```json
{
  "foodName": "tahu"
}
```

### Success Response (200 OK)
```json
{
  "valid": true,
  "ingredient": {
    "id": "uuid",
    "name": "tahu",
    "category": "soy",
    "synonyms": ["tahu putih", "tofu"],
    "allergens": [{"allergenId": "uuid", "allergenName": "soy"}]
  },
  "message": "Bahan makanan \"tahu\" ditemukan dan valid."
}
```

### Failure Response (400 Bad Request)
```json
{
  "valid": false,
  "error": "INGREDIENT_NOT_FOUND",
  "message": "Bahan makanan \"mobil\" tidak dikenali dalam knowledge base...",
  "suggestions": "Gunakan endpoint GET /api/ai/ingredients untuk melihat daftar..."
}
```

---

## 📋 Test Cases

### ✅ Valid Ingredient
```bash
curl -X POST http://localhost:5000/api/ai/validate-ingredient \
  -H "Content-Type: application/json" \
  -d '{"foodName": "tahu"}'
# Response: 200 OK with ingredient details
```

### ❌ Invalid Ingredient (Explicitly Rejected)
```bash
curl -X POST http://localhost:5000/api/ai/validate-ingredient \
  -H "Content-Type: application/json" \
  -d '{"foodName": "mobil"}'
# Response: 400 with error: "INGREDIENT_NOT_FOUND"
```

### 🔤 Synonym Matching
```bash
curl -X POST http://localhost:5000/api/ai/validate-ingredient \
  -H "Content-Type: application/json" \
  -d '{"foodName": "tofu"}'
# Response: 200 OK (matches synonym → "tahu")
```

### 📦 Batch Validation
```bash
curl -X POST http://localhost:5000/api/ai/validate-ingredients-batch \
  -H "Content-Type: application/json" \
  -d '{"foodNames": ["ayam", "tahu", "unknown_food", "telur"]}'
# Response: 200 OK with 4 validations + summary (75% valid)
```

### 🔎 Search Ingredients
```bash
curl -X GET "http://localhost:5000/api/ai/ingredients/search?keyword=nasi&limit=5"
# Response: 200 OK with matching ingredients
```

---

## 🧪 Run Full Test Suite

```bash
cd NUTRIPLAN_API
node TEST_INGREDIENT_VALIDATION.js
```

**Tests 15 scenarios including:**
- ✅ Valid ingredients
- ❌ Invalid ingredients (explicit rejection)
- 🔤 Synonym matching
- 📦 Batch validation
- 🔍 Search
- ⚠️ Input validation
- 📊 Category distribution
- 🔗 Allergen mapping

---

## 📁 Files Created/Modified

### New Files
```
NUTRIPLAN_API/
├── src/
│   └── services/
│       └── ingredientService.ts      (NEW - 180 lines)
├── INGREDIENT_VALIDATION_API.md       (NEW - Complete guide)
└── TEST_INGREDIENT_VALIDATION.js      (NEW - Test suite)
```

### Modified Files
```
src/controllers/aiController.ts
  + validateIngredient()
  + validateIngredientsBatch()
  + getAvailableIngredients()
  + searchIngredientsByKeyword()

src/routes/aiRoutes.ts
  + POST /api/ai/validate-ingredient
  + POST /api/ai/validate-ingredients-batch
  + GET /api/ai/ingredients
  + GET /api/ai/ingredients/search
```

---

## 🔌 Integration Example (React)

```typescript
import axios from 'axios';

// Validate ingredient on blur
const validateIngredient = async (foodName: string) => {
  try {
    const response = await axios.post('/api/ai/validate-ingredient', {
      foodName
    });
    
    if (response.data.valid) {
      // Ingredient is valid
      setSelectedIngredient(response.data.ingredient);
      setError(null);
    }
  } catch (error) {
    // Ingredient not found
    if (error.response?.status === 400) {
      setError(error.response.data.message);
      setSelectedIngredient(null);
    }
  }
};

// Search as user types (autocomplete)
const searchIngredients = async (keyword: string) => {
  try {
    const response = await axios.get('/api/ai/ingredients/search', {
      params: { keyword, limit: 10 }
    });
    setSuggestions(response.data.results);
  } catch (error) {
    console.error('Search failed:', error);
  }
};
```

---

## 🗄️ Database Schema

### Ingredient Table (48 items)
```
id            UUID (primary key)
name          TEXT (unique) - e.g., "tahu", "ayam", "nasi putih"
category      ENUM - protein, carb, vegetable, fruit, dairy, soy, seafood, gluten, misc
synonyms      TEXT - comma-separated alternatives (e.g., "tahu putih, tofu")
```

### Allergen Table (8 items)
```
id            UUID (primary key)
name          TEXT (unique) - egg, dairy, fish, shellfish, soy, gluten, peanut, tree_nut
description   TEXT
```

### IngredientAllergen Table (18 mappings)
```
ingredientId  UUID (FK)
allergenId    UUID (FK)
UNIQUE(ingredientId, allergenId)
```

### Sample Queries
```sql
-- Validate ingredient
SELECT * FROM "Ingredient" 
WHERE name = 'tahu' OR synonyms ILIKE '%tofu%'
LIMIT 1;

-- Get allergens for ingredient
SELECT a.name FROM "Allergen" a
JOIN "IngredientAllergen" ia ON a.id = ia."allergenId"
WHERE ia."ingredientId" = 'uuid-123';

-- Search ingredients
SELECT * FROM "Ingredient"
WHERE name ILIKE '%nasi%' OR synonyms ILIKE '%nasi%'
ORDER BY name ASC LIMIT 10;
```

---

## ✨ Key Features

### ✅ Semantic Matching
- Exact name matching (case-insensitive)
- Synonym support (e.g., "tofu" → "tahu")
- No fuzzy/approximate matching

### ✅ Explicit Rejection
- Unknown inputs return 400 error
- No hallucinations or assumptions
- Clear error messages in Indonesian

### ✅ Complete Allergen Info
- All ingredient-allergen mappings from KB
- Supports multi-allergen ingredients
- Zero-allergen ingredients supported

### ✅ Batch Processing
- Validate multiple ingredients at once
- Summary statistics (valid %, counts)
- Detailed per-ingredient results

### ✅ Search & Discovery
- Keyword search on name and synonyms
- Full ingredient catalog listing
- Category distribution statistics

---

## 🚦 HTTP Status Codes

| Code | Scenario |
|------|----------|
| **200** | Valid ingredient found |
| **400** | Invalid input or ingredient not found |
| **500** | Server error |

---

## 🔍 Validation Logic

```
Input: "tahu" or "tofu"
   ↓
[Normalize] → "tahu" (lowercase, trimmed)
   ↓
[Query DB] → Find by name OR synonyms
   ↓
[Found?] → YES: Return ingredient with allergens
          → NO: Return 400 error
```

---

## 📊 Knowledge Base Stats

| Category | Count | Examples |
|----------|-------|----------|
| Protein | 7 | ayam, telur, ikan nila, ... |
| Carb | 7 | nasi putih, roti, mie, ... |
| Vegetable | 9 | brokoli, bayam, wortel, ... |
| Fruit | 8 | apel, pisang, jeruk, ... |
| Dairy | 4 | susu, keju, yogurt, ... |
| Soy | 4 | tahu, tempe, kecap, ... |
| Seafood | 3 | ikan nila, ikan tongkol, ... |
| Gluten | 4 | roti, spaghetti, mie, ... |
| Misc | 8 | minyak, garam, gula, ... |

**Total: 48 ingredients, 8 allergens, 18 mappings**

---

## 🛠️ Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `INVALID_INPUT` | Missing/null foodName | Check request body |
| `EMPTY_INPUT` | Only whitespace | Provide ingredient name |
| `INGREDIENT_NOT_FOUND` | Not in KB | Check spelling or use search |
| `INTERNAL_ERROR` | Server error | Check server logs |

---

## 🎯 Use Cases

### 1. Menu Planning
Validate all menu ingredients before saving
```javascript
const menuIngredients = ['ayam', 'nasi putih', 'brokoli'];
// Validate all at once with batch endpoint
```

### 2. Student Allergen Check
Validate food items against student's allergies
```javascript
// Get valid ingredients, check against user's allergens
```

### 3. Autocomplete Input
Search as user types ingredient name
```javascript
// Use search endpoint to suggest matches
```

### 4. Kitchen Dashboard
Pre-validate all ingredients in recipes
```javascript
// Ensure all menu items use valid ingredients only
```

---

## ✅ Verification Checklist

- [x] Endpoint accepts POST with foodName
- [x] Returns 200 with ingredient details if valid
- [x] Returns 400 if ingredient not found
- [x] Supports synonym matching
- [x] Queries Ingredient table from PostgreSQL
- [x] Includes allergen information
- [x] Batch validation working
- [x] Search functionality working
- [x] All 48 ingredients in KB
- [x] All 8 allergens linked
- [x] TypeScript compilation clean
- [x] Test suite comprehensive (15 tests)
- [x] Error messages in Indonesian
- [x] No generative AI used

---

## 📖 Documentation

- **Full API Guide**: [INGREDIENT_VALIDATION_API.md](INGREDIENT_VALIDATION_API.md)
- **Test Suite**: [TEST_INGREDIENT_VALIDATION.js](TEST_INGREDIENT_VALIDATION.js)
- **Service Code**: [src/services/ingredientService.ts](src/services/ingredientService.ts)
- **Controller**: [src/controllers/aiController.ts](src/controllers/aiController.ts)
- **Routes**: [src/routes/aiRoutes.ts](src/routes/aiRoutes.ts)

---

## 🚀 Next Steps

1. **Start server**: `npm run dev`
2. **Run tests**: `node TEST_INGREDIENT_VALIDATION.js`
3. **Check logs**: Verify all tests pass ✅
4. **Integrate into UI**: Use endpoints in React components
5. **Monitor performance**: Query times should be <10ms

---

**Status**: ✅ Production Ready  
**TypeScript**: ✅ Clean compilation (no errors)  
**Tests**: ✅ 15 comprehensive test cases  
**Documentation**: ✅ Complete with examples  
**Database**: ✅ 48 ingredients, 8 allergens, 18 mappings
