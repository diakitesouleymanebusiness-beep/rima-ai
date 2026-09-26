import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Arrete la synthese vocale en cours */
export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/** Joue du texte via Web Speech API (TTS natif - fonctionne partout) */
export async function speakText(text: string, lang: string = 'fr'): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();

  return new Promise((resolve) => {
    const utt = new SpeechSynthesisUtterance(text);

    const langMap: Record<string, string> = {
      fr: 'fr-FR', en: 'en-US', ar: 'ar-SA',
      sw: 'fr-FR', ha: 'fr-FR', wo: 'fr-FR',
      bm: 'fr-FR', dyu: 'fr-FR', ff: 'fr-FR',
    };
    utt.lang = langMap[lang] ?? 'fr-FR';
    utt.rate = 0.9;
    utt.pitch = 1.0;
    utt.volume = 1.0;

    // Fix bug Chrome mobile : speechSynthesis se met en pause
    const resumeInterval = setInterval(() => {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    }, 500);

    utt.onend = () => { clearInterval(resumeInterval); resolve(); };
    utt.onerror = () => { clearInterval(resumeInterval); resolve(); };

    window.speechSynthesis.speak(utt);
  });
}

/** Lit un AudioBuffer dans le navigateur */
export async function playAudioBuffer(arrayBuffer: ArrayBuffer): Promise<void> {
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const decoded = await ctx.decodeAudioData(arrayBuffer);
  const source = ctx.createBufferSource();
  source.buffer = decoded;
  source.connect(ctx.destination);
  source.start(0);
  return new Promise((resolve) => { source.onended = () => resolve(); });
}

/** Formate une date ISO en francais */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/** Genere un ID unique simple */
export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/** Stockage local securise (SSR-safe) */
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

/** Liste des langues africaines connues (jeu) */
export const KNOWN_AFRICAN_LANGUAGES = [
  'wolof', 'bambara', 'haoussa', 'hausa', 'yoruba', 'igbo', 'fula', 'pulaar', 'fulani',
  'akan', 'amharique', 'swahili', 'kiswahili', 'zulu', 'shona', 'somali',
  'bete', 'dioula', 'moore', 'ewe', 'lingala', 'kinyarwanda', 'twi', 'ga',
  'soninke', 'mandingue', 'serer',
];
