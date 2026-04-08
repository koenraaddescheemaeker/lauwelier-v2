import React, { useState, useEffect } from 'react';
import { Link, Globe, Loader2, CheckCircle2, AlertCircle, Save, LogOut, Trash2, ExternalLink, ChefHat } from 'lucide-react';
import { Recipe } from '../types';
import { scrapeRecipeFromUrl } from '../services/geminiService';
import { RecipeCard } from './RecipeCard';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedRecipe, setScrapedRecipe] = useState<Recipe | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [existingRecipes, setExistingRecipes] = useState<any[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);

  useEffect(() => {
    fetchExistingRecipes();
  }, []);

  const fetchExistingRecipes = async () => {
    if (!supabase) {
      console.warn('⚠️ Supabase client niet gevonden in fetchExistingRecipes');
      return;
    }
    setIsLoadingRecipes(true);
    setError(null);
    try {
      console.log('📡 Ophalen van recepten uit Supabase...');
      const { data, error } = await supabase
        .from('recepten')
        .select('id, name, image, category, total_time, org_url, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('❌ Fout bij ophalen recepten:', error);
        if (error.message.includes('500') || error.code === '500') {
          setError('Database server fout (500). Controleer of de tabel "recepten" bestaat op supa.lauwelier.be en of de RLS-rechten goed staan.');
        } else {
          setError(`Database fout: ${error.message}`);
        }
        throw error;
      }
      
      console.log(`✅ ${data?.length || 0} recepten opgehaald.`);
      setExistingRecipes(data || []);
    } catch (err: any) {
      console.error('Error fetching recipes:', err);
      setError(`Kon recepten niet laden: ${err.message}`);
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const deleteRecipe = async (id: string) => {
    if (!supabase || !confirm('Weet je zeker dat je dit recept wilt verwijderen?')) return;
    
    try {
      const { error } = await supabase
        .from('recepten')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setExistingRecipes(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Fout bij het verwijderen.');
    }
  };

  const handleScrape = async () => {
    if (!url) return;
    setIsScraping(true);
    setError(null);
    setScrapedRecipe(null);
    
    try {
      const recipe = await scrapeRecipeFromUrl(url);
      if (recipe) {
        setScrapedRecipe(recipe);
      } else {
        setError('Kon het recept niet extraheren van deze URL.');
      }
    } catch (err) {
      setError('Er is een fout opgetreden bij het scrapen.');
    } finally {
      setIsScraping(false);
    }
  };

  const saveToDatabase = async () => {
    if (!scrapedRecipe || !supabase) return;
    
    setSaveStatus('saving');
    try {
      const recipeToInsert = {
        name: scrapedRecipe.title,
        description: scrapedRecipe.description,
        instructions: scrapedRecipe.instructions.join('\n'),
        ingredients: scrapedRecipe.ingredients.map(i => `${i.amount} ${i.name}`).join('\n'),
        image: scrapedRecipe.imageUrl,
        total_time: scrapedRecipe.cookingTime.toString(),
        perform_time: scrapedRecipe.cookingTime.toString(),
        recipe_yield: scrapedRecipe.servings || '2 personen',
        calories: scrapedRecipe.calories,
        rating: '5.0',
        is_vegan: true,
        chef_tip: scrapedRecipe.chefTips?.join('\n'),
        recipe_instructions: scrapedRecipe.instructions,
        recipe_ingredient: scrapedRecipe.ingredients,
        category: 'Imported',
        cuisine: 'Vegan',
        org_url: url
      };

      const { error } = await supabase
        .from('recepten')
        .insert([recipeToInsert]);

      if (error) throw error;
      setSaveStatus('saved');
      fetchExistingRecipes(); // Refresh list
      setTimeout(() => {
        setSaveStatus('idle');
        setScrapedRecipe(null);
        setUrl('');
      }, 3000);
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('error');
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-olive-900">Admin Dashboard</h2>
          <p className="text-olive-500">Beheer de database en importeer nieuwe recepten.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 hover:text-red-600 font-semibold transition-colors"
        >
          <LogOut size={20} />
          <span>Uitloggen</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scraper Section */}
        <div className="premium-card p-8 space-y-6 h-fit">
          <div className="flex items-center gap-3 text-olive-900 mb-2">
            <Globe size={24} className="text-olive-600" />
            <h3 className="text-xl font-bold">Importeer van URL</h3>
          </div>
          
          <p className="text-olive-600 text-sm">
            Plak een URL van een recepten website en onze AI zal het recept automatisch extraheren.
          </p>

          <div className="space-y-4">
            <div className="relative">
              <input 
                type="url" 
                placeholder="https://www.voorbeeld.be/recept/..."
                className="w-full bg-olive-50/50 border border-olive-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-olive-500/20 transition-all"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-olive-400" size={20} />
            </div>
            <button 
              onClick={handleScrape}
              disabled={isScraping || !url}
              className="w-full btn-primary py-4 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isScraping ? <Loader2 className="animate-spin" size={20} /> : <Globe size={20} />}
              {isScraping ? 'Scrapen...' : 'Importeer Recept'}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {scrapedRecipe && (
            <div className="pt-6 border-t border-olive-100 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-olive-900">Gevonden Recept</h4>
                <button 
                  onClick={saveToDatabase}
                  disabled={saveStatus === 'saving'}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-green-700 transition-all disabled:opacity-50"
                >
                  {saveStatus === 'saving' ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Opslaan
                </button>
              </div>
              <div className="scale-90 origin-top">
                <RecipeCard recipe={scrapedRecipe} onClick={() => {}} />
              </div>
              {saveStatus === 'saved' && (
                <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-sm">
                  <CheckCircle2 size={18} />
                  Succesvol opgeslagen!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Management Section */}
        <div className="premium-card p-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-olive-900">Bestaande Recepten</h3>
            <div className="flex items-center gap-3">
              <button 
                onClick={fetchExistingRecipes}
                className="p-2 text-olive-400 hover:text-olive-600 transition-colors"
                title="Vernieuwen"
              >
                <Loader2 className={isLoadingRecipes ? "animate-spin" : ""} size={18} />
              </button>
              <span className="bg-olive-100 text-olive-600 px-3 py-1 rounded-full text-xs font-bold">
                {existingRecipes.length} totaal
              </span>
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoadingRecipes ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-olive-400" size={32} />
              </div>
            ) : existingRecipes.length === 0 ? (
              <p className="text-center py-12 text-olive-400 italic">Nog geen recepten in de database.</p>
            ) : (
              existingRecipes.map((recipe) => (
                <div key={recipe.id} className="flex items-center justify-between p-4 bg-olive-50/50 rounded-2xl border border-olive-100/50 group hover:bg-white hover:shadow-sm transition-all">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-olive-100 rounded-xl overflow-hidden flex-shrink-0">
                      {recipe.image ? (
                        <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-olive-300">
                          <ChefHat size={20} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-olive-900 truncate">{recipe.name}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-olive-500">{recipe.category} • {recipe.total_time} min</p>
                        {recipe.org_url && (
                          <a 
                            href={recipe.org_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-olive-300 hover:text-olive-600 transition-colors"
                            title="Bekijk originele bron"
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => deleteRecipe(recipe.id)}
                      className="p-2 text-olive-300 hover:text-red-500 transition-colors"
                      title="Verwijderen"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
