import React, { useState } from 'react';
import { 
  Plus, 
  Camera, 
  Loader2, 
  X,
  Sparkles
} from 'lucide-react';
import { Ingredient } from '../types';
import { analyzeImageForIngredients } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

interface PantryProps {
  ingredients: Ingredient[];
  setIngredients: (ingredients: Ingredient[]) => void;
}

export default function Pantry({ ingredients, setIngredients }: PantryProps) {
  const [newItemName, setNewItemName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mainTab, setMainTab] = useState<'basis' | 'culinair' | 'fusion'>('basis');
  const [subTab, setSubTab] = useState<'koelkast' | 'gerecht' | 'wereld'>('koelkast');
  const [diet, setDiet] = useState<'vegan' | 'veggie'>('vegan');

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newItemName.trim()) {
      const ingredient: Ingredient = {
        id: Math.random().toString(36).substr(2, 9),
        name: newItemName.trim(),
        category: 'Handmatig'
      };
      setIngredients([ingredient, ...ingredients]);
      setNewItemName('');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      const detected = await analyzeImageForIngredients(base64);
      
      const newIngredients = detected.map(name => ({
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        category: 'Herkenning'
      }));
      
      setIngredients([...newIngredients, ...ingredients]);
      setIsAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(i => i.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Main Navigation Tabs */}
      <div className="flex justify-center border-b border-olive-100">
        <div className="flex gap-12 sm:gap-24">
          {(['basis', 'culinair', 'fusion'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMainTab(tab)}
              className={`pb-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative ${
                mainTab === tab ? 'text-olive-900' : 'text-olive-300 hover:text-olive-500'
              }`}
            >
              {tab}
              {mainTab === tab && (
                <motion.div 
                  layoutId="mainTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sub Navigation & Surprise Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex gap-8 sm:gap-12">
          {(['koelkast', 'gerecht', 'wereld'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSubTab(tab)}
              className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${
                subTab === tab ? 'text-olive-900' : 'text-olive-300 hover:text-olive-500'
              }`}
            >
              {tab}
              {subTab === tab && (
                <motion.div 
                  layoutId="subTabUnderline"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-green-500"
                />
              )}
            </button>
          ))}
        </div>

        <button className="flex items-center gap-2 bg-green-50 text-green-600 px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-green-100 transition-all">
          <Sparkles size={14} className="text-yellow-500" />
          Verras me
        </button>
      </div>

      {/* Diet Toggle */}
      <div className="flex justify-center">
        <div className="bg-olive-50/50 p-1 rounded-full flex border border-olive-100 w-fit">
          <button
            onClick={() => setDiet('vegan')}
            className={`px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              diet === 'vegan' ? 'bg-green-700 text-white shadow-lg' : 'text-olive-400 hover:text-olive-600'
            }`}
          >
            Vegan
          </button>
          <button
            onClick={() => setDiet('veggie')}
            className={`px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
              diet === 'veggie' ? 'bg-green-700 text-white shadow-lg' : 'text-olive-400 hover:text-olive-600'
            }`}
          >
            Veggie
          </button>
        </div>
      </div>

      {/* Main Input Area */}
      <div className="relative group">
        <div className="premium-card !p-2 !rounded-[2.5rem] bg-white shadow-xl shadow-olive-900/5 border-olive-100/50">
          <form onSubmit={handleAdd} className="flex items-center p-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="In huis..."
              className="flex-1 bg-transparent border-none focus:ring-0 px-6 py-4 text-xl text-olive-900 placeholder:text-olive-200 italic font-light"
            />
            <div className="flex items-center gap-2 pr-2">
              <label className="p-4 text-olive-300 hover:text-olive-600 cursor-pointer transition-colors">
                <Camera size={24} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              <button
                type="submit"
                disabled={!newItemName.trim()}
                className="w-14 h-14 bg-green-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-900/20 hover:bg-green-800 transition-all active:scale-95 disabled:opacity-30"
              >
                {isAnalyzing ? <Loader2 className="animate-spin" size={24} /> : <Plus size={28} />}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Ingredient Tags */}
      <div className="flex flex-wrap justify-center gap-3">
        <AnimatePresence mode="popLayout">
          {ingredients.map((ingredient) => (
            <motion.div
              key={ingredient.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="group flex items-center gap-2 bg-white border border-olive-100 px-5 py-2.5 rounded-full shadow-sm hover:border-olive-200 transition-all"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-olive-900">
                {ingredient.name}
              </span>
              <button
                onClick={() => removeIngredient(ingredient.id)}
                className="text-olive-200 hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Chef Section Footer */}
      <div className="pt-12 text-center">
        <div className="inline-flex flex-col items-center gap-4">
          <div className="h-px w-24 bg-olive-200" />
          <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-olive-900">
            Vraag het aan de chef
          </h4>
        </div>
      </div>
    </div>
  );
}
