import { Target, Eye, Users, Award } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function AboutPage() {
  const values = [
    {
      icon: Target,
      title: 'Visi',
      description: 'Menjadi sistem terdepan dalam manajemen nutrisi sekolah yang aman dan sehat untuk semua siswa'
    },
    {
      icon: Eye,
      title: 'Misi',
      description: 'Menyediakan solusi teknologi untuk membantu sekolah merencanakan menu bergizi dengan mempertimbangkan alergi makanan'
    },
    {
      icon: Users,
      title: 'Nilai',
      description: 'Keamanan, kesehatan, dan kesejahteraan siswa adalah prioritas utama kami'
    },
    {
      icon: Award,
      title: 'Komitmen',
      description: 'Terus berinovasi dalam teknologi deteksi alergen untuk memberikan layanan terbaik'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-emerald-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl mb-6">
              Tentang NutriPlan
            </h1>
            <p className="text-xl text-green-50">
              Platform inovatif untuk Program Makan Bergizi Gratis (MBG) dengan AI menu generator 
              dan sistem deteksi alergen otomatis
            </p>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h2 className="text-3xl text-gray-900">
              Mendukung Program MBG Indonesia
            </h2>
            <p className="text-gray-600">
              NutriPlan adalah platform yang dikembangkan khusus untuk mendukung Program Makan 
              Bergizi Gratis (MBG) pemerintah di sekolah-sekolah Indonesia. Kami menyediakan 
              sistem yang memudahkan pengelolaan menu harian dengan fokus pada 1 makanan bergizi 
              per hari untuk setiap siswa.
            </p>
            <p className="text-gray-600">
              Dengan fitur AI Menu Generator, admin sekolah dapat dengan mudah membuat menu 
              berdasarkan bahan dasar yang tersedia. AI kami akan memberikan beberapa opsi 
              menu bergizi yang sesuai dengan standar nutrisi anak sekolah, lengkap dengan 
              informasi kandungan alergen.
            </p>
            <p className="text-gray-600">
              Sistem kami juga memberikan peringatan otomatis kepada siswa yang memiliki alergi 
              tertentu ketika menu mengandung bahan alergen yang sudah diinput dalam profil mereka. 
              Keamanan dan kesehatan siswa adalah prioritas utama kami.
            </p>
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1641301547846-2cf73f58fdca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxudXRyaXRpb3VzJTIwbWVhbCUyMHBsYW5uaW5nfGVufDF8fHx8MTc2MDUwOTc1NXww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Nutritious meal planning"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Values Grid */}
        <div className="mb-20">
          <h2 className="text-3xl text-gray-900 text-center mb-12">
            Visi, Misi & Nilai Kami
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-gray-900 mb-3">{value.title}</h3>
                <p className="text-sm text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl text-gray-900 text-center mb-12">
            Dampak Kami
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-5xl text-green-600 mb-2">500+</p>
              <p className="text-gray-600">Sekolah Mitra</p>
            </div>
            <div>
              <p className="text-5xl text-green-600 mb-2">50K+</p>
              <p className="text-gray-600">Siswa Terlayani</p>
            </div>
            <div>
              <p className="text-5xl text-green-600 mb-2">99.9%</p>
              <p className="text-gray-600">Akurasi Deteksi</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
