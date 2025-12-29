import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMenu } from '../contexts/MenuContext';
import { MenuDetailView } from '../components/MenuDetailView';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export function MenuDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { menuItems } = useMenu();
  const menu = menuItems.find(item => item.id === id);

  if (!menu) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-gray-900 mb-4">Menu Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">
            Menu yang Anda cari tidak tersedia dalam sistem
          </p>
          <Link
            to="/menu-planning"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Kembali ke Jadwal Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-green-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/menu-planning" className="hover:text-green-600 transition-colors">
              Jadwal Menu
            </Link>
            <span>/</span>
            <span className="text-gray-900">{menu.name}</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <MenuDetailView menu={menu} />

        {/* Actions */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/menu-planning"
            className="inline-flex items-center justify-center bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Lihat Menu Lainnya
          </Link>
          <Link
            to="/allergen-detector"
            className="inline-flex items-center justify-center bg-white text-green-600 border-2 border-green-600 px-8 py-3 rounded-lg hover:bg-green-50 transition-colors"
          >
            Cek Alergen
          </Link>
        </div>
      </section>
    </div>
  );
}