import { Heart } from 'lucide-react';

export default function Favorites() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-olive-900">Mijn Favorieten</h2>
        <p className="text-olive-500">Sla je favoriete recepten op voor later.</p>
      </header>

      <div className="text-center py-20">
        <div className="w-20 h-20 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-4 text-olive-400">
          <Heart size={40} />
        </div>
        <h3 className="text-xl font-semibold text-olive-900">Nog geen favorieten</h3>
        <p className="text-olive-500">Sla recepten op door op het hartje te klikken.</p>
      </div>
    </div>
  );
}
