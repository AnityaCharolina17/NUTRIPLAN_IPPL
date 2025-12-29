export interface MenuPortion {
  item: string;
  amount: string;
  weight: string;
}

export interface DetailedNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium?: number;
  calcium?: number;
  iron?: number;
  vitaminA?: number;
  vitaminC?: number;
}

export interface MenuItem {
  id: string;
  day?: string;
  name: string;
  mainIngredient?: string;
  description: string;
  category: string;
  ingredients: string[];
  allergens: string[];
  nutritionFacts: DetailedNutrition;
  portions: MenuPortion[];
  imageUrl: string;
  safeMenuId?: string; // ID menu aman alternatif (bebas alergen umum)
}

export interface WeeklySchedule {
  day: string;
  date: string;
  menuId: string; // 1 menu per day for MBG program
  mainIngredient?: string; // For admin menu generation
}

// Menu items for MBG (Makan Bergizi Gratis) program
export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Nasi Ayam Goreng Sayur",
    description: "Nasi putih dengan ayam goreng, tumis kangkung, dan tempe goreng - Menu MBG bergizi seimbang",
    category: "Lunch",
    ingredients: ["Nasi Putih", "Ayam", "Kangkung", "Tempe", "Bawang Merah", "Bawang Putih", "Cabai", "Kecap Manis"],
    allergens: ["Kedelai"],
    safeMenuId: "safe-2",
    nutritionFacts: {
      calories: 550,
      protein: 28,
      carbs: 68,
      fat: 15,
      fiber: 6,
      sodium: 580,
      calcium: 180,
      iron: 3.2,
      vitaminA: 850,
      vitaminC: 25
    },
    portions: [
      { item: "Nasi Putih", amount: "1 porsi", weight: "150g" },
      { item: "Ayam Goreng", amount: "1 potong paha", weight: "80g" },
      { item: "Tumis Kangkung", amount: "1 porsi", weight: "100g" },
      { item: "Tempe Goreng", amount: "2 potong", weight: "50g" },
      { item: "Sambal", amount: "1 sdm", weight: "15g" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1604908553898-0582d8738866?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "2",
    name: "Nasi Ikan Goreng Capcay",
    description: "Nasi putih dengan ikan goreng, capcay sayuran, dan tahu bacem - Menu MBG kaya protein",
    category: "Lunch",
    ingredients: ["Nasi Putih", "Ikan", "Wortel", "Kol", "Buncis", "Tahu", "Bawang Bombay", "Saus Tiram"],
    allergens: ["Ikan", "Kedelai"],
    safeMenuId: "safe-2",
    nutritionFacts: {
      calories: 520,
      protein: 30,
      carbs: 65,
      fat: 12,
      fiber: 7,
      sodium: 620,
      calcium: 200,
      iron: 2.8,
      vitaminA: 920,
      vitaminC: 35
    },
    portions: [
      { item: "Nasi Putih", amount: "1 porsi", weight: "150g" },
      { item: "Ikan Goreng (Kembung/Tongkol)", amount: "1 ekor", weight: "75g" },
      { item: "Capcay Sayuran", amount: "1 porsi", weight: "120g" },
      { item: "Tahu Bacem", amount: "2 potong", weight: "60g" },
      { item: "Sambal", amount: "1 sdm", weight: "15g" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1604908177225-0ac1c9c97c32?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "3",
    name: "Nasi Telur Balado Sayur Asem",
    description: "Nasi putih dengan telur balado, sayur asem, dan perkedel kentang - Menu MBG tradisional",
    category: "Lunch",
    ingredients: ["Nasi Putih", "Telur", "Cabai", "Tomat", "Jagung", "Kacang Panjang", "Labu Siam", "Kentang"],
    allergens: ["Telur"],
    safeMenuId: "safe-3",
    nutritionFacts: {
      calories: 500,
      protein: 18,
      carbs: 72,
      fat: 14,
      fiber: 8,
      sodium: 550,
      calcium: 160,
      iron: 2.5,
      vitaminA: 780,
      vitaminC: 42
    },
    portions: [
      { item: "Nasi Putih", amount: "1 porsi", weight: "150g" },
      { item: "Telur Balado", amount: "1 butir", weight: "55g" },
      { item: "Sayur Asem", amount: "1 mangkok", weight: "150g" },
      { item: "Perkedel Kentang", amount: "2 buah", weight: "60g" },
      { item: "Kerupuk", amount: "2 keping", weight: "10g" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "4",
    name: "Nasi Rendang Sapi Sayur Bayam",
    description: "Nasi putih dengan rendang sapi, tumis bayam, dan kerupuk - Menu MBG istimewa",
    category: "Lunch",
    ingredients: ["Nasi Putih", "Daging Sapi", "Santan", "Cabai", "Lengkuas", "Bayam", "Jagung", "Kerupuk"],
    allergens: ["Susu"],
    safeMenuId: "safe-1",
    nutritionFacts: {
      calories: 580,
      protein: 32,
      carbs: 66,
      fat: 18,
      fiber: 6,
      sodium: 690,
      calcium: 220,
      iron: 4.5,
      vitaminA: 1200,
      vitaminC: 28
    },
    portions: [
      { item: "Nasi Putih", amount: "1 porsi", weight: "150g" },
      { item: "Rendang Sapi", amount: "1 potong", weight: "70g" },
      { item: "Tumis Bayam Jagung", amount: "1 porsi", weight: "100g" },
      { item: "Kerupuk", amount: "3 keping", weight: "15g" },
      { item: "Sambal", amount: "1 sdm", weight: "10g" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1559050019-0efffedaa4f2?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "5",
    name: "Nasi Sop Ayam Sayur",
    description: "Nasi putih dengan sop ayam sayuran, tempe goreng, dan sambal - Menu MBG hangat berkuah",
    category: "Lunch",
    ingredients: ["Nasi Putih", "Ayam", "Kentang", "Wortel", "Kol", "Seledri", "Tempe", "Cabai"],
    allergens: ["Kedelai"],
    nutritionFacts: {
      calories: 530,
      protein: 26,
      carbs: 70,
      fat: 13,
      fiber: 7,
      sodium: 610,
      calcium: 190,
      iron: 3.0,
      vitaminA: 880,
      vitaminC: 38
    },
    portions: [
      { item: "Nasi Putih", amount: "1 porsi", weight: "150g" },
      { item: "Sop Ayam Sayuran", amount: "1 mangkok", weight: "200g" },
      { item: "Ayam dalam Sop", amount: "1 potong", weight: "60g" },
      { item: "Tempe Goreng", amount: "2 potong", weight: "50g" },
      { item: "Sambal", amount: "1 sdm", weight: "15g" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80",
    safeMenuId: "safe-1"
  },
  // MENU AMAN (Bebas Alergen Umum) - Alternative options
  {
    id: "safe-1",
    name: "Nasi Daging Sapi Sayur Bening",
    description: "Menu aman bebas alergen: Nasi putih dengan daging sapi kukus, sayur bening bayam, dan kerupuk beras",
    category: "Safe Menu",
    ingredients: ["Nasi Putih", "Daging Sapi", "Bayam", "Jagung", "Wortel", "Bawang Merah", "Bawang Putih"],
    allergens: [],
    nutritionFacts: {
      calories: 540,
      protein: 32,
      carbs: 66,
      fat: 14,
      fiber: 7,
      sodium: 520,
      calcium: 210,
      iron: 4.8,
      vitaminA: 1100,
      vitaminC: 32
    },
    portions: [
      { item: "Nasi Putih", amount: "1 porsi", weight: "150g" },
      { item: "Daging Sapi Kukus", amount: "1 potong", weight: "75g" },
      { item: "Sayur Bening Bayam", amount: "1 mangkok", weight: "120g" },
      { item: "Kerupuk Beras", amount: "3 keping", weight: "15g" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "safe-2",
    name: "Nasi Ayam Rebus Sayur Asem",
    description: "Menu aman bebas alergen: Nasi putih dengan ayam rebus, sayur asem tanpa kacang, dan perkedel kentang",
    category: "Safe Menu",
    ingredients: ["Nasi Putih", "Ayam", "Labu Siam", "Jagung", "Tomat", "Kentang", "Asam Jawa"],
    allergens: [],
    nutritionFacts: {
      calories: 515,
      protein: 28,
      carbs: 64,
      fat: 12,
      fiber: 8,
      sodium: 490,
      calcium: 185,
      iron: 3.4,
      vitaminA: 920,
      vitaminC: 35
    },
    portions: [
      { item: "Nasi Putih", amount: "1 porsi", weight: "150g" },
      { item: "Ayam Rebus", amount: "1 potong", weight: "70g" },
      { item: "Sayur Asem", amount: "1 mangkok", weight: "130g" },
      { item: "Perkedel Kentang", amount: "2 buah", weight: "55g" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1604908177923-8df8c0e4382c?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "safe-3",
    name: "Nasi Ayam Panggang Sayur Lodeh",
    description: "Menu aman bebas alergen: Nasi putih dengan ayam panggang bumbu kuning, sayur lodeh tanpa santan, dan kerupuk beras",
    category: "Safe Menu",
    ingredients: ["Nasi Putih", "Ayam", "Wortel", "Buncis", "Kol", "Kunyit", "Jahe"],
    allergens: [],
    nutritionFacts: {
      calories: 525,
      protein: 27,
      carbs: 67,
      fat: 13,
      fiber: 6,
      sodium: 510,
      calcium: 175,
      iron: 3.1,
      vitaminA: 890,
      vitaminC: 30
    },
    portions: [
      { item: "Nasi Putih", amount: "1 porsi", weight: "150g" },
      { item: "Ayam Panggang", amount: "1 potong", weight: "75g" },
      { item: "Sayur Lodeh", amount: "1 mangkok", weight: "120g" },
      { item: "Kerupuk Beras", amount: "3 keping", weight: "15g" }
    ],
    imageUrl: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=1200&q=80"
  }
];

// Weekly schedule for MBG program (1 meal per day)
export const weeklySchedule: WeeklySchedule[] = [
  {
    day: "Senin",
    date: "11 November 2025",
    menuId: "1",
    mainIngredient: "Ayam"
  },
  {
    day: "Selasa",
    date: "12 November 2025",
    menuId: "2",
    mainIngredient: "Ikan"
  },
  {
    day: "Rabu",
    date: "13 November 2025",
    menuId: "3",
    mainIngredient: "Telur"
  },
  {
    day: "Kamis",
    date: "14 November 2025",
    menuId: "4",
    mainIngredient: "Daging Sapi"
  },
  {
    day: "Jumat",
    date: "15 November 2025",
    menuId: "5",
    mainIngredient: "Ayam"
  }
];

export const commonAllergens = [
  "Susu",
  "Telur",
  "Kacang",
  "Ikan",
  "Kerang",
  "Kedelai",
  "Gluten",
  "Wijen"
];