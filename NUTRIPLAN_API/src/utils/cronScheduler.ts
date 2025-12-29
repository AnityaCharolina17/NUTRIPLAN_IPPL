import cron from 'node-cron';
import prisma from '../utils/prismaClient';

/**
 * Auto assign menu sehat untuk siswa yang punya alergi
 * dan belum memilih menu. Dijalankan setiap Jumat jam 17.00
 */
export function setupMenuAutoAssignment() {
  // Jalankan setiap Jumat jam 17.00
  // Format: menit jam hari-dalam-bulan bulan hari-dalam-minggu
  // 0 17 * * 5 = jam 17:00 di hari Jumat
  cron.schedule('0 17 * * 5', async () => {
    console.log('[CRON] Running auto-assignment at Friday 17:00');
    
    try {
      // Ambil menu minggu depan
      const now = new Date();
      const nextMenu = await prisma.weeklyMenu.findFirst({
        where: {
          weekStart: { gt: now },
          isActive: true,
        },
        orderBy: {
          weekStart: 'asc',
        },
      });

      if (!nextMenu) {
        console.warn('[CRON] ⚠️  WARNING: No upcoming menu found for next week!');
        console.warn('[CRON] Admin belum membuat menu untuk minggu depan.');
        console.warn('[CRON] Skipping auto-assignment. Siswa tidak bisa pilih menu.');
        return;
      }

      // Ambil semua siswa
      const students = await prisma.user.findMany({
        where: {
          role: 'student',
        },
        include: {
          allergens: true,
        },
      });

      console.log(`[CRON] Found ${students.length} students to process`);

      const days: Array<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat'> = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

      // Proses setiap siswa
      for (const student of students) {
        const hasAllergies = student.allergens.length > 0 || student.customAllergies;

        // Cek setiap hari
        for (const day of days) {
          // Cek apakah siswa sudah pilih untuk hari ini
          const existingChoice = await prisma.studentMenuChoice.findFirst({
            where: {
              studentId: student.id,
              weekStart: nextMenu.weekStart,
              day,
            },
          });

          if (!existingChoice) {
            // Belum pilih, assign otomatis
            const autoChoice = hasAllergies ? 'sehat' : 'harian';

            await prisma.studentMenuChoice.create({
              data: {
                studentId: student.id,
                weekStart: nextMenu.weekStart,
                day,
                choice: autoChoice,
                isAutoAssigned: true,
              },
            });

            console.log(`[CRON] Auto-assigned ${autoChoice} menu for student ${student.name} on ${day}`);
          }
        }
      }

      console.log('[CRON] Auto-assignment completed successfully');
    } catch (error) {
      console.error('[CRON] Error during auto-assignment:', error);
    }
  }, {
    timezone: 'Asia/Jakarta', // Sesuaikan dengan timezone Anda
  });

  console.log('[CRON] Menu auto-assignment scheduler initialized (Friday 17:00)');
}
