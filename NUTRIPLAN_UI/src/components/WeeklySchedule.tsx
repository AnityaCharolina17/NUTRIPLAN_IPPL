import { useState } from 'react';
import { Calendar, AlertTriangle, UtensilsCrossed, ChevronDown, ChevronUp, Edit2, Save, X } from 'lucide-react';
import { useMenu } from '../contexts/MenuContext';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { MenuItem } from '../lib/menuData';

export function WeeklySchedule() {
  const { user, isStudent, isAdmin } = useAuth();
  const { weeklySchedule, menuItems, updateWeeklySchedule, addMenuItem } = useMenu();
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());
  
  // Edit menu state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [editingDay, setEditingDay] = useState<string>('');
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    ingredients: '',
    allergens: '',
    mainIngredient: ''
  });

  const getMenuById = (id: string) => {
    return menuItems.find(item => item.id === id);
  };

  const hasAllergen = (menuAllergens: string[]) => {
    if (!isStudent || !user?.allergens || user.allergens.length === 0) {
      return false;
    }
    return menuAllergens.some(allergen => 
      user.allergens.some(userAllergen => 
        allergen.toLowerCase().includes(userAllergen.toLowerCase()) ||
        userAllergen.toLowerCase().includes(allergen.toLowerCase())
      )
    );
  };

  const toggleDayExpanded = (index: number) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleEditClick = (schedule: any, menu: MenuItem) => {
    setEditingMenu(menu);
    setEditingDay(schedule.day);
    setEditForm({
      name: menu.name,
      description: menu.description,
      ingredients: menu.ingredients.join(', '),
      allergens: menu.allergens.join(', '),
      mainIngredient: schedule.mainIngredient || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingMenu) return;

    const updatedMenu: MenuItem = {
      ...editingMenu,
      name: editForm.name,
      description: editForm.description,
      ingredients: editForm.ingredients.split(',').map(i => i.trim()),
      allergens: editForm.allergens.split(',').map(a => a.trim()).filter(a => a.length > 0)
    };

    // Update menu item
    addMenuItem(updatedMenu);
    
    // Update weekly schedule with main ingredient
    updateWeeklySchedule(editingDay, editingMenu.id, editForm.mainIngredient);

    toast.success(`Menu berhasil diperbarui untuk hari ${editingDay}!`);
    setIsEditDialogOpen(false);
    setEditingMenu(null);
    setEditingDay('');
  };

  return (
    <div className="space-y-4">
      {weeklySchedule.map((schedule, index) => {
        const menu = getMenuById(schedule.menuId);
        const hasUserAllergen = menu ? hasAllergen(menu.allergens) : false;

        return (
          <div
            key={index}
            className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all ${
              hasUserAllergen ? 'ring-2 ring-red-500' : ''
            }`}
          >
            {/* Day Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5" />
                  <div>
                    <h3>{schedule.day}</h3>
                    <p className="text-sm text-green-50">{schedule.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {schedule.mainIngredient && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      <UtensilsCrossed className="h-3 w-3 mr-1" />
                      {schedule.mainIngredient}
                    </Badge>
                  )}
                  {isAdmin && menu && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(schedule, menu)}
                      className="text-white hover:bg-white/20"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Content - Single meal for MBG Program */}
            <div className={`p-6 transition-colors ${
              hasUserAllergen 
                ? 'bg-red-50' 
                : 'hover:bg-gray-50'
            }`}>
              {menu ? (
                <div className="space-y-4">
                  {/* Allergen Warning Banner */}
                  {hasUserAllergen && (
                    <div className="bg-red-100 border border-red-300 rounded-lg p-3 flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-900 text-sm">
                          Peringatan Alergen!
                        </p>
                        <p className="text-xs text-red-700 mt-0.5">
                          Menu ini mengandung bahan yang ada dalam daftar alergi Anda. Harap berhati-hati.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Menu Details */}
                  <Link
                    to={`/menu/${menu.id}`}
                    className="block group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <Badge className="bg-green-600 mt-1">Menu MBG</Badge>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                              {menu.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {menu.description}
                            </p>
                          </div>
                        </div>

                        {/* Nutrition Info */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-gray-200">
                          <div>
                            <p className="text-xs text-gray-500">Kalori</p>
                            <p className="font-semibold text-gray-900">{menu.nutritionFacts.calories} kkal</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Protein</p>
                            <p className="font-semibold text-gray-900">{menu.nutritionFacts.protein}g</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Karbohidrat</p>
                            <p className="font-semibold text-gray-900">{menu.nutritionFacts.carbs}g</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Lemak</p>
                            <p className="font-semibold text-gray-900">{menu.nutritionFacts.fat}g</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Serat</p>
                            <p className="font-semibold text-gray-900">{menu.nutritionFacts.fiber}g</p>
                          </div>
                        </div>

                        {/* Allergens */}
                        {menu.allergens.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-2">Mengandung Alergen:</p>
                            <div className="flex flex-wrap gap-2">
                              {menu.allergens.map((allergen) => {
                                const isUserAllergen = user?.allergens?.some(
                                  ua => ua.toLowerCase().includes(allergen.toLowerCase()) ||
                                        allergen.toLowerCase().includes(ua.toLowerCase())
                                );
                                return (
                                  <Badge
                                    key={allergen}
                                    variant={isUserAllergen ? "destructive" : "outline"}
                                    className="text-xs"
                                  >
                                    {isUserAllergen && <AlertTriangle className="h-3 w-3 mr-1" />}
                                    {allergen}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Menu Image */}
                      <div className="hidden sm:block">
                        <img
                          src={menu.imageUrl}
                          alt={menu.name}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      </div>
                    </div>
                  </Link>

                  {/* Expandable Portions Section */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleDayExpanded(index);
                      }}
                      className="w-full justify-between hover:bg-green-50"
                    >
                      <span className="text-xs font-medium">
                        Lihat Komposisi Porsi Menu
                      </span>
                      {expandedDays.has(index) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>

                    <Collapsible open={expandedDays.has(index)}>
                      <CollapsibleContent className="pt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          {menu.portions.map((portion: any, idx: number) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <UtensilsCrossed className="h-4 w-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-900">
                                  {portion.name}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600">{portion.amount}</p>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-3 bg-gray-100 rounded-full">
                    <AlertTriangle className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">Menu Belum Tersedia</p>
                  <p className="text-sm text-gray-500">
                    {isAdmin 
                      ? 'Silakan buat menu untuk hari ini melalui halaman Admin Menu Generator'
                      : 'Admin belum membuat menu untuk hari ini. Harap hubungi admin.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Edit Menu Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Menu</DialogTitle>
            <DialogDescription>
              Ubah detail menu untuk hari {editingDay}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name">Nama Menu</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ingredients">Bahan-bahan</Label>
              <Input
                id="ingredients"
                value={editForm.ingredients}
                onChange={(e) => setEditForm({ ...editForm, ingredients: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="allergens">Alergen</Label>
              <Input
                id="allergens"
                value={editForm.allergens}
                onChange={(e) => setEditForm({ ...editForm, allergens: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mainIngredient">Bahan Utama</Label>
              <Input
                id="mainIngredient"
                value={editForm.mainIngredient}
                onChange={(e) => setEditForm({ ...editForm, mainIngredient: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleEditSave}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}