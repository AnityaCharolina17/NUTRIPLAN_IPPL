import { WeeklySchedule } from '../components/WeeklySchedule';
import { MenuCard } from '../components/MenuCard';
import { useMenu } from '../contexts/MenuContext';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, UtensilsCrossed, History, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export function MenuPlanningPage() {
  const { menuHistory, menuItems } = useMenu();
  const { isStudent, user } = useAuth();
  const [nextWeekMenu, setNextWeekMenu] = useState<any>(null);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, 'harian' | 'sehat'>>({});
  const [existingChoices, setExistingChoices] = useState<Record<string, 'harian' | 'sehat'>>({});
  const [isSaving, setIsSaving] = useState(false);
  
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

  // Fetch next week menu for students
  useEffect(() => {
    if (!isStudent) return;
    
    const fetchNextWeekMenu = async () => {
      try {
        const { data } = await api.get('/api/menus/next-week', { validateStatus: () => true });
        if (data?.success && data?.menu) {
          setNextWeekMenu(data.menu);
          
          // Load existing choices if any
          const choicesRes = await api.get('/api/student-choices/my-choices', { validateStatus: () => true });
          if (choicesRes.data?.success && choicesRes.data?.choices) {
            const existing: Record<string, 'harian' | 'sehat'> = {};
            choicesRes.data.choices.forEach((ch: any) => {
              if (ch.weekStart === data.menu.weekStart) {
                existing[ch.day] = ch.choice;
              }
            });
            setExistingChoices(existing);
            setSelectedChoices(existing);
          }
        }
      } catch (err) {
        console.warn('Could not fetch next week menu');
      }
    };
    fetchNextWeekMenu();
  }, [isStudent]);

  const handleChoiceChange = (day: string, choice: 'harian' | 'sehat') => {
    setSelectedChoices(prev => ({ ...prev, [day]: choice }));
  };

  const handleSaveChoices = async () => {
    if (!user?.id || !nextWeekMenu) return;
    
    setIsSaving(true);
    try {
      const choices = Object.entries(selectedChoices).map(([day, choice]) => ({
        day,
        choice,
        weekStart: nextWeekMenu.weekStart,
      }));

      await api.post('/api/student-choices/submit', { choices });
      toast.success('Pilihan menu berhasil disimpan!');
      setExistingChoices(selectedChoices);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan pilihan menu');
    } finally {
      setIsSaving(false);
    }
  };
  
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
          <TabsList className={`grid w-full max-w-${isStudent ? '3xl' : 'md'} mx-auto grid-cols-${isStudent ? '3' : '2'}`}>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Jadwal Mingguan
            </TabsTrigger>
            {isStudent && (
              <TabsTrigger value="choose" className="flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4" />
                Pilih Menu
              </TabsTrigger>
            )}
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

          {/* Student Menu Choice Tab */}
          {isStudent && (
            <TabsContent value="choose" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5" />
                    Pilih Menu Minggu Depan
                  </CardTitle>
                  <CardDescription>
                    Pilih menu yang kamu inginkan untuk minggu depan. Kamu bisa memilih Menu Harian atau Menu Sehat (khusus untuk alergi).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {nextWeekMenu && nextWeekMenu.items?.length > 0 ? (
                    <div className="space-y-6">
                      {nextWeekMenu.items.map((item: any) => (
                        <div key={item.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{item.day}</h3>
                              <p className="text-sm text-gray-600">{item.mainDish}</p>
                            </div>
                            {existingChoices[item.day] && (
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Sudah dipilih
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-3">
                            {/* Menu Harian */}
                            <button
                              onClick={() => handleChoiceChange(item.day, 'harian')}
                              className={`p-4 border-2 rounded-lg text-left transition-all ${
                                selectedChoices[item.day] === 'harian'
                                  ? 'border-green-600 bg-green-50'
                                  : 'border-gray-200 hover:border-green-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Menu Harian</span>
                                {selectedChoices[item.day] === 'harian' && (
                                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{item.mainDish}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {item.sideDish}, {item.vegetable}, {item.fruit}
                              </p>
                            </button>

                            {/* Menu Sehat */}
                            <button
                              onClick={() => handleChoiceChange(item.day, 'sehat')}
                              className={`p-4 border-2 rounded-lg text-left transition-all ${
                                selectedChoices[item.day] === 'sehat'
                                  ? 'border-blue-600 bg-blue-50'
                                  : 'border-gray-200 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Menu Sehat</span>
                                {selectedChoices[item.day] === 'sehat' && (
                                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600">Menu alternatif bebas alergen</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Khusus siswa dengan alergi makanan
                              </p>
                            </button>
                          </div>
                        </div>
                      ))}

                      <Button
                        onClick={handleSaveChoices}
                        disabled={isSaving || Object.keys(selectedChoices).length === 0}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {isSaving ? 'Menyimpan...' : 'Simpan Pilihan Menu'}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-600 mb-2">Belum ada menu untuk minggu depan</p>
                      <p className="text-sm text-gray-500">Menu akan tersedia saat admin sudah membuat jadwal</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

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