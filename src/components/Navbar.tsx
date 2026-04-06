import { ChefHat, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

export default function Navbar({ activeTab, setActiveTab, isMenuOpen, setIsMenuOpen }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-olive-50/80 backdrop-blur-md border-b border-olive-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-olive-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-olive-200">
            <ChefHat size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-olive-900 leading-none">De Lauwelier</h1>
            <p className="text-[10px] text-olive-500 font-medium tracking-widest uppercase mt-1">Premium Vegan Cuisine</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => setActiveTab('pantry')}
            className={`text-sm font-medium transition-colors ${activeTab === 'pantry' ? 'text-olive-600' : 'text-olive-500 hover:text-olive-700'}`}
          >
            Voorraadkast
          </button>
          <button 
            onClick={() => setActiveTab('generate')}
            className={`text-sm font-medium transition-colors ${activeTab === 'generate' ? 'text-olive-600' : 'text-olive-500 hover:text-olive-700'}`}
          >
            Recepten
          </button>
          <button 
            onClick={() => setActiveTab('favorites')}
            className={`text-sm font-medium transition-colors ${activeTab === 'favorites' ? 'text-olive-600' : 'text-olive-500 hover:text-olive-700'}`}
          >
            Favorieten
          </button>
          <button 
            onClick={() => setActiveTab('generate')}
            className="btn-primary py-2 text-sm"
          >
            Start Koken
          </button>
        </nav>

        <button 
          className="md:hidden text-olive-900"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
