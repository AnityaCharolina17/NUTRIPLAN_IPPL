import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { LogIn, UserPlus, Users, GraduationCap, Shield, ChefHat, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';

export function LoginPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<'student' | 'admin' | 'kitchen_staff'>('student');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState<'student' | 'admin' | 'kitchen_staff'>('student');
  const [registerNIS, setRegisterNIS] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(loginEmail, loginPassword, loginRole);
    
    if (success) {
      const roleLabel = loginRole === 'admin' ? 'Admin' : loginRole === 'kitchen_staff' ? 'Petugas Dapur' : 'Siswa';
      toast.success(`Login berhasil sebagai ${roleLabel}!`);
      // Navigate based on role
      if (loginRole === 'admin') {
        navigate('/admin/menu-generator');
      } else if (loginRole === 'kitchen_staff') {
        navigate('/kitchen/dashboard');
      } else {
        navigate('/menu-planning');
      }
    } else {
      toast.error('Email atau password salah');
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Only students can register
    const result = await register(
      registerName, 
      registerEmail, 
      registerPassword, 
      'student', // Force student role
      { nis: registerNIS }
    );
    
    if (result.success) {
      toast.success('Registrasi berhasil sebagai Siswa! Selamat datang!');
      navigate('/profile');
    } else {
      toast.error(result.message || 'Registrasi gagal');
    }
    
    setIsLoading(false);
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    toast.success('Masuk sebagai Guest');
    navigate('/menu-planning');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl text-gray-900 mb-2">NutriPlan</h1>
          <p className="text-gray-600">Sistem Penjadwalan Makanan Bergizi</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Daftar</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Role Selection */}
                <div className="space-y-2">
                  <Label>Pilih Role</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Card
                      className={`p-4 cursor-pointer transition-all border-2 ${
                        loginRole === 'student'
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setLoginRole('student')}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div
                          className={`p-3 rounded-full ${
                            loginRole === 'student' ? 'bg-green-100' : 'bg-gray-100'
                          }`}
                        >
                          <GraduationCap
                            className={`h-6 w-6 ${
                              loginRole === 'student' ? 'text-green-600' : 'text-gray-600'
                            }`}
                          />
                        </div>
                        <div>
                          <p
                            className={`font-medium text-sm ${
                              loginRole === 'student' ? 'text-green-900' : 'text-gray-900'
                            }`}
                          >
                            Siswa
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Akses menu & profil alergi
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Card
                      className={`p-4 cursor-pointer transition-all border-2 ${
                        loginRole === 'admin'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setLoginRole('admin')}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div
                          className={`p-3 rounded-full ${
                            loginRole === 'admin' ? 'bg-purple-100' : 'bg-gray-100'
                          }`}
                        >
                          <Shield
                            className={`h-6 w-6 ${
                              loginRole === 'admin' ? 'text-purple-600' : 'text-gray-600'
                            }`}
                          />
                        </div>
                        <div>
                          <p
                            className={`font-medium text-sm ${
                              loginRole === 'admin' ? 'text-purple-900' : 'text-gray-900'
                            }`}
                          >
                            Admin
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Generate menu dengan AI
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Card
                      className={`p-4 cursor-pointer transition-all border-2 ${
                        loginRole === 'kitchen_staff'
                          ? 'border-orange-600 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setLoginRole('kitchen_staff')}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div
                          className={`p-3 rounded-full ${
                            loginRole === 'kitchen_staff' ? 'bg-orange-100' : 'bg-gray-100'
                          }`}
                        >
                          <ChefHat
                            className={`h-6 w-6 ${
                              loginRole === 'kitchen_staff' ? 'text-orange-600' : 'text-gray-600'
                            }`}
                          />
                        </div>
                        <div>
                          <p
                            className={`font-medium text-sm ${
                              loginRole === 'kitchen_staff' ? 'text-orange-900' : 'text-gray-900'
                            }`}
                          >
                            Dapur
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Rekap bahan & porsi
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                  {loginRole === 'admin' && (
                    <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-xs text-purple-900">
                        <span className="font-semibold">💡 Mode Admin:</span> Akses ke AI Menu Generator dan fitur manajemen menu untuk Program MBG
                      </p>
                    </div>
                  )}
                  {loginRole === 'kitchen_staff' && (
                    <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-xs text-orange-900">
                        <span className="font-semibold">👨‍🍳 Mode Dapur:</span> Akses dashboard rekap mingguan, porsi menu, dan kebutuhan bahan
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="nama@sekolah.id"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>

                <Alert className="bg-amber-50 border-amber-200 text-amber-900">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Lupa password? Silakan hubungi admin untuk bantuan reset akun.
                  </AlertDescription>
                </Alert>

                <Button
                  type="submit"
                  className={`w-full ${
                    loginRole === 'admin'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : loginRole === 'kitchen_staff'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                  disabled={isLoading}
                >
                  {loginRole === 'admin' ? (
                    <Shield className="h-4 w-4 mr-2" />
                  ) : loginRole === 'kitchen_staff' ? (
                    <ChefHat className="h-4 w-4 mr-2" />
                  ) : (
                    <LogIn className="h-4 w-4 mr-2" />
                  )}
                  {isLoading
                    ? 'Memproses...'
                    : `Login sebagai ${
                        loginRole === 'admin' ? 'Admin' : loginRole === 'kitchen_staff' ? 'Dapur' : 'Siswa'
                      }`}
                </Button>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nama Lengkap</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Nama Anda"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="nama@sekolah.id"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                {/* NIS Field for Students */}
                <div className="space-y-2">
                  <Label htmlFor="register-nis">NIS/NISN</Label>
                  <Input
                    id="register-nis"
                    type="text"
                    placeholder="Masukkan NIS/NISN (6-10 digit)"
                    value={registerNIS}
                    onChange={(e) => setRegisterNIS(e.target.value)}
                    required
                    pattern="\d{6,10}"
                  />
                  <p className="text-xs text-gray-500">
                    Masukkan Nomor Induk Siswa 6-10 digit
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {isLoading ? 'Memproses...' : 'Daftar sebagai Siswa'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Guest Login */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-3">
              Atau masuk tanpa akun
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGuestLogin}
            >
              <Users className="h-4 w-4 mr-2" />
              Masuk sebagai Guest
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Mode guest untuk orangtua/pengunjung yang ingin melihat menu
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}