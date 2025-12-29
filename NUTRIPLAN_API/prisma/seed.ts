import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (optional - hapus jika tidak ingin reset)
  await prisma.studentMenuChoice.deleteMany();
  await prisma.menuAllergen.deleteMany();
  await prisma.menuIngredient.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.weeklyMenu.deleteMany();
  await prisma.menuAllergenGood.deleteMany();
  await prisma.menuIngredientGood.deleteMany();
  await prisma.goodMenu.deleteMany();
  await prisma.userAllergen.deleteMany();
  await prisma.user.deleteMany();
  await prisma.menuCase.deleteMany();
  await prisma.ingredientAllergen.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.allergen.deleteMany();

  console.log('✅ Cleared existing data');

  // 1. Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Two-word student names (30 names)
  const studentNames = [
    'Rani Nasifa',
    'Rudi Sidoarjo',
    'Sarah Laura',
    'Bima Aditya',
    'Lila Cahya',
    'Tio Maulana',
    'Nara Fadila',
    'Dewa Bagus',
    'Rika Amanda',
    'Feri Saputra',
    'Tesa Nurhaliza',
    'Adnan Farrel',
    'Dini Safira',
    'Rio Pratama',
    'Sinta Lestari',
    'Yoga Pramana',
    'Vina Maharani',
    'Fajar Ramadhan',
    'Rara Melati',
    'Aldi Gunawan',
    'Nisa Kartika',
    'Rafi Alvaro',
    'Cici Rahma',
    'Rizky Ananda',
    'Luthfi Satria',
    'Mita Anggraini',
    'Kiki Oktaviani',
    'Arga Wicaksono',
    'Yudi Santoso',
    'Nindi Azzahra',
  ];

  const admin = await prisma.user.create({
    data: {
      id: 'admin@nutriplan.com', // No change needed here
      name: 'Admin Nutriplan',
      email: 'admin@nutriplan.com',
      password: hashedPassword,
      role: 'admin',
      bio: 'Administrator sistem Nutriplan',
    },
  });

  const kitchen = await prisma.user.create({
    data: {
      id: 'dapur@nutriplan.com', // No change needed here
      name: 'Petugas Dapur',
      email: 'dapur@nutriplan.com',
      password: hashedPassword,
      role: 'kitchen_staff',
      bio: 'Petugas dapur sekolah',
    },
  });

  const student1 = await prisma.user.create({
    data: {
      id: '1125101',
      name: studentNames[0],
      email: '1125101@student.if.ac.id',
      password: hashedPassword,
      role: 'student',
      class: '10 IPA 1',
      nis: '1823456001',
      customAllergies: 'Kacang tanah, Udang',
      bio: 'Siswa kelas 10 IPA 1',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      id: '1125102',
      name: studentNames[1],
      email: '1125102@student.if.ac.id',
      password: hashedPassword,
      role: 'student',
      class: '10 IPA 1',
      nis: '1823456002',
      bio: 'Siswa kelas 10 IPA 1',
    },
  });

  const student3 = await prisma.user.create({
    data: {
      id: '1125103',
      name: studentNames[2],
      email: '1125103@student.if.ac.id',
      password: hashedPassword,
      role: 'student',
      class: '10 IPA 1',
      nis: '1823456003',
      customAllergies: 'Susu',
      bio: 'Siswa kelas 10 IPA 1',
    },
  });

  console.log('✅ Created users');

  // Additional admin and kitchen staff
  const admin2 = await prisma.user.create({
    data: {
      id: 'admin2@nutriplan.com',
      name: 'Admin Nutriplan 2',
      email: 'admin2@nutriplan.com',
      password: hashedPassword,
      role: 'admin',
      bio: 'Administrator sistem Nutriplan',
    },
  });

  await prisma.user.createMany({
    data: [
      {
        id: 'dapur2@nutriplan.com',
        name: 'Petugas Dapur 2',
        email: 'dapur2@nutriplan.com',
        password: hashedPassword,
        role: 'kitchen_staff',
        bio: 'Petugas dapur sekolah',
      },
      {
        id: 'dapur3@nutriplan.com',
        name: 'Petugas Dapur 3',
        email: 'dapur3@nutriplan.com',
        password: hashedPassword,
        role: 'kitchen_staff',
        bio: 'Petugas dapur sekolah',
      },
      {
        id: 'dapur4@nutriplan.com',
        name: 'Petugas Dapur 4',
        email: 'dapur4@nutriplan.com',
        password: hashedPassword,
        role: 'kitchen_staff',
        bio: 'Petugas dapur sekolah',
      },
    ],
  });

  console.log('✅ Created extra admin and kitchen staff');

  // Create additional 27 dummy students (total = 30 students)
  // Student IDs: email format, NIS: random 10 digit
  const extraStudentsData = Array.from({ length: 27 }).map((_, idx) => {
    const studentNum = 1125104 + idx;
    const email = `${studentNum}@student.if.ac.id`;
    const nis = `182345${(1000 + idx).toString().slice(-4)}`; // 10-digit unique-ish
    const classGroup = studentNum <= 1125115 ? '10 IPA 1' : '10 IPA 2';
    const name = studentNames[idx + 3] || `Student ${studentNum}`;
    return {
      id: studentNum.toString(),
      name,
      email,
      password: hashedPassword,
      role: 'student' as const,
      class: classGroup,
      nis,
      bio: `Siswa kelas ${classGroup}`,
    };
  });

  await prisma.user.createMany({ data: extraStudentsData });
  console.log('✅ Created additional 27 students');

  // 2. Create User Allergens (15 students with varied allergens)
  const allergenPool = ['soy', 'dairy', 'egg', 'fish', 'shellfish', 'gluten', 'peanut', 'tree_nut'];
  const allergenAssignments: { userId: string; allergen: string; isCustom: boolean }[] = [];
  const targetedStudents = [
    student1.id,
    student2.id,
    student3.id,
    ...extraStudentsData.slice(0, 12).map((s) => s.id as string),
  ];
  targetedStudents.forEach((stuId, idx) => {
    const allergen = allergenPool[idx % allergenPool.length];
    allergenAssignments.push({ userId: stuId, allergen, isCustom: false });
  });

  await prisma.userAllergen.createMany({ data: allergenAssignments });

  console.log('✅ Created user allergens (15 students randomized)');

  // 3. Create Weekly Menu (Current Week)
  const currentWeekStart = new Date();
  currentWeekStart.setUTCHours(0, 0, 0, 0);
  const dayOfWeek = currentWeekStart.getDay();
  const diff = currentWeekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  currentWeekStart.setDate(diff);

  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 4);
  currentWeekEnd.setUTCHours(0, 0, 0, 0);

  const currentWeekMenu = await prisma.weeklyMenu.create({
    data: {
      weekStart: currentWeekStart,
      weekEnd: currentWeekEnd,
      isActive: true,
      createdById: admin.id,
    },
  });

  console.log('✅ Created current week menu');

  // 4. Create Menu Items for Current Week
  const menuItemsSenin = await prisma.menuItem.create({
    data: {
      weekMenuId: currentWeekMenu.id,
      day: 'Senin',
      mainDish: 'Ayam Bakar Madu',
      sideDish: 'Tahu Goreng',
      vegetable: 'Tumis Kangkung',
      fruit: 'Pisang',
      drink: 'Teh Manis',
      imageUrl: 'https://cdn-brilio-net.akamaized.net/news/2022/08/30/236241/1824120-cara-membuat-ayam-bakar-madu.jpg',
      calories: 650,
      protein: '35g',
      carbs: '75g',
      fat: '20g',
      portionCount: 150,
    },
  });

  const menuItemsSelasa = await prisma.menuItem.create({
    data: {
      weekMenuId: currentWeekMenu.id,
      day: 'Selasa',
      mainDish: 'Rendang Sapi',
      sideDish: 'Perkedel Kentang',
      vegetable: 'Sayur Asem',
      fruit: 'Jeruk',
      drink: 'Jus Alpukat',
      imageUrl: 'https://th.bing.com/th/id/OIP.8pUOtiZzKP_OMPx8C8FOJQHaE8?w=273&h=182&c=7&r=0&o=7&pid=1.7&rm=3',
      calories: 720,
      protein: '40g',
      carbs: '80g',
      fat: '25g',
      portionCount: 150,
    },
  });

  const menuItemsRabu = await prisma.menuItem.create({
    data: {
      weekMenuId: currentWeekMenu.id,
      day: 'Rabu',
      mainDish: 'Ikan Goreng Kecap',
      sideDish: 'Tempe Orek',
      vegetable: 'Capcay',
      fruit: 'Apel',
      drink: 'Air Mineral',
      imageUrl: 'https://img.inews.co.id/media/822/files/inews_new/2021/08/18/IMG_18082021_110746__822_x_430_piksel_.jpg',
      calories: 600,
      protein: '30g',
      carbs: '70g',
      fat: '18g',
      portionCount: 150,
    },
  });

  const menuItemsKamis = await prisma.menuItem.create({
    data: {
      weekMenuId: currentWeekMenu.id,
      day: 'Kamis',
      mainDish: 'Soto Ayam',
      sideDish: 'Bakwan Jagung',
      vegetable: 'Tumis Buncis',
      fruit: 'Semangka',
      drink: 'Teh Tawar',
      imageUrl: 'https://th.bing.com/th/id/R.8b4f9c64ae87807e4d79f3898bf5f52f?rik=yrFSRfj48LCyVg&riu=http%3a%2f%2f4.bp.blogspot.com%2f-E_9MQ9lGlDY%2fVSfcWnTq3FI%2fAAAAAAAAAHw%2ftEM73Hm6Ips%2fs640%2fresep-soto-ayam.jpg&ehk=yTAvFjcnQy7Wz6a2Gnr%2fBe4VVE%2bdTxOovWMKA%2f6VNNc%3d&risl=&pid=ImgRaw&r=0',
      calories: 580,
      protein: '28g',
      carbs: '68g',
      fat: '16g',
      portionCount: 150,
    },
  });

  const menuItemsJumat = await prisma.menuItem.create({
    data: {
      weekMenuId: currentWeekMenu.id,
      day: 'Jumat',
      mainDish: 'Nasi Goreng Ayam',
      sideDish: 'Telur Dadar',
      vegetable: 'Acar',
      fruit: 'Melon',
      drink: 'Es Teh',
      imageUrl: 'https://bing.com/th?id=OSK.8b16ddb47bce198642fc0a3038af7671',
      calories: 690,
      protein: '32g',
      carbs: '78g',
      fat: '22g',
      portionCount: 150,
    },
  });

  console.log('✅ Created menu items');

  // 5. Create Menu Ingredients
  await prisma.menuIngredient.createMany({
    data: [
      // Senin - Ayam Bakar
      { menuItemId: menuItemsSenin.id, ingredient: 'Ayam', quantity: '200', unit: 'gram' },
      { menuItemId: menuItemsSenin.id, ingredient: 'Madu', quantity: '2', unit: 'sdm' },
      { menuItemId: menuItemsSenin.id, ingredient: 'Kecap Manis', quantity: '1', unit: 'sdm' },
      { menuItemId: menuItemsSenin.id, ingredient: 'Tahu', quantity: '100', unit: 'gram' },
      { menuItemId: menuItemsSenin.id, ingredient: 'Kangkung', quantity: '150', unit: 'gram' },

      // Selasa - Rendang
      { menuItemId: menuItemsSelasa.id, ingredient: 'Daging Sapi', quantity: '250', unit: 'gram' },
      { menuItemId: menuItemsSelasa.id, ingredient: 'Santan Kelapa', quantity: '200', unit: 'ml' },
      { menuItemId: menuItemsSelasa.id, ingredient: 'Cabai Merah', quantity: '5', unit: 'buah' },
      { menuItemId: menuItemsSelasa.id, ingredient: 'Kentang', quantity: '150', unit: 'gram' },

      // Rabu - Ikan Goreng
      { menuItemId: menuItemsRabu.id, ingredient: 'Ikan Nila', quantity: '200', unit: 'gram' },
      { menuItemId: menuItemsRabu.id, ingredient: 'Kecap', quantity: '2', unit: 'sdm' },
      { menuItemId: menuItemsRabu.id, ingredient: 'Tempe', quantity: '100', unit: 'gram' },
      { menuItemId: menuItemsRabu.id, ingredient: 'Sayuran Campur', quantity: '150', unit: 'gram' },

      // Kamis - Soto Ayam
      { menuItemId: menuItemsKamis.id, ingredient: 'Ayam Kampung', quantity: '250', unit: 'gram' },
      { menuItemId: menuItemsKamis.id, ingredient: 'Kunyit', quantity: '2', unit: 'cm' },
      { menuItemId: menuItemsKamis.id, ingredient: 'Jagung Manis', quantity: '100', unit: 'gram' },
      { menuItemId: menuItemsKamis.id, ingredient: 'Buncis', quantity: '150', unit: 'gram' },

      // Jumat - Nasi Goreng
      { menuItemId: menuItemsJumat.id, ingredient: 'Nasi Putih', quantity: '300', unit: 'gram' },
      { menuItemId: menuItemsJumat.id, ingredient: 'Ayam Fillet', quantity: '150', unit: 'gram' },
      { menuItemId: menuItemsJumat.id, ingredient: 'Telur', quantity: '2', unit: 'butir' },
      { menuItemId: menuItemsJumat.id, ingredient: 'Bawang Merah', quantity: '5', unit: 'siung' },
    ],
  });

  console.log('✅ Created menu ingredients');

  // 6. Create Menu Allergens
  await prisma.menuAllergen.createMany({
    data: [
      { menuItemId: menuItemsSenin.id, allergen: 'Kedelai' },
      { menuItemId: menuItemsSelasa.id, allergen: 'Dairy' },
      { menuItemId: menuItemsRabu.id, allergen: 'Fish' },
      { menuItemId: menuItemsRabu.id, allergen: 'Kedelai' },
      { menuItemId: menuItemsKamis.id, allergen: 'Gluten' },
      { menuItemId: menuItemsJumat.id, allergen: 'Egg' },
      { menuItemId: menuItemsJumat.id, allergen: 'Gluten' },
    ],
  });

  console.log('✅ Created menu allergens');

  // 7. Create Good Menu (Menu Sehat untuk yang alergi)
  const goodMenu1 = await prisma.goodMenu.create({
    data: {
      weekStart: currentWeekStart,
      mainDish: 'Ayam Rebus',
      sideDish: 'Kentang Rebus',
      vegetable: 'Sayur Bayam',
      fruit: 'Pepaya',
      drink: 'Air Putih',
      imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80',
      calories: 450,
      protein: '25g',
      carbs: '55g',
      fat: '12g',
    },
  });

  const goodMenu2 = await prisma.goodMenu.create({
    data: {
      weekStart: currentWeekStart,
      mainDish: 'Dada Ayam Panggang',
      sideDish: 'Ubi Rebus',
      vegetable: 'Brokoli Kukus',
      fruit: 'Pir',
      drink: 'Jus Wortel',
      imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1200&q=80',
      calories: 480,
      protein: '28g',
      carbs: '58g',
      fat: '10g',
    },
  });

  console.log('✅ Created good menus');

  // 8. Create Good Menu Ingredients
  await prisma.menuIngredientGood.createMany({
    data: [
      { goodMenuId: goodMenu1.id, ingredient: 'Ayam Tanpa Kulit', quantity: '180', unit: 'gram' },
      { goodMenuId: goodMenu1.id, ingredient: 'Kentang', quantity: '120', unit: 'gram' },
      { goodMenuId: goodMenu1.id, ingredient: 'Bayam', quantity: '100', unit: 'gram' },

      { goodMenuId: goodMenu2.id, ingredient: 'Dada Ayam', quantity: '200', unit: 'gram' },
      { goodMenuId: goodMenu2.id, ingredient: 'Ubi Jalar', quantity: '150', unit: 'gram' },
      { goodMenuId: goodMenu2.id, ingredient: 'Brokoli', quantity: '120', unit: 'gram' },
    ],
  });

  console.log('✅ Created good menu ingredients');

  // 9. Create Good Menu Allergens (minimal/none)
  await prisma.menuAllergenGood.createMany({
    data: [
      { goodMenuId: goodMenu1.id, allergen: 'None' },
      { goodMenuId: goodMenu2.id, allergen: 'None' },
    ],
  });

  console.log('✅ Created good menu allergens');

  // 10. Create Student Menu Choices
  await prisma.studentMenuChoice.createMany({
    data: [
      // Budi (punya alergi) - pilih menu sehat
      {
        studentId: student1.id,
        weekStart: currentWeekStart,
        day: 'Senin',
        choice: 'sehat',
        isAutoAssigned: false,
      },
      {
        studentId: student1.id,
        weekStart: currentWeekStart,
        day: 'Selasa',
        choice: 'sehat',
        isAutoAssigned: false,
      },

      // Siti (tidak ada alergi) - pilih menu harian
      {
        studentId: student2.id,
        weekStart: currentWeekStart,
        day: 'Senin',
        choice: 'harian',
        isAutoAssigned: false,
      },
      {
        studentId: student2.id,
        weekStart: currentWeekStart,
        day: 'Selasa',
        choice: 'harian',
        isAutoAssigned: false,
      },
      {
        studentId: student2.id,
        weekStart: currentWeekStart,
        day: 'Rabu',
        choice: 'harian',
        isAutoAssigned: false,
      },

      // Andi (alergi susu) - auto assigned menu sehat
      {
        studentId: student3.id,
        weekStart: currentWeekStart,
        day: 'Senin',
        choice: 'sehat',
        isAutoAssigned: true,
      },
    ],
  });

  console.log('✅ Created student menu choices');

  // 11. Create Next Week Menu
  const nextWeekStart = new Date(currentWeekStart);
  nextWeekStart.setDate(currentWeekStart.getDate() + 7);
  nextWeekStart.setUTCHours(0, 0, 0, 0);
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekStart.getDate() + 4);
  nextWeekEnd.setUTCHours(0, 0, 0, 0);

  const nextWeekMenu = await prisma.weeklyMenu.create({
    data: {
      weekStart: nextWeekStart,
      weekEnd: nextWeekEnd,
      isActive: true,
      createdById: admin.id,
    },
  });

  // Menu items untuk minggu depan (Senin-Jumat)
  const nwSenin = await prisma.menuItem.create({
    data: {
      weekMenuId: nextWeekMenu.id,
      day: 'Senin',
      mainDish: 'Ayam Teriyaki',
      sideDish: 'Gyoza',
      vegetable: 'Edamame',
      fruit: 'Anggur',
      drink: 'Ocha',
      imageUrl: 'https://images.unsplash.com/photo-1589187151053-5ec8818e661b?auto=format&fit=crop&w=1200&q=80',
      calories: 620,
      protein: '33g',
      carbs: '72g',
      fat: '19g',
      portionCount: 150,
    },
  });
  const nwSelasa = await prisma.menuItem.create({
    data: {
      weekMenuId: nextWeekMenu.id,
      day: 'Selasa',
      mainDish: 'Spaghetti Bolognese',
      sideDish: 'Garlic Bread',
      vegetable: 'Salad Sayur',
      fruit: 'Strawberry',
      drink: 'Lemon Tea',
      imageUrl: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1200&q=80',
      calories: 680,
      protein: '30g',
      carbs: '82g',
      fat: '23g',
      portionCount: 150,
    },
  });
  const nwRabu = await prisma.menuItem.create({
    data: {
      weekMenuId: nextWeekMenu.id,
      day: 'Rabu',
      mainDish: 'Ikan Bakar Rica',
      sideDish: 'Tahu Goreng',
      vegetable: 'Tumis Buncis',
      fruit: 'Pisang',
      drink: 'Teh Tawar',
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
      calories: 640,
      protein: '32g',
      carbs: '74g',
      fat: '20g',
      portionCount: 150,
    },
  });
  const nwKamis = await prisma.menuItem.create({
    data: {
      weekMenuId: nextWeekMenu.id,
      day: 'Kamis',
      mainDish: 'Mie Ayam Bakso',
      sideDish: 'Telur Rebus',
      vegetable: 'Acar',
      fruit: 'Jeruk',
      drink: 'Air Mineral',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
      calories: 660,
      protein: '28g',
      carbs: '88g',
      fat: '18g',
      portionCount: 150,
    },
  });
  const nwJumat = await prisma.menuItem.create({
    data: {
      weekMenuId: nextWeekMenu.id,
      day: 'Jumat',
      mainDish: 'Nasi Goreng Seafood',
      sideDish: 'Perkedel Kentang',
      vegetable: 'Capcay',
      fruit: 'Semangka',
      drink: 'Jus Melon',
      imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=1200&q=80',
      calories: 700,
      protein: '31g',
      carbs: '90g',
      fat: '22g',
      portionCount: 150,
    },
  });

  const nextWeekAllergensByDay: Record<string, string[]> = {
    Senin: ['soy', 'gluten'], // teriyaki (kecap), gyoza
    Selasa: ['gluten', 'dairy'], // pasta dan garlic bread (butter/keju)
    Rabu: ['fish', 'soy'],
    Kamis: ['gluten', 'egg'],
    Jumat: ['shellfish', 'egg', 'gluten'],
  };

  await prisma.menuAllergen.createMany({
    data: [
      { menuItemId: nwSenin.id, allergen: 'soy' },
      { menuItemId: nwSenin.id, allergen: 'gluten' },
      { menuItemId: nwSelasa.id, allergen: 'gluten' },
      { menuItemId: nwSelasa.id, allergen: 'dairy' },
      { menuItemId: nwRabu.id, allergen: 'fish' },
      { menuItemId: nwRabu.id, allergen: 'soy' },
      { menuItemId: nwKamis.id, allergen: 'gluten' },
      { menuItemId: nwKamis.id, allergen: 'egg' },
      { menuItemId: nwJumat.id, allergen: 'shellfish' },
      { menuItemId: nwJumat.id, allergen: 'egg' },
      { menuItemId: nwJumat.id, allergen: 'gluten' },
    ],
  });

  // Student choices for next week (auto after 17:00 Jumat)
  const allStudents = await prisma.user.findMany({ where: { role: 'student' } });
  const studentAllergenMap = new Map<string, Set<string>>();
  allergenAssignments.forEach((a) => {
    const set = studentAllergenMap.get(a.userId) || new Set<string>();
    set.add(a.allergen);
    studentAllergenMap.set(a.userId, set);
  });

  const daysNext = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
  const autoChoicesNext: any[] = [];
  for (const stu of allStudents) {
    const stuAller = studentAllergenMap.get(stu.id) || new Set<string>();
    for (const d of daysNext) {
      const menuAllers = nextWeekAllergensByDay[d] || [];
      const hasConflict = menuAllers.some((alg) => stuAller.has(alg));
      autoChoicesNext.push({
        studentId: stu.id,
        weekStart: nextWeekStart,
        day: d,
        choice: hasConflict ? 'sehat' : 'harian',
        isAutoAssigned: true,
      });
    }
  }
  await prisma.studentMenuChoice.createMany({ data: autoChoicesNext });

  // Recap for kitchen (next week)
  console.log('📊 Recap next week (auto after Jumat 17:00):');
  const recap = daysNext.map((d) => ({ day: d, harian: 0, sehat: 0 }));
  autoChoicesNext.forEach((c) => {
    const r = recap.find((r) => r.day === c.day);
    if (r) {
      if (c.choice === 'harian') r.harian += 1;
      else r.sehat += 1;
    }
  });
  recap.forEach((r) => {
    console.log(`   ${r.day}: harian=${r.harian}, sehat=${r.sehat}`);
  });

  console.log('✅ Created next week menu and auto choices');

  // 12. Create Last Week Menu (so kitchen has past shopping list)
  const lastWeekStart = new Date(currentWeekStart);
  lastWeekStart.setDate(currentWeekStart.getDate() - 7);
  lastWeekStart.setUTCHours(0, 0, 0, 0);
  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setDate(lastWeekStart.getDate() + 4);
  lastWeekEnd.setUTCHours(0, 0, 0, 0);

  const lastWeekMenu = await prisma.weeklyMenu.create({
    data: {
      weekStart: lastWeekStart,
      weekEnd: lastWeekEnd,
      isActive: false,
      createdById: admin.id,
    },
  });

  // Menu items for last week (Mon-Fri)
  const lwSenin = await prisma.menuItem.create({
    data: {
      weekMenuId: lastWeekMenu.id,
      day: 'Senin',
      mainDish: 'Ayam Broiler Panggang',
      sideDish: 'Tempe Orek',
      vegetable: 'Tumis Bayam',
      fruit: 'Pisang',
      drink: 'Air Mineral',
      imageUrl: 'https://images.unsplash.com/photo-1604908177923-8df8c0e4382c?auto=format&fit=crop&w=1200&q=80',
      calories: 660,
      protein: '36g',
      carbs: '74g',
      fat: '21g',
      portionCount: 200,
    },
  });
  const lwSelasa = await prisma.menuItem.create({
    data: {
      weekMenuId: lastWeekMenu.id,
      day: 'Selasa',
      mainDish: 'Semur Daging Sapi',
      sideDish: 'Perkedel Kentang',
      vegetable: 'Capcay',
      fruit: 'Jeruk',
      drink: 'Teh Tawar',
      imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80',
      calories: 700,
      protein: '38g',
      carbs: '78g',
      fat: '23g',
      portionCount: 180,
    },
  });
  const lwRabu = await prisma.menuItem.create({
    data: {
      weekMenuId: lastWeekMenu.id,
      day: 'Rabu',
      mainDish: 'Ikan Nila Bakar',
      sideDish: 'Tahu Goreng Kecap',
      vegetable: 'Tumis Kangkung',
      fruit: 'Apel',
      drink: 'Air Mineral',
      imageUrl: 'https://images.unsplash.com/photo-1601312377638-2c7c7832f8b0?auto=format&fit=crop&w=1200&q=80',
      calories: 600,
      protein: '30g',
      carbs: '70g',
      fat: '18g',
      portionCount: 170,
    },
  });
  const lwKamis = await prisma.menuItem.create({
    data: {
      weekMenuId: lastWeekMenu.id,
      day: 'Kamis',
      mainDish: 'Mie Goreng Ayam',
      sideDish: 'Telur Dadar',
      vegetable: 'Acar',
      fruit: 'Semangka',
      drink: 'Es Teh',
      imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80',
      calories: 650,
      protein: '28g',
      carbs: '85g',
      fat: '20g',
      portionCount: 190,
    },
  });
  const lwJumat = await prisma.menuItem.create({
    data: {
      weekMenuId: lastWeekMenu.id,
      day: 'Jumat',
      mainDish: 'Nasi Goreng Spesial',
      sideDish: 'Bakwan Jagung',
      vegetable: 'Tumis Buncis',
      fruit: 'Melon',
      drink: 'Jus Alpukat',
      imageUrl: 'https://images.unsplash.com/photo-1585036156171-3841643d0afc?auto=format&fit=crop&w=1200&q=80',
      calories: 720,
      protein: '32g',
      carbs: '90g',
      fat: '26g',
      portionCount: 200,
    },
  });

  // Ingredients for last week menu items
  await prisma.menuIngredient.createMany({
    data: [
      // Senin
      { menuItemId: lwSenin.id, ingredient: 'Ayam Broiler', quantity: '220', unit: 'gram' },
      { menuItemId: lwSenin.id, ingredient: 'Kecap Manis', quantity: '2', unit: 'sdm' },
      { menuItemId: lwSenin.id, ingredient: 'Bawang Putih', quantity: '4', unit: 'siung' },
      { menuItemId: lwSenin.id, ingredient: 'Tempe', quantity: '120', unit: 'gram' },
      { menuItemId: lwSenin.id, ingredient: 'Bayam', quantity: '150', unit: 'gram' },

      // Selasa
      { menuItemId: lwSelasa.id, ingredient: 'Daging Sapi', quantity: '250', unit: 'gram' },
      { menuItemId: lwSelasa.id, ingredient: 'Kentang', quantity: '150', unit: 'gram' },
      { menuItemId: lwSelasa.id, ingredient: 'Bawang Merah', quantity: '5', unit: 'siung' },
      { menuItemId: lwSelasa.id, ingredient: 'Tomat', quantity: '2', unit: 'buah' },

      // Rabu
      { menuItemId: lwRabu.id, ingredient: 'Ikan Nila', quantity: '220', unit: 'gram' },
      { menuItemId: lwRabu.id, ingredient: 'Kecap Manis', quantity: '2', unit: 'sdm' },
      { menuItemId: lwRabu.id, ingredient: 'Tahu', quantity: '100', unit: 'gram' },
      { menuItemId: lwRabu.id, ingredient: 'Kangkung', quantity: '150', unit: 'gram' },

      // Kamis
      { menuItemId: lwKamis.id, ingredient: 'Mie', quantity: '200', unit: 'gram' },
      { menuItemId: lwKamis.id, ingredient: 'Ayam', quantity: '150', unit: 'gram' },
      { menuItemId: lwKamis.id, ingredient: 'Telur', quantity: '2', unit: 'butir' },
      { menuItemId: lwKamis.id, ingredient: 'Wortel', quantity: '100', unit: 'gram' },

      // Jumat
      { menuItemId: lwJumat.id, ingredient: 'Nasi Putih', quantity: '300', unit: 'gram' },
      { menuItemId: lwJumat.id, ingredient: 'Ayam Fillet', quantity: '150', unit: 'gram' },
      { menuItemId: lwJumat.id, ingredient: 'Bakso', quantity: '4', unit: 'butir' },
      { menuItemId: lwJumat.id, ingredient: 'Buncis', quantity: '150', unit: 'gram' },
    ],
  });

  console.log('✅ Created last week menu and ingredients');

  // Create student choices for last week (all students, Mon-Fri)
  const daysLW = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
  const lwChoices: any[] = [];
  for (const stu of allStudents) {
    for (const d of daysLW) {
      lwChoices.push({
        studentId: stu.id,
        weekStart: lastWeekStart,
        day: d,
        choice: 'harian',
        isAutoAssigned: false,
      });
    }
  }
  await prisma.studentMenuChoice.createMany({ data: lwChoices });
  console.log(`✅ Created last week choices for ${allStudents.length} students`);

  // Aggregated kitchen shopping list for last week
  const lastWeekItems = await prisma.menuItem.findMany({ where: { weekMenuId: lastWeekMenu.id } });
  const lastWeekIngredientRows = await prisma.menuIngredient.findMany({
    where: { menuItemId: { in: lastWeekItems.map((mi) => mi.id) } },
  });
  const totals = new Map<string, { unit: string; total: number }>();
  for (const row of lastWeekIngredientRows) {
    const ing = row.ingredient ?? 'Unknown';
    const unit = row.unit ?? 'unit';
    const key = `${ing}__${unit}`;
    const qty = parseFloat(row.quantity ?? '0');
    const prev = totals.get(key);
    if (prev) {
      prev.total += isNaN(qty) ? 0 : qty;
    } else {
      totals.set(key, { unit, total: isNaN(qty) ? 0 : qty });
    }
  }
  const totalPortions = lastWeekItems.reduce((acc, it) => acc + (it.portionCount || 0), 0);
  console.log('📦 Kitchen shopping list (last week):');
  for (const [key, val] of totals.entries()) {
    const [ing, unit] = key.split('__');
    console.log(`   - ${ing}: ${val.total} ${unit}`);
  }
  console.log(`🍽️ Total portions to prepare (last week): ${totalPortions}`);

  // 4. Seed Knowledge Base - Allergens
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
      create: { name: 'tree_nut', description: 'Kacang pohon' },
    }),
  ]);

  console.log('✅ Created allergens');

  // 5. Seed Knowledge Base - Ingredients (EXPANDED)
  const ingredients = await Promise.all([
    // Protein
    prisma.ingredient.upsert({
      where: { name: 'ayam' },
      update: {},
      create: {
        name: 'ayam',
        category: 'protein',
        synonyms: 'ayam kampung,dada ayam,ayam fillet,ayam broiler',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'daging sapi' },
      update: {},
      create: {
        name: 'daging sapi',
        category: 'protein',
        synonyms: 'sapi,daging,beef',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'telur' },
      update: {},
      create: {
        name: 'telur',
        category: 'protein',
        synonyms: 'telur ayam,egg',
      },
    }),
    
    // Seafood
    prisma.ingredient.upsert({
      where: { name: 'ikan nila' },
      update: {},
      create: {
        name: 'ikan nila',
        category: 'seafood',
        synonyms: 'ikan,nila,tilapia',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'ikan tongkol' },
      update: {},
      create: {
        name: 'ikan tongkol',
        category: 'seafood',
        synonyms: 'tongkol,mackerel',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'ikan bandeng' },
      update: {},
      create: {
        name: 'ikan bandeng',
        category: 'seafood',
        synonyms: 'bandeng,milkfish',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'udang' },
      update: {},
      create: {
        name: 'udang',
        category: 'seafood',
        synonyms: 'udang putih,udang jawa,shrimp',
      },
    }),
    
    // Soy Products
    prisma.ingredient.upsert({
      where: { name: 'tempe' },
      update: {},
      create: {
        name: 'tempe',
        category: 'soy',
        synonyms: 'tempe kedelai,tempeh',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'tahu' },
      update: {},
      create: {
        name: 'tahu',
        category: 'soy',
        synonyms: 'tahu putih,tahu kuning,tofu',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'edamame' },
      update: {},
      create: {
        name: 'edamame',
        category: 'soy',
        synonyms: 'kedelai muda,edamame beans',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'kecap' },
      update: {},
      create: {
        name: 'kecap',
        category: 'soy',
        synonyms: 'kecap manis,kecap asin,soy sauce',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'kecap asin' },
      update: {},
      create: {
        name: 'kecap asin',
        category: 'soy',
        synonyms: 'kecap,soy sauce',
      },
    }),
    
    // Carb
    prisma.ingredient.upsert({
      where: { name: 'nasi putih' },
      update: {},
      create: {
        name: 'nasi putih',
        category: 'carb',
        synonyms: 'nasi,beras,white rice',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'nasi goreng' },
      update: {},
      create: {
        name: 'nasi goreng',
        category: 'carb',
        synonyms: 'nasgor,fried rice',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'kentang' },
      update: {},
      create: {
        name: 'kentang',
        category: 'carb',
        synonyms: 'potato,kentang goreng',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'ubi' },
      update: {},
      create: {
        name: 'ubi',
        category: 'carb',
        synonyms: 'ubi jalar,sweet potato',
      },
    }),
    
    // Gluten Products
    prisma.ingredient.upsert({
      where: { name: 'roti' },
      update: {},
      create: {
        name: 'roti',
        category: 'gluten',
        synonyms: 'roti tawar,roti gandum,bread',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'spaghetti' },
      update: {},
      create: {
        name: 'spaghetti',
        category: 'gluten',
        synonyms: 'pasta,spaghetti',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'mie' },
      update: {},
      create: {
        name: 'mie',
        category: 'gluten',
        synonyms: 'mi,mie instan,noodles',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'tepung terigu' },
      update: {},
      create: {
        name: 'tepung terigu',
        category: 'gluten',
        synonyms: 'terigu,wheat flour',
      },
    }),
    
    // Vegetables
    prisma.ingredient.upsert({
      where: { name: 'kangkung' },
      update: {},
      create: {
        name: 'kangkung',
        category: 'vegetable',
        synonyms: 'kangkung air,water spinach',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'buncis' },
      update: {},
      create: {
        name: 'buncis',
        category: 'vegetable',
        synonyms: 'green beans',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'wortel' },
      update: {},
      create: {
        name: 'wortel',
        category: 'vegetable',
        synonyms: 'carrot',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'kubis' },
      update: {},
      create: {
        name: 'kubis',
        category: 'vegetable',
        synonyms: 'kol,cabbage',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'bayam' },
      update: {},
      create: {
        name: 'bayam',
        category: 'vegetable',
        synonyms: 'bayam hijau,spinach',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'brokoli' },
      update: {},
      create: {
        name: 'brokoli',
        category: 'vegetable',
        synonyms: 'broccoli',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'tomat' },
      update: {},
      create: {
        name: 'tomat',
        category: 'vegetable',
        synonyms: 'tomato',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'timun' },
      update: {},
      create: {
        name: 'timun',
        category: 'vegetable',
        synonyms: 'ketimun,cucumber',
      },
    }),
    
    // Fruits
    prisma.ingredient.upsert({
      where: { name: 'pisang' },
      update: {},
      create: {
        name: 'pisang',
        category: 'fruit',
        synonyms: 'banana',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'jeruk' },
      update: {},
      create: {
        name: 'jeruk',
        category: 'fruit',
        synonyms: 'orange',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'apel' },
      update: {},
      create: {
        name: 'apel',
        category: 'fruit',
        synonyms: 'apple',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'semangka' },
      update: {},
      create: {
        name: 'semangka',
        category: 'fruit',
        synonyms: 'watermelon',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'melon' },
      update: {},
      create: {
        name: 'melon',
        category: 'fruit',
        synonyms: 'honeydew',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'anggur' },
      update: {},
      create: {
        name: 'anggur',
        category: 'fruit',
        synonyms: 'grape',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'pepaya' },
      update: {},
      create: {
        name: 'pepaya',
        category: 'fruit',
        synonyms: 'papaya',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'pir' },
      update: {},
      create: {
        name: 'pir',
        category: 'fruit',
        synonyms: 'pear',
      },
    }),
    
    // Dairy
    prisma.ingredient.upsert({
      where: { name: 'susu' },
      update: {},
      create: {
        name: 'susu',
        category: 'dairy',
        synonyms: 'susu sapi,milk',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'keju' },
      update: {},
      create: {
        name: 'keju',
        category: 'dairy',
        synonyms: 'cheese',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'yogurt' },
      update: {},
      create: {
        name: 'yogurt',
        category: 'dairy',
        synonyms: 'yoghurt',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'mentega' },
      update: {},
      create: {
        name: 'mentega',
        category: 'dairy',
        synonyms: 'butter',
      },
    }),
    
    // Misc
    prisma.ingredient.upsert({
      where: { name: 'santan' },
      update: {},
      create: {
        name: 'santan',
        category: 'misc',
        synonyms: 'santan kelapa,coconut milk',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'bawang merah' },
      update: {},
      create: {
        name: 'bawang merah',
        category: 'misc',
        synonyms: 'shallot',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'bawang putih' },
      update: {},
      create: {
        name: 'bawang putih',
        category: 'misc',
        synonyms: 'garlic',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'cabai' },
      update: {},
      create: {
        name: 'cabai',
        category: 'misc',
        synonyms: 'cabai merah,cabe,chili',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'gula' },
      update: {},
      create: {
        name: 'gula',
        category: 'misc',
        synonyms: 'gula pasir,sugar',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'garam' },
      update: {},
      create: {
        name: 'garam',
        category: 'misc',
        synonyms: 'salt',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'madu' },
      update: {},
      create: {
        name: 'madu',
        category: 'misc',
        synonyms: 'honey',
      },
    }),
    prisma.ingredient.upsert({
      where: { name: 'kunyit' },
      update: {},
      create: {
        name: 'kunyit',
        category: 'misc',
        synonyms: 'turmeric',
      },
    }),
  ]);

  console.log('✅ Created ingredients');

  // 6. Create Ingredient-Allergen Mappings
  const ingredientMap: Record<string, string> = Object.fromEntries(
    ingredients.map((ing: any) => [ing.name, ing.id])
  );
  const allergenMap: Record<string, string> = Object.fromEntries(
    allergens.map((alg: any) => [alg.name, alg.id])
  );

  const mappings = [
    // Soy allergens
    { ingredient: 'tempe', allergen: 'soy' },
    { ingredient: 'tahu', allergen: 'soy' },
    { ingredient: 'edamame', allergen: 'soy' },
    { ingredient: 'kecap', allergen: 'soy' },
    { ingredient: 'kecap asin', allergen: 'soy' },
    // Egg allergen
    { ingredient: 'telur', allergen: 'egg' },
    // Dairy allergens
    { ingredient: 'susu', allergen: 'dairy' },
    { ingredient: 'keju', allergen: 'dairy' },
    { ingredient: 'yogurt', allergen: 'dairy' },
    { ingredient: 'mentega', allergen: 'dairy' },
    // Fish allergens
    { ingredient: 'ikan nila', allergen: 'fish' },
    { ingredient: 'ikan tongkol', allergen: 'fish' },
    { ingredient: 'ikan bandeng', allergen: 'fish' },
    // Shellfish allergen
    { ingredient: 'udang', allergen: 'shellfish' },
    // Gluten allergens
    { ingredient: 'roti', allergen: 'gluten' },
    { ingredient: 'spaghetti', allergen: 'gluten' },
    { ingredient: 'mie', allergen: 'gluten' },
    { ingredient: 'tepung terigu', allergen: 'gluten' },
  ];

  for (const mapping of mappings) {
    await prisma.ingredientAllergen.upsert({
      where: {
        ingredientId_allergenId: {
          ingredientId: ingredientMap[mapping.ingredient],
          allergenId: allergenMap[mapping.allergen],
        },
      },
      update: {},
      create: {
        ingredientId: ingredientMap[mapping.ingredient],
        allergenId: allergenMap[mapping.allergen],
      },
    });
  }

  console.log('✅ Created ingredient-allergen mappings');

  // 7. Create Menu Cases for Case-Based Reasoning (EXPANDED WITH FULL COMPOSITIONS)
  await Promise.all([
    // === AYAM (3 menus) ===
    prisma.menuCase.upsert({
      where: { id: 'case-ayam-bakar' },
      update: {},
      create: {
        id: 'case-ayam-bakar',
        baseIngredientId: ingredientMap['ayam'],
        menuName: 'Ayam Bakar Madu',
        description:
          'Komposisi: ayam potong, madu, kecap manis, bawang putih, bawang merah, cabai merah, garam, minyak. ' +
          'Pelengkap: nasi putih, lalapan, pisang.',
        calories: 650,
        protein: '35g',
        carbs: '75g',
        fat: '20g',
      },
    }),
    prisma.menuCase.upsert({
      where: { id: 'case-ayam-goreng' },
      update: {},
      create: {
        id: 'case-ayam-goreng',
        baseIngredientId: ingredientMap['ayam'],
        menuName: 'Ayam Goreng Krispy',
        description:
          'Komposisi: ayam fillet, tepung terigu, telur, bawang putih, lada, garam, minyak goreng. ' +
          'Pelengkap: nasi putih, saus sambal, jeruk.',
        calories: 700,
        protein: '40g',
        carbs: '60g',
        fat: '28g',
      },
    }),
    prisma.menuCase.upsert({
      where: { id: 'case-soto-ayam' },
      update: {},
      create: {
        id: 'case-soto-ayam',
        baseIngredientId: ingredientMap['ayam'],
        menuName: 'Soto Ayam',
        description:
          'Komposisi: ayam suwir, bawang putih, bawang merah, kunyit, jahe, serai, daun jeruk, santan. ' +
          'Pelengkap: nasi putih, mie, daun bawang, bawang goreng, apel.',
        calories: 580,
        protein: '28g',
        carbs: '68g',
        fat: '16g',
      },
    }),

    // === AYAM BROILER (1 menu) ===
    prisma.menuCase.upsert({
      where: { id: 'case-ayam-broiler' },
      update: {},
      create: {
        id: 'case-ayam-broiler',
        baseIngredientId: ingredientMap['ayam'],
        menuName: 'Ayam Broiler Panggang',
        description:
          'Komposisi: ayam broiler, bawang putih, bawang merah, lada, garam, kecap manis, minyak. ' +
          'Pelengkap: nasi putih, tumis buncis, jeruk.',
        calories: 660,
        protein: '36g',
        carbs: '74g',
        fat: '21g',
      },
    }),
    
    // === DAGING SAPI (3 menus) ===
    prisma.menuCase.upsert({
      where: { id: 'case-rendang' },
      update: {},
      create: {
        id: 'case-rendang',
        baseIngredientId: ingredientMap['daging sapi'],
        menuName: 'Rendang Sapi',
        description: 'Rendang daging sapi dengan santan, cabai merah, bawang merah, bawang putih, kunyit, nasi putih, dan semangka',
        calories: 720,
        protein: '40g',
        carbs: '80g',
        fat: '25g',
      },
    }),
    prisma.menuCase.upsert({
      where: { id: 'case-semur-daging' },
      update: {},
      create: {
        id: 'case-semur-daging',
        baseIngredientId: ingredientMap['daging sapi'],
        menuName: 'Semur Daging Sapi',
        description: 'Semur daging sapi dengan kecap manis, kentang, bawang merah, bawang putih, tomat, nasi putih, dan anggur',
        calories: 680,
        protein: '38g',
        carbs: '75g',
        fat: '22g',
      },
    }),
    prisma.menuCase.upsert({
      where: { id: 'case-sapi-lada-hitam' },
      update: {},
      create: {
        id: 'case-sapi-lada-hitam',
        baseIngredientId: ingredientMap['daging sapi'],
        menuName: 'Daging Sapi Lada Hitam',
        description: 'Daging sapi tumis lada hitam dengan bawang merah, cabai, kecap asin, nasi putih, dan pir',
        calories: 690,
        protein: '39g',
        carbs: '72g',
        fat: '23g',
      },
    }),
    
    // === TELUR (3 menus) ===
    prisma.menuCase.upsert({
      where: { id: 'case-telur-dadar' },
      update: {},
      create: {
        id: 'case-telur-dadar',
        baseIngredientId: ingredientMap['telur'],
        menuName: 'Telur Dadar Padang',
        description: 'Telur dadar dengan cabai merah, bawang merah, tomat, nasi putih, dan pisang',
        calories: 480,
        protein: '22g',
        carbs: '58g',
        fat: '18g',
      },
    }),
    prisma.menuCase.upsert({
      where: { id: 'case-telur-balado' },
      update: {},
      create: {
        id: 'case-telur-balado',
        baseIngredientId: ingredientMap['telur'],
        menuName: 'Telur Balado',
        description: 'Telur rebus dengan sambal balado dari cabai merah, tomat, bawang merah, bawang putih, nasi putih, dan apel',
        calories: 500,
        protein: '24g',
        carbs: '60g',
        fat: '20g',
      },
    }),
    prisma.menuCase.upsert({
      where: { id: 'case-telur-ceplok-kecap' },
      update: {},
      create: {
        id: 'case-telur-ceplok-kecap',
        baseIngredientId: ingredientMap['telur'],
        menuName: 'Telur Ceplok Kecap',
        description: 'Telur ceplok dengan kecap manis, cabai, bawang putih, nasi putih, dan jeruk',
        calories: 470,
        protein: '20g',
        carbs: '62g',
        fat: '17g',
      },
    }),
    
    // === TEMPE (3 menus) ===
    prisma.menuCase.upsert({
      where: { id: 'case-tempe-goreng' },
      update: {},
      create: {
        id: 'case-tempe-goreng',
        baseIngredientId: ingredientMap['tempe'],
        menuName: 'Tempe Goreng Sambal',
        description: 'Tempe goreng dengan sambal dari cabai, tomat, bawang merah, nasi putih, dan semangka',
        calories: 420,
        protein: '18g',
        carbs: '55g',
        fat: '14g',
      },
    }),
    prisma.menuCase.upsert({
      where: { id: 'case-tempe-bacem' },
      update: {},
      create: {
        id: 'case-tempe-bacem',
        baseIngredientId: ingredientMap['tempe'],
        menuName: 'Tempe Bacem',
        description: 'Tempe bacem manis dengan kecap manis, gula, bawang putih, nasi putih, dan pepaya',
        calories: 450,
        protein: '20g',
        carbs: '62g',
        fat: '15g',
      },
    }),
    prisma.menuCase.upsert({
      where: { id: 'case-tempe-orek' },
      update: {},
      create: {
        id: 'case-tempe-orek',
        baseIngredientId: ingredientMap['tempe'],
        menuName: 'Tempe Orek',
        description: 'Tempe orek dengan kecap manis, cabai, kentang, nasi putih, dan melon',
        calories: 480,
        protein: '22g',
        carbs: '65g',
        fat: '16g',
      },
    }),
    
    // === TAHU (3 menus) ===
    prisma.menuCase.upsert({
      where: { id: 'case-tahu-goreng-kecap' },
      update: {},
      create: {
        id: 'case-tahu-goreng-kecap',
        baseIngredientId: ingredientMap['tahu'],
        menuName: 'Tahu Goreng Kecap',
        description: 'Tahu goreng dengan saus kecap manis, cabai, bawang putih, nasi putih, dan pisang',
        calories: 400,
        protein: '16g',
        carbs: '58g',
        fat: '12g',
      },
    }),
    prisma.menuCase.upsert({
      where: { id: 'case-tahu-gejrot' },
      update: {},
      create: {
        id: 'case-tahu-gejrot',
        baseIngredientId: ingredientMap['tahu'],
        menuName: 'Tahu Gejrot',
        description: 'Tahu gejrot dengan gula merah, cabai, bawang merah, timun, nasi putih, dan jeruk',
        calories: 380,
        protein: '14g',
        carbs: '60g',
        fat: '10g',
      },
    }),
    prisma.menuCase.upsert({
      where: { id: 'case-tahu-bacem' },
      update: {},
      create: {
        id: 'case-tahu-bacem',
        baseIngredientId: ingredientMap['tahu'],
        menuName: 'Tahu Bacem',
        description: 'Tahu bacem manis dengan kecap manis, bawang putih, kunyit, santan, nasi putih, dan apel',
        calories: 430,
        protein: '18g',
        carbs: '62g',
        fat: '13g',
      },
    }),
    
    // === IKAN NILA (3 menus) ===
    prisma.menuCase.upsert({
      where: { id: 'case-ikan-goreng' },
      update: {},
      create: {
        id: 'case-ikan-goreng',
        baseIngredientId: ingredientMap['ikan nila'],
        menuName: 'Ikan Nila Goreng Kecap',
        description: 'Ikan nila goreng dengan saus kecap manis, cabai, bawang putih, nasi putih, dan semangka',
        calories: 600,
        protein: '30g',
        carbs: '70g',
        fat: '18g',
      },
    }),
    prisma.menuCase.upsert({
      where: { id: 'case-ikan-nila-bakar' },
      update: {},
      create: {
        id: 'case-ikan-nila-bakar',
        baseIngredientId: ingredientMap['ikan nila'],
        menuName: 'Ikan Nila Bakar',
        description: 'Ikan nila bakar dengan kecap manis, cabai, bawang putih, tomat, nasi putih, dan pepaya',
        calories: 580,
        protein: '32g',
        carbs: '68g',
        fat: '16g',
      },
    }),
    prisma.menuCase.upsert({
      where: { id: 'case-ikan-nila-sambal-matah' },
      update: {},
      create: {
        id: 'case-ikan-nila-sambal-matah',
        baseIngredientId: ingredientMap['ikan nila'],
        menuName: 'Ikan Nila Sambal Matah',
        description: 'Ikan nila goreng dengan sambal matah dari cabai, bawang merah, tomat, nasi putih, dan melon',
        calories: 590,
        protein: '31g',
        carbs: '69g',
        fat: '17g',
      },
    }),
    
    // === IKAN TONGKOL (3 menus) ===
    prisma.menuCase.upsert({
      where: { id: 'case-tongkol-balado' },
      update: {},
      create: {
        id: 'case-tongkol-balado',
        baseIngredientId: ingredientMap['ikan tongkol'],
        menuName: 'Tongkol Balado',
        description: 'Ikan tongkol dengan sambal balado dari cabai merah, tomat, bawang merah, nasi putih, dan pisang',
        calories: 620,
        protein: '32g',
        carbs: '65g',
        fat: '22g',
      },
    }),
    prisma.menuCase.upsert({
      where: { id: 'case-tongkol-rica' },
      update: {},
      create: {
        id: 'case-tongkol-rica',
        baseIngredientId: ingredientMap['ikan tongkol'],
        menuName: 'Tongkol Rica-Rica',
        description: 'Ikan tongkol rica-rica dengan cabai merah, tomat, bawang merah, bawang putih, nasi putih, dan jeruk',
        calories: 610,
        protein: '33g',
        carbs: '64g',
        fat: '21g',
      },
    }),
    prisma.menuCase.upsert({
      where: { id: 'case-tongkol-bumbu-kuning' },
      update: {},
      create: {
        id: 'case-tongkol-bumbu-kuning',
        baseIngredientId: ingredientMap['ikan tongkol'],
        menuName: 'Tongkol Bumbu Kuning',
        description: 'Ikan tongkol dengan bumbu kuning dari kunyit, santan, cabai, bawang putih, nasi putih, dan apel',
        calories: 630,
        protein: '34g',
        carbs: '66g',
        fat: '23g',
      },
    }),
    
    // === IKAN BANDENG (3 menus) ===
    prisma.menuCase.upsert({
      where: { id: 'case-bandeng-presto' },
      update: {},
      create: {
        id: 'case-bandeng-presto',
        baseIngredientId: ingredientMap['ikan bandeng'],
        menuName: 'Bandeng Presto',
        description: 'Bandeng presto bumbu kuning dengan kunyit, bawang putih, cabai, nasi putih, dan semangka',
        calories: 640,
        protein: '35g',
        carbs: '67g',
        fat: '20g',
      },
    }),
    prisma.menuCase.upsert({
      where: { id: 'case-bandeng-goreng-kecap' },
      update: {},
      create: {
        id: 'case-bandeng-goreng-kecap',
        baseIngredientId: ingredientMap['ikan bandeng'],
        menuName: 'Bandeng Goreng Kecap',
        description: 'Bandeng goreng dengan kecap manis, cabai, bawang merah, nasi putih, dan anggur',
        calories: 620,
        protein: '33g',
        carbs: '68g',
        fat: '19g',
      },
    }),
    prisma.menuCase.upsert({
      where: { id: 'case-bandeng-bumbu-kuning' },
      update: {},
      create: {
        id: 'case-bandeng-bumbu-kuning',
        baseIngredientId: ingredientMap['ikan bandeng'],
        menuName: 'Bandeng Bumbu Kuning',
        description: 'Bandeng bumbu kuning dengan kunyit, santan, cabai, bawang putih, nasi putih, dan pir',
        calories: 650,
        protein: '36g',
        carbs: '69g',
        fat: '21g',
      },
    }),
    
    // === KENTANG (3 menus) ===
    prisma.menuCase.upsert({
      where: { id: 'case-perkedel-kentang' },
      update: {},
      create: {
        id: 'case-perkedel-kentang',
        baseIngredientId: ingredientMap['kentang'],
        menuName: 'Perkedel Kentang',
        description: 'Perkedel kentang dengan telur, bawang putih, bawang merah, nasi putih, dan pisang',
        calories: 520,
        protein: '18g',
        carbs: '72g',
        fat: '16g',
      },
    }),
    prisma.menuCase.upsert({
      where: { id: 'case-kentang-balado' },
      update: {},
      create: {
        id: 'case-kentang-balado',
        baseIngredientId: ingredientMap['kentang'],
        menuName: 'Kentang Balado',
        description: 'Kentang goreng balado dengan cabai merah, tomat, bawang merah, nasi putih, dan semangka',
        calories: 480,
        protein: '12g',
        carbs: '78g',
        fat: '14g',
      },
    }),
    prisma.menuCase.upsert({
      where: { id: 'case-sambal-goreng-kentang' },
      update: {},
      create: {
        id: 'case-sambal-goreng-kentang',
        baseIngredientId: ingredientMap['kentang'],
        menuName: 'Sambal Goreng Kentang',
        description: 'Sambal goreng kentang dengan kecap manis, cabai, santan, nasi putih, dan pepaya',
        calories: 510,
        protein: '14g',
        carbs: '75g',
        fat: '17g',
      },
    }),
    
    // === NASI GORENG (3 menus) ===
    prisma.menuCase.upsert({
      where: { id: 'case-nasi-goreng-ayam' },
      update: {},
      create: {
        id: 'case-nasi-goreng-ayam',
        baseIngredientId: ingredientMap['nasi goreng'],
        menuName: 'Nasi Goreng Ayam',
        description: 'Nasi goreng dengan ayam, telur, kecap, bawang merah, bawang putih, cabai, dan jeruk',
        calories: 680,
        protein: '28g',
        carbs: '85g',
        fat: '22g',
      },
    }),
    prisma.menuCase.upsert({
      where: { id: 'case-nasi-goreng-seafood' },
      update: {},
      create: {
        id: 'case-nasi-goreng-seafood',
        baseIngredientId: ingredientMap['nasi goreng'],
        menuName: 'Nasi Goreng Seafood',
        description: 'Nasi goreng dengan udang, telur, kecap, bawang merah, bawang putih, cabai, dan apel',
        calories: 700,
        protein: '30g',
        carbs: '88g',
        fat: '24g',
      },
    }),
    prisma.menuCase.upsert({
      where: { id: 'case-nasi-goreng-kambing' },
      update: {},
      create: {
        id: 'case-nasi-goreng-kambing',
        baseIngredientId: ingredientMap['nasi goreng'],
        menuName: 'Nasi Goreng Spesial',
        description: 'Nasi goreng spesial dengan ayam, telur, bakso, kecap, bawang merah, bawang putih, cabai, dan melon',
        calories: 720,
        protein: '32g',
        carbs: '90g',
        fat: '26g',
      },
    }),
    
    // === MIE (Mie Ayam - 3 menus) ===
    prisma.menuCase.upsert({
      where: { id: 'case-mie-ayam' },
      update: {},
      create: {
        id: 'case-mie-ayam',
        baseIngredientId: ingredientMap['mie'],
        menuName: 'Mie Ayam Bakso',
        description: 'Mie ayam dengan ayam cincang, bakso, bawang merah, bawang putih, kecap asin, dan pisang',
        calories: 620,
        protein: '26g',
        carbs: '82g',
        fat: '18g',
      },
    }),
    prisma.menuCase.upsert({
      where: { id: 'case-mie-goreng' },
      update: {},
      create: {
        id: 'case-mie-goreng',
        baseIngredientId: ingredientMap['mie'],
        menuName: 'Mie Goreng Ayam',
        description: 'Mie goreng dengan ayam, telur, kubis, wortel, bawang merah, bawang putih, kecap, dan jeruk',
        calories: 650,
        protein: '28g',
        carbs: '85g',
        fat: '20g',
      },
    }),
    prisma.menuCase.upsert({
      where: { id: 'case-mie-kuah' },
      update: {},
      create: {
        id: 'case-mie-kuah',
        baseIngredientId: ingredientMap['mie'],
        menuName: 'Mie Kuah Ayam',
        description: 'Mie kuah dengan ayam, telur rebus, kangkung, bawang merah, bawang putih, dan apel',
        calories: 590,
        protein: '25g',
        carbs: '80g',
        fat: '16g',
      },
    }),
  ]);

  console.log('✅ Created menu cases');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   Users: ${await prisma.user.count()}`);
  console.log(`   Weekly Menus: ${await prisma.weeklyMenu.count()}`);
  console.log(`   Menu Items: ${await prisma.menuItem.count()}`);
  console.log(`   Good Menus: ${await prisma.goodMenu.count()}`);
  console.log(`   Student Choices: ${await prisma.studentMenuChoice.count()}`);
  console.log(`   Allergens: ${await prisma.allergen.count()}`);
  console.log(`   Ingredients: ${await prisma.ingredient.count()}`);
  console.log(`   Ingredient-Allergen Mappings: ${await prisma.ingredientAllergen.count()}`);
  console.log(`   Menu Cases: ${await prisma.menuCase.count()}`);
  console.log('');
  console.log('🔑 Login credentials:');
  console.log('   Admin: admin@nutriplan.com / password123');
  console.log('   Admin 2: admin2@nutriplan.com / password123');
  console.log('   Kitchen: dapur@nutriplan.com / password123');
  console.log('   Kitchen 2: dapur2@nutriplan.com / password123');
  console.log('   Kitchen 3: dapur3@nutriplan.com / password123');
  console.log('   Kitchen 4: dapur4@nutriplan.com / password123');
  console.log('   Students: 1125101@student.if.ac.id to 1125130@student.if.ac.id / password123');
  console.log('   (Student 1125101, 1125103 have allergies)');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

