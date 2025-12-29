import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AlertCircle, ChevronRight, Info } from 'lucide-react';
import { MenuItem } from '../lib/menuData';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface MenuCardProps {
  menu: MenuItem;
}

export function MenuCard({ menu }: MenuCardProps) {
  return (
    <Link
      to={`/menu/${menu.id}`}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden">
        <ImageWithFallback
          src={menu.imageUrl}
          alt={menu.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-start gap-2">
              <h3 className="text-gray-900 group-hover:text-green-600 transition-colors flex-1">
                {menu.name}
              </h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <div className="space-y-2">
                      <p className="font-medium text-xs">Komposisi Menu:</p>
                      {menu.portions.slice(0, 3).map((portion, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span>{portion.item}</span>
                          <span className="font-medium ml-2">{portion.weight}</span>
                        </div>
                      ))}
                      {menu.portions.length > 3 && (
                        <p className="text-xs text-gray-500 italic">
                          +{menu.portions.length - 3} item lainnya
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-gray-500 mt-1">{menu.category}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors flex-shrink-0" />
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">
          {menu.description}
        </p>

        {/* Allergens */}
        {menu.allergens.length > 0 && (
          <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
            <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Mengandung:</p>
              <div className="flex flex-wrap gap-1">
                {menu.allergens.map((allergen) => (
                  <span
                    key={allergen}
                    className="inline-block text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Nutrition Info */}
        <div className="pt-2 border-t border-gray-100 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Kalori</span>
            <span className="text-sm font-medium text-gray-900">{menu.nutritionFacts.calories} kkal</span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-xs">
            <div className="text-center">
              <p className="text-gray-500">Protein</p>
              <p className="font-medium text-gray-900">{menu.nutritionFacts.protein}g</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Karbo</p>
              <p className="font-medium text-gray-900">{menu.nutritionFacts.carbs}g</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Lemak</p>
              <p className="font-medium text-gray-900">{menu.nutritionFacts.fat}g</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Serat</p>
              <p className="font-medium text-gray-900">{menu.nutritionFacts.fiber}g</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
