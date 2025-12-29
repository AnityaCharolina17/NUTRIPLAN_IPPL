# ⚡ CBR API - Quick Start

## Main Endpoint

```bash
POST /api/ai/generate-menu
Content-Type: application/json

{
  "foodName": "ayam"
}
```

## Response

```json
{
  "success": true,
  "baseIngredient": {
    "id": "uuid",
    "name": "ayam",
    "category": "protein"
  },
  "cases": [
    {
      "id": "uuid",
      "menuName": "Ayam Bakar Madu",
      "description": "Ayam bakar dengan bumbu madu...",
      "calories": 650,
      "protein": "28g",
      "carbs": "15g",
      "fat": "45g"
    },
    ...3 menus max...
  ],
  "caseCount": 3,
  "message": "Ditemukan 3 menu untuk bahan makanan \"ayam\"."
}
```

---

## Test It

```bash
# 1. Start server
npm run dev

# 2. Test endpoint
curl -X POST http://localhost:5000/api/ai/generate-menu \
  -H "Content-Type: application/json" \
  -d '{"foodName": "ayam"}'

# 3. Get all cases
curl http://localhost:5000/api/ai/cbr/cases

# 4. Get statistics
curl http://localhost:5000/api/ai/cbr/statistics
```

---

## Available Base Ingredients

Menu cases exist for:
- **ayam** (3 menus) - Bakar, Goreng, Soto
- **ikan nila** (1 menu) - Goreng Kecap
- **daging sapi** (1 menu) - Rendang
- **ikan tongkol** (1 menu) - Balado

---

## Key Points

✅ **No invention** - All menus from MenuCase table  
✅ **Deterministic** - Same input = same output always  
✅ **Validated** - Ingredients checked against KB first  
✅ **Up to 3** - Maximum 3 cases per ingredient  
✅ **Complete data** - Nutrition info included  

---

## React Integration

```typescript
const [menus, setMenus] = useState([]);

const generateMenus = async (foodName) => {
  const res = await axios.post('/api/ai/generate-menu', {
    foodName
  });
  
  if (res.data.success) {
    setMenus(res.data.cases); // Array of menu options
  }
};
```

---

**Status:** ✅ Ready to use
