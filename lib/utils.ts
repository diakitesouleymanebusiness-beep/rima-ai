// ============================================================
// RIMA AI — Utilitaires
// ============================================================
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Lit un AudioBuffer dans le navigateur */
export async function playAudioBuffer(arrayBuffer: ArrayBuffer): Promise<void> {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const decoded = await ctx.decodeAudioData(arrayBuffer);
  const source = ctx.createBufferSource();
  source.buffer = decoded;
  source.connect(ctx.destination);
  source.start(0);
  return new Promise((resolve) => { source.onended = () => resolve(); });
}

/** Joue du texte via l'API TTS (côté client) */
export async function speakText(text: string, lang: string = 'fr'): Promise<void> {
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: lang }),
    });
    if (!res.ok) throw new Error('TTS API failed');
    const buffer = await res.arrayBuffer();
    await playAudioBuffer(buffer);
  } catch (err) {
    // Fallback : Web Speech API
    if ('speechSynthesis' in window) {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = lang === 'ar' ? 'ar-SA' : lang === 'en' ? 'en-US' : 'fr-FR';
      window.speechSynthesis.speak(utt);
    }
  }
}

/** Formate une date ISO en français */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/** Génère un ID unique simple */
export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/** Stockage local sécurisé (SSR-safe) */
export const storage = {
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : null;
    } catch { return null; }
  },
  set(key: string, value: unknown): void {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
};

/** Liste des langues africaines connues (simulé pour le jeu) */
export const KNOWN_AFRICAN_LANGUAGES = [
  'wolof', 'bambara', 'haoussa', 'yoruba', 'igbo', 'fula', 'akan',
  'amharique', 'swahili', 'zulu', 'shona', 'somali', 'bété', 'dioula',
  'moore', 'ewé', 'lingala', 'kinyarwanda', 'twi', 'ga',
];
