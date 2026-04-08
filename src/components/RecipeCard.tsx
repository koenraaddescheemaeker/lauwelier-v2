import React from 'react';
import { Clock, Flame, Euro, Heart, ChevronRight } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="premium-card group cursor-pointer overflow-hidden flex flex-col h-full !p-4"
    >
      <div className="relative h-32 -mx-4 -mt-4 mb-4 overflow-hidden">
        <img 
          src={recipe.imageUrl || `https://picsum.photos/seed/${recipe.id}/800/600`} 
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 left-2 flex gap-1">
          <span className="bg-white/90 backdrop-blur-sm text-olive-900 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {recipe.difficulty}
          </span>
          {recipe.isVegan && (
            <span className="bg-olive-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Vegan
            </span>
          )}
        </div>
        <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-olive-400 hover:text-red-500 transition-colors">
          <Heart size={16} />
        </button>
      </div>

      <div className="flex-1 space-y-2">
        <h3 className="text-lg font-bold text-olive-900 group-hover:text-olive-600 transition-colors leading-tight line-clamp-1">
          {recipe.title}
        </h3>
        <p className="text-xs text-olive-500 line-clamp-1">
          {recipe.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-olive-50">
          <div className="flex flex-wrap items-center gap-3">
            {recipe.cookingTime > 0 && (
              <div className="flex items-center gap-1 text-olive-500">
                <Clock size={14} />
                <span className="text-[10px] font-medium">{recipe.cookingTime}m</span>
              </div>
            )}
            {recipe.calories > 0 && (
              <div className="flex items-center gap-1 text-olive-500">
                <Flame size={14} />
                <span className="text-[10px] font-medium">{recipe.calories}k</span>
              </div>
            )}
            {recipe.cost && (
              <div className="flex items-center gap-1 text-olive-500">
                <Euro size={14} />
                <span className="text-[10px] font-medium">{recipe.cost}</span>
              </div>
            )}
          </div>
          <ChevronRight size={16} className="text-olive-300 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}
