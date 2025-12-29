import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, LogIn } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useAuth } from '../contexts/AuthContext';

export function Hero() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">AI-Powered Allergen Detection</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl text-gray-900">
              Program Makan Bergizi Gratis (MBG) untuk Sekolah
            </h1>
            
            <p className="text-lg text-gray-600">
              Sistem penjadwalan menu MBG dengan 1 makanan bergizi per hari. Dilengkapi dengan 
              AI menu generator dan deteksi alergen otomatis untuk menjaga keamanan dan kesehatan siswa.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/menu-planning"
                    className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Lihat Jadwal Menu
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/allergen-detector"
                    className="inline-flex items-center justify-center gap-2 bg-white text-green-600 border-2 border-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    Cek Alergen
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <LogIn className="h-5 w-5" />
                    Mulai Sekarang
                  </Link>
                  <Link
                    to="/about"
                    className="inline-flex items-center justify-center gap-2 bg-white text-green-600 border-2 border-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    Pelajari Lebih Lanjut
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1678562884934-34222a670eb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwc2Nob29sJTIwbHVuY2h8ZW58MXx8fHwxNzYwNDE3MzA2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Healthy school meal"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-200 rounded-full blur-2xl opacity-50"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-emerald-200 rounded-full blur-2xl opacity-50"></div>
          </div>
        </div>
      </div>
    </div>
  );
}