# 🤖 Panduan Testing AI Endpoints - Nutriplan

## ✅ Implementasi OpenAI Sudah Selesai

### 🎯 Fitur AI yang Tersedia:

1. **Deteksi Nama Makanan** - AI mengidentifikasi nama makanan dari deskripsi
2. **Ekstraksi Bahan/Ingredients** - AI mengekstrak semua bahan yang digunakan
3. **Deteksi Alergen** - AI mendeteksi alergen potensial dalam makanan
4. **Matching dengan Alergi User** - AI mencocokkan dengan alergi user dari database
5. **Rekomendasi Keamanan** - AI memberikan saran berdasarkan hasil analisis

---

## 📡 Endpoint AI yang Tersedia:

### 1. **POST `/api/ai/analyze-food`**
Menganalisis makanan secara komprehensif menggunakan AI

**Request:**
```json
{
  "foodDescription": "Spaghetti carbonara dengan bacon, telur, dan keju parmesan"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "foodName": "Spaghetti Carbonara",
    "ingredients": ["spaghetti", "bacon", "telur", "keju parmesan", "lada hitam"],
    "allergens": ["Gluten", "Egg", "Dairy", "Pork"],
    "nutritionEstimate": {
      "calories": 680,
      "protein": "28g",
      "carbs": "75g",
      "fat": "30g"
    },
    "isProcessedFood": true,
    "safetyNotes": "Mengandung alergen umum: telur, susu, dan gluten"
  }
}
```

---

### 2. **POST `/api/ai/check-allergen-safety`** 🔐 (Requires Auth)
Cek keamanan makanan untuk user dengan alergi tertentu

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "foodDescription": "Nasi goreng seafood dengan udang, cumi, dan kerang"
}
```

**Response:**
```json
{
  "success": true,
  "foodAnalysis": {
    "foodName": "Nasi Goreng Seafood",
    "ingredients": ["nasi", "udang", "cumi", "kerang", "bawang", "kecap"],
    "allergens": ["Seafood", "Shellfish", "Gluten"],
    "nutritionEstimate": {
      "calories": 550,
      "protein": "25g",
      "carbs": "70g",
      "fat": "18g"
    },
    "isProcessedFood": false,
    "safetyNotes": "Mengandung seafood"
  },
  "userAllergens": ["Seafood", "Udang"],
  "matchedAllergens": ["seafood"],
  "isSafe": false,
  "severity": "danger",
  "recommendation": "Hindari makanan ini karena mengandung seafood yang Anda alergi. Disarankan memilih menu alternatif yang tidak mengandung hasil laut."
}
```

---

### 3. **POST `/api/ai/detect-allergens`** 🔐 (Requires Auth)
Ekstraksi bahan & alergen dari nama/deskripsi menu

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "name": "Ayam Teriyaki",
  "description": "Ayam dengan saus teriyaki, wijen, dan madu",
  "ingredients": ["ayam", "kecap", "wijen", "madu"]
}
```

**Response:**
```json
{
  "success": true,
  "aiExtracted": {
    "ingredients": ["ayam", "kecap manis", "wijen", "madu", "jahe", "bawang putih"],
    "possibleAllergens": ["Wijen", "Kedelai", "Gluten"],
    "summary": "Ayam teriyaki mengandung wijen dan kecap yang berbasis kedelai"
  },
  "userAllergens": ["Kacang", "Seafood"],
  "matchedAllergens": [],
  "hasAllergy": false
}
```

---

### 4. **POST `/api/allergens/check`** 🔐 (Enhanced with AI)
Cek alergen dengan opsi AI detection

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request (Traditional):**
```json
{
  "ingredients": ["ayam", "tahu", "kangkung"],
  "menuAllergens": ["Kedelai"],
  "useAI": false
}
```

**Request (AI-Powered):**
```json
{
  "ingredients": ["ayam", "tahu", "kangkung"],
  "menuAllergens": ["Kedelai"],
  "foodDescription": "Ayam bakar dengan tahu goreng dan tumis kangkung",
  "useAI": true
}
```

**Response:**
```json
{
  "success": true,
  "hasAllergy": false,
  "matchedAllergens": [],
  "severity": "none",
  "recommendation": "Menu ini aman untuk Anda",
  "aiAnalysis": {
    "detectedAllergens": [],
    "confidence": "high",
    "reasoning": "Tidak ada alergen yang terdeteksi dari daftar alergi user"
  },
  "method": "AI-powered"
}
```

---

## 🧪 Cara Testing:

### Step 1: Login untuk mendapatkan token
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "budi@student.com",
  "password": "password123"
}
```

### Step 2: Copy JWT token dari response

### Step 3: Test AI Endpoints

#### Test 1: Analisis Makanan Umum (Tanpa Auth)
```bash
POST http://localhost:5000/api/ai/analyze-food
Content-Type: application/json

