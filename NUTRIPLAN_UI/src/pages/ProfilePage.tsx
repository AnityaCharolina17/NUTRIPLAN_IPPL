import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { User, Mail, Shield, Edit2, Save, X, AlertCircle, Calendar, Utensils } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { commonAllergens } from '../lib/menuData';

export function ProfilePage() {
  const { user, isAuthenticated, updateUserProfile, isStudent, isAdmin, isKitchenStaff } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    class: user?.class || '',
    allergens: user?.allergens || [],
    customAllergies: user?.customAllergies || '',
    bio: user?.bio || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        class: user.class || '',
        allergens: user.allergens || [],
        customAllergies: user.customAllergies || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handleSave = () => {
    updateUserProfile(formData);
    setIsEditing(false);
    toast.success('Profil berhasil diperbarui!');
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      class: user?.class || '',
      allergens: user?.allergens || [],
      customAllergies: user?.customAllergies || '',
      bio: user?.bio || ''
    });
    setIsEditing(false);
  };

  const toggleAllergen = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  const getRoleBadge = () => {
    if (isAdmin) return { text: 'Admin', color: 'bg-purple-100 text-purple-700' };
    if (isKitchenStaff) return { text: 'Petugas Dapur', color: 'bg-orange-100 text-orange-700' };
    if (isStudent) return { text: 'Siswa', color: 'bg-green-100 text-green-700' };
    return { text: 'Guest', color: 'bg-gray-100 text-gray-700' };
  };

  const roleBadge = getRoleBadge();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl text-gray-900 mb-2">Profil Saya</h1>
              <p className="text-gray-600">Kelola informasi profil dan preferensi Anda</p>
            </div>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profil
              </Button>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Pribadi
              </CardTitle>
              <Badge className={roleBadge.color}>
                {roleBadge.text}
              </Badge>
            </div>
            <CardDescription>
              Informasi dasar tentang akun Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                />
              ) : (
                <p className="text-gray-900">{user?.name || '-'}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Masukkan email"
                />
              ) : (
                <p className="text-gray-900">{user?.email || '-'}</p>
              )}
            </div>

            {/* Class (for students) */}
            {isStudent && (
              <div className="space-y-2">
                <Label htmlFor="class">Kelas</Label>
                {isEditing ? (
                  <Input
                    id="class"
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    placeholder="Contoh: 7A, 8B"
                  />
                ) : (
                  <p className="text-gray-900">{user?.class || '-'}</p>
                )}
              </div>
            )}

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio / Catatan</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tambahkan catatan atau bio singkat"
                  className="min-h-24 resize-none"
                />
              ) : (
                <p className="text-gray-600">{user?.bio || 'Belum ada bio'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Allergies Card (for students) */}
        {isStudent && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Data Alergi
              </CardTitle>
              <CardDescription>
                Kelola informasi alergi Anda untuk mendapatkan peringatan otomatis pada menu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Warning */}
              {!isEditing && formData.allergens.length === 0 && !formData.customAllergies && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Anda belum mengatur data alergi. Tambahkan informasi alergi untuk mendapatkan peringatan otomatis pada jadwal menu.
                  </p>
                </div>
              )}

              {/* Common Allergens */}
              <div className="space-y-3">
                <Label>Alergen Umum</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {commonAllergens.map((allergen) => (
                    <div key={allergen} className="flex items-center gap-2">
                      <Checkbox
                        id={`allergen-${allergen}`}
                        checked={formData.allergens.includes(allergen)}
                        onCheckedChange={() => toggleAllergen(allergen)}
                        disabled={!isEditing}
                      />
                      <Label
                        htmlFor={`allergen-${allergen}`}
                        className={`text-sm ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        {allergen}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Allergies */}
              <div className="space-y-2">
                <Label htmlFor="customAllergies">Alergen Kustom (Opsional)</Label>
                <p className="text-xs text-gray-500">
                  Tambahkan alergen lain yang tidak ada dalam daftar. Pisahkan dengan koma.
                </p>
                {isEditing ? (
                  <Input
                    id="customAllergies"
                    value={formData.customAllergies}
                    onChange={(e) => setFormData({ ...formData, customAllergies: e.target.value })}
                    placeholder="Contoh: MSG, pengawet, pewarna"
                  />
                ) : (
                  <p className="text-gray-900">{user?.customAllergies || 'Tidak ada'}</p>
                )}
              </div>

              {/* Current Allergies Display */}
              {!isEditing && (formData.allergens.length > 0 || formData.customAllergies) && (
                <div className="pt-4 border-t">
                  <Label className="mb-2 block">Alergi Anda Saat Ini:</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.allergens.map((allergen) => (
                      <Badge key={allergen} variant="destructive">
                        {allergen}
                      </Badge>
                    ))}
                    {formData.customAllergies && formData.customAllergies.split(',').map((allergen) => (
                      <Badge key={allergen.trim()} variant="outline" className="border-red-300 text-red-700">
                        {allergen.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Edit Actions - Shown at bottom when editing */}
        {isEditing && (
          <div className="flex items-center gap-3 mb-6">
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Simpan Perubahan
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
            >
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
          </div>
        )}

        {/* Account Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Informasi Akun
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Tipe Akun</span>
              <Badge className={roleBadge.color}>
                {roleBadge.text}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-t">
              <span className="text-sm text-gray-600">Status</span>
              <Badge className="bg-green-100 text-green-700">
                Aktif
              </Badge>
            </div>
            {isStudent && user?.class && (
              <div className="flex items-center justify-between py-2 border-t">
                <span className="text-sm text-gray-600">Kelas</span>
                <span className="text-sm font-medium text-gray-900">{user.class}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips for Admin/Kitchen Staff */}
        {(isAdmin || isKitchenStaff) && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-gray-900 mb-2 flex items-center gap-2">
              {isAdmin ? <Utensils className="h-5 w-5 text-blue-600" /> : <Calendar className="h-5 w-5 text-blue-600" />}
              {isAdmin ? 'Akses Admin' : 'Akses Petugas Dapur'}
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              {isAdmin 
                ? 'Sebagai Admin, Anda memiliki akses ke AI Menu Generator untuk membuat dan mengelola menu mingguan.'
                : 'Sebagai Petugas Dapur, Anda memiliki akses ke Dashboard Dapur untuk melihat rekap porsi dan bahan.'}
            </p>
            <div className="flex gap-2">
              {isAdmin && (
                <Button
                  asChild
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <a href="/admin/menu-generator">
                    <Utensils className="h-4 w-4 mr-2" />
                    Buka Menu Generator
                  </a>
                </Button>
              )}
              {isKitchenStaff && (
                <Button
                  asChild
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <a href="/kitchen/dashboard">
                    <Calendar className="h-4 w-4 mr-2" />
                    Buka Dashboard Dapur
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}