// ============================================================
// RIMA AI — Composant : Sélecteur de langue
// ============================================================
'use client';
import { Language, LANGUAGES } from '@/types';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  value: Language;
  onChange: (lang: Language) => void;
  className?: string;
}

export default function LanguageSelector({ value, onChange, className }: LanguageSelectorProps) {
  return (
    <div className={cn('flex gap-2 flex-wrap justify-center', className)}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onChange(lang.code)}
          className={cn(
            'px-4 py-2 rounded-full font-semibold text-sm transition-all border-2',
            value === lang.code
              ? 'bg-primary-500 border-primary-500 text-white shadow-lg scale-105'
              : 'bg-white border-primary-300 text-primary-700 hover:bg-primary-50'
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
