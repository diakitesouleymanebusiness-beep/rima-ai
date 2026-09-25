// ============================================================
// RIMA AI — Composant : Bouton "Lire à voix haute"
// ============================================================
'use client';
import { useState } from 'react';
import { speakText } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SpeakButtonProps {
  text: string;
  language?: string;
  label?: string;
  className?: string;
}

export default function SpeakButton({ text, language = 'fr', label = 'Écouter', className }: SpeakButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      await speakText(text, language);
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <button
      onClick={handleSpeak}
      disabled={isSpeaking}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-xl font-semibold',
        'bg-primary-100 text-primary-700 hover:bg-primary-200 border border-primary-300',
        'disabled:opacity-60 transition-all text-sm',
        className
      )}
    >
      <span>{isSpeaking ? '🔊' : '▶️'}</span>
      <span>{isSpeaking ? 'Lecture...' : label}</span>
    </button>
  );
}
