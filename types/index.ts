// ============================================================
// RIMA AI — Types TypeScript globaux
// ============================================================

// --- Langues supportées ---
export type Language = 'fr' | 'en' | 'ar';

export interface LanguageConfig {
  code: Language;
  label: string;
  greeting: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: LanguageConfig[] = [
  { code: 'fr', label: 'Français', greeting: 'Bonjour ! Je suis RIMA, votre assistante vocale.', dir: 'ltr' },
  { code: 'en', label: 'English', greeting: 'Hello! I am RIMA, your voice assistant.', dir: 'ltr' },
  { code: 'ar', label: 'العربية', greeting: 'مرحباً! أنا ريما، مساعدتك الصوتية.', dir: 'rtl' },
];

// --- Contact ---
export interface Contact {
  id: string;
  name: string;
  phone: string;
  addedAt: string;
}

// --- Phonétique (couche transversale) ---
export interface PhoneticEntry {
  mot: string;
  langue: string;
  zone: string;
  ipa: string;
  audio_url?: string;
  variantes: PhoneticVariant[];
}

export interface PhoneticVariant {
  zone: string;
  ipa: string;
  note: string;
}

// --- Éducation ---
export type LetterResult = 'pending' | 'correct' | 'incorrect';

export interface LetterExercise {
  letter: string;
  result: LetterResult;
  attempts: number;
}

export interface EducationScore {
  total: number;
  correct: number;
  language: Language;
  date: string;
}

// --- Agriculture ---
export interface PlantAnalysisResult {
  plantName: string;
  diseaseName: string;
  confidence: number;
  bioAdvice: string;
  source: 'plant.id' | 'plantnet';
}

// --- Santé ---
export interface HealthResponse {
  advice: string;
  severity: 'low' | 'medium' | 'high';
  callEmergency: boolean;
  nearbyClinic?: string;
}

// --- Jeu participatif ---
export interface GameTranslation {
  phrase: string;
  language: string;
  zone: string;
  country: string;
  phonetic: PhoneticEntry;
  isKnownLanguage: boolean;
}

// --- Réponse API générique ---
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
