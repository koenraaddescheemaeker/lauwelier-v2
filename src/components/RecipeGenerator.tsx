import { useState } from 'react';
import { ChefHat, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { Recipe, Ingredient } from '../types';
import { generateRecipesFromIngredients } from '../services/geminiService';
import { RecipeCard } from './RecipeCard';
import RecipeDetail from './RecipeDetail';
import { AnimatePresence, motion } from 'motion/react';
import { supabase } from '../lib/supabase';

interface RecipeGeneratorProps {
  ingredients: Ingredient[];
}

export default function RecipeGenerator({ ingredients }: RecipeGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const saveRecipesToSupabase = async (generatedRecipes: Recipe[]) => {
    if (!supabase) {
      console.warn('Supabase client not initialized. Skipping save.');
      return;
    }
    
    setSaveStatus('saving');
    try {
      const recipesToInsert = generatedRecipes.map(recipe => ({
        name: recipe.title,
        description: recipe.description,
        instructions: recipe.instructions.join('\n'),
        ingredients: recipe.ingredients.map(i => `${i.amount} ${i.name}`).join('\n'),
        image: recipe.imageUrl,
        total_time: recipe.cookingTime.toString(),
        is_vegan: true,
        chef_tip: recipe.chefTips?.join('\n'),
        recipe_instructions: recipe.instructions,
        recipe_ingredient: recipe.ingredients,
        category: 'AI Generated',
        cuisine: 'Vegan'
      }));

      const { error } = await supabase
        .from('recepten')
        .insert(recipesToInsert);

      if (error) throw error;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving recipes to Supabase:', error);
      setSaveStatus('error');
    }
  };

  const generateRecipes = async () => {
    if (ingredients.length === 0) return;
    setIsGenerating(true);
    setRecipes([]);
    
    const generatedRecipes = await generateRecipesFromIngredients(ingredients);
    setRecipes(generatedRecipes);
    setIsGenerating(false);

    if (generatedRecipes.length > 0) {
      await saveRecipesToSupabase(generatedRecipes);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-olive-900">Wat gaan we vandaag koken?</h2>
        <p className="text-olive-500">Ontdek recepten op basis van jouw voorraadkast.</p>
      </header>

      <div className="premium-card bg-olive-900 text-white border-none p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="relative z-10 space-y-4 max-w-lg">
          <h3 className="text-2xl font-bold">Klaar voor culinaire inspiratie?</h3>
          <p className="text-olive-200">Onze AI analyseert je ingrediënten en stelt 3 unieke, plantaardige recepten voor.</p>
          <div className="flex items-center gap-4">
            <button 
              onClick={generateRecipes}
              disabled={isGenerating || ingredients.length === 0}
              className="bg-white text-olive-900 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all hover:bg-olive-100 active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
              {isGenerating ? 'Recepten genereren...' : 'Genereer Recepten'}
            </button>

            <AnimatePresence>
              {saveStatus === 'saving' && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-olive-300 text-sm"
                >
                  <Loader2 className="animate-spin" size={16} />
                  Opslaan in database...
                </motion.div>
              )}
              {saveStatus === 'saved' && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-green-400 text-sm font-bold"
                >
                  <CheckCircle2 size={16} />
                  Opgeslagen!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {ingredients.length === 0 && (
            <p className="text-xs text-olive-300 italic mt-2">Voeg eerst ingrediënten toe aan je voorraadkast.</p>
          )}
        </div>
        <div className="absolute right-[-50px] bottom-[-50px] opacity-10 rotate-12">
          <ChefHat size={300} />
        </div>
      </div>

      {recipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              onClick={() => setSelectedRecipe(recipe)} 
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedRecipe && (
          <RecipeDetail 
            recipe={selectedRecipe} 
            onClose={() => setSelectedRecipe(null)} 
          />
        )}
      </AnimatePresence>

      {recipes.length === 0 && !isGenerating && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-4 text-olive-400">
            <ChefHat size={40} />
          </div>
          <h3 className="text-xl font-semibold text-olive-900">Nog geen recepten gegenereerd</h3>
          <p className="text-olive-500">Klik op de knop hierboven om te beginnen.</p>
        </div>
      )}
    </div>
  );
}
