import React, { useState, useRef } from 'react';
import { Plus, Trash2, Camera, Mic, Search, Tag, Loader2 } from 'lucide-react';
import { Ingredient } from '../types';
import { analyzeImageForIngredients } from '../services/geminiService';

interface PantryProps {
  ingredients: Ingredient[];
  setIngredients: (ingredients: Ingredient[]) => void;
}

export default function Pantry({ ingredients, setIngredients }: PantryProps) {
  const [newItem, setNewItem] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addIngredient = (name: string) => {
    if (!name.trim()) return;
    const ingredient: Ingredient = {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      category: 'Overig'
    };
    setIngredients([ingredient, ...ingredients]);
    setNewItem('');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      const recognizedIngredients = await analyzeImageForIngredients(base64String);
      
      const newIngredients = recognizedIngredients.map(name => ({
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        category: 'Herkenning'
      }));
      
      setIngredients([...newIngredients, ...ingredients]);
      setIsAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-olive-900">Mijn Voorraadkast</h2>
        <p className="text-olive-500">Beheer je ingrediënten en voorkom verspilling.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Voeg ingrediënt toe (bijv. '3 wortels')..."
            className="w-full bg-white border border-olive-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-olive-500/20 transition-all"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addIngredient(newItem)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-olive-400" size={20} />
        </div>
        <div className="flex gap-2">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="btn-secondary flex items-center gap-2 px-4 disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
            <span className="hidden sm:inline">{isAnalyzing ? 'Analyseren...' : 'Scan Foto'}</span>
          </button>
          <button className="btn-secondary flex items-center gap-2 px-4">
            <Mic size={20} />
            <span className="hidden sm:inline">Spraak</span>
          </button>
          <button 
            onClick={() => addIngredient(newItem)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            <span>Voeg toe</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {ingredients.map((item) => (
          <div key={item.id} className="premium-card p-3 flex items-center justify-between group hover:border-olive-300 transition-all bg-white/50">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-olive-100 rounded-lg flex items-center justify-center text-olive-600 flex-shrink-0">
                <Tag size={16} />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-olive-900 truncate text-sm">{item.name}</h3>
                <p className="text-[10px] text-olive-500 truncate">{item.quantity || 'Aantal niet opgegeven'}</p>
              </div>
            </div>
            <button 
              onClick={() => setIngredients(ingredients.filter(i => i.id !== item.id))}
              className="p-2 text-olive-300 hover:text-red-500 transition-colors flex-shrink-0"
              aria-label="Verwijder ingrediënt"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
