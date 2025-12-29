// Seed demo users for testing
export function seedDemoUser() {
  const users = JSON.parse(localStorage.getItem('nutriplan_users') || '[]');
  
  // Check if demo users already exist
  const studentExists = users.some((u: any) => u.email === 'siswa@sekolah.id');
  const adminExists = users.some((u: any) => u.email === 'admin@sekolah.id');
  const kitchenExists = users.some((u: any) => u.email === 'dapur@sekolah.id');
  
  if (!studentExists) {
    const demoStudent = {
      id: 'demo-1',
      email: 'siswa@sekolah.id',
      password: 'password123',
      name: 'Budi Santoso',
      role: 'student',
      allergens: ['Kacang', 'Susu'],
      nis: '1234567890', // NIS demo untuk siswa
      class: '7A',
      customAllergies: 'MSG',
      bio: 'Siswa aktif kelas 7A yang suka olahraga basket'
    };
    users.push(demoStudent);
    console.log('Demo student seeded successfully');
  }
  
  if (!adminExists) {
    const demoAdmin = {
      id: 'admin-1',
      email: 'admin@sekolah.id',
      password: 'admin123',
      name: 'Admin Sekolah',
      role: 'admin',
      allergens: [],
      bio: 'Administrator sistem NutriPlan'
    };
    users.push(demoAdmin);
    console.log('Demo admin seeded successfully');
  }
  
  if (!kitchenExists) {
    const demoKitchen = {
      id: 'kitchen-1',
      email: 'dapur@sekolah.id',
      password: 'dapur123',
      name: 'Petugas Dapur',
      role: 'kitchen_staff',
      allergens: [],
      bio: 'Petugas dapur bertanggung jawab untuk persiapan menu'
    };
    users.push(demoKitchen);
    console.log('Demo kitchen staff seeded successfully');
  }
  
  if (!studentExists || !adminExists || !kitchenExists) {
    localStorage.setItem('nutriplan_users', JSON.stringify(users));
  }
}