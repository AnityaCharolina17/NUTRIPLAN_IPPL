import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMenu } from '../contexts/MenuContext';
import { Navigate } from 'react-router-dom';
import { ChefHat, Calendar, Users, Package, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { api } from '../lib/api';

export function KitchenDashboardPage() {
  const { isKitchenStaff } = useAuth();
  const { weeklySchedule } = useMenu();
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [weeklyRecap, setWeeklyRecap] = useState<Array<{
    day: string;
    date: string;
    mainMenu: string;
    mainMenuCount: number;
    safeMenu: string;
    safeMenuCount: number;
    total: number;
  }>>([]);
  const [topIngredients, setTopIngredients] = useState<Array<{ item: string; amount?: number; unit?: string }>>([]);

  // Redirect if not kitchen staff
  if (!isKitchenStaff) {
    return <Navigate to="/" replace />;
  }
  const weekStartDate = useMemo(() => {
    // Calculate Monday of current week (same logic as MenuContext)
    const d = new Date();
    const day = d.getDay(); // 0-6 (0=Sun)
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday of current week
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    const fetchRecap = async () => {
      try {
        const iso = weekStartDate.toISOString();
        const { data } = await api.get(`/api/kitchen/recap`, { validateStatus: () => true });
        if (!data?.success) {
          console.warn('Failed to fetch kitchen recap:', data?.message);
          return;
        }

        // Map dailyRecap to UI structure
        const recapArr: Array<{ day: string; date: string; mainMenu: string; mainMenuCount: number; safeMenu: string; safeMenuCount: number; total: number }> = [];
        const daily = data.dailyRecap || {};
        for (const day of Object.keys(daily)) {
          const item = daily[day];
          const scheduleDate = weeklySchedule.find(s => s.day === day)?.date || '';
          recapArr.push({
            day,
            date: scheduleDate,
            mainMenu: item?.menuItem?.mainDish || '-',
            mainMenuCount: item?.harianCount || 0,
            safeMenu: 'Menu Sehat',
            safeMenuCount: item?.sehatCount || 0,
            total: item?.totalCount || 0,
          });
        }
        setWeeklyRecap(recapArr);

        setTotalStudents(data.totalStudents || 0);
        const weeklyIngredients = (data.weeklyIngredients || []) as Array<{ ingredient: string; quantity?: string; unit?: string; days?: string[] }>;
        const top = weeklyIngredients
          .map(w => ({ item: w.ingredient, amount: 0, unit: w.unit }))
          .slice(0, 10);
        setTopIngredients(top);
      } catch (err: any) {
        console.warn('Failed to fetch kitchen recap:', err?.response?.data || err?.message);
      }
    };
    fetchRecap();
  }, [weekStartDate, weeklySchedule]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-orange-600 to-amber-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ChefHat className="h-8 w-8" />
              <h1 className="text-4xl">Dashboard Dapur</h1>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-1">
              👨‍🍳 Petugas Dapur
            </Badge>
          </div>
          <p className="text-xl text-orange-50 max-w-3xl">
            Rekap kebutuhan bahan dan porsi menu mingguan untuk Program MBG
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Total Siswa</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{totalStudents} siswa</div>
              <p className="text-xs text-muted-foreground mt-1">
                Per minggu ini
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Total Porsi/Hari</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{totalStudents} porsi</div>
              <p className="text-xs text-muted-foreground mt-1">
                Menu Utama + Menu Aman
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Menu Minggu Ini</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">5 hari</div>
              <p className="text-xs text-muted-foreground mt-1">
                Senin - Jumat
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Student Menu Choices Recap Cards */}
        {weeklyRecap.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Rekapan Pilihan Menu Siswa Minggu Ini</CardTitle>
              <CardDescription>
                Total {totalStudents} siswa telah memilih menu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-4">
                {weeklyRecap.map((recap, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{recap.day}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Menu Harian:</span>
                        <span className="font-medium text-green-600">{recap.mainMenuCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Menu Sehat:</span>
                        <span className="font-medium text-blue-600">{recap.safeMenuCount}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-700 font-medium">Total:</span>
                        <span className="font-semibold">{recap.total}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly Menu Recap Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Rekap Menu Mingguan
            </CardTitle>
            <CardDescription>
              Jumlah porsi yang harus disiapkan per hari
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hari</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Menu Utama</TableHead>
                    <TableHead className="text-center">Porsi</TableHead>
                    <TableHead>Menu Aman</TableHead>
                    <TableHead className="text-center">Porsi</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weeklyRecap.map((recap, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{recap.day}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {recap.date}
                      </TableCell>
                      <TableCell className="text-sm">{recap.mainMenu}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {recap.mainMenuCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{recap.safeMenu}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {recap.safeMenuCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {recap.total}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-gray-50">
                    <TableCell colSpan={3} className="font-semibold">
                      Total Mingguan
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {weeklyRecap.reduce((sum, r) => sum + r.mainMenuCount, 0)}
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-center font-semibold">
                      {weeklyRecap.reduce((sum, r) => sum + r.safeMenuCount, 0)}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {totalStudents * 5}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Top Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Bahan Utama yang Dibutuhkan
            </CardTitle>
            <CardDescription>
              10 bahan paling banyak digunakan minggu ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topIngredients.map((ingredient, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{ingredient.item}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {ingredient.amount} {ingredient.unit}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="p-3 bg-orange-100 rounded-full">
                  <ChefHat className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-orange-900 mb-1">
                  Jadwal Persiapan
                </h3>
                <p className="text-sm text-orange-800">
                  Rekap mingguan tersedia setiap <strong>Sabtu malam pukul 22.00</strong> untuk minggu berikutnya.
                  Persiapan bahan dapat dilakukan hari <strong>Minggu</strong> agar siap untuk hari <strong>Senin</strong> pagi.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}