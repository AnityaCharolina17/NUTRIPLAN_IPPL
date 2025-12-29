import { WeeklySchedule } from '../components/WeeklySchedule';
import { MenuCard } from '../components/MenuCard';
import { useMenu } from '../contexts/MenuContext';
import { Calendar, UtensilsCrossed, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export function MenuPlanningPage() {
  const { menuHistory, menuItems } = useMenu();
  
  const getCurrentMonday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const currentWeekLabel = () => {
    const monday = getCurrentMonday();
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    const sameMonth = monday.getMonth() === friday.getMonth();
    const sameYear = monday.getFullYear() === friday.getFullYear();

    if (sameMonth && sameYear) {
      // Same month: "29 Des - 2 Jan 2025" -> "29-2 Desember 2025"
      const startDay = monday.getDate();
      const endDay = friday.getDate();
      const monthYear = monday.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      return `${startDay}-${endDay} ${monthYear}`;
    } else {
      // Different months: "29 Des 2025 - 2 Jan 2026"
      const startDate = monday.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      const endDate = friday.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      return `${startDate} - ${endDate}`;
    }
  };

  // Get unique served menus from history
  const servedMenuIds = [...new Set(menuHistory.map(h => h.menuId))];
  const servedMenus = menuItems.filter(menu => servedMenuIds.includes(menu.id));
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-green-600 to-emerald-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-8 w-8" />
            <h1 className="text-4xl">Jadwal Menu Mingguan</h1>
          </div>
          <p className="text-xl text-green-50 max-w-3xl">
            Lihat jadwal menu sehat untuk minggu ini dan jelajahi riwayat menu yang sudah pernah disajikan
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="schedule" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Jadwal Mingguan
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Riwayat Menu
            </TabsTrigger>
          </TabsList>

          {/* Weekly Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <div>
              <h2 className="text-2xl text-gray-900 mb-2">
                Minggu {currentWeekLabel()}
              </h2>
              <p className="text-gray-600 mb-6">
                Program Makan Bergizi Gratis (MBG) - 1 menu bergizi per hari
              </p>
              <WeeklySchedule />
            </div>
          </TabsContent>

          {/* Menu History Tab */}
          <TabsContent value="menu" className="space-y-6">
            <div>
              <h2 className="text-2xl text-gray-900 mb-2">
                Riwayat Menu
              </h2>
              <p className="text-gray-600 mb-6">
                Menu yang sudah pernah disajikan sejak awal program MBG
              </p>
              {servedMenus.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {servedMenus.map((menu) => (
                    <MenuCard key={menu.id} menu={menu} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <History className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600 mb-2">Belum ada riwayat menu</p>
                  <p className="text-sm text-gray-500">Menu yang sudah pernah disajikan akan muncul di sini</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}