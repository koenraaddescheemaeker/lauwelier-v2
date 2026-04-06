import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Clock, 
  Flame, 
  Euro, 
  ChefHat, 
  Utensils, 
  Info, 
  Lightbulb,
  Wine,
  Share2,
  Printer
} from 'lucide-react';
import { Recipe } from '../types';

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
}

export default function RecipeDetail({ recipe, onClose }: RecipeDetailProps) {
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  useEffect(() => {
    // Request Wake Lock to keep screen on
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          const wl = await navigator.wakeLock.request('screen');
          setWakeLock(wl);
          console.log('Wake Lock is active');
        }
      } catch (err: any) {
        // Ignore NotAllowedError as it's expected in iframe environments (like AI Studio)
        if (err.name !== 'NotAllowedError') {
          console.warn(`Wake Lock error: ${err.name}, ${err.message}`);
        }
      }
    };

    requestWakeLock();

    return () => {
      wakeLock?.release().then(() => setWakeLock(null));
    };
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: recipe.title,
      text: `Bekijk dit heerlijke recept voor ${recipe.title} op De Lauwelier!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert('Link gekopieerd naar klembord!');
      }
    } catch (err: any) {
      // Ignore AbortError which happens when the user cancels the native share dialog
      if (err.name !== 'AbortError' && !err.message?.includes('canceled')) {
        console.error('Error sharing:', err);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white flex flex-col print:absolute print:inset-0 print:h-auto print:block"
    >
      <div className="relative h-[40vh] sm:h-[50vh] flex-shrink-0 print:h-[30vh] print:break-after-avoid">
        <img 
          src={recipe.imageUrl || `https://picsum.photos/seed/${recipe.id}/1920/1080`} 
          alt={recipe.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute top-8 right-8 flex items-center gap-3 z-20 print:hidden">
          <button 
            onClick={handleShare}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white shadow-2xl hover:bg-white hover:text-olive-900 transition-all border border-white/30"
            title="Deel recept"
          >
            <Share2 size={22} />
          </button>
          <button 
            onClick={handlePrint}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white shadow-2xl hover:bg-white hover:text-olive-900 transition-all border border-white/30"
            title="Print recept"
          >
            <Printer size={22} />
          </button>
          <button 
            onClick={onClose}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white shadow-2xl hover:bg-white hover:text-olive-900 transition-all border border-white/30"
            title="Sluiten"
          >
            <X size={26} />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-16 max-w-7xl mx-auto w-full">
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="bg-olive-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
                {recipe.difficulty}
              </span>
              {recipe.isVegan && (
                <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
                  Vegan
                </span>
              )}
            </div>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
              {recipe.title}
            </h2>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white print:overflow-visible print:h-auto">
        <div className="max-w-7xl mx-auto px-8 sm:px-16 py-16 space-y-20 print:py-8 print:space-y-10">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-olive-50/50 p-8 rounded-[2rem] flex flex-col items-center justify-center gap-3 border border-olive-100/50">
              <Clock className="text-olive-600" size={28} />
              <div className="text-center">
                <p className="text-[10px] text-olive-400 uppercase font-bold tracking-widest mb-1">Bereidingstijd</p>
                <p className="text-2xl font-bold text-olive-900">{recipe.cookingTime} min</p>
              </div>
            </div>
            <div className="bg-olive-50/50 p-8 rounded-[2rem] flex flex-col items-center justify-center gap-3 border border-olive-100/50">
              <Flame className="text-olive-600" size={28} />
              <div className="text-center">
                <p className="text-[10px] text-olive-400 uppercase font-bold tracking-widest mb-1">Calorieën</p>
                <p className="text-2xl font-bold text-olive-900">{recipe.calories} kcal</p>
              </div>
            </div>
            <div className="bg-olive-50/50 p-8 rounded-[2rem] flex flex-col items-center justify-center gap-3 border border-olive-100/50">
              <Euro className="text-olive-600" size={28} />
              <div className="text-center">
                <p className="text-[10px] text-olive-400 uppercase font-bold tracking-widest mb-1">Kosten</p>
                <p className="text-2xl font-bold text-olive-900">{recipe.cost}</p>
              </div>
            </div>
            <div className="bg-olive-50/50 p-8 rounded-[2rem] flex flex-col items-center justify-center gap-3 border border-olive-100/50">
              <ChefHat className="text-olive-600" size={28} />
              <div className="text-center">
                <p className="text-[10px] text-olive-400 uppercase font-bold tracking-widest mb-1">Moeilijkheid</p>
                <p className="text-2xl font-bold text-olive-900">{recipe.difficulty}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            {/* Left Column: Ingredients & Nutrition */}
            <div className="lg:col-span-4 space-y-12">
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-olive-900 text-white rounded-2xl flex items-center justify-center">
                    <Utensils size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-olive-900">Ingrediënten</h3>
                </div>
                <ul className="space-y-4">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex justify-between items-center py-4 border-b border-olive-50 group hover:bg-olive-50/30 px-4 -mx-4 rounded-xl transition-colors">
                      <span className="text-olive-700 font-medium">{ing.name}</span>
                      <span className="font-bold text-olive-900 bg-olive-100/50 px-3 py-1 rounded-lg text-sm">{ing.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-olive-900 text-white p-10 rounded-[2.5rem] space-y-8 shadow-xl shadow-olive-900/20">
                <div className="flex items-center gap-3">
                  <Info className="text-olive-400" size={20} />
                  <h3 className="text-xl font-bold">Voedingswaarden</h3>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] text-olive-400 uppercase font-bold tracking-widest">Eiwit</p>
                    <p className="text-2xl font-bold">{recipe.nutrients.protein}g</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-olive-400 uppercase font-bold tracking-widest">Koolh.</p>
                    <p className="text-2xl font-bold">{recipe.nutrients.carbs}g</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-olive-400 uppercase font-bold tracking-widest">Vet</p>
                    <p className="text-2xl font-bold">{recipe.nutrients.fat}g</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Instructions & Tips */}
            <div className="lg:col-span-8 space-y-16">
              <div className="space-y-10">
                <h3 className="text-3xl font-bold text-olive-900">Bereidingswijze</h3>
                <div className="space-y-12">
                  {recipe.instructions.map((step, i) => (
                    <div key={i} className="flex gap-8 group">
                      <div className="flex-shrink-0">
                        <span className="w-12 h-12 bg-olive-50 text-olive-600 rounded-2xl flex items-center justify-center font-bold text-lg group-hover:bg-olive-600 group-hover:text-white transition-all duration-300">
                          {i + 1}
                        </span>
                      </div>
                      <div className="space-y-2 pt-2">
                        <p className="text-lg text-olive-800 leading-relaxed font-medium">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {recipe.chefTips && recipe.chefTips.length > 0 && (
                  <div className="bg-amber-50/50 border border-amber-100 p-10 rounded-[2.5rem] space-y-6">
                    <div className="flex items-center gap-3 text-amber-700">
                      <Lightbulb size={24} />
                      <h3 className="text-xl font-bold">Chef Tips</h3>
                    </div>
                    <ul className="space-y-4">
                      {recipe.chefTips.map((tip, i) => (
                        <li key={i} className="text-amber-900/80 leading-relaxed flex gap-3">
                          <span className="text-amber-400 mt-1.5">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {recipe.drinkPairing && (
                  <div className="bg-olive-50/50 border border-olive-100 p-10 rounded-[2.5rem] flex flex-col justify-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-olive-600 shadow-sm">
                      <Wine size={32} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-olive-900 mb-2">Drink Suggestie</h4>
                      <p className="text-lg text-olive-700 leading-relaxed">{recipe.drinkPairing}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Section */}
              <div className="pt-12 border-t border-olive-100 flex flex-col sm:flex-row gap-4 print:hidden">
                <button 
                  onClick={handleShare}
                  className="flex-1 bg-olive-900 text-white py-5 px-8 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-olive-800 transition-all shadow-lg active:scale-95"
                >
                  <Share2 size={20} />
                  Deel dit recept
                </button>
                <button 
                  onClick={handlePrint}
                  className="flex-1 bg-white text-olive-900 border-2 border-olive-900 py-5 px-8 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-olive-50 transition-all active:scale-95"
                >
                  <Printer size={20} />
                  Print dit recept
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
