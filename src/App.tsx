import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChefHat, 
  Refrigerator, 
  Heart, 
  Settings as SettingsIcon, 
  Plus, 
  Camera, 
  Mic, 
  Search,
  Menu,
  X
} from 'lucide-react';
import Navbar from './components/Navbar';
import Pantry from './components/Pantry';
import RecipeGenerator from './components/RecipeGenerator';
import Favorites from './components/Favorites';
import Settings from './components/Settings';
import { Ingredient } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'pantry' | 'generate' | 'favorites' | 'settings'>('pantry');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', name: 'Kikkererwten', quantity: '2 blikken', category: 'Peulvruchten' },
    { id: '2', name: 'Spinazie', quantity: '200g', category: 'Groenten' },
    { id: '3', name: 'Kokosmelk', quantity: '400ml', category: 'Voorraadkast' },
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
      />

      <main className="flex-1 container mx-auto px-4 py-6 pb-24 md:pb-6">
        <AnimatePresence mode="wait">
          {activeTab === 'pantry' && (
            <motion.div
              key="pantry"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Pantry ingredients={ingredients} setIngredients={setIngredients} />
            </motion.div>
          )}

          {activeTab === 'generate' && (
            <motion.div
              key="generate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RecipeGenerator ingredients={ingredients} />
            </motion.div>
          )}

          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Favorites />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Settings />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-olive-100 px-6 py-3 flex justify-between items-center z-50">
        <button 
          onClick={() => setActiveTab('pantry')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'pantry' ? 'text-olive-600' : 'text-olive-400'}`}
        >
          <Refrigerator size={24} />
          <span className="text-[10px] font-medium">Voorraad</span>
        </button>
        <button 
          onClick={() => setActiveTab('generate')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'generate' ? 'text-olive-600' : 'text-olive-400'}`}
        >
          <ChefHat size={24} />
          <span className="text-[10px] font-medium">Koken</span>
        </button>
        <button 
          onClick={() => setActiveTab('favorites')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'favorites' ? 'text-olive-600' : 'text-olive-400'}`}
        >
          <Heart size={24} />
          <span className="text-[10px] font-medium">Favorieten</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-olive-600' : 'text-olive-400'}`}
        >
          <SettingsIcon size={24} />
          <span className="text-[10px] font-medium">Instellingen</span>
        </button>
      </nav>
    </div>
  );
}
