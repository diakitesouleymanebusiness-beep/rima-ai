// ============================================================
// RIMA AI — Composant : Mode texte (fallback pour démo PC)
// ============================================================
'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TextInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function TextInput({ onSubmit, placeholder = 'Tapez votre message...', className, disabled }: TextInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className={cn('flex gap-3 w-full', className)}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'flex-1 px-5 py-4 text-lg rounded-2xl border-2 border-primary-200',
          'focus:outline-none focus:border-primary-500 bg-white shadow-sm',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      />
      <button
        type="submit"
        disabled={!value.trim() || disabled}
        className={cn(
          'px-6 py-4 bg-primary-500 text-white rounded-2xl font-bold text-xl',
          'hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed',
          'shadow-lg transition-all active:scale-95'
        )}
      >
        ➤
      </button>
    </form>
  );
}
