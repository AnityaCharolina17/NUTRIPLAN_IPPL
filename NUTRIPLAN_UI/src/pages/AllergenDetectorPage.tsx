import { useState } from 'react';
import { api } from '../lib/api';
import { AllergenForm } from '../components/AllergenForm';
import { AllergenResultModal } from '../components/AllergenResultModal';
import { Sparkles, Shield, Zap } from 'lucide-react';

interface AllergenResult {
  ingredient: string;
  isAllergen: boolean;
  allergenType?: string;
  riskLevel?: 'high' | 'medium' | 'low';
}

export function AllergenDetectorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<AllergenResult[]>([]);

  const handleSubmit = async (ingredients: string, selectedAllergens: string[]) => {
    try {
      setIsLoading(true);
      
      const ingredientList = ingredients.split(',').map(i => i.trim()).filter(i => i.length > 0);
      
      if (ingredientList.length === 0) {
        alert('Masukkan minimal 1 bahan makanan');
        return;
      }
      
      const { data } = await api.post('/api/ai/check-allergen', { ingredients: ingredientList });

      if (!data.success) {
        alert(data.message || 'Gagal mendeteksi alergen');
        return;
      }

      // Debug: log API response
      console.log('API Response for allergen check:', data);
      console.log('Ingredients data:', data.ingredients);

      const selectedLower = (selectedAllergens || []).map(a => a.toLowerCase());

      const mapped: AllergenResult[] = data.ingredients.map((ingData: any) => {
        console.log('Processing ingredient:', ingData);
        const hasAllergen = ingData.allergens && ingData.allergens.length > 0;
        
        if (!hasAllergen) {
          return {
            ingredient: ingData.name,
            isAllergen: false
          };
        }
        
        const matchedAllergens = ingData.allergens.filter((allergen: string) => {
          if (selectedLower.length === 0) return true;
          return selectedLower.some(s => allergen.toLowerCase().includes(s));
        });
        
        if (matchedAllergens.length === 0 && selectedLower.length > 0) {
          return {
            ingredient: ingData.name,
            isAllergen: false
          };
        }
        
        return {
          ingredient: ingData.name,
          isAllergen: hasAllergen,
          allergenType: ingData.allergens.join(', '),
          riskLevel: 'high' as const
        };
      });

      setResults(mapped);
      setShowResults(true);
    } catch (err: any) {
      alert(`Gagal mendeteksi alergen: ${err?.response?.data?.message || err?.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: 'AI Detection',
      description: 'Menggunakan machine learning untuk mendeteksi alergen dengan akurat'
    },
    {
      icon: Shield,
      title: 'Keamanan Prioritas',
      description: 'Memberikan peringatan untuk semua alergen yang terdeteksi'
    },
    {
      icon: Zap,
      title: 'Hasil Instan',
      description: 'Dapatkan hasil analisis dalam hitungan detik'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-green-600 to-emerald-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8" />
            <h1 className="text-4xl">Deteksi Alergen AI</h1>
          </div>
          <p className="text-xl text-green-50 max-w-3xl">
            Masukkan daftar bahan makanan dan biarkan AI kami mengidentifikasi 
            potensi alergen untuk keamanan siswa
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Warning Alert */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-red-900 mb-2">⚠️ Peringatan Penting</h3>
              <p className="text-sm text-red-800 mb-2">
                Untuk <strong>alergi akut atau riwayat reaksi anafilaksis</strong>, mohon konsultasi lebih lanjut dengan pihak medis atau ahli gizi.
              </p>
              <p className="text-xs text-red-700">
                Hasil deteksi AI tidak 100% akurat dan hanya sebagai panduan awal. Selalu verifikasi dengan tenaga kesehatan profesional untuk kondisi alergi yang serius.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 text-center"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <feature.icon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <AllergenForm onSubmit={handleSubmit} isLoading={isLoading} />

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="text-gray-900 mb-2">💡 Cara Penggunaan</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>1. <strong>Masukkan makanan/bahan:</strong> Ketik nama makanan lengkap (contoh: "Nasi Goreng") atau daftar bahan makanan yang ingin Anda cek</li>
            <li>2. <strong>Pilih alergen (opsional):</strong> Centang jenis alergen yang ingin dideteksi dari daftar yang tersedia</li>
            <li>3. <strong>Isi alergen kustom (opsional):</strong> Jika alergen yang Anda cari tidak ada dalam daftar, ketik langsung di kolom "Alergen Kustom" (pisahkan dengan koma jika lebih dari satu)</li>
            <li>4. Klik tombol "Deteksi Alergen dengan AI"</li>
            <li>5. Tunggu beberapa saat untuk hasil analisis</li>
            <li>6. Lihat hasil deteksi dengan tingkat risiko untuk setiap bahan</li>
          </ul>
          <div className="mt-4 pt-4 border-t border-blue-300">
            <p className="text-xs text-gray-600">
              <strong>Tips:</strong> Semakin spesifik informasi yang Anda masukkan, semakin akurat hasil deteksi AI.
            </p>
          </div>
        </div>
      </section>

      {/* Results Modal */}
      <AllergenResultModal
        open={showResults}
        onClose={() => setShowResults(false)}
        results={results}
      />
    </div>
  );
}