import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMenu } from '../contexts/MenuContext';
import { Navigate } from 'react-router-dom';
import { Sparkles, Calendar, ChefHat, Save, Loader2, Edit2, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import { generateMenuSuggestions, MenuSuggestion } from '../lib/aiMenuGenerator';
import { MenuItem } from '../lib/menuData';
import { api } from '../lib/api';

export function AdminMenuGeneratorPage() {
  const { isAdmin } = useAuth();
  const { weeklySchedule, menuItems, updateWeeklySchedule, addMenuItem } = useMenu();
  const [selectedDay, setSelectedDay] = useState('Senin');
  const [mainIngredient, setMainIngredient] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<MenuSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
  const [weeklyRecap, setWeeklyRecap] = useState<any>(null);
  
  // Edit menu state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    ingredients: '',
    allergens: '',
    mainIngredient: ''
  });

  // Fetch weekly recap
  useEffect(() => {
    const fetchRecap = async () => {
      try {
        const res = await api.get('/kitchen/recap');
        if (res.data?.success) {
          setWeeklyRecap(res.data);
        }
      } catch (error) {
        console.log('Could not fetch recap');
      }
    };
    fetchRecap();
  }, []);

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleGenerate = async () => {
    if (!mainIngredient.trim()) {
      toast.error('Mohon masukkan bahan dasar utama');
      return;
    }

    setIsGenerating(true);
    setSuggestions([]);
    setSelectedSuggestion(null);

    try {
      const generated = await generateMenuSuggestions(mainIngredient);
      setSuggestions(generated);
      toast.success(`Berhasil generate ${generated.length} opsi menu!`);
    } catch (error) {
      toast.error('Gagal generate menu. Silakan coba lagi.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveMenu = async () => {
    if (selectedSuggestion === null) {
      toast.error('Pilih salah satu opsi menu terlebih dahulu');
      return;
    }

    setIsSaving(true);

    const selectedMenu = suggestions[selectedSuggestion];
    
    // Create a new menu item
    const newMenuId = `menu-${Date.now()}`;
    const newMenuItem = {
      id: newMenuId,
      name: selectedMenu.name,
      description: selectedMenu.description,
      category: 'Lunch',
      ingredients: selectedMenu.ingredients,
      allergens: selectedMenu.allergens,
      nutritionFacts: selectedMenu.nutritionFacts,
      portions: selectedMenu.portions,
      imageUrl: 'https://images.unsplash.com/photo-1678562884934-34222a670eb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwc2Nob29sJTIwbHVuY2h8ZW58MXx8fHwxNzYwNDE3MzA2fDA&ixlib=rb-4.1.0&q=80&w=1080'
    };

    // Add menu item to collection
    addMenuItem(newMenuItem);
    
    // Update weekly schedule
    updateWeeklySchedule(selectedDay, newMenuId, mainIngredient);
    
    toast.success(`Menu "${selectedMenu.name}" berhasil disimpan untuk hari ${selectedDay}!`, {
      description: 'Menu otomatis ditambahkan ke jadwal mingguan'
    });

    // Reset form
    setMainIngredient('');
    setSuggestions([]);
    setSelectedSuggestion(null);
    setIsSaving(false);
  };

  const currentSchedule = weeklySchedule.find(s => s.day === selectedDay);
  const currentMenu = currentSchedule ? menuItems.find(m => m.id === currentSchedule.menuId) : null;

  // Edit menu functions
  const handleEditMenu = (menu: MenuItem) => {
    setEditingMenu(menu);
    setEditForm({
      name: menu.name,
      description: menu.description,
      ingredients: menu.ingredients.join(', '),
      allergens: menu.allergens.join(', '),
      mainIngredient: currentSchedule?.mainIngredient || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = () => {
    if (!editingMenu) return;

    const updatedMenu: MenuItem = {
      ...editingMenu,
      name: editForm.name,
      description: editForm.description,
      ingredients: editForm.ingredients.split(',').map(i => i.trim()),
      allergens: editForm.allergens.split(',').map(a => a.trim())
    };

    // Update menu item in collection
    addMenuItem(updatedMenu);
    
    // Update weekly schedule
    updateWeeklySchedule(selectedDay, editingMenu.id, editForm.mainIngredient);
    
    toast.success(`Menu "${updatedMenu.name}" berhasil diperbarui untuk hari ${selectedDay}!`, {
      description: 'Menu otomatis diperbarui di jadwal mingguan'
    });

    // Reset form
    setEditForm({
      name: '',
      description: '',
      ingredients: '',
      allergens: '',
      mainIngredient: ''
    });
    setIsEditDialogOpen(false);
    setEditingMenu(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8" />
              <h1 className="text-4xl">AI Menu Generator</h1>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-1">
              🛡️ Admin Mode
            </Badge>
          </div>
          <p className="text-xl text-purple-50 max-w-3xl">
            Generate menu bergizi untuk program MBG dengan bantuan AI berdasarkan bahan dasar yang tersedia
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Student Choices Recap */}
        {weeklyRecap && weeklyRecap.dailyRecap && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Rekapan Pilihan Menu Siswa Minggu Ini</CardTitle>
              <CardDescription>
                Total {weeklyRecap.totalStudents} siswa telah memilih menu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-4">
                {Object.entries(weeklyRecap.dailyRecap).map(([day, data]: [string, any]) => (
                  <div key={day} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{day}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Menu Harian:</span>
                        <span className="font-medium text-green-600">{data.harianCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Menu Sehat:</span>
                        <span className="font-medium text-blue-600">{data.sehatCount}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-700 font-medium">Total:</span>
                        <span className="font-semibold">{data.totalCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Generate Menu Baru
                </CardTitle>
                <CardDescription>
                  Masukkan bahan dasar utama untuk generate opsi menu. Semakin spesifik, semakin baik hasil.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="day">Hari</Label>
                  <select
                    id="day"
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {weeklySchedule.map((schedule) => (
                      <option key={schedule.day} value={schedule.day}>
                        {schedule.day} - {schedule.date}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="ingredient">Bahan Dasar Utama</Label>
                  <Input
                    id="ingredient"
                    type="text"
                    placeholder="Contoh: Ikan Tongkol, Ayam Kampung, Daging Sapi, Ikan Bandeng"
                    value={mainIngredient}
                    onChange={(e) => setMainIngredient(e.target.value)}
                    className="mt-1.5"
                    disabled={isGenerating}
                  />
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                    <p className="text-xs text-blue-900 mb-1 font-semibold">💡 Tips:</p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Sebutkan <strong>jenis spesifik</strong>: "Ikan Tongkol" atau "Ikan Kembung"</li>
                      <li>• Untuk ayam: "Ayam Kampung" atau "Ayam Broiler"</li>
                      <li>• AI akan memberikan resep yang sesuai dengan jenis bahan</li>
                    </ul>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !mainIngredient.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Menu
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Current Menu */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Menu Saat Ini - {selectedDay}
                  </CardTitle>
                  {currentMenu && (
                    <Button variant="outline" size="sm" onClick={() => handleEditMenu(currentMenu)}>
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {currentMenu ? (
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{currentMenu.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{currentMenu.description}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Bahan Utama:</p>
                      <p className="text-sm text-gray-600">{currentSchedule?.mainIngredient}</p>
                    </div>
                    {currentMenu.allergens.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Alergen:</p>
                        <div className="flex flex-wrap gap-1">
                          {currentMenu.allergens.map((allergen) => (
                            <Badge key={allergen} variant="outline" className="text-xs">
                              {allergen}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Belum ada menu untuk hari ini</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Suggestions Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Opsi Menu yang Dihasilkan</CardTitle>
                <CardDescription>
                  Pilih salah satu opsi menu untuk disimpan ke jadwal
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                      <p className="text-gray-600">Sedang generate menu...</p>
                    </div>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="space-y-4">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedSuggestion(index)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedSuggestion === index
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{suggestion.name}</h3>
                          {selectedSuggestion === index && (
                            <Badge className="bg-purple-600">Dipilih</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                        
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-1">Bahan:</p>
                            <div className="flex flex-wrap gap-1">
                              {suggestion.ingredients.slice(0, 5).map((ing, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded">
                                  {ing}
                                </span>
                              ))}
                              {suggestion.ingredients.length > 5 && (
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                  +{suggestion.ingredients.length - 5} lainnya
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Portions */}
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-1">Komposisi & Porsi:</p>
                            <div className="space-y-1">
                              {suggestion.portions.map((portion, i) => (
                                <div key={i} className="flex justify-between items-center text-xs bg-gray-50 rounded px-2 py-1">
                                  <span className="text-gray-700">{portion.item}</span>
                                  <span className="text-gray-500">{portion.weight}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {suggestion.allergens.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-700 mb-1">Alergen:</p>
                              <div className="flex flex-wrap gap-1">
                                {suggestion.allergens.map((allergen, i) => (
                                  <Badge key={i} variant="destructive" className="text-xs">
                                    {allergen}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="pt-2 border-t border-gray-200">
                            <p className="text-xs font-medium text-gray-700 mb-2">Nilai Gizi:</p>
                            <div className="grid grid-cols-5 gap-2 text-xs">
                              <div>
                                <p className="text-gray-500">Kalori</p>
                                <p className="font-medium">{suggestion.nutritionFacts.calories}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Protein</p>
                                <p className="font-medium">{suggestion.nutritionFacts.protein}g</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Karbo</p>
                                <p className="font-medium">{suggestion.nutritionFacts.carbs}g</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Lemak</p>
                                <p className="font-medium">{suggestion.nutritionFacts.fat}g</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Serat</p>
                                <p className="font-medium">{suggestion.nutritionFacts.fiber}g</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      onClick={handleSaveMenu}
                      disabled={selectedSuggestion === null || isSaving}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Menyimpan...' : 'Simpan ke Jadwal Menu'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <ChefHat className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p>Masukkan bahan dasar dan klik "Generate Menu"</p>
                    <p className="text-sm mt-1">untuk melihat opsi menu</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Edit Menu Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Menu</DialogTitle>
            <DialogDescription>
              Ubah detail menu untuk hari {selectedDay}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Menu</Label>
              <Input
                id="name"
                name="name"
                value={editForm.name}
                onChange={handleEditFormChange}
                className="mt-1.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi Menu</Label>
              <Textarea
                id="description"
                name="description"
                value={editForm.description}
                onChange={handleEditFormChange}
                className="mt-1.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ingredients">Bahan-Bahan</Label>
              <Input
                id="ingredients"
                name="ingredients"
                value={editForm.ingredients}
                onChange={handleEditFormChange}
                className="mt-1.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergens">Alergen</Label>
              <Input
                id="allergens"
                name="allergens"
                value={editForm.allergens}
                onChange={handleEditFormChange}
                className="mt-1.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mainIngredient">Bahan Dasar Utama</Label>
              <Input
                id="mainIngredient"
                name="mainIngredient"
                value={editForm.mainIngredient}
                onChange={handleEditFormChange}
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSaveEdit}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}