"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMenuAutoAssignment = setupMenuAutoAssignment;
const node_cron_1 = __importDefault(require("node-cron"));
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
/**
 * Auto assign menu sehat untuk siswa yang punya alergi
 * dan belum memilih menu. Dijalankan setiap Jumat jam 17.00
 */
function setupMenuAutoAssignment() {
    // Jalankan setiap Jumat jam 17.00
    // Format: menit jam hari-dalam-bulan bulan hari-dalam-minggu
    // 0 17 * * 5 = jam 17:00 di hari Jumat
    node_cron_1.default.schedule('0 17 * * 5', async () => {
        console.log('[CRON] Running auto-assignment at Friday 17:00');
        try {
            // Ambil menu minggu depan
            const now = new Date();
            const nextMenu = await prismaClient_1.default.weeklyMenu.findFirst({
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
            const students = await prismaClient_1.default.user.findMany({
                where: {
                    role: 'student',
                },
                include: {
                    allergens: true,
                },
            });
            console.log(`[CRON] Found ${students.length} students to process`);
            const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
            // Proses setiap siswa
            for (const student of students) {
                const hasAllergies = student.allergens.length > 0 || student.customAllergies;
                // Cek setiap hari
                for (const day of days) {
                    // Cek apakah siswa sudah pilih untuk hari ini
                    const existingChoice = await prismaClient_1.default.studentMenuChoice.findFirst({
                        where: {
                            studentId: student.id,
                            weekStart: nextMenu.weekStart,
                            day,
                        },
                    });
                    if (!existingChoice) {
                        // Belum pilih, assign otomatis
                        const autoChoice = hasAllergies ? 'sehat' : 'harian';
                        await prismaClient_1.default.studentMenuChoice.create({
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
        }
        catch (error) {
            console.error('[CRON] Error during auto-assignment:', error);
        }
    }, {
        timezone: 'Asia/Jakarta', // Sesuaikan dengan timezone Anda
    });
    console.log('[CRON] Menu auto-assignment scheduler initialized (Friday 17:00)');
}
