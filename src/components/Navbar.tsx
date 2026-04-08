import { ChefHat, Menu, X, Refrigerator, Heart, Settings as SettingsIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

export default function Navbar({ activeTab, setActiveTab, isMenuOpen, setIsMenuOpen }: NavbarProps) {
  const menuItems = [
    { id: 'pantry', label: 'Voorraadkast', icon: Refrigerator },
    { id: 'generate', label: 'Recepten', icon: Sparkles },
    { id: 'favorites', label: 'Favorieten', icon: Heart },
    { id: 'settings', label: 'Instellingen', icon: SettingsIcon },
    { id: 'admin', label: 'Admin', icon: ChefHat },
  ];

  return (
    <header className="sticky top-0 z-[100] bg-olive-50/80 backdrop-blur-md border-b border-olive-100">
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
          {menuItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`text-sm font-medium transition-colors ${activeTab === item.id ? 'text-olive-600' : 'text-olive-500 hover:text-olive-700'}`}
            >
              {item.label}
            </button>
          ))}
          <button 
            onClick={() => setActiveTab('generate')}
            className="btn-primary py-2 text-sm"
          >
            Start Koken
          </button>
        </nav>

        <button 
          className="md:hidden text-olive-900 p-2 hover:bg-olive-100 rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay - Verplaatst naar buiten de container voor betere positionering */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[110] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 bottom-0 w-[80%] max-w-xs bg-white/90 backdrop-blur-xl shadow-2xl flex flex-col h-screen"
            >
              <div className="p-5 flex items-center justify-between border-b border-olive-100/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-olive-600 rounded-lg flex items-center justify-center text-white">
                    <ChefHat size={18} />
                  </div>
                  <span className="font-bold text-olive-900 text-sm">De Lauwelier</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-olive-100/50 rounded-lg text-olive-500"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                      activeTab === item.id 
                        ? 'bg-olive-600 text-white shadow-md shadow-olive-200' 
                        : 'text-olive-700 hover:bg-olive-100/50'
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="font-bold text-base">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-6 border-t border-olive-100/50 bg-olive-50/50">
                <button 
                  onClick={() => {
                    setActiveTab('generate');
                    setIsMenuOpen(false);
                  }}
                  className="w-full btn-primary py-4 text-base font-bold"
                >
                  Start Koken
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
