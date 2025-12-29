import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from './ui/button';

interface AllergenResult {
  ingredient: string;
  isAllergen: boolean;
  allergenType?: string;
  riskLevel?: 'high' | 'medium' | 'low';
}

interface AllergenResultModalProps {
  open: boolean;
  onClose: () => void;
  results: AllergenResult[];
}

export function AllergenResultModal({ open, onClose, results }: AllergenResultModalProps) {
  const allergensFound = results.filter(r => r.isAllergen);
  const safeIngredients = results.filter(r => !r.isAllergen);

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskIcon = (level?: string) => {
    switch (level) {
      case 'high': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'medium': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'low': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default: return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Hasil Deteksi Alergen</DialogTitle>
          <DialogDescription>
            Analisis AI terhadap bahan makanan yang dimasukkan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Total Bahan</p>
              <p className="text-2xl text-gray-900">{results.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Alergen Terdeteksi</p>
              <p className="text-2xl text-red-600">{allergensFound.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Aman</p>
              <p className="text-2xl text-green-600">{safeIngredients.length}</p>
            </div>
          </div>

          {/* Allergens Found */}
          {allergensFound.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h3 className="text-gray-900">Alergen Terdeteksi</h3>
              </div>
              <div className="space-y-2">
                {allergensFound.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${getRiskColor(result.riskLevel)}`}
                  >
                    <div className="flex items-center gap-3">
                      {getRiskIcon(result.riskLevel)}
                      <div>
                        <p className="capitalize">{result.ingredient}</p>
                        {result.allergenType && (
                          <p className="text-xs opacity-75">Jenis: {result.allergenType}</p>
                        )}
                      </div>
                    </div>
                    {result.riskLevel && (
                      <span className="text-xs uppercase px-2 py-1 rounded">
                        {result.riskLevel === 'high' ? 'Tinggi' : 
                         result.riskLevel === 'medium' ? 'Sedang' : 'Rendah'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safe Ingredients */}
          {safeIngredients.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="text-gray-900">Bahan Aman</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {safeIngredients.map((result, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-full"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {result.ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button onClick={onClose} variant="outline">
              Tutup
            </Button>
            <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
              Analisis Lagi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
