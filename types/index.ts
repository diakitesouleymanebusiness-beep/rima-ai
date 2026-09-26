// RIMA AI - Types TypeScript globaux

export type Language = "fr" | "en" | "ar" | "sw" | "ha" | "wo" | "bm" | "dyu" | "ff";

export interface LanguageConfig {
  code: Language;
  label: string;
  greeting: string;
  dir: "ltr" | "rtl";
}

export const LANGUAGES: LanguageConfig[] = [
  { code: "fr", label: "Francais", greeting: "Bonjour ! Je suis RIMA, votre assistante vocale.", dir: "ltr" },
  { code: "en", label: "English", greeting: "Hello! I am RIMA, your voice assistant.", dir: "ltr" },
  { code: "ar", label: "العربية", greeting: "مرحبا! أنا ريما، مساعدتك الصوتية.", dir: "rtl" },
  { code: "sw", label: "Kiswahili", greeting: "Habari! Mimi ni RIMA, msaidizi wako wa sauti.", dir: "ltr" },
  { code: "ha", label: "Hausa", greeting: "Sannu! Ni ne RIMA, mataimakiyar murya.", dir: "ltr" },
  { code: "wo", label: "Wolof", greeting: "Mangi fi! Maa ngi tudd RIMA, bawoo bi ma.", dir: "ltr" },
  { code: "bm", label: "Bambara", greeting: "I ni ce! Ne ye RIMA ye, i ka kuma denmisenna.", dir: "ltr" },
  { code: "dyu", label: "Dioula", greeting: "I ni ce! Ne ye RIMA ye, i ka kuma demebaga.", dir: "ltr" },
  { code: "ff", label: "Pulaar", greeting: "Jam waali! Mi wiyetee RIMA, ballotoodo maa.", dir: "ltr" },
];

export interface Contact { id: string; name: string; phone: string; addedAt: string; }
export interface PhoneticEntry { mot: string; langue: string; zone: string; ipa: string; audio_url?: string; variantes: PhoneticVariant[]; }
export interface PhoneticVariant { zone: string; ipa: string; note: string; }
export type LetterResult = "pending" | "correct" | "incorrect";
export interface LetterExercise { letter: string; result: LetterResult; attempts: number; }
export interface EducationScore { total: number; correct: number; language: Language; date: string; }
export interface PlantAnalysisResult { plantName: string; diseaseName: string; confidence: number; bioAdvice: string; source: "plant.id" | "plantnet"; }
export interface HealthResponse { advice: string; severity: "low" | "medium" | "high"; callEmergency: boolean; nearbyClinic?: string; }
export interface GameTranslation { phrase: string; language: string; zone: string; country: string; phonetic: PhoneticEntry; isKnownLanguage: boolean; }
export interface ApiResponse<T> { success: boolean; data?: T; error?: string; }
