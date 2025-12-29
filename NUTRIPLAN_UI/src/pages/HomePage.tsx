import { Hero } from '../components/Hero';
import { CheckCircle2, Calendar, Sparkles, Shield, LogIn, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

export function HomePage() {
  const { isAuthenticated } = useAuth();
  
  const features = [
    {
      icon: Calendar,
      title: 'Program MBG',
      description: '1 menu bergizi per hari sesuai program Makan Bergizi Gratis pemerintah'
    },
    {
      icon: Sparkles,
      title: 'AI Menu Generator',
      description: 'Generate menu otomatis berdasarkan bahan dasar yang tersedia dengan AI'
    },
    {
      icon: Shield,
      title: 'Deteksi Alergen',
      description: 'Peringatan otomatis untuk siswa dengan alergi makanan tertentu'
    },
    {
      icon: CheckCircle2,
      title: 'Nutrisi Seimbang',
      description: 'Setiap menu dirancang memenuhi standar gizi untuk anak sekolah'
    }
  ];

  return (
    <div>
      <Hero />
      
      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl text-gray-900 mb-4">
            Fitur Unggulan
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sistem lengkap untuk mengelola Program Makan Bergizi Gratis (MBG) di sekolah dengan teknologi AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          {isAuthenticated ? (
            <>
              <h2 className="text-3xl mb-4">
                Siap Merencanakan Menu Sehat?
              </h2>
              <p className="text-lg text-green-50 mb-8 max-w-2xl mx-auto">
                Mulai gunakan sistem kami untuk membuat jadwal menu bergizi dan pastikan 
                keamanan makanan untuk semua siswa
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-green-600 hover:bg-green-50">
                  <Link to="/menu-planning">
                    <Calendar className="h-5 w-5 mr-2" />
                    Lihat Jadwal Menu
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-green-700 text-white hover:bg-green-800 border-2 border-white">
                  <Link to="/allergen-detector">
                    <Shield className="h-5 w-5 mr-2" />
                    Coba Deteksi Alergen
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl mb-4">
                Mulai Kelola Menu Bergizi Sekolah
              </h2>
              <p className="text-lg text-green-50 mb-8 max-w-2xl mx-auto">
                Login untuk mengakses fitur lengkap: Jadwal Menu, Deteksi Alergen AI, dan Dashboard Khusus
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-green-600 hover:bg-green-50">
                  <Link to="/login">
                    <LogIn className="h-5 w-5 mr-2" />
                    Login Sekarang
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-green-700 text-white hover:bg-green-800 border-2 border-white">
                  <Link to="/about">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Pelajari Lebih Lanjut
                  </Link>
                </Button>
              </div>
              <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-xl max-w-md mx-auto">
                <p className="text-sm text-green-50 mb-3">
                  💡 <strong>Mode Guest:</strong> Orangtua/pihak luar dapat login sebagai Guest untuk melihat jadwal menu tanpa fitur personalisasi
                </p>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}