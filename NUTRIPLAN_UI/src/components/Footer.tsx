import { UtensilsCrossed, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <UtensilsCrossed className="h-8 w-8 text-green-500" />
              <span className="text-white">NutriPlan</span>
            </div>
            <p className="text-sm">
              Sistem penjadwalan makanan bergizi untuk sekolah dengan deteksi alergen berbasis AI.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white mb-4">Navigasi</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-green-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm hover:text-green-500 transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link to="/menu-planning" className="text-sm hover:text-green-500 transition-colors">
                  Jadwal Menu
                </Link>
              </li>
              <li>
                <Link to="/allergen-detector" className="text-sm hover:text-green-500 transition-colors">
                  Deteksi Alergen
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white mb-4">Kontak</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-green-500" />
                info@nutriplan.id
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-green-500" />
                +62 812-3456-7890
              </li>
              <li className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-green-500" />
                Jakarta, Indonesia
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          <p>&copy; 2025 NutriPlan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}