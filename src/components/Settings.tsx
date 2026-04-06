import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, LogOut, Heart } from 'lucide-react';

export default function Settings() {
  const [diet, setDiet] = useState('vegan');

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-olive-900">Instellingen</h2>
        <p className="text-olive-500">Beheer je profiel en culinaire voorkeuren.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <div className="premium-card p-4 space-y-1">
            <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-olive-50 text-olive-600 font-medium">
              <User size={20} />
              <span>Profiel</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl text-olive-500 hover:bg-olive-50 hover:text-olive-600 transition-all">
              <Heart size={20} />
              <span>Dieetvoorkeuren</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl text-olive-500 hover:bg-olive-50 hover:text-olive-600 transition-all">
              <Bell size={20} />
              <span>Meldingen</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl text-olive-500 hover:bg-olive-50 hover:text-olive-600 transition-all">
              <Shield size={20} />
              <span>Privacy</span>
            </button>
            <div className="pt-4 mt-4 border-t border-olive-50">
              <button className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-all">
                <LogOut size={20} />
                <span>Uitloggen</span>
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="premium-card space-y-6">
            <h3 className="text-xl font-bold text-olive-900">Dieetvoorkeuren</h3>
            
            <div className="space-y-4">
              <p className="text-sm font-medium text-olive-700 uppercase tracking-wider">Kies je culinaire stijl</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => setDiet('vegan')}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${diet === 'vegan' ? 'border-olive-600 bg-olive-50' : 'border-olive-100 hover:border-olive-200'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${diet === 'vegan' ? 'bg-olive-600 text-white' : 'bg-olive-100 text-olive-400'}`}>
                    <Heart size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-olive-900">100% Veganistisch</p>
                    <p className="text-xs text-olive-500">Geen dierlijke producten</p>
                  </div>
                </button>
                <button 
                  onClick={() => setDiet('vegetarian')}
                  className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${diet === 'vegetarian' ? 'border-olive-600 bg-olive-50' : 'border-olive-100 hover:border-olive-200'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${diet === 'vegetarian' ? 'bg-olive-600 text-white' : 'bg-olive-100 text-olive-400'}`}>
                    <Heart size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-olive-900">Vegetarisch</p>
                    <p className="text-xs text-olive-500">Inclusief zuivel en eieren</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-olive-50">
              <h4 className="font-bold text-olive-900">Allergieën & Beperkingen</h4>
              <div className="flex flex-wrap gap-2">
                {['Glutenvrij', 'Notenvrij', 'Lactosevrij', 'Sojavrij'].map((allergy) => (
                  <button key={allergy} className="px-4 py-2 rounded-full border border-olive-100 text-sm text-olive-600 hover:bg-olive-50 transition-all">
                    {allergy}
                  </button>
                ))}
                <button className="px-4 py-2 rounded-full border border-dashed border-olive-300 text-sm text-olive-400 hover:bg-olive-50 transition-all">
                  + Voeg toe
                </button>
              </div>
            </div>

            <div className="pt-6">
              <button className="btn-primary w-full sm:w-auto">
                Instellingen Opslaan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
