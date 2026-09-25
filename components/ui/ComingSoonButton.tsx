// ============================================================
// RIMA AI — Composant : Bouton "Coming Soon"
// ============================================================
'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ComingSoonButtonProps {
  icon: string;
  label: string;
  className?: string;
}

export default function ComingSoonButton({ icon, label, className }: ComingSoonButtonProps) {
  const [showToast, setShowToast] = useState(false);

  const handleClick = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={cn(
          'relative flex flex-col items-center gap-2 p-4 rounded-2xl',
          'bg-gray-100 border-2 border-dashed border-gray-300',
          'text-gray-400 cursor-pointer hover:bg-gray-200 transition-all',
          'min-w-[100px]',
          className
        )}
      >
        <span className="text-3xl grayscale opacity-60">{icon}</span>
        <span className="text-xs font-semibold text-center leading-tight">{label}</span>
        {/* Badge Coming Soon */}
        <span className="absolute -top-2 -right-2 bg-earth-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
          Bientôt
        </span>
      </button>

      {/* Toast de notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fadeInUp">
          <div className="bg-gray-800 text-white px-5 py-3 rounded-2xl shadow-xl text-sm text-center max-w-xs">
            🚀 Fonctionnalité en cours de développement<br/>
            <span className="text-primary-300 font-semibold">Bientôt disponible !</span>
          </div>
        </div>
      )}
    </div>
  );
}
