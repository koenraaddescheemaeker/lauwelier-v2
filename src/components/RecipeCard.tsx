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
      className="premium-card group cursor-pointer overflow-hidden flex flex-col h-full"
    >
      <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden">
        <img 
          src={recipe.imageUrl || `https://picsum.photos/seed/${recipe.id}/800/600`} 
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-white/90 backdrop-blur-sm text-olive-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {recipe.difficulty}
          </span>
          {recipe.isVegan && (
            <span className="bg-olive-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Vegan
            </span>
          )}
        </div>
        <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-olive-400 hover:text-red-500 transition-colors">
          <Heart size={20} />
        </button>
      </div>

      <div className="flex-1 space-y-3">
        <h3 className="text-xl font-bold text-olive-900 group-hover:text-olive-600 transition-colors">
          {recipe.title}
        </h3>
        <p className="text-sm text-olive-500 line-clamp-2">
          {recipe.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-olive-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-olive-500">
              <Clock size={16} />
              <span className="text-xs font-medium">{recipe.cookingTime} min</span>
            </div>
            <div className="flex items-center gap-1.5 text-olive-500">
              <Flame size={16} />
              <span className="text-xs font-medium">{recipe.calories} kcal</span>
            </div>
            <div className="flex items-center gap-1.5 text-olive-500">
              <Euro size={16} />
              <span className="text-xs font-medium">{recipe.cost}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-olive-600 font-bold text-sm">
        <span>Bekijk Recept</span>
        <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
}