{
  "foodDescription": "Pizza Margherita dengan keju mozzarella, tomat, dan basil"
}
```

#### Test 2: Cek Keamanan dengan Alergi User (Dengan Auth)
```bash
POST http://localhost:5000/api/ai/check-allergen-safety
Content-Type: application/json
Authorization: Bearer <YOUR_JWT_TOKEN>

{
  "foodDescription": "Kue kacang dengan selai kacang dan biskuit"
}
```

#### Test 3: Deteksi Alergen dari Menu (Dengan Auth)
```bash
POST http://localhost:5000/api/ai/detect-allergens
Content-Type: application/json
Authorization: Bearer <YOUR_JWT_TOKEN>

{
  "name": "Rendang Sapi",
  "description": "Rendang dengan santan kelapa dan rempah",
  "ingredients": ["daging sapi", "santan", "cabai", "bawang"]
}
```

#### Test 4: Cek Alergen dengan AI Enhancement (Dengan Auth)
```bash
POST http://localhost:5000/api/allergens/check
Content-Type: application/json
Authorization: Bearer <YOUR_JWT_TOKEN>

{
  "ingredients": ["ikan nila", "kecap", "tempe"],
  "menuAllergens": ["Fish", "Kedelai"],
  "foodDescription": "Ikan goreng kecap dengan tempe orek",
  "useAI": true
}
```

---

## 🔑 Test Credentials:

**Student dengan Alergi:**
- Email: `budi@student.com`
- Password: `password123`
- Alergi: Kacang, Seafood

**Student dengan Alergi Susu:**
- Email: `andi@student.com`
- Password: `password123`
- Alergi: Dairy (Susu)

**Student Tanpa Alergi:**
- Email: `siti@student.com`
- Password: `password123`
- Alergi: None

---

## 💡 Contoh Use Cases:

### Use Case 1: Deteksi Makanan Berbahaya
User Budi (alergi kacang) ingin tahu apakah "Gado-gado dengan bumbu kacang" aman:

```bash
POST /api/ai/check-allergen-safety
Authorization: Bearer <budi_token>

{
  "foodDescription": "Gado-gado dengan bumbu kacang, sayuran rebus, dan lontong"
}
```

Expected: `isSafe: false`, `matchedAllergens: ["kacang"]`

---

### Use Case 2: Identifikasi Makanan Unknown
Admin ingin mengidentifikasi makanan dari foto/deskripsi:

```bash
POST /api/ai/analyze-food

{
  "foodDescription": "Makanan Jepang dengan nasi, ikan mentah, dan rumput laut"
}
```

Expected: `foodName: "Sushi"`, `allergens: ["Fish", "Seafood"]`

---

### Use Case 3: Validasi Menu Kantin
Kitchen staff ingin memvalidasi menu baru:

```bash
POST /api/ai/analyze-food

{
  "foodDescription": "Ayam geprek dengan sambal matah dan nasi putih"
}
```

Expected: Complete nutrition info + allergen analysis

---

## 🚀 Fitur AI yang Diimplementasikan:

✅ **Deteksi Nama Makanan** - AI mengidentifikasi nama makanan dari deskripsi  
✅ **Ekstraksi Bahan** - AI mengekstrak ingredients secara otomatis  
✅ **Deteksi Alergen** - AI mendeteksi semua alergen potensial  
✅ **Nutrisi Estimasi** - AI memberikan estimasi kalori, protein, carbs, fat  
✅ **Safety Check** - AI memeriksa keamanan makanan untuk user spesifik  
✅ **Rekomendasi** - AI memberikan saran berdasarkan analisis  
✅ **Confidence Score** - AI memberikan tingkat kepercayaan deteksi  

---

## 🔧 Environment Variables yang Diperlukan:

Pastikan `.env` file memiliki:
```
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
DATABASE_URL=postgresql://nutriplan:nutriplan123@localhost:5432/nutriplan_db
JWT_SECRET=your_secret_key
```

---

## 📝 Notes:

1. **Model yang digunakan:** `gpt-4o-mini` (cost-effective dan cepat)
2. **Temperature:** 0.2-0.5 untuk hasil yang konsisten
3. **JSON Parsing:** Otomatis membersihkan markdown code blocks
4. **Fallback:** Jika AI gagal, sistem menggunakan keyword matching
5. **Auth:** Endpoint safety check memerlukan JWT token

---

## ✨ Next Steps:

1. Test semua endpoint dengan Postman/Thunder Client
2. Verify AI responses dengan real food data
3. Integrate ke frontend UI
4. Add error handling untuk edge cases
5. Monitor OpenAI API usage dan costs
