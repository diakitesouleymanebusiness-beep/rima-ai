// ============================================================
// RIMA AI — Composant : Gros bouton de navigation principal
// ============================================================
'use client';
import { useRouter } from 'next/navigation';
import { speakText } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface MainNavButtonProps {
  icon: string;
  label: string;
  sublabel?: string;
  href: string;
  color: string;       // classe Tailwind bg-*
  language?: string;
  voiceMessage?: string;
}

export default function MainNavButton({
  icon, label, sublabel, href, color, language = 'fr', voiceMessage
}: MainNavButtonProps) {
  const router = useRouter();

  const handleClick = async () => {
    if (voiceMessage) {
      // Lire le message d'invitation avant de naviguer
      speakText(voiceMessage, language).catch(() => {});
    }
    router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex flex-col items-center justify-center gap-3 p-6 rounded-3xl shadow-xl',
        'text-white w-full min-h-[140px] transition-all duration-200',
        'hover:scale-105 hover:shadow-2xl active:scale-100',
        'focus:outline-none focus:ring-4 focus:ring-white/50',
        color
      )}
    >
      <span className="text-6xl drop-shadow-md">{icon}</span>
      <div className="text-center">
        <p className="text-2xl font-black tracking-wide">{label}</p>
        {sublabel && <p className="text-sm opacity-80 mt-1">{sublabel}</p>}
      </div>
    </button>
  );
}
