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
      className="fixed inset-0 z-[100] bg-white flex flex-col print:relative print:z-0 print:block print:bg-white print:h-auto print:overflow-visible"
    >
      <div className="relative h-[40vh] sm:h-[50vh] flex-shrink-0 print:h-auto print:block print:mb-8">
        <img 
          src={recipe.imageUrl || `https://picsum.photos/seed/${recipe.id}/1920/1080`} 
          alt={recipe.title}
          className="w-full h-full object-cover print:h-[10cm] print:rounded-3xl print:shadow-none"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent print:hidden" />
        
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

        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-16 max-w-7xl mx-auto w-full print:relative print:p-0 print:mt-4">
          <div className="space-y-4">
            <div className="flex gap-3 print:hidden">
              <span className="bg-olive-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
                {recipe.difficulty}
              </span>
              {recipe.isVegan && (
                <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
                  Vegan
                </span>
              )}
            </div>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight print:text-olive-900 print:text-4xl print:mb-4">
              {recipe.title}
            </h2>
            <div className="hidden print:flex gap-4 text-olive-600 font-bold text-sm uppercase tracking-widest">
              <span>{recipe.difficulty}</span>
              <span>•</span>
              <span>{recipe.cookingTime} min</span>
              <span>•</span>
              <span>{recipe.servings || '2 personen'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white print:overflow-visible print:h-auto">
        <div className="max-w-7xl mx-auto px-8 sm:px-16 py-16 space-y-20 print:py-0 print:px-0 print:space-y-12">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4">
            {recipe.cookingTime > 0 && (
              <div className="bg-olive-50/50 p-8 rounded-[2rem] flex flex-col items-center justify-center gap-3 border border-olive-100/50 print:p-4 print:rounded-2xl print:border-olive-100">
                <Clock className="text-olive-600 print:w-5 print:h-5" size={28} />
                <div className="text-center">
                  <p className="text-[10px] text-olive-400 uppercase font-bold tracking-widest mb-1">Tijd</p>
                  <p className="text-2xl font-bold text-olive-900 print:text-lg">{recipe.cookingTime} min</p>
                </div>
              </div>
            )}
            {recipe.calories > 0 && (
              <div className="bg-olive-50/50 p-8 rounded-[2rem] flex flex-col items-center justify-center gap-3 border border-olive-100/50 print:p-4 print:rounded-2xl print:border-olive-100">
                <Flame className="text-olive-600 print:w-5 print:h-5" size={28} />
                <div className="text-center">
                  <p className="text-[10px] text-olive-400 uppercase font-bold tracking-widest mb-1">Energie</p>
                  <p className="text-2xl font-bold text-olive-900 print:text-lg">{recipe.calories} kcal</p>
                </div>
              </div>
            )}
            {recipe.servings && (
              <div className="bg-olive-50/50 p-8 rounded-[2rem] flex flex-col items-center justify-center gap-3 border border-olive-100/50 print:p-4 print:rounded-2xl print:border-olive-100">
                <Utensils className="text-olive-600 print:w-5 print:h-5" size={28} />
                <div className="text-center">
                  <p className="text-[10px] text-olive-400 uppercase font-bold tracking-widest mb-1">Porties</p>
                  <p className="text-2xl font-bold text-olive-900 print:text-lg">{recipe.servings}</p>
                </div>
              </div>
            )}
            <div className="bg-olive-50/50 p-8 rounded-[2rem] flex flex-col items-center justify-center gap-3 border border-olive-100/50 print:p-4 print:rounded-2xl print:border-olive-100">
              <ChefHat className="text-olive-600 print:w-5 print:h-5" size={28} />
              <div className="text-center">
                <p className="text-[10px] text-olive-400 uppercase font-bold tracking-widest mb-1">Niveau</p>
                <p className="text-2xl font-bold text-olive-900 print:text-lg">{recipe.difficulty}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 print:grid-cols-1 print:gap-8">
            {/* Left Column: Ingredients & Nutrition */}
            <div className="lg:col-span-4 space-y-12 print:space-y-8">
              <div className="space-y-8 print:space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-olive-900 text-white rounded-2xl flex items-center justify-center print:w-8 print:h-8 print:rounded-lg">
                    <Utensils size={24} className="print:w-4 print:h-4" />
                  </div>
                  <h3 className="text-2xl font-bold text-olive-900 print:text-xl">Ingrediënten</h3>
                </div>
                <ul className="space-y-4 print:space-y-2">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex justify-between items-center py-4 border-b border-olive-50 group hover:bg-olive-50/30 px-4 -mx-4 rounded-xl transition-colors print:py-2 print:px-0 print:mx-0">
                      <span className="text-olive-700 font-medium print:text-sm">{ing.name}</span>
                      <span className="font-bold text-olive-900 bg-olive-100/50 px-3 py-1 rounded-lg text-sm print:bg-transparent print:p-0 print:text-xs">{ing.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {recipe.nutrients && (recipe.nutrients.protein > 0 || recipe.nutrients.carbs > 0 || recipe.nutrients.fat > 0) && (
                <div className="bg-olive-900 text-white p-10 rounded-[2.5rem] space-y-8 shadow-xl shadow-olive-900/20 print:bg-white print:text-olive-900 print:p-6 print:rounded-2xl print:border print:border-olive-100 print:shadow-none">
                  <div className="flex items-center gap-3">
                    <Info className="text-olive-400 print:text-olive-600" size={20} />
                    <h3 className="text-xl font-bold print:text-lg">Voedingswaarden</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-6 print:gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-olive-400 uppercase font-bold tracking-widest print:text-olive-500">Eiwit</p>
                      <p className="text-2xl font-bold print:text-lg">{recipe.nutrients.protein}g</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-olive-400 uppercase font-bold tracking-widest print:text-olive-500">Koolh.</p>
                      <p className="text-2xl font-bold print:text-lg">{recipe.nutrients.carbs}g</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-olive-400 uppercase font-bold tracking-widest print:text-olive-500">Vet</p>
                      <p className="text-2xl font-bold print:text-lg">{recipe.nutrients.fat}g</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Instructions & Tips */}
            <div className="lg:col-span-8 space-y-16 print:space-y-8">
              <div className="space-y-10 print:space-y-6">
                <h3 className="text-3xl font-bold text-olive-900 print:text-xl">Bereidingswijze</h3>
                <div className="space-y-12 print:space-y-6">
                  {recipe.instructions.map((step, i) => (
                    <div key={i} className="flex gap-8 group print:gap-4 print:break-inside-avoid">
                      <div className="flex-shrink-0">
                        <span className="w-12 h-12 bg-olive-50 text-olive-600 rounded-2xl flex items-center justify-center font-bold text-lg group-hover:bg-olive-600 group-hover:text-white transition-all duration-300 print:w-8 print:h-8 print:text-sm print:rounded-lg print:bg-olive-100 print:text-olive-700">
                          {i + 1}
                        </span>
                      </div>
                      <div className="space-y-2 pt-2 print:pt-1">
                        <p className="text-lg text-olive-800 leading-relaxed font-medium print:text-sm">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 print:grid-cols-1 print:gap-6">
                {recipe.chefTips && recipe.chefTips.length > 0 && (
                  <div className="bg-amber-50/50 border border-amber-100 p-10 rounded-[2.5rem] space-y-6 print:p-6 print:rounded-2xl print:break-inside-avoid">
                    <div className="flex items-center gap-3 text-amber-700">
                      <Lightbulb size={24} className="print:w-5 print:h-5" />
                      <h3 className="text-xl font-bold print:text-lg">Chef Tips</h3>
                    </div>
                    <ul className="space-y-4 print:space-y-2">
                      {recipe.chefTips.map((tip, i) => (
                        <li key={i} className="text-amber-900/80 leading-relaxed flex gap-3 print:text-sm">
                          <span className="text-amber-400 mt-1.5">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {recipe.drinkPairing && (
                  <div className="bg-olive-50/50 border border-olive-100 p-10 rounded-[2.5rem] flex flex-col justify-center gap-6 print:p-6 print:rounded-2xl print:break-inside-avoid">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-olive-600 shadow-sm print:w-10 print:h-10 print:rounded-xl print:border print:border-olive-100">
                      <Wine size={32} className="print:w-6 print:h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-olive-900 mb-2 print:text-lg">Drink Suggestie</h4>
                      <p className="text-lg text-olive-700 leading-relaxed print:text-sm">{recipe.drinkPairing}</p>
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

              {/* Temporary Debug Log Section */}
              <div className="mt-12 p-6 bg-gray-900 rounded-3xl text-xs font-mono text-green-400 overflow-x-auto print:hidden">
                <p className="text-gray-500 mb-2 uppercase tracking-widest font-bold">Debug Log (Tijdelijk)</p>
                <pre>{JSON.stringify({ 
                  id: recipe.id, 
                  title: recipe.title, 
                  ingredientsCount: recipe.ingredients.length,
                  instructionsCount: recipe.instructions.length,
                  hasImage: !!recipe.imageUrl,
                  timestamp: new Date().toISOString()
                }, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
